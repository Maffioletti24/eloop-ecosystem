import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { createHash } from "crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { anchorHashOnPolygon } from "@/lib/onchain.functions";

/**
 * Queima ELP do saldo de um comprador (role 'buyer') e emite certificado
 * de compensação ambiental com prova on-chain (Polygon).
 *
 * Fluxo:
 * 1) Verifica role = 'buyer' e saldo suficiente
 * 2) Decrementa saldo da wallet (via admin para contornar triggers de evento)
 * 3) Ancora hash da queima na Polygon
 * 4) Gera PDF e faz upload no bucket `certificates`
 * 5) Persiste linha em `compensations`
 */
export const burnElpForCompensation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        amount: z.number().positive().max(1_000_000),
        finalidade: z.string().min(3).max(280),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: op, error: opErr } = await supabase
      .from("operators")
      .select("id, nome, cpf_cnpj, role")
      .eq("user_id", userId)
      .single();
    if (opErr || !op) throw new Error("Operador não encontrado");
    if (op.role !== "buyer")
      throw new Error("Apenas perfis comprador podem compensar (queimar) ELP.");

    const { data: w, error: wErr } = await supabase
      .from("wallets")
      .select("saldo_elp, wallet_address")
      .eq("user_id", userId)
      .single();
    if (wErr || !w) throw new Error("Carteira não encontrada");
    const saldo = Number(w.saldo_elp ?? 0);
    if (saldo < data.amount)
      throw new Error(`Saldo insuficiente: ${saldo.toFixed(2)} ELP`);

    // Decremento via admin (evita conflito com trigger sync de eventos)
    const novoSaldo = saldo - data.amount;
    const { error: updErr } = await supabaseAdmin
      .from("wallets")
      .update({ saldo_elp: novoSaldo })
      .eq("user_id", userId);
    if (updErr) throw new Error("Falha ao debitar saldo: " + updErr.message);

    // Hash + âncora on-chain
    const payload = JSON.stringify({
      buyer: op.cpf_cnpj,
      amount: data.amount,
      finalidade: data.finalidade,
      at: new Date().toISOString(),
    });
    const hashHex = createHash("sha256").update(payload).digest("hex");

    let txHash: string | null = null;
    try {
      const r = await anchorHashOnPolygon({ data: { hashHex } });
      if (r.ok) txHash = r.txHash;
    } catch (e) {
      console.error("anchor compensação falhou", e);
    }

    const numero = `ELP-COMP-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;

    // PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const green = rgb(0.114, 0.729, 0.329);
    const ink = rgb(0.12, 0.16, 0.12);
    const dim = rgb(0.48, 0.62, 0.48);

    page.drawRectangle({ x: 0, y: 792, width: 595, height: 50, color: green });
    page.drawText("ELOOP TOKEN", { x: 40, y: 815, size: 14, font: bold, color: rgb(1, 1, 1) });
    page.drawText("CERTIFICADO DE COMPENSAÇÃO AMBIENTAL", {
      x: 40, y: 800, size: 10, font, color: rgb(1, 1, 1),
    });
    page.drawText(`Nº ${numero}`, { x: 410, y: 808, size: 10, font: bold, color: rgb(1, 1, 1) });

    page.drawText("Queima de tokens ELP — Lei 12.305/2010 (PNRS)", {
      x: 40, y: 760, size: 9, font, color: dim,
    });

    const linhas: Array<[string, string]> = [
      ["Comprador:", op.nome ?? "—"],
      ["CPF/CNPJ:", op.cpf_cnpj ?? "—"],
      ["Data:", new Date().toLocaleString("pt-BR")],
      ["ELP queimado:", `${data.amount.toFixed(2)} ELP`],
      ["Saldo remanescente:", `${novoSaldo.toFixed(2)} ELP`],
      ["Finalidade:", data.finalidade],
    ];
    let y = 700;
    for (const [label, value] of linhas) {
      page.drawText(label, { x: 40, y, size: 10, font: bold, color: ink });
      page.drawText(value.length > 70 ? value.slice(0, 67) + "..." : value, {
        x: 200, y, size: 10, font, color: ink,
      });
      y -= 22;
    }

    y -= 10;
    page.drawRectangle({
      x: 40, y: y - 90, width: 515, height: 100,
      borderColor: green, borderWidth: 1, color: rgb(0.96, 0.99, 0.96),
    });
    page.drawText("PROVA DE QUEIMA — POLYGON MAINNET", {
      x: 50, y: y - 10, size: 9, font: bold, color: green,
    });
    page.drawText("Hash SHA-256:", { x: 50, y: y - 30, size: 9, font: bold, color: ink });
    page.drawText(hashHex, { x: 50, y: y - 44, size: 7, font, color: ink });
    page.drawText("TX Polygon:", { x: 50, y: y - 62, size: 9, font: bold, color: ink });
    page.drawText(txHash ?? "—", { x: 50, y: y - 76, size: 7, font, color: ink });

    page.drawText("Certificado eletrônico — válido sem assinatura física.", {
      x: 40, y: 60, size: 8, font, color: dim,
    });

    const pdfBytes = await pdfDoc.save();
    const path = `${userId}/${numero}.pdf`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("certificates")
      .upload(path, pdfBytes, { contentType: "application/pdf", upsert: true });
    if (upErr) throw new Error("Upload falhou: " + upErr.message);

    const { data: signed } = await supabaseAdmin.storage
      .from("certificates")
      .createSignedUrl(path, 60 * 60 * 24 * 30);

    const { error: insErr } = await supabase.from("compensations").insert({
      operator_id: op.id,
      elp_burned: data.amount,
      finalidade: data.finalidade,
      numero_sequencial: numero,
      polygon_tx_hash: txHash,
      pdf_url: signed?.signedUrl ?? null,
    });
    if (insErr) throw new Error("Falha ao registrar compensação: " + insErr.message);

    return {
      ok: true as const,
      numero,
      txHash,
      pdfUrl: signed?.signedUrl ?? null,
      novoSaldo,
    };
  });

/** Lista compensações do comprador autenticado */
export const listCompensations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: op } = await supabase
      .from("operators")
      .select("id, role")
      .eq("user_id", userId)
      .single();
    if (!op) return { role: null, items: [], saldo: 0 };

    const [{ data: items }, { data: w }] = await Promise.all([
      supabase
        .from("compensations")
        .select("id, elp_burned, finalidade, numero_sequencial, polygon_tx_hash, pdf_url, created_at")
        .eq("operator_id", op.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("wallets").select("saldo_elp").eq("user_id", userId).maybeSingle(),
    ]);

    return {
      role: op.role,
      items: items ?? [],
      saldo: Number(w?.saldo_elp ?? 0),
    };
  });
