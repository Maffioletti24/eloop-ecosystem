import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PageShell } from "@/components/PageShell";
import { AuditExpander } from "@/components/AuditExpander";
import { requireRole, DISPOSAL_ROLES } from "@/lib/require-role";
import { listBatches } from "@/lib/events.functions";
import { formatELP } from "@/lib/elp";
import { Loader2, Package, PlusCircle, QrCode, ExternalLink, ImageIcon } from "lucide-react";

export const Route = createFileRoute("/lotes")({
  beforeLoad: () => requireRole(DISPOSAL_ROLES),
  head: () => ({ meta: [{ title: "Gestão de Lotes — Eloop Token" }] }),
  component: LotesPage,
});

const GREEN = "#1DB954";
const DARK = "#0F1A0F";
const MUTED = "#7a8a7a";
const TEXT = "#E8F5E8";

type Evt = {
  id: string;
  weight_kg: number;
  elp_amount: number | null;
  status: string;
  photo_url: string | null;
  hash_sha256: string | null;
  polygon_tx_hash: string | null;
  created_at: string;
  categories: { nome: string; risk_level: string } | null;
};
type Batch = {
  id: string;
  qr_code: string;
  status: string;
  created_at: string;
  expires_at: string;
  disposal_events: Evt[];
};

function statusColor(status: string) {
  if (status === "aprovado" || status === "validado") return GREEN;
  if (status === "pendente") return "#f59e0b";
  return "#ef4444";
}

function LotesPage() {
  const fetchBatches = useServerFn(listBatches);
  const [batches, setBatches] = useState<Batch[] | null>(null);
  const [filter, setFilter] = useState<"todos" | "pendente" | "validado">("todos");
  const [openPhoto, setOpenPhoto] = useState<string | null>(null);

  useEffect(() => {
    fetchBatches()
      .then((b) => setBatches(b as Batch[]))
      .catch(() => setBatches([]));
  }, [fetchBatches]);

  const filtered = (batches ?? []).filter((b) =>
    filter === "todos" ? true : b.status === filter,
  );

  return (
    <PageShell title="Gestão de Lotes">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1.5">
          {(["todos", "pendente", "validado"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold capitalize border"
              style={{
                background: filter === f ? `${GREEN}22` : "transparent",
                borderColor: filter === f ? GREEN : "#1f2a1f",
                color: filter === f ? GREEN : MUTED,
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <Link
          to="/registro"
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold"
          style={{ background: GREEN, color: "#0A0F0A" }}
        >
          <PlusCircle className="h-4 w-4" /> Novo
        </Link>
      </div>

      {batches === null ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: GREEN }} />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-2xl border p-8 text-center"
          style={{ background: DARK, borderColor: `${GREEN}33`, color: MUTED }}
        >
          <Package className="h-10 w-10 mx-auto mb-3" style={{ color: GREEN, opacity: 0.5 }} />
          <p className="text-sm">Nenhum lote {filter !== "todos" ? `${filter}` : ""} ainda.</p>
          <Link
            to="/registro"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold"
            style={{ color: GREEN }}
          >
            <PlusCircle className="h-4 w-4" /> Registrar primeiro lote
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const evt = b.disposal_events?.[0];
            const expired = new Date(b.expires_at) < new Date() && b.status === "pendente";
            return (
              <div
                key={b.id}
                className="rounded-2xl border p-4"
                style={{ background: DARK, borderColor: `${GREEN}22` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <QrCode className="h-3.5 w-3.5" style={{ color: GREEN }} />
                      <span
                        className="text-[10px] font-mono truncate"
                        style={{ color: MUTED }}
                      >
                        {b.qr_code}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: TEXT }}>
                      {evt?.categories?.nome ?? "Sem evento"}
                      {evt ? (
                        <span style={{ color: MUTED }}>
                          {" · "}
                          {Number(evt.weight_kg).toFixed(2)} kg
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: MUTED }}>
                      {new Date(b.created_at).toLocaleString("pt-BR")}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className="text-[9px] font-bold tracking-wider px-2 py-1 rounded-md uppercase"
                      style={{
                        background: `${statusColor(expired ? "expirado" : b.status)}22`,
                        color: statusColor(expired ? "expirado" : b.status),
                      }}
                    >
                      {expired ? "expirado" : b.status}
                    </span>
                    {evt?.elp_amount ? (
                      <span className="text-sm font-bold" style={{ color: GREEN }}>
                        +{formatELP(Number(evt.elp_amount))}
                      </span>
                    ) : null}
                  </div>
                </div>

                {evt ? (
                  <div className="mt-3 pt-3 border-t flex items-center gap-2" style={{ borderColor: "#1f2a1f" }}>
                    {evt.photo_url ? (
                      <button
                        type="button"
                        onClick={() => setOpenPhoto(evt.photo_url)}
                        className="h-14 w-14 rounded-lg overflow-hidden border shrink-0"
                        style={{ borderColor: `${GREEN}44` }}
                      >
                        <img src={evt.photo_url} alt="" className="h-full w-full object-cover" />
                      </button>
                    ) : (
                      <div
                        className="h-14 w-14 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "#0A0F0A", color: MUTED }}
                      >
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-[10px] space-y-0.5" style={{ color: MUTED }}>
                      {evt.hash_sha256 ? (
                        <div className="font-mono truncate">
                          <span style={{ color: GREEN }}>hash</span> {evt.hash_sha256.slice(0, 24)}…
                        </div>
                      ) : null}
                      {evt.polygon_tx_hash ? (
                        <a
                          href={`https://polygonscan.com/tx/${evt.polygon_tx_hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 font-mono"
                          style={{ color: GREEN }}
                        >
                          tx {evt.polygon_tx_hash.slice(0, 14)}…
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <div style={{ color: "#f59e0b" }}>aguardando ancoragem on-chain</div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {openPhoto ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setOpenPhoto(null)}
        >
          <img
            src={openPhoto}
            alt="Foto do descarte"
            className="max-h-[85vh] max-w-full rounded-xl"
          />
        </div>
      ) : null}
    </PageShell>
  );
}
