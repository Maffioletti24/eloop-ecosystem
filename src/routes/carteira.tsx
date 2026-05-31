import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ExternalLink, Inbox, Loader2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { requireRole, WALLET_ROLES } from "@/lib/require-role";
import { supabase } from "@/integrations/supabase/client";
import { formatELP, formatKg } from "@/lib/elp";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/carteira")({
  beforeLoad: () => requireRole(WALLET_ROLES),
  head: () => ({ meta: [{ title: "Carteira ELP — Eloop Token" }] }),
  component: CarteiraPage,
});

const POOLS = [
  { label: "Operação", pct: 40, color: "#1DB954" },
  { label: "Reserva técnica", pct: 25, color: "#4FA8E8" },
  { label: "Ecossistema", pct: 20, color: "#B084E8" },
  { label: "Tesouro", pct: 15, color: "#F5B544" },
];

type EventRow = {
  id: string;
  weight_kg: number;
  elp_amount: number | null;
  status: string;
  created_at: string;
  polygon_tx_hash: string | null;
  categories: { nome: string; gamma_factor: number } | null;
};

function CarteiraPage() {
  const [loading, setLoading] = useState(true);
  const [saldo, setSaldo] = useState(0);
  const [walletAddr, setWalletAddr] = useState<string | null>(null);
  const [beta, setBeta] = useState(1);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [supply, setSupply] = useState<{ total: number; cap: number }>({
    total: 0,
    cap: 250_000_000,
  });

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return;
        const [w, o, ev, ts] = await Promise.all([
          supabase
            .from("wallets")
            .select("saldo_elp, wallet_address")
            .eq("user_id", auth.user.id)
            .maybeSingle(),
          supabase
            .from("operators")
            .select("beta_score")
            .eq("user_id", auth.user.id)
            .maybeSingle(),
          supabase
            .from("disposal_events")
            .select(
              "id, weight_kg, elp_amount, status, created_at, polygon_tx_hash, categories(nome, gamma_factor)",
            )
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("token_supply")
            .select("total_emitido, hard_cap")
            .maybeSingle(),
        ]);
        if (cancel) return;
        setSaldo(Number(w.data?.saldo_elp ?? 0));
        setWalletAddr(w.data?.wallet_address ?? null);
        setBeta(Number(o.data?.beta_score ?? 1));
        setEvents((ev.data ?? []) as EventRow[]);
        if (ts.data) {
          setSupply({
            total: Number(ts.data.total_emitido ?? 0),
            cap: Number(ts.data.hard_cap ?? 250_000_000),
          });
        }
      } catch (e) {
        if (!cancel)
          setError(e instanceof Error ? e.message : "Erro ao carregar carteira");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const shortAddr = walletAddr
    ? `${walletAddr.slice(0, 6)}…${walletAddr.slice(-4)}`
    : "carteira on-chain pendente";

  return (
    <PageShell title="Carteira ELP">
      {error && (
        <div
          className="mb-4 rounded-xl border px-3 py-2 text-xs"
          style={{ borderColor: "#7f1d1d", background: "#1a0a0a", color: "#fca5a5" }}
        >
          {error}
        </div>
      )}

      <div
        className="rounded-2xl border p-6 text-center"
        style={{
          borderColor: "#1DB954",
          background: "linear-gradient(135deg, #0F1A0F, #0A0F0A)",
        }}
      >
        <div
          className="text-[10px] font-semibold tracking-[0.14em]"
          style={{ color: "#7A9E7A" }}
        >
          SALDO DE CONFORMIDADE
        </div>
        {loading ? (
          <Skeleton className="mx-auto mt-2 h-10 w-32 bg-white/5" />
        ) : (
          <div className="text-4xl font-bold mt-2" style={{ color: "#1DB954" }}>
            {formatELP(saldo)}
          </div>
        )}
        <div className="text-xs mt-1" style={{ color: "#7a8a7a" }}>
          ELP · ≈ R$ {formatELP(saldo * 8)}
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-mono">
          <span
            className="font-bold tracking-wider px-2 py-1 rounded-md"
            style={{ background: "rgba(29,185,84,0.18)", color: "#1DB954" }}
          >
            ON-CHAIN · POLYGON
          </span>
          <span style={{ color: "#7a8a7a" }}>{shortAddr}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <Metric label="β operador" value={beta.toFixed(2)} hint="reputação" />
        <Metric
          label="eventos"
          value={String(events.length)}
          hint="últimos 20"
        />
      </div>

      <div
        className="mt-4 rounded-2xl border p-4"
        style={{ borderColor: "#1f2a1f", background: "#0F1A0F" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold" style={{ color: "#E8F5E8" }}>
            Tokenomics · hard cap 250M
          </div>
          <span className="text-[10px]" style={{ color: "#7a8a7a" }}>
            v2026.1
          </span>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span style={{ color: "#7a8a7a" }}>Supply emitido</span>
            <span style={{ color: "#E8F5E8" }}>
              {formatELP(supply.total)} / {formatELP(supply.cap)} ELP
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "#1f2a1f" }}
          >
            <div
              className="h-full"
              style={{
                width: `${Math.min(100, (supply.total / supply.cap) * 100).toFixed(2)}%`,
                background: "#1DB954",
              }}
            />
          </div>
          <div className="text-[10px] mt-1" style={{ color: "#7a8a7a" }}>
            Guard on-chain — emissões além do cap são revertidas.
          </div>
        </div>

        <div className="flex h-2 rounded-full overflow-hidden">
          {POOLS.map((p) => (
            <div
              key={p.label}
              style={{ width: `${p.pct}%`, background: p.color }}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {POOLS.map((p) => (
            <div key={p.label} className="flex items-center gap-2 text-[11px]">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: p.color }}
              />
              <span style={{ color: "#E8F5E8" }}>{p.label}</span>
              <span style={{ color: "#7a8a7a" }}>{p.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-sm font-bold" style={{ color: "#E8F5E8" }}>
            Histórico on-chain
          </h2>
          <Link
            to="/conformidade"
            className="text-xs font-medium"
            style={{ color: "#1DB954" }}
          >
            ver tudo
          </Link>
        </div>
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: "#0F1A0F", borderColor: "rgba(29,185,84,0.12)" }}
        >
          {loading ? (
            <div className="p-4">
              <Loader2 className="h-4 w-4 animate-spin mx-auto" style={{ color: "#1DB954" }} />
            </div>
          ) : events.length === 0 ? (
            <div
              className="px-4 py-8 flex flex-col items-center gap-2 text-center"
              style={{ color: "#7a8a7a" }}
            >
              <Inbox className="h-6 w-6" />
              <div className="text-xs">
                Nenhuma emissão ainda.{" "}
                <Link to="/registro" className="font-semibold" style={{ color: "#1DB954" }}>
                  Registrar descarte →
                </Link>
              </div>
            </div>
          ) : (
            events.map((e, i) => (
              <div key={e.id}>
                {i > 0 && (
                  <div className="h-px mx-4" style={{ background: "rgba(29,185,84,0.10)" }} />
                )}
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: "#E8F5E8" }}>
                      {e.categories?.nome ?? "Categoria"}
                    </div>
                    <div className="text-[10px] mt-0.5 flex items-center gap-2" style={{ color: "#7a8a7a" }}>
                      <span>{formatKg(Number(e.weight_kg))} kg</span>
                      <span>·</span>
                      <span>γ {Number(e.categories?.gamma_factor ?? 0).toFixed(2)}</span>
                      <span>·</span>
                      <span>{new Date(e.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                    {e.polygon_tx_hash && (
                      <a
                        href={`https://polygonscan.com/tx/${e.polygon_tx_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono mt-1 inline-flex items-center gap-1"
                        style={{ color: "#1DB954" }}
                      >
                        {e.polygon_tx_hash.slice(0, 10)}…
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: "#1DB954" }}>
                      +{formatELP(Number(e.elp_amount ?? 0))}
                    </div>
                    <div
                      className="text-[9px] font-semibold tracking-wider mt-0.5"
                      style={{
                        color: e.status === "aprovado" ? "#1DB954" : "#F5B544",
                      }}
                    >
                      {e.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageShell>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div
      className="rounded-xl border px-3 py-2.5"
      style={{ borderColor: "rgba(29,185,84,0.18)", background: "#0F1A0F" }}
    >
      <div className="text-[10px] tracking-wider" style={{ color: "#7a8a7a" }}>
        {label.toUpperCase()}
      </div>
      <div className="text-base font-bold" style={{ color: "#E8F5E8" }}>
        {value}
      </div>
      <div className="text-[9px]" style={{ color: "#7a8a7a" }}>
        {hint}
      </div>
    </div>
  );
}
