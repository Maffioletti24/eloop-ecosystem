import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getEventAudit } from "@/lib/events.functions";
import { formatELP } from "@/lib/elp";
import { ShieldCheck, ChevronDown, Loader2 } from "lucide-react";

const GREEN = "#1DB954";
const MUTED = "#7a8a7a";
const TEXT = "#E8F5E8";

type AuditRow = {
  id: string;
  algorithm: string;
  weight_kg: number;
  gamma_factor: number;
  alpha: number;
  beta: number;
  elp_amount: number;
  input_hash: string;
  signature: string | null;
  signed_at: string;
};

/**
 * Expander leve para mostrar a auditoria de um evento em linguagem simples.
 * Operador comum vê o resumo amigável; quem quiser detalhes técnicos abre "Detalhes técnicos".
 */
export function AuditExpander({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const [showTech, setShowTech] = useState(false);
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const fetchAudit = useServerFn(getEventAudit);

  useEffect(() => {
    if (!open || rows !== null) return;
    fetchAudit({ data: { eventId } })
      .then((r) => setRows(r as AuditRow[]))
      .catch(() => setRows([]));
  }, [open, rows, fetchAudit, eventId]);

  const a = rows?.[0];

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[11px] font-semibold"
        style={{ color: GREEN }}
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        {open ? "Ocultar auditoria" : "Ver auditoria"}
        <ChevronDown
          className="h-3 w-3 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {open ? (
        <div
          className="mt-2 rounded-xl p-3 text-[11px] space-y-2"
          style={{ background: "#0A0F0A", border: `1px solid ${GREEN}22` }}
        >
          {rows === null ? (
            <div className="flex items-center gap-2" style={{ color: MUTED }}>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Carregando…
            </div>
          ) : !a ? (
            <div style={{ color: MUTED }}>Sem registro de auditoria.</div>
          ) : (
            <>
              {/* Resumo amigável */}
              <div className="space-y-1" style={{ color: TEXT }}>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: GREEN }} />
                  <div>
                    <div className="font-semibold">Valor calculado e assinado pelo sistema</div>
                    <div style={{ color: MUTED }}>
                      Em{" "}
                      {new Date(a.signed_at).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 pl-5">
                  <Field label="Peso medido" value={`${Number(a.weight_kg).toFixed(2)} kg`} />
                  <Field
                    label="ELP creditado"
                    value={formatELP(Number(a.elp_amount))}
                    accent
                  />
                </div>
              </div>

              {/* Toggle técnico */}
              <button
                type="button"
                onClick={() => setShowTech((v) => !v)}
                className="text-[10px] underline pl-5"
                style={{ color: MUTED }}
              >
                {showTech ? "Ocultar detalhes técnicos" : "Detalhes técnicos"}
              </button>

              {showTech ? (
                <div
                  className="pl-5 space-y-1 pt-1 border-t font-mono text-[10px]"
                  style={{ borderColor: "#1f2a1f", color: MUTED }}
                >
                  <div>
                    fórmula <span style={{ color: TEXT }}>{a.algorithm}</span> ·{" "}
                    peso × γ × α × β
                  </div>
                  <div>
                    γ {Number(a.gamma_factor).toFixed(2)} · α {Number(a.alpha).toFixed(1)} ·
                    β {Number(a.beta).toFixed(2)}
                  </div>
                  <div className="truncate">
                    <span style={{ color: GREEN }}>hash dos dados</span>{" "}
                    {a.input_hash.slice(0, 32)}…
                  </div>
                  {a.signature ? (
                    <div className="truncate">
                      <span style={{ color: GREEN }}>assinatura</span>{" "}
                      {a.signature.slice(0, 32)}…
                    </div>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[10px]" style={{ color: MUTED }}>
        {label}
      </div>
      <div
        className="text-xs font-semibold"
        style={{ color: accent ? GREEN : TEXT }}
      >
        {value}
      </div>
    </div>
  );
}
