import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { PageShell } from "@/components/PageShell";
import { requireAuth } from "@/lib/require-auth";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { createDisposalEvent, getCategories } from "@/lib/events.functions";
import { generateQrCode, sha256Hex, buildEventPayload } from "@/lib/hash";
import { calcularELP, ALPHA_DEFAULT, formatELP } from "@/lib/elp";
import { Camera, Check, Loader2, QrCode as QrIcon, Sparkles } from "lucide-react";

export const Route = createFileRoute("/registro")({
  beforeLoad: requireAuth,
  head: () => ({ meta: [{ title: "Registrar Descarte — Eloop Token" }] }),
  component: RegistroPage,
});

type Category = {
  id: string;
  nome: string;
  gamma_factor: number;
  risk_level: string;
  descricao: string | null;
};

const STEPS = ["QR", "PESO", "FOTO", "HASH", "ELP"] as const;

const GREEN = "#1DB954";
const DARK = "#0F1A0F";
const BORDER = "#1f2a1f";
const MUTED = "#7a8a7a";
const TEXT = "#E8F5E8";

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-5">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="h-1.5 w-full rounded-full transition-colors"
              style={{
                background: done || active ? GREEN : "#1f2a1f",
                opacity: active ? 0.9 : 1,
              }}
            />
            <span
              className="text-[10px] font-medium tracking-wider"
              style={{ color: done || active ? GREEN : MUTED }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5 border"
      style={{ background: DARK, borderColor: `${GREEN}33` }}
    >
      {children}
    </div>
  );
}

