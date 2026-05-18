import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { createDisposalEvent, getCategories } from "@/lib/events.functions";
import { ocrPesoFromImage } from "@/lib/vision.functions";
import { generateCertificate } from "@/lib/certificate.functions";
import { sha256Hex, buildEventPayload, generateQrCode } from "@/lib/hash";
import { calcularELP, formatELP } from "@/lib/elp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Loader2, CheckCircle2, QrCode, Scale, FileSignature, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/registro")({
  head: () => ({ meta: [{ title: "Registrar descarte" }] }),
  component: RegistroPage,
});

type Step = 1 | 2 | 3 | 4 | 5;
type Cat = { id: string; nome: string; gamma_factor: number; risk_level: string };

function RegistroPage() {
  const fetchCats = useServerFn(getCategories);
  const ocr = useServerFn(ocrPesoFromImage);
  const submit = useServerFn(createDisposalEvent);
  const genCert = useServerFn(generateCertificate);

  const { data: categorias = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchCats(),
  });

  const [step, setStep] = useState<Step>(1);
  const [qr, setQr] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [peso, setPeso] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ eventId: string; elp: number; txHash: string | null } | null>(null);

  useEffect(() => {
    if (step === 1 && !qr) setQr(generateQrCode("manual"));
  }, [step, qr]);

  const cat = (categorias as Cat[]).find((c) => c.id === categoryId);
  const elpPrevisto = cat && peso ? calcularELP(parseFloat(peso) || 0, Number(cat.gamma_factor)) : 0;

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const b64 = reader.result as string;
      setPhoto(b64);
      setOcrLoading(true);
      try {
        const r = await ocr({ data: { imageBase64: b64 } });
        if (r.ok && r.peso) {
          setPeso(String(r.peso));
          toast.success(`OCR detectou: ${r.peso} kg`);
        } else if (r.ok) {
          toast.info("Não foi possível detectar peso — digite manualmente.");
        } else {
          toast.error(r.error ?? "OCR falhou");
        }
      } finally {
        setOcrLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    if (!cat || !peso) return;
    setSubmitting(true);
    try {
      const payload = buildEventPayload({
        batchId: qr,
        weightKg: parseFloat(peso),
        categoryId: cat.id,
      });
      const hashHex = await sha256Hex(payload);
      const r = await submit({
        data: {
          categoryId: cat.id,
          weightKg: parseFloat(peso),
          hashHex,
          qrCode: qr,
          photoBase64: photo ?? undefined,
        },
      });
      setResult({ eventId: r.eventId, elp: r.elp, txHash: r.txHash });
      setStep(5);
      toast.success(`Evento registrado — ${formatELP(r.elp)} ELP`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao registrar");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGerarCert() {
    if (!result) return;
    const t = toast.loading("Gerando certificado PDF...");
    try {
      const r = await genCert({ data: { eventId: result.eventId } });
      toast.dismiss(t);
      if (r.pdfUrl) {
        toast.success("Certificado pronto!");
        window.open(r.pdfUrl, "_blank");
      }
    } catch (e) {
      toast.dismiss(t);
      toast.error(e instanceof Error ? e.message : "Falha ao gerar");
    }
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center gap-3 mb-5">
        <Link to="/dashboard" className="p-2 -ml-2 text-dim">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-lg font-bold">Registrar descarte</h1>
          <div className="text-[11px] text-dim">Etapa {step} de 5</div>
        </div>
      </div>

      {/* progress */}
      <div className="flex gap-1.5 mb-6">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className={`h-1 flex-1 rounded-full ${n <= step ? "bg-primary" : "bg-surface-2"}`} />
        ))}
      </div>

      {step === 1 && (
        <StepCard icon={<QrCode className="h-5 w-5" />} title="Identificação do lote"
          desc="Um QR único é gerado por lote, válido por 24h.">
          <div className="rounded-xl bg-surface-2 border border-border p-4 font-mono text-sm tabular text-primary break-all">
            {qr}
          </div>
          <Button onClick={() => setQr(generateQrCode("manual"))} variant="outline" size="sm" className="mt-3">
            Gerar novo
          </Button>
          <FooterNav onNext={() => setStep(2)} canNext={!!qr} />
        </StepCard>
      )}

      {step === 2 && (
        <StepCard icon={<Scale className="h-5 w-5" />} title="Categoria REEE"
          desc="Selecione a categoria do resíduo. O fator γ define o multiplicador ELP.">
          <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar">
            {(categorias as Cat[]).map((c) => (
              <button key={c.id} onClick={() => setCategoryId(c.id)}
                className={`w-full text-left rounded-xl border p-3 transition ${
                  categoryId === c.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface hover:bg-surface-2"
                }`}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{c.nome}</div>
                  <Badge variant="outline" className="text-[10px]">γ {c.gamma_factor}</Badge>
                </div>
                <div className="text-[11px] text-dim mt-0.5">Risco {c.risk_level}</div>
              </button>
            ))}
          </div>
          <FooterNav onBack={() => setStep(1)} onNext={() => setStep(3)} canNext={!!categoryId} />
        </StepCard>
      )}

      {step === 3 && (
        <StepCard icon={<Camera className="h-5 w-5" />} title="Foto + peso"
          desc="Tire foto do display da balança. O OCR extrai o peso automaticamente.">
          <label className="block rounded-xl border-2 border-dashed border-border bg-surface p-6 text-center cursor-pointer hover:border-primary/50 transition">
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
            {photo ? (
              <img src={photo} alt="balança" className="w-full max-h-48 object-contain rounded-lg" />
            ) : (
              <>
                <Camera className="h-8 w-8 text-dim mx-auto" />
                <div className="mt-2 text-sm font-medium">Tirar foto da balança</div>
                <div className="text-[11px] text-dim">ou enviar do dispositivo</div>
              </>
            )}
          </label>

          {ocrLoading && (
            <div className="mt-3 flex items-center gap-2 text-xs text-dim">
              <Loader2 className="h-3 w-3 animate-spin" /> Lendo display via Google Vision...
            </div>
          )}

          <div className="mt-4 space-y-1.5">
            <Label htmlFor="peso">Peso (kg)</Label>
            <Input id="peso" type="number" step="0.01" min="0" value={peso}
              onChange={(e) => setPeso(e.target.value)} placeholder="0.00" />
          </div>

          {cat && peso && (
            <div className="mt-4 rounded-xl border border-primary/30 bg-primary/10 p-3 text-sm">
              ELP previsto: <span className="font-bold text-primary tabular">{formatELP(elpPrevisto)}</span>
            </div>
          )}

          <FooterNav onBack={() => setStep(2)} onNext={() => setStep(4)}
            canNext={!!peso && parseFloat(peso) > 0} />
        </StepCard>
      )}

      {step === 4 && (
        <StepCard icon={<FileSignature className="h-5 w-5" />} title="Confirmar e ancorar"
          desc="O hash SHA-256 do evento será registrado na Polygon Mainnet como prova imutável.">
          <Row k="Lote" v={qr} mono />
          <Row k="Categoria" v={cat?.nome ?? "—"} />
          <Row k="Peso" v={`${peso} kg`} />
          <Row k="γ" v={String(cat?.gamma_factor ?? "—")} />
          <Row k="ELP a emitir" v={formatELP(elpPrevisto)} highlight />
          <Button onClick={handleSubmit} disabled={submitting} className="w-full h-11 mt-5">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar e registrar on-chain
          </Button>
          <Button onClick={() => setStep(3)} variant="ghost" className="w-full mt-2">Voltar</Button>
        </StepCard>
      )}

      {step === 5 && result && (
        <StepCard icon={<CheckCircle2 className="h-5 w-5 text-primary" />} title="Registrado!"
          desc="Seu evento de descarte foi registrado com sucesso.">
          <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-surface border border-primary/30 p-5 text-center">
            <div className="text-xs text-dim">ELP emitido</div>
            <div className="tabular text-3xl font-bold text-primary mt-1">+{formatELP(result.elp)}</div>
          </div>
          {result.txHash ? (
            <a href={`https://polygonscan.com/tx/${result.txHash}`} target="_blank" rel="noreferrer"
              className="mt-4 flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-xs">
              <span className="flex items-center gap-2 text-primary">
                <LinkIcon className="h-3 w-3" /> Ver na Polygonscan
              </span>
              <span className="text-dim font-mono">{result.txHash.slice(0, 10)}…</span>
            </a>
          ) : (
            <div className="mt-4 rounded-xl border border-warn/40 bg-warn/10 p-3 text-xs text-warn">
              Hash gerado, mas a ancoragem on-chain está pendente. Será reprocessada.
            </div>
          )}
          <Button onClick={handleGerarCert} className="w-full h-11 mt-4">
            <FileSignature className="h-4 w-4" /> Gerar certificado PNRS
          </Button>
          <Button asChild variant="outline" className="w-full mt-2">
            <Link to="/dashboard">Voltar ao dashboard</Link>
          </Button>
        </StepCard>
      )}
    </div>
  );
}

function StepCard({ icon, title, desc, children }: {
  icon: React.ReactNode; title: string; desc: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <div className="text-sm font-semibold text-foreground">{title}</div>
      </div>
      <p className="text-xs text-dim mt-1 mb-4">{desc}</p>
      {children}
    </div>
  );
}

function Row({ k, v, mono, highlight }: { k: string; v: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-xs text-dim">{k}</span>
      <span className={`text-sm ${mono ? "font-mono text-[11px]" : ""} ${highlight ? "text-primary font-bold tabular" : ""} truncate ml-3 max-w-[60%] text-right`}>
        {v}
      </span>
    </div>
  );
}

function FooterNav({ onBack, onNext, canNext }: {
  onBack?: () => void; onNext: () => void; canNext: boolean;
}) {
  return (
    <div className="flex gap-2 mt-5">
      {onBack && <Button variant="outline" onClick={onBack} className="flex-1">Voltar</Button>}
      <Button onClick={onNext} disabled={!canNext} className="flex-1">Próximo</Button>
    </div>
  );
}
