import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";


/**
 * Gera certificado PNRS (PF) em PDF e faz upload no bucket `certificates`.
 * Retorna a URL assinada por 7 dias.
 */
export const generateCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ eventId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // 1) Busca evento + operador + categoria com RLS do usuário
    const { data: evento, error } = await supabase
      .from("disposal_events")
      .select(
        "id, weight_kg, elp_amount, hash_sha256, polygon_tx_hash, created_at, alpha, beta, category_id, operator_id",
      )
      .eq("id", data.eventId)
      .single();
    if (error || !evento) throw new Error("Evento não encontrado");

    const { data: operador } = await supabase
      .from("operators")
      .select("nome, cpf_cnpj, tipo")
      .eq("id", evento.operator_id)
      .single();
    const { data: categoria } = await supabase
      .from("categories")
      .select("nome, gamma_factor")
      .eq("id", evento.category_id)
      .single();

    // 2) Sequencial baseado em timestamp (curto e único)
    const numero = `ELP-PF-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;

    // 3) Monta PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const green = rgb(0.114, 0.729, 0.329);
    const ink = rgb(0.12, 0.16, 0.12);
    const dim = rgb(0.48, 0.62, 0.48);

    // Header
    page.drawRectangle({ x: 0, y: 792, width: 595, height: 50, color: green });
    page.drawText("ELOOP TOKEN", { x: 40, y: 815, size: 14, font: bold, color: rgb(1, 1, 1) });
    page.drawText("CERTIFICADO DE CONFORMIDADE PNRS", {
      x: 40, y: 800, size: 10, font, color: rgb(1, 1, 1),
    });
    page.drawText(`Nº ${numero}`, { x: 430, y: 808, size: 10, font: bold, color: rgb(1, 1, 1) });

    page.drawText("Lei Federal 12.305/2010 — Política Nacional de Resíduos Sólidos", {
      x: 40, y: 760, size: 9, font, color: dim,
    });
    page.drawText("Decreto 10.936/2022 — SINIR", {
      x: 40, y: 748, size: 9, font, color: dim,
    });

    // Dados
    const linhas: Array<[string, string]> = [
      ["Operador:", operador?.nome ?? "—"],
      ["CPF/CNPJ:", operador?.cpf_cnpj ?? "—"],
      ["Tipo:", operador?.tipo ?? "—"],
      ["Data do descarte:", new Date(evento.created_at).toLocaleString("pt-BR")],
      ["Categoria REEE:", categoria?.nome ?? "—"],
      ["Fator γ:", String(categoria?.gamma_factor ?? "—")],
      ["Peso certificado:", `${Number(evento.weight_kg).toFixed(3)} kg`],
      ["α (taxa):", String(evento.alpha)],
      ["β (score operador):", String(evento.beta)],
      ["ELP emitido:", `${Number(evento.elp_amount ?? 0).toFixed(2)} ELP`],
    ];

    let y = 700;
    for (const [label, value] of linhas) {
      page.drawText(label, { x: 40, y, size: 10, font: bold, color: ink });
      page.drawText(value, { x: 200, y, size: 10, font, color: ink });
      y -= 22;
    }

    // Proof box
    y -= 10;
    page.drawRectangle({
      x: 40, y: y - 90, width: 515, height: 100,
      borderColor: green, borderWidth: 1, color: rgb(0.96, 0.99, 0.96),
    });
    page.drawText("PROVA DE EXISTÊNCIA — POLYGON MAINNET", {
      x: 50, y: y - 10, size: 9, font: bold, color: green,
    });
    page.drawText("Hash SHA-256:", { x: 50, y: y - 30, size: 9, font: bold, color: ink });
    page.drawText(evento.hash_sha256 ?? "—", { x: 50, y: y - 44, size: 7, font, color: ink });
    page.drawText("TX Polygon:", { x: 50, y: y - 62, size: 9, font: bold, color: ink });
    page.drawText(evento.polygon_tx_hash ?? "—", { x: 50, y: y - 76, size: 7, font, color: ink });

    // Footer
    page.drawText("Certificado emitido eletronicamente — válido sem assinatura física.", {
      x: 40, y: 60, size: 8, font, color: dim,
    });
    page.drawText(`Verifique em polygonscan.com/tx/${(evento.polygon_tx_hash ?? "").slice(0, 20)}…`, {
      x: 40, y: 48, size: 8, font, color: dim,
    });

    const pdfBytes = await pdfDoc.save();

    // 4) Upload no storage (pasta = userId, exigido pelas policies)
    const path = `${userId}/${numero}.pdf`;
    const { error: upErr } = await supabase.storage
      .from("certificates")
      .upload(path, pdfBytes, { contentType: "application/pdf", upsert: true });
    if (upErr) throw new Error(`Upload falhou: ${upErr.message}`);

    const { data: signed } = await supabase.storage
      .from("certificates")
      .createSignedUrl(path, 60 * 60 * 24 * 7);

    // 5) Registra na tabela certificates
    await supabase.from("certificates").insert({
      event_id: evento.id,
      tipo: "PF",
      numero_sequencial: numero,
      pdf_url: signed?.signedUrl ?? null,
      assinado_at: new Date().toISOString(),
    });

    return { ok: true, numero, pdfUrl: signed?.signedUrl ?? null };
  });
