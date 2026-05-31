import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

/**
 * Custódia invisível: gera par EVM no servidor, criptografa a chave privada
 * com AES-256-GCM (KEK derivada de SUPABASE_SERVICE_ROLE_KEY) e persiste
 * endereço + cifra na tabela wallets. Usuário nunca vê a seed.
 *
 * Idempotente: se já existir wallet_address, retorna sem regenerar.
 */
const KEK_SALT = "eloop-elp-kek-v1";

function getKek(): Buffer {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("SUPABASE_SERVICE_ROLE_KEY ausente");
  return scryptSync(secret, KEK_SALT, 32);
}

export function encryptPk(pkHex: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKek(), iv);
  const enc = Buffer.concat([cipher.update(pkHex, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // formato: base64(iv)|base64(tag)|base64(cipher)
  return [iv.toString("base64"), tag.toString("base64"), enc.toString("base64")].join("|");
}

export function decryptPk(payload: string): string {
  const [ivB64, tagB64, encB64] = payload.split("|");
  const decipher = createDecipheriv("aes-256-gcm", getKek(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(encB64, "base64")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}

export const ensureCustodialWallet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
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
