import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createWalletClient, http, createPublicClient, formatEther, type Hex } from "viem";
import { polygon } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

/**
 * Diagnóstico da carteira de ancoragem — retorna endereço público e saldo
 * em POL (MATIC) na Polygon Mainnet. Use para saber para onde enviar gás
 * e monitorar o saldo durante o beta.
 *
 * Custo estimado por evento: ~0.0005 POL (~$0.0003).
 * Recomendado: manter ≥ 1 POL na carteira para ~2.000 eventos.
 */
export const getAnchorWalletStatus = createServerFn({ method: "GET" }).handler(
  async () => {
    const pkRaw = process.env.POLYGON_PRIVATE_KEY;
    if (!pkRaw) {
      return {
        ok: false as const,
        error: "POLYGON_PRIVATE_KEY não configurada",
      };
    }
    try {
      const pk = (pkRaw.startsWith("0x") ? pkRaw : `0x${pkRaw}`) as Hex;
      const account = privateKeyToAccount(pk);
      const publicClient = createPublicClient({
        chain: polygon,
        transport: http("https://polygon-rpc.com"),
      });
      const balanceWei = await publicClient.getBalance({ address: account.address });
      const balancePol = formatEther(balanceWei);
      const estEvents = Math.floor(Number(balancePol) / 0.0005);
      return {
        ok: true as const,
        address: account.address,
        balancePol,
        estEvents,
        explorer: `https://polygonscan.com/address/${account.address}`,
        needsFunding: Number(balancePol) < 0.1,
      };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  },
);

/**
 * Ancora o hash SHA-256 de um evento na Polygon Mainnet enviando uma
 * transação 0-value com o hash no calldata. Retorna o tx_hash on-chain.
 *
 * Esta abordagem é independente do contrato Eloop específico e funciona
 * como um carimbo de tempo verificável (proof-of-existence) imutável.
 * Custo: ~$0.001 por tx.
 */
export const anchorHashOnPolygon = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        hashHex: z.string().regex(/^[a-f0-9]{64}$/i, "Hash SHA-256 hex inválido"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const pkRaw = process.env.POLYGON_PRIVATE_KEY;
    if (!pkRaw) {
      return { ok: false as const, error: "POLYGON_PRIVATE_KEY não configurada" };
    }
    const pk = (pkRaw.startsWith("0x") ? pkRaw : `0x${pkRaw}`) as Hex;

    try {
      const account = privateKeyToAccount(pk);
      const rpcUrl =
        process.env.POLYGON_RPC_URL ?? "https://polygon-bor-rpc.publicnode.com";
      const transport = http(rpcUrl);
      const publicClient = createPublicClient({ chain: polygon, transport });
      const wallet = createWalletClient({ account, chain: polygon, transport });

      // self-tx com hash no data (proof-of-existence)
      const calldata = `0x${data.hashHex.toLowerCase()}` as Hex;
      const txHash = await wallet.sendTransaction({
        to: account.address,
        value: 0n,
        data: calldata,
      });

      // não esperar confirmação — só ack do mempool
      return {
        ok: true as const,
        txHash,
        from: account.address,
        explorer: `https://polygonscan.com/tx/${txHash}`,
      };
    } catch (e) {
      console.error("anchorHashOnPolygon error", e);
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  });
