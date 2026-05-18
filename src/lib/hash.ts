/** Hash SHA-256 do payload de um evento de descarte. */
export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function buildEventPayload(args: {
  batchId: string;
  weightKg: number;
  categoryId: string;
  operatorWallet?: string | null;
  timestamp?: number;
}): string {
  return [
    args.batchId,
    args.weightKg.toFixed(3),
    args.categoryId,
    args.timestamp ?? Date.now(),
    args.operatorWallet ?? "no-wallet",
  ].join("|");
}

export function generateQrCode(operatorId: string): string {
  // ELP-<operadorPrefix>-<timestamp36>-<random>
  const opPrefix = operatorId.slice(0, 8).toUpperCase();
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ELP-${opPrefix}-${ts}-${rnd}`;
}
