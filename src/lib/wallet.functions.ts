import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Custódia invisível: gera par EVM no servidor, criptografa a chave privada
 * com AES-256-GCM (KEK derivada de SUPABASE_SERVICE_ROLE_KEY) e persiste
 * endereço + cifra na tabela wallets. Usuário nunca vê a seed.
 *
 * Idempotente: se já existir wallet_address, retorna sem regenerar.
 *
 * IMPORTANTE: imports server-only (node:crypto, supabaseAdmin, viem)
 * ficam dentro do .handler() para não vazar no bundle do cliente.
 */
export const ensureCustodialWallet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { generatePrivateKey, privateKeyToAccount } = await import("viem/accounts");
    const { encryptPk } = await import("./wallet.server");

    const userId = context.userId;

    const { data: existing, error: readErr } = await supabaseAdmin
      .from("wallets")
      .select("wallet_address, encrypted_pk")
      .eq("user_id", userId)
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);

    if (existing?.wallet_address && existing?.encrypted_pk) {
      return { ok: true as const, address: existing.wallet_address, created: false };
    }

    const pk = generatePrivateKey();
    const account = privateKeyToAccount(pk);
    const encrypted = encryptPk(pk);

    const { error: upErr } = await supabaseAdmin
      .from("wallets")
      .upsert(
        {
          user_id: userId,
          wallet_address: account.address,
          encrypted_pk: encrypted,
          custody: "custodial",
        },
        { onConflict: "user_id" },
      );
    if (upErr) throw new Error(upErr.message);

    return { ok: true as const, address: account.address, created: true };
  });
