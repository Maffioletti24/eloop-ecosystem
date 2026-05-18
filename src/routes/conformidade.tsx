import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/conformidade")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Conformidade & SINIR — Eloop Token" }] }),
  component: ConformidadePage,
});

const STATUS = [
  { label: "PNRS Lei 12.305/2010", status: "Conforme", tone: "#1DB954" },
  { label: "SINIR · MMA", status: "Exportação ativa", tone: "#1DB954" },
  { label: "ABNT NBR 16156", status: "Categorias mapeadas", tone: "#1DB954" },
  { label: "ISO 14064-2 · CO₂e", status: "Metodologia aplicada", tone: "#4FA8E8" },
];

function ConformidadePage() {
  return (
    <PageShell title="Conformidade & SINIR">
      <p className="text-sm mb-4" style={{ color: "#7a8a7a" }}>
        Evidências auditáveis de logística reversa REEE conforme PNRS,
        exportáveis em formato SINIR (PDF/CSV).
      </p>

      <div className="grid grid-cols-2 gap-2 mb-5">
        {STATUS.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border p-3"
            style={{ borderColor: "rgba(29,185,84,0.18)", background: "#0F1A0F" }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: s.tone }}
              />
              <span className="text-[9px] font-bold tracking-wider" style={{ color: s.tone }}>
                {s.status.toUpperCase()}
              </span>
            </div>
            <div className="text-[11px] font-medium" style={{ color: "#E8F5E8" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          className="flex-1 rounded-xl py-2.5 text-xs font-semibold"
          style={{ background: "#1DB954", color: "#0A0F0A" }}
        >
          Exportar PDF SINIR
        </button>
        <button
          type="button"
          className="flex-1 rounded-xl py-2.5 text-xs font-semibold border"
          style={{ borderColor: "rgba(29,185,84,0.30)", color: "#1DB954" }}
        >
          Exportar CSV
        </button>
      </div>

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: "#1f2a1f", background: "#0F1A0F" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: "#7a8a7a" }}>
              <th className="text-left p-3 font-medium">Data</th>
              <th className="text-left p-3 font-medium">Categoria</th>
              <th className="text-right p-3 font-medium">Kg</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 text-center" colSpan={3} style={{ color: "#7a8a7a" }}>
                Nenhum registro no período.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
