import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/carteira")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Carteira ELP — Eloop Token" }] }),
  component: CarteiraPage,
});

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
        <div className="text-xs" style={{ color: "#7a8a7a" }}>
          Saldo disponível
        </div>
        <div className="text-4xl font-bold mt-2" style={{ color: "#1DB954" }}>
          —
        </div>
        <div className="text-xs mt-1" style={{ color: "#7a8a7a" }}>
          ELP
        </div>
      </div>
      <div
        className="mt-6 rounded-2xl border p-4 text-sm"
        style={{ borderColor: "#1f2a1f", background: "#0F1A0F", color: "#7a8a7a" }}
      >
        Histórico de movimentações em breve.
      </div>
    </PageShell>
  );
}
