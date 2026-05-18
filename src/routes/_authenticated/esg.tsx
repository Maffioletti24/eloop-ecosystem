import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "@/lib/events.functions";
import { estimarCO2e, formatKg, formatELP } from "@/lib/elp";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Leaf, Wind, Recycle } from "lucide-react";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { format, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/esg")({
  head: () => ({ meta: [{ title: "Painel ESG" }] }),
  component: EsgPage,
});

function EsgPage() {
  const fetchD = useServerFn(getDashboard);
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: () => fetchD() });

  const eventos = data?.eventos_full ?? [];
  const total_kg = data?.total_kg ?? 0;
  const co2 = estimarCO2e(total_kg, "medio");

  // 6 últimos meses agregados
  const buckets: { mes: string; kg: number; elp: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const m = startOfMonth(subMonths(new Date(), i));
    buckets.push({ mes: format(m, "MMM", { locale: ptBR }), kg: 0, elp: 0 });
  }
  eventos.forEach((e) => {
    const d = new Date(e.created_at);
    const key = format(startOfMonth(d), "MMM", { locale: ptBR });
    const b = buckets.find((x) => x.mes === key);
    if (b && e.status === "aprovado") {
      b.kg += Number(e.weight_kg);
      b.elp += Number(e.elp_amount ?? 0);
    }
  });

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center gap-3 mb-5">
        <Link to="/dashboard" className="p-2 -ml-2 text-dim"><ArrowLeft className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-lg font-bold">Painel ESG</h1>
          <div className="text-[11px] text-dim">Impacto ambiental mensurável</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <EsgKpi icon={<Recycle />} value={`${formatKg(total_kg)} kg`} label="REEE reciclado" tone="primary" />
        <EsgKpi icon={<Wind />} value={`${formatKg(co2)} kg`} label="CO₂e evitado" tone="info" />
        <EsgKpi icon={<Leaf />} value={`${formatELP(data?.saldo_elp ?? 0)}`} label="ELP gerado" tone="elp" />
        <EsgKpi icon={<Recycle />} value={`${data?.total_aprovados ?? 0}`} label="Eventos validados" tone="warn" />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Volume mensal (kg)</h2>
          <Badge variant="outline" className="text-[10px]">últimos 6 meses</Badge>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buckets}>
              <XAxis dataKey="mes" stroke="var(--dim)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                cursor={{ fill: "oklch(0.71 0.18 145 / 0.1)" }}
              />
              <Bar dataKey="kg" fill="oklch(0.71 0.18 145)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 to-surface p-5">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Leaf className="h-4 w-4" />
          <div className="text-sm font-semibold text-foreground">Certificado PNRS coletivo</div>
        </div>
        <p className="text-xs text-dim">
          A geração de certificado consolidado por período estará disponível na próxima fase.
          Por enquanto, cada evento gera seu próprio certificado em "Registrar".
        </p>
      </div>
    </div>
  );
}

function EsgKpi({ icon, value, label, tone }: { icon: React.ReactNode; value: string; label: string; tone: "primary" | "info" | "elp" | "warn" }) {
  const colors: Record<string, string> = {
    primary: "text-primary border-primary/30 bg-primary/10",
    info: "text-info border-info/30 bg-info/10",
    elp: "text-elp border-elp/30 bg-elp/10",
    warn: "text-warn border-warn/30 bg-warn/10",
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[tone]}`}>
      <div className="[&>svg]:h-4 [&>svg]:w-4">{icon}</div>
      <div className="tabular text-lg font-bold text-foreground mt-2">{value}</div>
      <div className="text-[10px] text-dim">{label}</div>
    </div>
  );
}
