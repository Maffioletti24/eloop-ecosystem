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
  Inbox,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { EloopLogo } from "@/components/EloopLogo";
import { requireAuth } from "@/lib/require-auth";
import { formatELP, formatKg, estimarCO2e } from "@/lib/elp";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Flame } from "lucide-react";
import type { AppRole } from "@/lib/require-role";

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

type RecentEvent = {
  id: string;
  weight_kg: number;
  elp_amount: number | null;
  created_at: string;
  categories: { nome: string; risk_level: "alto" | "medio" | "baixo" } | null;
};

type DashboardData = {
  saldo: number;
  totalEventos: number;
  totalKg: number;
  totalCO2e: number;
  events: RecentEvent[];
  kpi: {
    scan_rate: number | null;
    uptime: number | null;
    tx_custo: number | null;
    beta_score: number | null;
  } | null;
};

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  return `há ${Math.floor(diff / 86400)} d`;
}

function DashboardPage() {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData>({
    saldo: 0,
    totalEventos: 0,
    totalKg: 0,
    totalCO2e: 0,
    events: [],
    kpi: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: userData, error: authErr } = await supabase.auth.getUser();
        if (authErr) throw authErr;
        const user = userData.user;
        if (!user) return;
        if (!cancelled) setEmail(user.email ?? "");

        const [walletRes, eventsRes, kpiRes, allEventsRes] = await Promise.all([
          supabase
            .from("wallets")
            .select("saldo_elp")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("disposal_events")
            .select(
              "id, weight_kg, elp_amount, created_at, categories(nome, risk_level)",
            )
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("kpis")
            .select("scan_rate, uptime, tx_custo, beta_score")
            .order("periodo", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("disposal_events")
            .select("weight_kg, categories(risk_level)"),
        ]);

        const firstErr =
          walletRes.error ?? eventsRes.error ?? kpiRes.error ?? allEventsRes.error;
        if (firstErr) throw firstErr;

        const totalEventos = allEventsRes.data?.length ?? 0;
        const totalKg =
          allEventsRes.data?.reduce((s, e) => s + Number(e.weight_kg ?? 0), 0) ??
          0;
        const totalCO2e =
          allEventsRes.data?.reduce((s, e) => {
            const risk =
              (e.categories as { risk_level?: "alto" | "medio" | "baixo" } | null)
                ?.risk_level ?? "baixo";
            return s + estimarCO2e(Number(e.weight_kg ?? 0), risk);
          }, 0) ?? 0;

        if (cancelled) return;
        setData({
          saldo: Number(walletRes.data?.saldo_elp ?? 0),
          totalEventos,
          totalKg,
          totalCO2e,
          events: (eventsRes.data ?? []) as RecentEvent[],
          kpi: kpiRes.data ?? null,
        });
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Erro ao carregar dados");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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
          <div
            className="text-[11px] font-medium"
            style={{ color: COLORS.greenMuted }}
          >
            Bem-vindo de volta
          </div>
          <div
            className="text-sm font-semibold truncate"
            style={{ color: COLORS.text }}
          >
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
        {error && (
          <Alert
            variant="destructive"
            className="border-red-500/30 bg-red-500/10 text-red-200"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar dashboard</AlertTitle>
            <AlertDescription className="text-red-200/80 text-xs">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* BALANCE CARD */}
        <section
          className="rounded-2xl border p-5"
          style={{ background: COLORS.surface, borderColor: COLORS.ring }}
        >
          <div className="flex items-center justify-between">
            <div
              className="text-[10px] font-semibold tracking-[0.14em]"
              style={{ color: COLORS.greenMuted }}
            >
              SALDO ELP · CARTEIRA DE CONFORMIDADE
            </div>
            <span
              className="text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-md"
              style={{ background: `${COLORS.green}22`, color: COLORS.green }}
            >
              ON-CHAIN · POLYGON
            </span>
          </div>
          {loading ? (
            <Skeleton className="mt-2 h-9 w-40 bg-white/5" />
          ) : (
            <div
              className="mt-2 font-bold leading-none"
              style={{ color: COLORS.text, fontSize: 36 }}
            >
              {formatELP(data.saldo)}{" "}
              <span
                className="text-2xl font-semibold"
                style={{ color: COLORS.greenMuted }}
              >
                ELP
              </span>
            </div>
          )}
          <div className="mt-2 text-xs flex items-center gap-2" style={{ color: COLORS.dim }}>
            <span>α = 2.0 ELP/kg</span>
            {!loading && data.saldo > 0 && (
              <>
                <span>·</span>
                <span style={{ color: COLORS.text }}>
                  ≈ R$ {formatELP(data.saldo * 8)}
                </span>
              </>
            )}
          </div>
          <div
            className="mt-3 rounded-lg px-2.5 py-1.5 text-[10px] font-mono flex items-center justify-between"
            style={{ background: "#0A0F0A", color: COLORS.dim }}
          >
            <span>contrato 0x6b01…DE26</span>
            <span style={{ color: COLORS.greenMuted }}>cap 250M</span>
          </div>

          <div
            className="my-4 h-px"
            style={{ background: "rgba(29,185,84,0.15)" }}
          />

          {loading ? (
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-10 bg-white/5" />
              <Skeleton className="h-10 bg-white/5" />
              <Skeleton className="h-10 bg-white/5" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat
                value={String(data.totalEventos)}
                unit="eventos"
                color={COLORS.green}
              />
              <Stat
                value={formatKg(data.totalKg)}
                unit="kg"
                color={COLORS.green}
              />
              <Stat
                value={`${(data.totalCO2e / 1000).toFixed(1)}t`}
                unit="CO₂e"
                color={COLORS.amber}
              />
            </div>
          )}
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
          style={{
            background: COLORS.surface,
            borderColor: "rgba(29,185,84,0.12)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="text-xs font-semibold"
              style={{ color: COLORS.text }}
            >
              KPIs do Piloto ·{" "}
              <span style={{ color: COLORS.dim }}>Mês 3</span>
            </div>
            <div
              className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider"
              style={{ color: COLORS.green }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ background: COLORS.green }}
              />
              AO VIVO
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Kpi
              label="SCAN RATE"
              value={
                data.kpi?.scan_rate != null
                  ? `${data.kpi.scan_rate}%`
                  : "—"
              }
            />
            <Kpi
              label="UPTIME"
              value={
                data.kpi?.uptime != null ? `${data.kpi.uptime}%` : "—"
              }
            />
            <Kpi
              label="TX CUSTO"
              value={
                data.kpi?.tx_custo != null
                  ? `<$${data.kpi.tx_custo}`
                  : "—"
              }
            />
            <Kpi
              label="β SCORE"
              value={
                data.kpi?.beta_score != null
                  ? String(data.kpi.beta_score)
                  : "—"
              }
            />
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
            style={{
              background: COLORS.surface,
              borderColor: "rgba(29,185,84,0.12)",
            }}
          >
            {loading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-12 bg-white/5" />
                <Skeleton className="h-12 bg-white/5" />
              </div>
            ) : data.events.length === 0 ? (
              <div
                className="px-4 py-8 flex flex-col items-center gap-2 text-center"
                style={{ color: COLORS.dim }}
              >
                <Inbox className="h-6 w-6" />
                <div className="text-xs">
                  Nenhum evento ainda.
                  <br />
                  <Link
                    to="/registro"
                    className="font-semibold"
                    style={{ color: COLORS.green }}
                  >
                    Registrar primeiro descarte →
                  </Link>
                </div>
              </div>
            ) : (
              data.events.map((e, i) => (
                <div key={e.id}>
                  {i > 0 && (
                    <div
                      className="h-px mx-4"
                      style={{ background: "rgba(29,185,84,0.10)" }}
                    />
                  )}
                  <EventRow
                    icon={<Smartphone className="h-4 w-4" />}
                    title={e.categories?.nome ?? "Categoria"}
                    meta={`${timeAgo(e.created_at)} · ${formatKg(Number(e.weight_kg))} kg`}
                    amount={`+${formatELP(Number(e.elp_amount ?? 0))} ELP`}
                  />
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}

function Stat({
  value,
  unit,
  color,
}: {
  value: string;
  unit: string;
  color: string;
}) {
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
      style={{
        background: COLORS.surface,
        borderColor: "rgba(29,185,84,0.12)",
      }}
    >
      <div
        className="h-9 w-9 rounded-xl flex items-center justify-center"
        style={{ background: `${tint}1F`, color: tint }}
      >
        {icon}
      </div>
      <div>
        <div
          className="text-sm font-semibold leading-tight"
          style={{ color: COLORS.text }}
        >
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
      style={{
        background: "#0A0F0A",
        border: "1px solid rgba(29,185,84,0.10)",
      }}
    >
      <div
        className="text-[8.5px] font-semibold tracking-wider"
        style={{ color: COLORS.dim }}
      >
        {label}
      </div>
      <div
        className="text-[13px] font-bold mt-1"
        style={{ color: COLORS.text }}
      >
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
        <div
          className="text-sm font-medium truncate"
          style={{ color: COLORS.text }}
        >
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
