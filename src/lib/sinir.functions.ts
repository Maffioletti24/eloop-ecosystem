import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Gera relatório SINIR (agrega eventos aprovados no período) e devolve totais + CSV.
 */
export const generateSinirReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        inicio: z.string(), // ISO date
        fim: z.string(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Pega o operator do usuário
    const { data: op } = await supabase
      .from("operators")
      .select("id, nome, cpf_cnpj")
      .eq("user_id", userId)
      .single();
    if (!op) throw new Error("Operador não encontrado");

    const { data: eventos, error } = await supabase
      .from("disposal_events")
      .select("id, weight_kg, elp_amount, hash_sha256, polygon_tx_hash, created_at, categories(nome, gamma_factor, risk_level)")
      .eq("operator_id", op.id)
      .eq("status", "aprovado")
      .gte("created_at", data.inicio)
      .lte("created_at", data.fim)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);

    const lista = eventos ?? [];
    const total_kg = lista.reduce((s, e) => s + Number(e.weight_kg), 0);
    const total_elp = lista.reduce((s, e) => s + Number(e.elp_amount ?? 0), 0);

    // CSV
    const header = "id,data,categoria,peso_kg,elp,hash_sha256,polygon_tx\n";
    const rows = lista
      .map((e) => {
        const cat = (e as { categories?: { nome?: string } | null }).categories;
        return [
          e.id,
          new Date(e.created_at).toISOString(),
          cat?.nome ?? "",
          Number(e.weight_kg).toFixed(3),
          Number(e.elp_amount ?? 0).toFixed(2),
          e.hash_sha256 ?? "",
          e.polygon_tx_hash ?? "",
        ].join(",");
      })
      .join("\n");
    const csv = header + rows;

    // Persiste o registro
    await supabase.from("sinir_reports").insert({
      operator_id: op.id,
      periodo_inicio: data.inicio.slice(0, 10),
      periodo_fim: data.fim.slice(0, 10),
      total_kg,
      total_elp,
      total_eventos: lista.length,
    });

    return {
      ok: true,
      total_kg,
      total_elp,
      total_eventos: lista.length,
      csv,
      operador: op,
    };
  });
