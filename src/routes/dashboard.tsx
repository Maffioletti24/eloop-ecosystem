import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bell,
  PlusCircle,
  FileText,
  Leaf,
  Wallet,
  Smartphone,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { EloopLogo } from "@/components/EloopLogo";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [{ title: "Dashboard ELP — Eloop Token" }],
  }),
  component: DashboardPage,
});

const COLORS = {
  bg: "#0A0F0A",
  surface: "#111A11",
  ring: "rgba(29,185,84,0.20)",
  green: "#1DB954",
  greenMuted: "#7A9E7A",
  amber: "#F5B544",
  blue: "#4FA8E8",
  purple: "#B084E8",
  text: "#E8F5E8",
  dim: "#7a8a7a",
};

function DashboardPage() {
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "");
    });
  }, []);

  return (
    <div
      className="min-h-screen mx-auto max-w-[390px] pb-24"
      style={{ background: COLORS.bg, color: COLORS.text }}
    >
      {/* HEADER */}
      <header className="flex items-center gap-3 px-5 pt-6 pb-4">
        <EloopLogo size={32} />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-medium" style={{ color: COLORS.greenMuted }}>
            Bem-vindo de volta
          </div>
          <div className="text-sm font-semibold truncate" style={{ color: COLORS.text }}>
            {email || "—"}
          </div>
        </div>
        <button
          type="button"
          aria-label="Notificações"
          className="relative h-10 w-10 rounded-full flex items-center justify-center"
          style={{ background: COLORS.surface, color: COLORS.text }}
        >
          <Bell className="h-5 w-5" />
          <span
            className="absolute top-2 right-2 h-2 w-2 rounded-full"
            style={{ background: COLORS.green }}
          />
        </button>
      </header>

      <div className="px-5 space-y-4">
        {/* BALANCE CARD */}
        <section
          className="rounded-2xl border p-5"
          style={{ background: COLORS.surface, borderColor: COLORS.ring }}
        >
          <div
            className="text-[10px] font-semibold tracking-[0.14em]"
            style={{ color: COLORS.greenMuted }}
          >
            SALDO ELP · CARTEIRA DE CONFORMIDADE
          </div>
          <div
            className="mt-2 font-bold leading-none"
            style={{ color: COLORS.text, fontSize: 36 }}
          >
            150,5 <span className="text-2xl font-semibold" style={{ color: COLORS.greenMuted }}>ELP</span>
          </div>
          <div className="mt-2 text-xs" style={{ color: COLORS.dim }}>
            α = 2.0 ELP/kg · R$ 1.204,00
          </div>

          <div
            className="my-4 h-px"
            style={{ background: "rgba(29,185,84,0.15)" }}
          />

          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat value="247" unit="eventos" color={COLORS.green} />
            <Stat value="1.240" unit="kg" color={COLORS.green} />
            <Stat value="3,1t" unit="CO₂e" color={COLORS.amber} />
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="grid grid-cols-2 gap-3">
          <ActionCard
            to="/registro"
            label="Registrar Descarte"
            sub="Novo evento REEE"
            icon={<PlusCircle className="h-5 w-5" />}
            tint={COLORS.green}
          />
          <ActionCard
            to="/conformidade"
            label="Relatório SINIR"
            sub="Conformidade mensal"
            icon={<FileText className="h-5 w-5" />}
            tint={COLORS.amber}
          />
          <ActionCard
            to="/esg"
            label="Indicadores ESG"
            sub="Impacto & métricas"
            icon={<Leaf className="h-5 w-5" />}
            tint={COLORS.blue}
          />
          <ActionCard
            to="/carteira"
            label="Minha Carteira ELP"
            sub="Saldo & histórico"
            icon={<Wallet className="h-5 w-5" />}
            tint={COLORS.purple}
          />
        </section>

        {/* KPI STRIP */}
        <section
          className="rounded-2xl border p-4"
          style={{ background: COLORS.surface, borderColor: "rgba(29,185,84,0.12)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold" style={{ color: COLORS.text }}>
              KPIs do Piloto · <span style={{ color: COLORS.dim }}>Mês 3</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider"
              style={{ color: COLORS.green }}>
              <span
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ background: COLORS.green }}
              />
              AO VIVO
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Kpi label="SCAN RATE" value="94%" />
            <Kpi label="UPTIME" value="99.1%" />
            <Kpi label="TX CUSTO" value="<$0.01" />
            <Kpi label="β SCORE" value="1.12" />
          </div>
        </section>

        {/* RECENT EVENTS */}
        <section>
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-sm font-bold" style={{ color: COLORS.text }}>
              Eventos Recentes
            </h2>
            <Link
              to="/conformidade"
              className="text-xs font-medium flex items-center gap-0.5"
              style={{ color: COLORS.green }}
            >
              ver todos <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: COLORS.surface, borderColor: "rgba(29,185,84,0.12)" }}
          >
            <EventRow
              icon={<Smartphone className="h-4 w-4" />}
              title="Smartphones · Lote #2024-A"
              meta="há 2 horas · 15 kg"
              amount="+30 ELP"
            />
            <div className="h-px mx-4" style={{ background: "rgba(29,185,84,0.10)" }} />
            <EventRow
              icon={<Smartphone className="h-4 w-4" />}
              title="Smartphones · Lote #2024-B"
              meta="ontem · 12 kg"
              amount="+24 ELP"
            />
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}

function Stat({ value, unit, color }: { value: string; unit: string; color: string }) {
  return (
    <div>
      <div className="text-base font-bold leading-none" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] mt-1" style={{ color: COLORS.dim }}>
        {unit}
      </div>
    </div>
  );
}

function ActionCard({
  to,
  label,
  sub,
  icon,
  tint,
}: {
  to: "/registro" | "/conformidade" | "/esg" | "/carteira";
  label: string;
  sub: string;
  icon: React.ReactNode;
  tint: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-2xl border p-4 flex flex-col gap-3 transition active:scale-[0.98]"
      style={{ background: COLORS.surface, borderColor: "rgba(29,185,84,0.12)" }}
    >
      <div
        className="h-9 w-9 rounded-xl flex items-center justify-center"
        style={{ background: `${tint}1F`, color: tint }}
      >
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold leading-tight" style={{ color: COLORS.text }}>
          {label}
        </div>
        <div className="text-[11px] mt-0.5" style={{ color: COLORS.dim }}>
          {sub}
        </div>
      </div>
    </Link>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl px-2 py-2.5 text-center"
      style={{ background: "#0A0F0A", border: "1px solid rgba(29,185,84,0.10)" }}
    >
      <div className="text-[8.5px] font-semibold tracking-wider" style={{ color: COLORS.dim }}>
        {label}
      </div>
      <div className="text-[13px] font-bold mt-1" style={{ color: COLORS.text }}>
        {value}
      </div>
    </div>
  );
}

function EventRow({
  icon,
  title,
  meta,
  amount,
}: {
  icon: React.ReactNode;
  title: string;
  meta: string;
  amount: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div
        className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "rgba(29,185,84,0.12)", color: COLORS.green }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: COLORS.text }}>
          {title}
        </div>
        <div className="text-[11px]" style={{ color: COLORS.dim }}>
          {meta}
        </div>
      </div>
      <div className="text-sm font-bold" style={{ color: COLORS.green }}>
        {amount}
      </div>
    </div>
  );
}
