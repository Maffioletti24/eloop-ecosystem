import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Mail,
  Globe,
  Linkedin,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Recycle,
  Cpu,
  Construction,
  Send,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { submitInvestorLead } from "@/lib/investor-leads.functions";

export const Route = createFileRoute("/investidores")({
  head: () => ({
    meta: [
      {
        title:
          "Eloop Token — Captação de Investidores e Co Founders | Logística reversa REEE",
      },
      {
        name: "description",
        content:
          "Buscamos investidores e Co Founders para acelerar a plataforma Eloop Token: balança INMETRO + on-chain MTR/CDF para logística reversa de eletroeletrônicos no Brasil.",
      },
      { property: "og:title", content: "Eloop Token — Captação de Investidores" },
      {
        property: "og:description",
        content:
          "Climatetech B2B SaaS. MVP em finalização, pipeline de 3 beneficiadores para piloto remunerado. Mercado REEE Brasil com 70% de volume informal.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: InvestidoresLanding,
});

const CONTATO_EMAIL = "elooptoken.project@elooptoken.com";
const SITE_URL = "https://eloop.token";

function InvestidoresLanding() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitLead = useServerFn(submitInvestorLead);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setIsPending(true);
    setError(null);
    try {
      await submitLead({ name: form.name, email: form.email, message: form.message });
      setSubmitted(true);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar. Tente novamente.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top nav */}
      <header className="border-b border-border/40 bg-surface/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/15 text-primary">
              <Recycle className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight">Eloop Token</span>
          </Link>
          <a
            href={`mailto:${CONTATO_EMAIL}?subject=Investimento%20Eloop%20Token`}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Mail className="h-4 w-4" /> Falar com fundadores
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(60% 50% at 20% 10%, oklch(0.35 0.12 145 / 0.45) 0%, transparent 60%), radial-gradient(50% 40% at 90% 30%, oklch(0.45 0.10 200 / 0.30) 0%, transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Climatetech • B2B SaaS • Pré-Seed
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Buscamos investidores e Co Founders para destravar a logística
            reversa de eletroeletrônicos no Brasil.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            MVP em finalização. Pipeline de 3 beneficiadores prontos para piloto
            remunerado. Receita B2B SaaS por tonelada rastreada com MTR/CDF
            on-chain.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#contato"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Quero conversar <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${CONTATO_EMAIL}?subject=Investimento%20Eloop%20Token`}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-5 py-3 text-sm font-semibold hover:bg-surface-2"
            >
              Enviar e-mail
            </a>
          </div>
        </div>
      </section>

      {/* Market */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold tracking-tight">
          Por que agora: REEE Brasil
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: TrendingUp,
              k: "12% CAGR",
              v: "Mercado global de logística reversa de eletroeletrônicos.",
            },
            {
              icon: Recycle,
              k: "~70% informal",
              v: "Volume REEE no Brasil fora da cadeia formal — sem rastreabilidade.",
            },
            {
              icon: ShieldCheck,
              k: "Compliance ausente",
              v: "OEMs sem ferramenta confiável para MTR, CDF, SINIR e ISO 14001.",
            },
          ].map(({ icon: Icon, k, v }) => (
            <div
              key={k}
              className="rounded-xl border border-border bg-card p-5"
            >
              <Icon className="h-5 w-5 text-primary" />
              <div className="mt-3 text-2xl font-bold">{k}</div>
              <p className="mt-1 text-sm text-muted-foreground">{v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solution */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold tracking-tight">
          O que é o Eloop Token
        </h2>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Plataforma que conecta balança INMETRO + QR code no ponto de coleta a
          um registro on-chain de MTR e CDF, exportando automaticamente para
          SINIR, ISO 14001 e relatórios de compliance das OEMs.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            {
              icon: Cpu,
              t: "Pesagem certificada",
              d: "Integração com balança INMETRO + leitura QR no operador, sem digitação manual.",
            },
            {
              icon: ShieldCheck,
              t: "MTR e CDF on-chain",
              d: "Cada lote vira um registro imutável, auditável por OEM, reciclador e órgão ambiental.",
            },
            {
              icon: TrendingUp,
              t: "Exportação automatizada",
              d: "Relatórios SINIR, ISO 14001 e dashboards ESG para a OEM em poucos cliques.",
            },
            {
              icon: Recycle,
              t: "Receita por tonelada",
              d: "SaaS B2B com cobrança por tonelada rastreada — alinhado ao volume operado.",
            },
          ].map(({ icon: Icon, t, d }) => (
            <div
              key={t}
              className="flex gap-4 rounded-xl border border-border bg-card p-5"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Traction */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-semibold tracking-tight">
          Status atual e tração
        </h2>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {[
            "MVP em finalização (cadastro, pesagem, lote, MTR/CDF, dashboard ESG).",
            "Pipeline de 3 beneficiadores prontos para piloto remunerado.",
            "Modelo de receita B2B SaaS validado por tonelada rastreada.",
            "Arquitetura on-chain pronta para auditoria de OEM e órgão regulador.",
          ].map((t) => (
            <li
              key={t}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm">{t}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Ask */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-2xl border border-primary/30 bg-primary/10 p-8">
          <h2 className="text-2xl font-semibold tracking-tight">O que buscamos</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-primary">Investidores</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Rodada pré-seed para acelerar pilotos remunerados, certificações
                e integrações com OEMs. Tese: climatetech + compliance + dados
                rastreáveis.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-primary">Co Founders</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Perfis comerciais (B2B enterprise / OEM) e técnicos
                (blockchain / integrações industriais) com equity relevante.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contato / Formulário */}
      <section id="contato" className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Contato</h2>
            <p className="mt-2 text-muted-foreground">
              Fale direto com os fundadores. Respondemos pessoalmente.
            </p>
            <div className="mt-6 space-y-4">
              <a
                href={`mailto:${CONTATO_EMAIL}?subject=Investimento%20Eloop%20Token`}
                className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 hover:border-primary/50"
              >
                <div className="grid h-11 w-11 place-items-center rounded-md bg-primary/15 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    E-mail
                  </div>
                  <div className="mt-1 truncate font-medium">{CONTATO_EMAIL}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Para investidores, Co Founders e parcerias.
                  </div>
                </div>
              </a>

              <a
                href={SITE_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 hover:border-primary/50"
              >
                <div className="grid h-11 w-11 place-items-center rounded-md bg-primary/15 text-primary">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">
                    Site oficial
                  </div>
                  <div className="mt-1 truncate font-medium">
                    Eloop – Compliance Digital para Logística Reversa de Resíduos Eletrônicos | PNRS
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-warn/15 px-2 py-0.5 text-xs font-medium text-warn">
                    <Construction className="h-3 w-3" /> Em construção
                  </div>
                </div>
              </a>

              <a
                href="https://www.linkedin.com/company/eloop-token"
                target="_blank"
                rel="noreferrer noopener"
                className="group inline-flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium hover:bg-surface-2"
              >
                <Linkedin className="h-4 w-4" /> LinkedIn — Eloop Token
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            {submitted ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/15">
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Mensagem enviada!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Obrigado pelo interesse. Entraremos em contato em breve pelo e-mail informado.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => setSubmitted(false)}
                >
                  Enviar outra mensagem
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Seu nome completo"
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="seu@email.com"
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Conte um pouco sobre você e como podemos colaborar..."
                    required
                    rows={5}
                    className="mt-1.5"
                  />
                </div>
                {mutation.isError && (
                  <p className="text-sm text-destructive">
                    {mutation.error instanceof Error ? mutation.error.message : "Erro ao enviar. Tente novamente."}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Enviando…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Enviar mensagem
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto max-w-6xl px-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Eloop Token — Logística reversa REEE
          rastreável.
        </div>
      </footer>
    </div>
  );
}
