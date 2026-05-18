import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/carteira")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Carteira ELP — Eloop Token" }] }),
  component: CarteiraPage,
});

const POOLS = [
  { label: "Operação", pct: 40, color: "#1DB954" },
  { label: "Reserva técnica", pct: 25, color: "#4FA8E8" },
  { label: "Ecossistema", pct: 20, color: "#B084E8" },
  { label: "Tesouro", pct: 15, color: "#F5B544" },
];

function CarteiraPage() {
  return (
    <PageShell title="Carteira ELP">
      <div
        className="rounded-2xl border p-6 text-center"
        style={{
          borderColor: "#1DB954",
          background: "linear-gradient(135deg, #0F1A0F, #0A0F0A)",
        }}
      >
        <div
          className="text-[10px] font-semibold tracking-[0.14em]"
          style={{ color: "#7A9E7A" }}
        >
          SALDO DE CONFORMIDADE
        </div>
        <div className="text-4xl font-bold mt-2" style={{ color: "#1DB954" }}>
          —
        </div>
        <div className="text-xs mt-1" style={{ color: "#7a8a7a" }}>
          ELP · lastreado em REEE rastreado
        </div>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <span
            className="text-[9px] font-bold tracking-wider px-2 py-1 rounded-md"
            style={{ background: "rgba(29,185,84,0.18)", color: "#1DB954" }}
          >
            ON-CHAIN · POLYGON
          </span>
        </div>
      </div>

      <div
        className="mt-4 rounded-2xl border p-4"
        style={{ borderColor: "#1f2a1f", background: "#0F1A0F" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold" style={{ color: "#E8F5E8" }}>
            Tokenomics · hard cap 250M ELP
          </div>
          <span className="text-[10px]" style={{ color: "#7a8a7a" }}>
            v2026.1
          </span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden">
          {POOLS.map((p) => (
            <div
              key={p.label}
              style={{ width: `${p.pct}%`, background: p.color }}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {POOLS.map((p) => (
            <div key={p.label} className="flex items-center gap-2 text-[11px]">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: p.color }}
              />
              <span style={{ color: "#E8F5E8" }}>{p.label}</span>
              <span style={{ color: "#7a8a7a" }}>{p.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-4 rounded-2xl border p-4 text-xs"
        style={{ borderColor: "#1f2a1f", background: "#0F1A0F", color: "#7a8a7a" }}
      >
        <div className="font-semibold mb-1" style={{ color: "#E8F5E8" }}>
          Histórico on-chain
        </div>
        Cada emissão é ancorada em transação Polygon com hash SHA-256 do evento.
        Histórico detalhado disponível em breve.
      </div>
    </PageShell>
  );
}
