
import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/esg")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Impacto ESG — Eloop Token" }] }),
  component: EsgPage,
});

function EsgPage() {
  const metrics = [
    { label: "REEE rastreado", value: "— kg", sub: "PNRS Art. 33" },
    { label: "CO₂e evitado", value: "— kg", sub: "ISO 14064-2" },
    { label: "ELP emitido", value: "—", sub: "lastro auditável" },
    { label: "Eventos validados", value: "—", sub: "hash on-chain" },
  ];
  return (
    <PageShell title="Indicadores ESG">
      <p className="text-xs mb-4" style={{ color: "#7a8a7a" }}>
        Métricas de impacto calculadas com metodologia ISO 14064-2 sobre
        eventos REEE rastreados em Polygon.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl p-4 border"
            style={{ borderColor: "#1f2a1f", background: "#0F1A0F" }}
          >
            <div className="text-[11px]" style={{ color: "#7a8a7a" }}>
              {m.label}
            </div>
            <div className="text-lg font-bold mt-1" style={{ color: "#1DB954" }}>
              {m.value}
            </div>
            <div
              className="text-[9px] font-semibold tracking-wider mt-1"
              style={{ color: "#7A9E7A" }}
            >
              {m.sub}
            </div>
          </div>
        ))}
      </div>
      <div
        className="mt-6 rounded-2xl border p-5"
        style={{ borderColor: "#1f2a1f", background: "#0F1A0F" }}
      >
        <div className="text-sm font-semibold mb-1">Volume mensal por categoria</div>
        <div className="text-xs" style={{ color: "#7a8a7a" }}>
          Série histórica disponível após primeiro mês fechado.
        </div>
      </div>
    </PageShell>
  );
}
