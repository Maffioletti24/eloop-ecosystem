import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Loader2, FileBadge } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { requireAuth } from "@/lib/require-auth";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { generateSinirReport } from "@/lib/sinir.functions";
import { generateCertificate } from "@/lib/certificate.functions";
import { formatKg, formatELP, estimarCO2e } from "@/lib/elp";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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

type EventRow = {
  id: string;
  weight_kg: number;
  elp_amount: number | null;
  status: string;
  created_at: string;
  hash_sha256: string | null;
  polygon_tx_hash: string | null;
  categories: { nome: string; risk_level: "alto" | "medio" | "baixo" } | null;
};

function firstDayOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function ConformidadePage() {
  const generate = useServerFn(generateSinirReport);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data } = await supabase
        .from("disposal_events")
        .select(
          "id, weight_kg, elp_amount, status, created_at, hash_sha256, polygon_tx_hash, categories(nome, risk_level)",
        )
        .order("created_at", { ascending: false })
        .limit(100);
      if (!cancel) {
        setEvents((data ?? []) as EventRow[]);
        setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const totals = useMemo(() => {
    const aprov = events.filter((e) => e.status === "aprovado");
    const kg = aprov.reduce((s, e) => s + Number(e.weight_kg), 0);
    const elp = aprov.reduce((s, e) => s + Number(e.elp_amount ?? 0), 0);
    const co2 = aprov.reduce(
      (s, e) => s + estimarCO2e(Number(e.weight_kg), e.categories?.risk_level ?? "baixo"),
      0,
    );
    return { kg, elp, co2, eventos: aprov.length };
  }, [events]);

  async function handleExport(kind: "csv" | "pdf") {
    setExporting(true);
    try {
      const r = await generate({
        data: { inicio: firstDayOfMonth(), fim: new Date().toISOString() },
      });
      if (kind === "csv") {
        const blob = new Blob([r.csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sinir_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`CSV gerado · ${r.total_eventos} eventos`);
      } else {
        toast.info("Geração PDF SINIR em produção. CSV disponível agora.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no export");
    } finally {
      setExporting(false);
    }
  }

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
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.tone }} />
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

      <div
        className="rounded-2xl border p-4 mb-4"
        style={{ borderColor: "rgba(29,185,84,0.18)", background: "#0F1A0F" }}
      >
        <div className="text-[10px] tracking-wider mb-2" style={{ color: "#7a8a7a" }}>
          PERÍODO · MÊS CORRENTE
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <Tot label="kg REEE" value={formatKg(totals.kg)} />
          <Tot label="eventos" value={String(totals.eventos)} />
          <Tot label="ELP" value={formatELP(totals.elp)} />
          <Tot label="t CO₂e" value={(totals.co2 / 1000).toFixed(2)} tone="#F5B544" />
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => handleExport("pdf")}
          disabled={exporting || totals.eventos === 0}
          className="flex-1 rounded-xl py-2.5 text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
          style={{ background: "#1DB954", color: "#0A0F0A" }}
        >
          {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
          PDF SINIR
        </button>
        <button
          type="button"
          onClick={() => handleExport("csv")}
          disabled={exporting || totals.eventos === 0}
          className="flex-1 rounded-xl py-2.5 text-xs font-semibold border flex items-center justify-center gap-2 disabled:opacity-40"
          style={{ borderColor: "rgba(29,185,84,0.30)", color: "#1DB954" }}
        >
          {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          CSV
        </button>
      </div>

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: "#1f2a1f", background: "#0F1A0F" }}
      >
        <div className="px-3 py-2 text-[10px] tracking-wider border-b" style={{ color: "#7a8a7a", borderColor: "rgba(29,185,84,0.12)" }}>
          LIVRO DE EVENTOS · ÚLTIMOS 100
        </div>
        {loading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-10 bg-white/5" />
            <Skeleton className="h-10 bg-white/5" />
          </div>
        ) : events.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs" style={{ color: "#7a8a7a" }}>
            Nenhum evento registrado.
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] tracking-wider" style={{ color: "#7a8a7a" }}>
                <th className="text-left px-3 py-2 font-medium">DATA</th>
                <th className="text-left px-3 py-2 font-medium">CATEGORIA</th>
                <th className="text-right px-3 py-2 font-medium">KG</th>
                <th className="text-right px-3 py-2 font-medium">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-t" style={{ borderColor: "rgba(29,185,84,0.08)" }}>
                  <td className="px-3 py-2" style={{ color: "#7a8a7a" }}>
                    {new Date(e.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-3 py-2" style={{ color: "#E8F5E8" }}>
                    {e.categories?.nome ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right font-mono" style={{ color: "#E8F5E8" }}>
                    {formatKg(Number(e.weight_kg))}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span
                      className="text-[9px] font-bold tracking-wider"
                      style={{ color: e.status === "aprovado" ? "#1DB954" : "#F5B544" }}
                    >
                      {e.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageShell>
  );
}

function Tot({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div>
      <div className="text-base font-bold" style={{ color: tone ?? "#1DB954" }}>
        {value}
      </div>
      <div className="text-[10px] mt-0.5" style={{ color: "#7a8a7a" }}>
        {label}
      </div>
    </div>
  );
}
