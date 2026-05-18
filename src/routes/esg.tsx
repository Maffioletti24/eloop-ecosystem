import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

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
    { label: "REEE reciclado", value: "— kg" },
    { label: "CO₂e evitado", value: "— kg" },
    { label: "ELP gerado", value: "—" },
    { label: "Eventos validados", value: "—" },
  ];
  return (
    <PageShell title="Impacto ESG">
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
          </div>
        ))}
      </div>
      <div
        className="mt-6 rounded-2xl border p-5"
        style={{ borderColor: "#1f2a1f", background: "#0F1A0F" }}
      >
        <div className="text-sm font-semibold mb-1">Volume mensal</div>
        <div className="text-xs" style={{ color: "#7a8a7a" }}>
          Gráfico será exibido aqui.
        </div>
      </div>
    </PageShell>
  );
}
