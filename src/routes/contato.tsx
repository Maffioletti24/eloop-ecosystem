import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Mail, Linkedin, Instagram, Send, Loader2, CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { submitContactLead } from "@/lib/contact-leads.functions";

const SITE_URL = "https://eloop-investidores.lovable.app";
const EMAIL = "elooptoken.project@elooptoken.com";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Eloop Token" },
      {
        name: "description",
        content:
          "Fale com a equipe da Eloop Token. Solicite demo, parceria ou tire dúvidas sobre compliance PNRS, SINIR e logística reversa de REEE.",
      },
      { property: "og:title", content: "Contato — Eloop Token" },
      {
        property: "og:description",
        content: "Solicite demo, parceria ou converse com os fundadores.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/contato` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/contato` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contato — Eloop Token",
          url: `${SITE_URL}/contato`,
          contactPoint: {
            "@type": "ContactPoint",
            email: EMAIL,
            contactType: "customer support",
            areaServed: "BR",
            availableLanguage: ["Portuguese"],
          },
        }),
      },
    ],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useServerFn(submitContactLead);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setIsPending(true);
    setError(null);
    try {
      await submit({ data: { ...form, source: "contato" } });
      setSubmitted(true);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar. Tente novamente.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="border-b border-border/40">
          <div className="mx-auto max-w-4xl px-4 pb-12 pt-16 md:pt-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Fale com a Eloop
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Vamos transformar resíduos eletrônicos em oportunidade.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              Solicite uma demo, proponha um piloto ou converse sobre parceria
              e investimento. Respondemos pessoalmente.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Canais</h2>
              <div className="mt-6 space-y-3">
                <a
                  href={`mailto:${EMAIL}?subject=Contato%20Eloop%20Token`}
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 hover:border-primary/50"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-md bg-primary/15 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">E-mail</div>
                    <div className="mt-1 truncate font-medium">{EMAIL}</div>
                  </div>
                </a>

                <a
                  href="https://www.linkedin.com/company/eloop-token"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 hover:border-primary/50"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-md bg-primary/15 text-primary">
                    <Linkedin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">LinkedIn</div>
                    <div className="mt-1 font-medium">Eloop Token</div>
                  </div>
                </a>

                <a
                  href="https://instagram.com/elooptoken"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 hover:border-primary/50"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-md bg-primary/15 text-primary">
                    <Instagram className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Instagram</div>
                    <div className="mt-1 font-medium">@elooptoken</div>
                  </div>
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
              {submitted ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/15">
                    <CheckCircle2 className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="mt-4 text-xl font-semibold">Mensagem enviada!</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Obrigado pelo contato. Respondemos pelo e-mail informado em breve.
                  </p>
                  <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
                    Enviar outra mensagem
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name" required maxLength={120}
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Seu nome completo" className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email" type="email" required maxLength={255}
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="seu@email.com" className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message" required rows={5} maxLength={2000}
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Conte um pouco do contexto, perfil da empresa e o que precisa…"
                      className="mt-1.5"
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Enviando…</>
                    ) : (
                      <><Send className="h-4 w-4" /> Enviar mensagem</>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
