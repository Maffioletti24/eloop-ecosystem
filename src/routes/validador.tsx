import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Loader2, ShieldCheck, ExternalLink } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { requireAuth } from "@/lib/require-auth";
import { useServerFn } from "@tanstack/react-start";
import {
  getValidatorStatus,
  listEventsForValidator,
  decideEvent,
} from "@/lib/validator.functions";
import { formatELP, formatKg } from "@/lib/elp";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/validador")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Painel do Validador — Eloop Token" }] }),
  component: ValidadorPage,
});

type Row = Awaited<ReturnType<typeof listEventsForValidator>>[number];
type Tab = "pendente" | "aprovado" | "rejeitado";

function ValidadorPage() {
  const fetchStatus = useServerFn(getValidatorStatus);
  const listFn = useServerFn(listEventsForValidator);
  const decideFn = useServerFn(decideEvent);

  const [status, setStatus] = useState<{ isValidator: boolean; validator: { nome: string; tipo: string } | null } | null>(null);
  const [tab, setTab] = useState<Tab>("pendente");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus().then(setStatus);
  }, [fetchStatus]);

  const load = useCallback(
    async (t: Tab) => {
      setLoading(true);
      const r = await listFn({ data: { status: t } });
      setRows(r);
      setLoading(false);
    },
    [listFn],
  );

  useEffect(() => {
    if (status?.isValidator) load(tab);
  }, [status, tab, load]);

  async function handleDecide(id: string, decision: "aprovado" | "rejeitado") {
    setActing(id);
    try {
      const r = await decideFn({ data: { eventId: id, decision } });
      toast.success(
        decision === "aprovado"
          ? r.txHash
            ? "Aprovado e ancorado on-chain"
            : "Aprovado"
          : "Evento rejeitado",
      );
      await load(tab);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha");
    } finally {
      setActing(null);
    }
  }

  if (status && !status.isValidator) {
    return (
      <PageShell title="Painel do Validador">
        <div
          className="rounded-2xl border p-6 text-center"
          style={{ borderColor: "rgba(29,185,84,0.18)", background: "#0F1A0F" }}
        >
          <ShieldCheck className="h-10 w-10 mx-auto mb-3" style={{ color: "#F5B544" }} />
          <h2 className="text-sm font-bold mb-1" style={{ color: "#E8F5E8" }}>
            Acesso restrito
          </h2>
          <p className="text-xs" style={{ color: "#7a8a7a" }}>
            Apenas validadores credenciados ativos podem aprovar eventos.
            Solicite cadastro à equipe Eloop.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Painel do Validador">
      {status?.validator && (
        <div className="flex items-center gap-2 mb-3 text-[10px] tracking-wider" style={{ color: "#1DB954" }}>
          <ShieldCheck className="h-3.5 w-3.5" />
          VALIDADOR · {status.validator.nome.toUpperCase()} · {status.validator.tipo}
        </div>
      )}

      <div className="flex gap-1 mb-4 p-1 rounded-xl" style={{ background: "#0F1A0F" }}>
        {(["pendente", "aprovado", "rejeitado"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-[10px] font-bold tracking-wider transition"
            style={{
              background: tab === t ? "#1DB954" : "transparent",
              color: tab === t ? "#0A0F0A" : "#7a8a7a",
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-28 bg-white/5" />
          <Skeleton className="h-28 bg-white/5" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border p-8 text-center text-xs" style={{ borderColor: "#1f2a1f", color: "#7a8a7a" }}>
          Nenhum evento {tab}.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((e) => (
            <div
              key={e.id}
              className="rounded-2xl border p-3"
              style={{ borderColor: "rgba(29,185,84,0.18)", background: "#0F1A0F" }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate" style={{ color: "#E8F5E8" }}>
                    {e.operators?.nome ?? "Operador"}
                  </div>
                  <div className="text-[10px]" style={{ color: "#7a8a7a" }}>
                    {e.categories?.nome ?? "—"} · {new Date(e.created_at).toLocaleString("pt-BR")}
                  </div>
                </div>
                <span
                  className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded"
                  style={{
                    color: e.categories?.risk_level === "alto" ? "#F5B544" : "#4FA8E8",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  RISCO {(e.categories?.risk_level ?? "—").toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-2 text-center">
                <Field label="Peso" value={`${formatKg(Number(e.weight_kg))} kg`} />
                <Field label="ELP" value={formatELP(Number(e.elp_amount ?? 0))} />
                <Field label="γ" value={String(e.categories?.gamma_factor ?? "—")} />
              </div>

              {e.hash_sha256 && (
                <div className="text-[9px] font-mono mb-2 truncate" style={{ color: "#7a8a7a" }}>
                  SHA-256 {e.hash_sha256.slice(0, 24)}…
                </div>
              )}
              {e.polygon_tx_hash && (
                <a
                  href={`https://polygonscan.com/tx/${e.polygon_tx_hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] inline-flex items-center gap-1 mb-2"
                  style={{ color: "#4FA8E8" }}
                >
                  Ver tx <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}

              {tab === "pendente" && (
                <div className="flex gap-2 pt-2 border-t" style={{ borderColor: "rgba(29,185,84,0.12)" }}>
                  <button
                    type="button"
                    disabled={acting === e.id}
                    onClick={() => handleDecide(e.id, "rejeitado")}
                    className="flex-1 rounded-lg py-2 text-[10px] font-bold tracking-wider border flex items-center justify-center gap-1.5 disabled:opacity-40"
                    style={{ borderColor: "rgba(245,68,68,0.30)", color: "#f54444" }}
                  >
                    {acting === e.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                    REJEITAR
                  </button>
                  <button
                    type="button"
                    disabled={acting === e.id}
                    onClick={() => handleDecide(e.id, "aprovado")}
                    className="flex-1 rounded-lg py-2 text-[10px] font-bold tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-40"
                    style={{ background: "#1DB954", color: "#0A0F0A" }}
                  >
                    {acting === e.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                    APROVAR
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg py-1.5" style={{ background: "rgba(255,255,255,0.03)" }}>
      <div className="text-xs font-bold" style={{ color: "#1DB954" }}>{value}</div>
      <div className="text-[9px]" style={{ color: "#7a8a7a" }}>{label}</div>
    </div>
  );
}
