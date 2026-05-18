import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { anchorHashOnPolygon } from "@/lib/onchain.functions";

/** Checa se o usuário autenticado é validador ativo. */
export const getValidatorStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("validators")
      .select("id, nome, tipo, ativo")
      .eq("user_id", userId)
      .eq("ativo", true)
      .maybeSingle();
    return { isValidator: !!data, validator: data };
  });

/** Lista eventos por status (validador vê todos via RLS). */
export const listEventsForValidator = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        status: z.enum(["pendente", "aprovado", "rejeitado"]).default("pendente"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows } = await supabase
      .from("disposal_events")
      .select(
        "id, weight_kg, elp_amount, status, hash_sha256, polygon_tx_hash, photo_url, created_at, operator_id, categories(nome, risk_level, gamma_factor), operators(nome, cpf_cnpj, tipo)",
      )
      .eq("status", data.status)
      .order("created_at", { ascending: false })
      .limit(100);
    return rows ?? [];
  });

/** Aprova ou rejeita evento. Aprovação tenta ancorar hash se ainda não houver tx. */
export const decideEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        eventId: z.string().uuid(),
        decision: z.enum(["aprovado", "rejeitado"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: validator } = await supabase
      .from("validators")
      .select("id, ativo")
      .eq("user_id", userId)
      .eq("ativo", true)
      .maybeSingle();
    if (!validator) throw new Error("Apenas validadores ativos podem decidir");

    let txHash: string | null = null;
    if (data.decision === "aprovado") {
      const { data: ev } = await supabase
        .from("disposal_events")
        .select("hash_sha256, polygon_tx_hash")
        .eq("id", data.eventId)
        .single();
      if (ev && !ev.polygon_tx_hash && ev.hash_sha256) {
        try {
          const r = await anchorHashOnPolygon({ data: { hashHex: ev.hash_sha256 } });
          if (r.ok) txHash = r.txHash;
        } catch (e) {
          console.error("anchor on approval failed", e);
        }
      }
    }

    const patch: Record<string, unknown> = {
      status: data.decision,
      validator_id: validator.id,
      updated_at: new Date().toISOString(),
    };
    if (txHash) patch.polygon_tx_hash = txHash;

    const { error } = await supabase
      .from("disposal_events")
      .update(patch)
      .eq("id", data.eventId);
    if (error) throw new Error(error.message);

    return { ok: true, txHash };
  });
