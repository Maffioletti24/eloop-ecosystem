import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboard } from "@/lib/events.functions";
import { supabase } from "@/integrations/supabase/client";
import { formatELP, formatKg, estimarCO2e } from "@/lib/elp";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle, FileCheck2, Leaf, Coins, LogOut, ShieldCheck,
  TrendingUp, Clock3, CheckCircle2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Eloop Token" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const fetchDashboard = useServerFn(getDashboard);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => fetchDashboard(),
  });

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const saldo = data?.saldo_elp ?? 0;
  const kg = data?.total_kg ?? 0;
  const co2 = estimarCO2e(kg, "medio");
  const operador = data?.operador;

  return (
    <div className="px-5 pt-8 pb-4">
      {/* header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-dim">Bem-vindo</div>
          <div className="text-base font-semibold">{operador?.nome ?? "—"}</div>
          <Badge variant="outline" className="mt-1.5 border-primary/40 text-primary text-[10px]">
            {operador?.tipo}
          </Badge>
        </div>
        <button onClick={handleLogout} className="text-dim hover:text-foreground p-2">
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {/* Saldo card */}
      <div className="mt-6 relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-surface to-surface-2 p-5">
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex items-center gap-2 text-xs text-primary/90">
          <Coins className="h-3.5 w-3.5" /> Saldo Eloop Token
        </div>
        <div className="relative mt-2 flex items-baseline gap-2">
          <div className="tabular text-4xl font-bold">{formatELP(saldo)}</div>
          <div className="text-sm font-semibold text-primary">ELP</div>
        </div>
        <div className="relative text-[11px] text-dim mt-1">
          β-score do operador: {Number(operador?.beta_score ?? 1).toFixed(2)}
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <KPI icon={<TrendingUp className="h-3.5 w-3.5" />} label="kg REEE" value={formatKg(kg)} />
        <KPI icon={<Leaf className="h-3.5 w-3.5" />} label="CO₂e evitado" value={`${formatKg(co2)}kg`} />
        <KPI
          icon={<ShieldCheck className="h-3.5 w-3.5" />}
          label="Eventos"
          value={`${data?.total_aprovados ?? 0}/${data?.total_eventos ?? 0}`}
        />
      </div>

      {/* Ações */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <ActionTile to="/registro" icon={<PlusCircle className="h-5 w-5" />}
          title="Registrar descarte" sub="QR + foto + hash" tone="primary" />
        <ActionTile to="/conformidade" icon={<FileCheck2 className="h-5 w-5" />}
          title="Conformidade" sub="Relatório SINIR" tone="info" />
        <ActionTile to="/esg" icon={<Leaf className="h-5 w-5" />}
          title="Painel ESG" sub="Impacto + PNRS" tone="elp" />
        <ActionTile to="/registro" icon={<ShieldCheck className="h-5 w-5" />}
          title="Auditar lote" sub="Validar hash" tone="warn" />
      </div>

      {/* Eventos recentes */}
      <div className="mt-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Eventos recentes</h2>
          <Link to="/conformidade" className="text-xs text-primary">Ver tudo</Link>
        </div>
        {isLoading && <div className="text-xs text-dim">Carregando...</div>}
        {!isLoading && (data?.eventos?.length ?? 0) === 0 && (
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <p className="text-sm text-dim">Nenhum descarte registrado ainda.</p>
            <Button asChild size="sm" className="mt-3">
              <Link to="/registro">Registrar o primeiro</Link>
            </Button>
          </div>
        )}
        <div className="space-y-2">
          {(data?.eventos ?? []).map((e) => (
            <EventoRow key={e.id} ev={e} />
          ))}
        </div>
      </div>
    </div>
  );
}

function KPI({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface border border-border p-3">
      <div className="flex items-center gap-1 text-[10px] text-dim">
        {icon} {label}
      </div>
      <div className="tabular text-base font-semibold mt-1.5">{value}</div>
    </div>
  );
}

function ActionTile({
  to, icon, title, sub, tone,
}: { to: "/registro" | "/conformidade" | "/esg"; icon: React.ReactNode; title: string; sub: string; tone: "primary" | "info" | "elp" | "warn" }) {
  const tones: Record<string, string> = {
    primary: "from-primary/20 to-primary/5 border-primary/30 text-primary",
    info: "from-info/20 to-info/5 border-info/30 text-info",
    elp: "from-elp/20 to-elp/5 border-elp/30 text-elp",
    warn: "from-warn/20 to-warn/5 border-warn/30 text-warn",
  };
  return (
    <Link to={to}
      className={`rounded-2xl border bg-gradient-to-br p-4 transition active:scale-[0.98] ${tones[tone]}`}>
      <div className="h-9 w-9 rounded-xl bg-background/40 grid place-items-center">{icon}</div>
      <div className="mt-3 text-sm font-semibold text-foreground">{title}</div>
      <div className="text-[11px] text-dim mt-0.5">{sub}</div>
    </Link>
  );
}

type Ev = {
  id: string;
  weight_kg: number;
  elp_amount: number | null;
  status: string;
  created_at: string;
  polygon_tx_hash: string | null;
  categories: { nome: string; risk_level: string } | null;
};

function EventoRow({ ev }: { ev: Ev }) {
  const isAprovado = ev.status === "aprovado";
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5">
      <div className="min-w-0">
        <div className="text-sm font-medium truncate">{ev.categories?.nome ?? "—"}</div>
        <div className="text-[11px] text-dim flex items-center gap-1.5">
          <Clock3 className="h-3 w-3" />
          {formatDistanceToNow(new Date(ev.created_at), { addSuffix: true, locale: ptBR })}
        </div>
      </div>
      <div className="text-right">
        <div className="tabular text-sm font-semibold text-primary">
          +{formatELP(Number(ev.elp_amount ?? 0))} ELP
        </div>
        <div className="text-[10px] flex items-center justify-end gap-1 mt-0.5">
          {isAprovado ? (
            <span className="text-primary flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> on-chain
            </span>
          ) : (
            <span className="text-warn">pendente</span>
          )}
          <span className="text-dim">· {Number(ev.weight_kg).toFixed(2)}kg</span>
        </div>
      </div>
    </div>
  );
}
