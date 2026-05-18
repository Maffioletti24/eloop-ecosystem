import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { generateSinirReport } from "@/lib/sinir.functions";
import { getDashboard } from "@/lib/events.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, FileCheck2, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { formatKg, formatELP } from "@/lib/elp";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/conformidade")({
  head: () => ({ meta: [{ title: "Conformidade SINIR" }] }),
  component: ConformidadePage,
});

function ConformidadePage() {
  const fetchD = useServerFn(getDashboard);
  const gen = useServerFn(generateSinirReport);
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: () => fetchD() });

  const hoje = new Date();
  const inicio30 = new Date(hoje.getTime() - 30 * 24 * 3600 * 1000);
  const [inicio, setInicio] = useState(inicio30.toISOString().slice(0, 10));
  const [fim, setFim] = useState(hoje.toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const r = await gen({
        data: { inicio: new Date(inicio).toISOString(), fim: new Date(fim + "T23:59:59").toISOString() },
      });
      const blob = new Blob([r.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sinir-${inicio}-${fim}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Relatório gerado: ${r.total_eventos} eventos`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha");
    } finally {
      setLoading(false);
    }
  }

  const pendentes = (data?.eventos_full ?? []).filter((e) => e.status === "pendente").length;

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center gap-3 mb-5">
        <Link to="/dashboard" className="p-2 -ml-2 text-dim"><ArrowLeft className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-lg font-bold">Conformidade</h1>
          <div className="text-[11px] text-dim">SINIR · PNRS · Decreto 10.936/22</div>
        </div>
      </div>

      <div className="rounded-2xl border border-info/30 bg-gradient-to-br from-info/10 to-surface p-4">
        <div className="flex items-center gap-2 text-info">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-sm font-semibold text-foreground">Status regulatório</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] text-dim">Eventos aprovados</div>
            <div className="tabular text-xl font-bold mt-0.5">{data?.total_aprovados ?? 0}</div>
          </div>
          <div>
            <div className="text-[10px] text-dim">Pendentes validação</div>
            <div className="tabular text-xl font-bold mt-0.5 text-warn">{pendentes}</div>
          </div>
        </div>
        <Badge className="mt-3 bg-primary/20 text-primary border-0">
          ✓ Conformidade ativa
        </Badge>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileCheck2 className="h-4 w-4 text-primary" />
          <div className="text-sm font-semibold">Exportar relatório SINIR</div>
        </div>
        <p className="text-xs text-dim mb-4">
          Agrega eventos aprovados (com hash on-chain) no período selecionado.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="ini" className="text-xs">Início</Label>
            <Input id="ini" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="fim" className="text-xs">Fim</Label>
            <Input id="fim" type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleExport} disabled={loading} className="w-full mt-4 h-11">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Baixar CSV
        </Button>
      </div>

      <div className="mt-5">
        <h2 className="text-sm font-semibold mb-2">Eventos do período</h2>
        <div className="space-y-2">
          {(data?.eventos_full ?? []).slice(0, 20).map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{e.categories?.nome}</div>
                <div className="text-[10px] text-dim font-mono">
                  {e.polygon_tx_hash ? `tx ${e.polygon_tx_hash.slice(0, 12)}...` : "sem ancoragem"}
                </div>
              </div>
              <div className="text-right">
                <div className="tabular text-xs font-semibold">{formatKg(Number(e.weight_kg))}kg</div>
                <div className="text-[10px] text-primary">+{formatELP(Number(e.elp_amount ?? 0))} ELP</div>
              </div>
            </div>
          ))}
          {(data?.eventos_full ?? []).length === 0 && (
            <div className="text-xs text-dim flex items-center gap-2">
              <AlertCircle className="h-3 w-3" /> Sem eventos para exibir.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
