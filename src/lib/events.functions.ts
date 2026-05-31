import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { calcularELP } from "@/lib/elp";
import { anchorHashOnPolygon } from "@/lib/onchain.functions";

/**
 * Cria evento de descarte completo:
 * 1) Cria batch (se necessário)
 * 2) Persiste disposal_event com peso, categoria, hash
 * 3) Tenta ancorar hash na Polygon (se falhar, segue como 'pendente')
 * 4) Calcula ELP e marca como 'aprovado' se ancorou on-chain
 */
export const createDisposalEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        categoryId: z.string().uuid(),
        weightKg: z.number().positive().max(10000),
        hashHex: z.string().regex(/^[a-f0-9]{64}$/i),
        qrCode: z.string().min(4).max(64),
        photoBase64: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: op, error: opErr } = await supabase
      .from("operators")
      .select("id, beta_score")
      .eq("user_id", userId)
      .single();
    if (opErr || !op) throw new Error("Operador não encontrado");

    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .select("id, gamma_factor")
      .eq("id", data.categoryId)
      .single();
    if (catErr || !cat) throw new Error("Categoria inválida");

    // QR uso único: rejeita se já existe lote com este código
    const { data: existingBatch } = await supabase
      .from("batches")
      .select("id, expires_at, status")
      .eq("qr_code", data.qrCode)
      .maybeSingle();
    if (existingBatch) {
      throw new Error("QR já utilizado — gere um novo lote.");
    }

    // batch
    const { data: batch, error: bErr } = await supabase
      .from("batches")
      .insert({ qr_code: data.qrCode, operator_id: op.id })
      .select("id, expires_at")
      .single();
    if (bErr || !batch) throw new Error("Falha ao criar lote: " + bErr?.message);

    // Expiração defensiva (24h default; rejeita se relógio estiver torto)
    if (new Date(batch.expires_at) <= new Date()) {
      throw new Error("Lote expirado — gere novo QR.");
    }

    // photo upload (opcional)
    let photoUrl: string | null = null;
    if (data.photoBase64) {
      const b64 = data.photoBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const path = `${userId}/${batch.id}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("disposal-photos")
        .upload(path, bytes, { contentType: "image/jpeg", upsert: true });
      if (!upErr) {
        const { data: signed } = await supabase.storage
          .from("disposal-photos")
          .createSignedUrl(path, 60 * 60 * 24 * 30);
        photoUrl = signed?.signedUrl ?? null;
      }
    }

    const beta = Number(op.beta_score ?? 1);
    const alpha = 2.0;
    const elp = calcularELP(data.weightKg, Number(cat.gamma_factor), alpha, beta);

    // Ancora on-chain
    let txHash: string | null = null;
    try {
      const r = await anchorHashOnPolygon({ data: { hashHex: data.hashHex } });
      if (r.ok) txHash = r.txHash;
    } catch (e) {
      console.error("anchor failed", e);
    }

    const { data: evento, error: eErr } = await supabase
      .from("disposal_events")
      .insert({
        operator_id: op.id,
        category_id: cat.id,
        batch_id: batch.id,
        weight_kg: data.weightKg,
        alpha,
        beta,
        hash_sha256: data.hashHex,
        polygon_tx_hash: txHash,
        photo_url: photoUrl,
        elp_amount: elp,
        status: txHash ? "aprovado" : "pendente",
      })
      .select("id, elp_amount, status, polygon_tx_hash")
      .single();
    if (eErr || !evento) throw new Error("Falha ao criar evento: " + eErr?.message);

    if (txHash) {
      await supabase
        .from("batches")
        .update({ status: "validado" })
        .eq("id", batch.id);
    }

    return {
      ok: true,
      eventId: evento.id,
      elp: Number(evento.elp_amount ?? 0),
      status: evento.status,
      txHash: evento.polygon_tx_hash,
    };
  });

/** Saldo + estatísticas agregadas do operador autenticado */
export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: op } = await supabase
      .from("operators")
      .select("id, nome, tipo, beta_score")
      .eq("user_id", userId)
      .single();
    if (!op) return null;

    const { data: eventos } = await supabase
      .from("disposal_events")
      .select("id, weight_kg, elp_amount, status, created_at, polygon_tx_hash, categories(nome, risk_level)")
      .eq("operator_id", op.id)
      .order("created_at", { ascending: false })
      .limit(50);

    const lista = eventos ?? [];
    const aprovados = lista.filter((e) => e.status === "aprovado");
    const saldo_elp = aprovados.reduce((s, e) => s + Number(e.elp_amount ?? 0), 0);
    const total_kg = aprovados.reduce((s, e) => s + Number(e.weight_kg), 0);

    return {
      operador: op,
      saldo_elp,
      total_kg,
      total_eventos: lista.length,
      total_aprovados: aprovados.length,
      eventos: lista.slice(0, 10),
      eventos_full: lista,
    };
  });

export const getCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("categories")
      .select("id, nome, gamma_factor, risk_level, descricao")
      .order("gamma_factor", { ascending: false });
    return data ?? [];
  });

/** Lista lotes do operador autenticado com evento vinculado (se houver). */
export const listBatches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: op } = await supabase
      .from("operators")
      .select("id")
      .eq("user_id", userId)
      .single();
    if (!op) return [];

    const { data: batches } = await supabase
      .from("batches")
      .select(
        "id, qr_code, status, created_at, expires_at, disposal_events(id, weight_kg, elp_amount, status, photo_url, hash_sha256, polygon_tx_hash, created_at, categories(nome, risk_level))",
      )
      .eq("operator_id", op.id)
      .order("created_at", { ascending: false })
      .limit(100);

    return batches ?? [];
  });
