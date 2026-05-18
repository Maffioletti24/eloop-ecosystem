import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/conformidade")({
  head: () => ({ meta: [{ title: "Conformidade & SINIR" }] }),
  component: ConformidadePage,
});

function ConformidadePage() {
  return (
    <PageShell title="Conformidade & SINIR">
      <p className="text-sm mb-4" style={{ color: "#7a8a7a" }}>
        Relatórios consolidados para o SINIR.
      </p>
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
                Nenhum registro ainda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
