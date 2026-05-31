import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

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
