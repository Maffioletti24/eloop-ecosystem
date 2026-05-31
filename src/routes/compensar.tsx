import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Flame, ExternalLink, FileDown, Loader2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireAuth } from "@/lib/require-auth";
import { supabase } from "@/integrations/supabase/client";
import { burnElpForCompensation, listCompensations } from "@/lib/compensar.functions";
import { formatELP } from "@/lib/elp";
import { toast } from "sonner";

export const Route = createFileRoute("/compensar")({
  beforeLoad: async () => {
    await requireAuth();
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data: op } = await supabase
      .from("operators")
      .select("role")
      .eq("user_id", u.user.id)
      .maybeSingle();
    if (op?.role !== "buyer" && op?.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({ meta: [{ title: "Compensar ELP — Eloop Token" }] }),
  component: CompensarPage,
});

type Comp = {
  id: string;
  elp_burned: number;
  finalidade: string | null;
  numero_sequencial: string;
  polygon_tx_hash: string | null;
  pdf_url: string | null;
  created_at: string;
};

function CompensarPage() {
  const fetchList = useServerFn(listCompensations);
  const burn = useServerFn(burnElpForCompensation);
  const [saldo, setSaldo] = useState(0);
  const [items, setItems] = useState<Comp[]>([]);
  const [amount, setAmount] = useState("");
  const [finalidade, setFinalidade] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function reload() {
    const r = await fetchList({});
    setSaldo(r.saldo);
    setItems((r.items ?? []) as Comp[]);
  }

  useEffect(() => {
    (async () => {
      try {
        await reload();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleBurn(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return toast.error("Quantidade inválida");
    if (amt > saldo) return toast.error("Saldo insuficiente");
    if (finalidade.trim().length < 3) return toast.error("Descreva a finalidade");
    setBusy(true);
    try {
      const r = await burn({ data: { amount: amt, finalidade: finalidade.trim() } });
      toast.success(`Compensação ${r.numero} emitida`);
      setAmount("");
      setFinalidade("");
      await reload();
      if (r.pdfUrl) window.open(r.pdfUrl, "_blank");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao compensar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell title="Compensar ELP">
      <div
        className="rounded-2xl border p-5 text-center"
        style={{
          borderColor: "#1DB954",
          background: "linear-gradient(135deg, #0F1A0F, #0A0F0A)",
        }}
      >
        <div className="text-[10px] tracking-[0.14em]" style={{ color: "#7A9E7A" }}>
          SALDO DISPONÍVEL PARA QUEIMA
        </div>
        <div className="text-4xl font-bold mt-2" style={{ color: "#1DB954" }}>
          {formatELP(saldo)}
        </div>
        <div className="text-xs mt-1" style={{ color: "#7a8a7a" }}>
          ELP adquiridos · rastreáveis on-chain
        </div>
      </div>

      <form
        onSubmit={handleBurn}
        className="mt-4 rounded-2xl border p-4 space-y-3"
        style={{ borderColor: "rgba(29,185,84,0.2)", background: "#0F1A0F" }}
      >
        <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: "#E8F5E8" }}>
          <Flame className="h-4 w-4" style={{ color: "#F5B544" }} />
          Nova compensação
        </h2>

        <div className="space-y-1.5">
          <Label htmlFor="amt">Quantidade (ELP)</Label>
          <Input
            id="amt"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            max={saldo}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fim">Finalidade / lote compensado</Label>
          <Textarea
            id="fim"
            value={finalidade}
            onChange={(e) => setFinalidade(e.target.value)}
            placeholder="Ex.: Compensação de REEE referente ao lote 2026/Q2 — Indústria XYZ"
            rows={3}
            required
            maxLength={280}
          />
        </div>

        <Button type="submit" className="w-full h-11" disabled={busy || saldo <= 0}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Queimar e emitir certificado
        </Button>
        <p className="text-[10px]" style={{ color: "#7a8a7a" }}>
          A queima é registrada na Polygon (proof-of-burn) e gera certificado PDF
          rastreável no SINIR.
        </p>
      </form>

      <div className="mt-5">
        <h3 className="text-sm font-bold mb-2 px-1" style={{ color: "#E8F5E8" }}>
          Histórico de compensações
        </h3>
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: "#0F1A0F", borderColor: "rgba(29,185,84,0.12)" }}
        >
          {loading ? (
            <div className="p-4">
              <Loader2 className="h-4 w-4 animate-spin mx-auto" style={{ color: "#1DB954" }} />
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-6 text-xs text-center" style={{ color: "#7a8a7a" }}>
              Nenhuma compensação emitida ainda.
            </div>
          ) : (
            items.map((c, i) => (
              <div key={c.id}>
                {i > 0 && (
                  <div className="h-px mx-4" style={{ background: "rgba(29,185,84,0.10)" }} />
                )}
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-mono tracking-wider"
                      style={{ color: "#7a8a7a" }}
                    >
                      {c.numero_sequencial}
                    </span>
                    <span className="text-sm font-bold" style={{ color: "#F5B544" }}>
                      −{formatELP(Number(c.elp_burned))}
                    </span>
                  </div>
                  {c.finalidade && (
                    <div className="text-xs mt-1" style={{ color: "#E8F5E8" }}>
                      {c.finalidade}
                    </div>
                  )}
                  <div
                    className="text-[10px] mt-1 flex items-center gap-3"
                    style={{ color: "#7a8a7a" }}
                  >
                    <span>{new Date(c.created_at).toLocaleString("pt-BR")}</span>
                    {c.polygon_tx_hash && (
                      <a
                        href={`https://polygonscan.com/tx/${c.polygon_tx_hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1"
                        style={{ color: "#1DB954" }}
                      >
                        on-chain <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                    {c.pdf_url && (
                      <a
                        href={c.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1"
                        style={{ color: "#1DB954" }}
                      >
                        PDF <FileDown className="h-2.5 w-2.5" />
                      </a>
                    )}
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
