import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, Eye, Heart, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const SITE_URL = "https://eloop-investidores.lovable.app";

export const Route = createFileRoute("/quem-somos")({
  head: () => ({
    meta: [
      { title: "Quem somos — Eloop Token" },
      {
        name: "description",
        content:
          "Eloop Token é uma climatetech brasileira que constrói infraestrutura de compliance para a logística reversa de resíduos eletrônicos.",
      },
      { property: "og:title", content: "Quem somos — Eloop Token" },
      {
        property: "og:description",
        content:
          "Climatetech brasileira focada em compliance REEE auditável e rastreável.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/quem-somos` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/quem-somos` }],
  }),
  component: QuemSomosPage,
});

function QuemSomosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="border-b border-border/40">
          <div className="mx-auto max-w-4xl px-4 pb-12 pt-16 md:pt-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Quem somos
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Construindo a camada de confiança da logística reversa no Brasil.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Eloop Token é uma climatetech brasileira que une pesagem
              certificada, registro on-chain e exportação regulatória em uma
              única plataforma — para que OEMs, beneficiadores e órgãos
              ambientais falem a mesma língua de dados.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 md:py-20">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Target,
                t: "Missão",
                d: "Tornar a conformidade PNRS auditável, automática e acessível para toda a cadeia REEE brasileira.",
              },
              {
                icon: Eye,
                t: "Visão",
                d: "Ser a infraestrutura padrão de compliance e impacto socioambiental para resíduos eletrônicos na América Latina.",
              },
              {
                icon: Heart,
                t: "Valores",
                d: "Rastreabilidade, transparência, formalização da cadeia informal e respeito ao trabalho de catadores e cooperativas.",
              },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="rounded-xl border border-border bg-card p-6">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-semibold">{t}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-border/40 bg-surface/40">
          <div className="mx-auto max-w-4xl px-4 py-16 md:py-20">
            <h2 className="text-3xl font-semibold tracking-tight">Nossa história</h2>
            <div className="prose prose-invert mt-6 max-w-none text-muted-foreground">
              <p>
                A Eloop nasceu da constatação de que a Política Nacional de
                Resíduos Sólidos está em vigor desde 2010, mas a maior parte
                dos eletroeletrônicos descartados no Brasil ainda não tem
                rastreabilidade real. OEMs enfrentam pressão regulatória
                crescente; beneficiadores e catadores operam à margem da
                cadeia formal; e o órgão ambiental não tem fonte de dados
                confiável.
              </p>
              <p>
                Decidimos construir a camada que faltava: pesagem certificada
                INMETRO + identificação por QR + assinatura digital + registro
                on-chain. Tudo isso embrulhado em um app para o operador, um
                dashboard ESG para o gestor e uma área de auditoria para o
                regulador.
              </p>
              <p>
                Hoje, com MVP em finalização e pipeline de pilotos remunerados
                com beneficiadores, estamos abrindo rodada pré-seed e
                conversando com Co Founders comerciais e técnicos para
                acelerar a tração.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-8 md:p-12">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Quer construir essa cadeia com a gente?
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Conversamos com investidores climatech, OEMs interessadas em
              piloto e potenciais Co Founders.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/contato"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Falar com fundadores <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/investidores"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-5 py-3 text-sm font-semibold hover:bg-surface-2"
              >
                Página de investidores
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
