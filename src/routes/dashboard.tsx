import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { requireAuth } from "@/lib/require-auth";
import { EloopLogo } from "@/components/EloopLogo";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Dashboard ELP — Eloop Token" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <PageShell title="Dashboard ELP" showBack={false}>
      <div className="flex justify-center mb-4">
        <EloopLogo size={80} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Saldo ELP", value: "—" },
          { label: "Kg reciclados", value: "—" },
          { label: "CO₂e evitado", value: "—" },
          { label: "Eventos", value: "—" },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-2xl p-4 border"
            style={{ borderColor: "#1f2a1f", background: "#0F1A0F" }}
          >
            <div className="text-[11px]" style={{ color: "#7a8a7a" }}>
              {k.label}
            </div>
            <div className="text-xl font-bold mt-1" style={{ color: "#1DB954" }}>
              {k.value}
            </div>
          </div>
        ))}
      </div>
      <div
        className="mt-6 rounded-2xl p-4 border text-sm"
        style={{ borderColor: "#1f2a1f", background: "#0F1A0F" }}
      >
        Eventos recentes aparecerão aqui.
      </div>
    </PageShell>
  );
}