function PrimaryBtn({
  children,
  onClick,
  disabled,
  loading,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full rounded-xl py-3 font-semibold mt-5 flex items-center justify-center gap-2 disabled:opacity-40"
      style={{ background: GREEN, color: "#0A0F0A" }}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

function RegistroPage() {
  const navigate = useNavigate();
  const fetchCategories = useServerFn(getCategories);
  const submitEvent = useServerFn(createDisposalEvent);

  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [qrCode, setQrCode] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [batchId] = useState(() => crypto.randomUUID());

  // Step 2
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [weight, setWeight] = useState("");
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 4
  const [hashHex, setHashHex] = useState("");

  // Step 5
  const [result, setResult] = useState<{
    elp: number;
    status: string;
    txHash: string | null;
  } | null>(null);

  // bootstrap: generate qr + load categories
  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data: op } = await supabase
        .from("operators")
        .select("id")
        .eq("user_id", auth.user.id)
        .single();
      if (!op) return;
      const code = generateQrCode(op.id);
      setQrCode(code);
      const url = await QRCode.toDataURL(code, {
        width: 240,
        margin: 1,
        color: { dark: "#1DB954", light: "#0F1A0F" },
      });
      setQrDataUrl(url);
      try {
        const cats = await fetchCategories();
        setCategories(cats as Category[]);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [fetchCategories]);

  const selectedCat = categories.find((c) => c.id === categoryId);
  const gamma = selectedCat ? Number(selectedCat.gamma_factor) : 0;
  const weightNum = Number(weight.replace(",", ".")) || 0;
  const elpPreview = calcularELP(weightNum, gamma, ALPHA_DEFAULT, 1.0);

  function onPickPhoto(file: File) {
    const reader = new FileReader();
    reader.onload = () => setPhotoBase64(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleGenerateHash() {
    setError(null);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const payload = buildEventPayload({
        batchId,
        weightKg: weightNum,
        categoryId,
        operatorWallet: auth.user?.id ?? null,
      });
      const h = await sha256Hex(payload);
      setHashHex(h);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar hash");
    }
  }

  async function handleEmit() {
    setError(null);
    setLoading(true);
    try {
      const r = await submitEvent({
        data: {
          categoryId,
          weightKg: weightNum,
          hashHex,
          qrCode,
          photoBase64: photoBase64 ?? undefined,
        },
      });
      setResult({ elp: r.elp, status: r.status, txHash: r.txHash });
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao emitir ELP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell title="Registrar Descarte">
      <StepBar current={step} />

      {error ? (
        <div
          className="mb-4 rounded-xl border px-3 py-2 text-xs"
          style={{ borderColor: "#7f1d1d", background: "#1a0a0a", color: "#fca5a5" }}
        >
          {error}
        </div>
      ) : null}

      {/* STEP 1 — QR */}
      {step === 0 && (
        <Card>
          <div className="flex flex-col items-center gap-3">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code do lote"
                className="rounded-xl"
                style={{ borderColor: GREEN }}
              />
            ) : (
              <div
                className="h-[240px] w-[240px] rounded-xl flex items-center justify-center"
                style={{ background: "#0A0F0A" }}
              >
                <Loader2 className="h-6 w-6 animate-spin" style={{ color: GREEN }} />
              </div>
            )}
            <p className="text-xs" style={{ color: MUTED }}>
              QR único por lote · uso único
            </p>
            <p className="text-[10px] font-mono" style={{ color: MUTED }}>
              {qrCode}
            </p>
          </div>
          <PrimaryBtn onClick={() => setStep(1)} disabled={!qrCode}>
            <QrIcon className="h-4 w-4" /> Confirmar QR
          </PrimaryBtn>
        </Card>
      )}

      {/* STEP 2 — PESO */}
      {step === 1 && (
        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: MUTED }}>
                Categoria REEE
              </label>
              <div className="flex gap-2">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex-1 rounded-xl px-3 py-3 border outline-none text-sm"
                  style={{ background: "#0A0F0A", borderColor: BORDER, color: TEXT }}
                >
                  <option value="">Selecione…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
                {selectedCat ? (
                  <span
                    className="rounded-xl px-3 py-2 text-xs font-semibold self-stretch flex items-center"
                    style={{ background: `${GREEN}22`, color: GREEN }}
                  >
                    γ = {gamma}
                  </span>
                ) : null}
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: MUTED }}>
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0,00"
                className="w-full rounded-xl px-4 py-3 border outline-none"
                style={{ background: "#0A0F0A", borderColor: BORDER, color: TEXT }}
              />
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: MUTED }}>
                Foto do descarte
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onPickPhoto(f);
                }}
              />
              {photoBase64 ? (
                <div className="relative">
                  <img
                    src={photoBase64}
                    alt="Preview"
                    className="w-full rounded-xl object-cover max-h-48"
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute top-2 right-2 rounded-full px-2 py-1 text-[10px]"
                    style={{ background: "#0A0F0A", color: TEXT }}
                  >
                    Trocar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full rounded-xl border-2 border-dashed p-5 flex flex-col items-center gap-1.5"
                  style={{ borderColor: GREEN, color: TEXT }}
                >
                  <Camera className="h-6 w-6" style={{ color: GREEN }} />
                  <span className="text-xs">Tirar / enviar foto</span>
                </button>
              )}
            </div>

            {weightNum > 0 && gamma > 0 ? (
              <div
                className="rounded-xl p-3 text-xs font-mono"
                style={{ background: "#0A0F0A", color: TEXT }}
              >
                <div style={{ color: MUTED }}>Prévia ELP</div>
                <div className="mt-1" style={{ color: GREEN }}>
                  {weightNum} × {gamma} × 2.0 × 1.0 = {formatELP(elpPreview)} ELP
                </div>
              </div>
            ) : null}
          </div>
          <PrimaryBtn
            onClick={() => setStep(2)}
            disabled={!categoryId || weightNum <= 0 || !photoBase64}
          >
            Confirmar Peso
          </PrimaryBtn>
        </Card>
      )}

      {/* STEP 3 — FOTO */}
      {step === 2 && (
        <Card>
          <div className="space-y-3">
            {photoBase64 ? (
              <img
                src={photoBase64}
                alt="Foto"
                className="w-full rounded-xl object-cover max-h-56"
              />
            ) : null}
            <p className="text-xs" style={{ color: MUTED }}>
              Pesagem manual · fallback Nível 1 (ABNT NBR 16156).
              Integração balança INMETRO promove auto Nível 2.
            </p>
            <ul className="space-y-1.5 text-xs">
              <li style={{ color: GREEN }}>✓ QR validado · uso único</li>
              <li style={{ color: GREEN }}>✓ Peso registrado · evidência fotográfica</li>
              <li style={{ color: "#f59e0b" }}>⏳ Hash SHA-256 pendente</li>
            </ul>
          </div>
          <PrimaryBtn onClick={handleGenerateHash}>Gerar Hash</PrimaryBtn>
        </Card>
      )}

      {/* STEP 4 — HASH */}
      {step === 3 && (
        <Card>
          <div className="space-y-3">
            <div className="text-xs" style={{ color: MUTED }}>
              SHA-256
            </div>
            <div
              className="rounded-xl p-3 font-mono text-[11px] break-all"
              style={{ background: "#0A0F0A", color: GREEN }}
            >
              {hashHex}
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="text-[9px] font-bold tracking-wider px-2 py-1 rounded-md"
                style={{ background: `${GREEN}22`, color: GREEN }}
              >
                ON-CHAIN · POLYGON
              </span>
              <span className="text-[10px]" style={{ color: MUTED }}>
                prova de integridade imutável
              </span>
            </div>
            <div
              className="rounded-xl px-3 py-2 text-xs flex items-center gap-2"
              style={{ background: `${GREEN}11`, color: TEXT }}
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: "#f59e0b" }} />
              <span>Ancoragem em curso…</span>
            </div>
          </div>
          <PrimaryBtn onClick={handleEmit} loading={loading}>
            Emitir ELP
          </PrimaryBtn>
        </Card>
      )}

      {/* STEP 5 — ELP */}
      {step === 4 && result ? (
        <Card>
          <div className="flex flex-col items-center gap-3 text-center py-2">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center"
              style={{ background: `${GREEN}22` }}
            >
              <Check className="h-9 w-9" style={{ color: GREEN }} />
            </div>
            <div className="text-2xl font-bold flex items-center gap-1.5" style={{ color: GREEN }}>
              <Sparkles className="h-5 w-5" />
              +{formatELP(result.elp)} ELP emitido!
            </div>
            <div
              className="rounded-xl p-3 text-xs font-mono w-full"
              style={{ background: "#0A0F0A", color: TEXT }}
            >
              <div style={{ color: MUTED }}>Cálculo</div>
              <div className="mt-1" style={{ color: GREEN }}>
                {weightNum} × {gamma} × 2.0 × 1.0 = {formatELP(result.elp)} ELP
              </div>
            </div>
            <div className="text-[11px]" style={{ color: MUTED }}>
              Status: {result.status}
              {result.txHash ? ` · tx ${result.txHash.slice(0, 10)}…` : ""}
            </div>
          </div>
          <PrimaryBtn onClick={() => navigate({ to: "/dashboard" })}>
            Voltar ao Dashboard
          </PrimaryBtn>
        </Card>
      ) : null}

      <p className="text-[10px] text-center mt-4" style={{ color: MUTED }}>
        Lote #{batchId.slice(0, 8)}
      </p>
    </PageShell>
  );
}
