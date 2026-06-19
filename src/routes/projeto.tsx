import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ScrollText, Layers, Cpu, FileCheck2, Recycle, TrendingUp, Users, ShieldCheck,
  ArrowRight, TreePine, BarChart3, Leaf,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import processImage from "@/assets/eloop-process.jpg";
import appImage from "@/assets/eloop-app.jpg";
import dashboardImage from "@/assets/eloop-dashboard.jpg";
import materialsImage from "@/assets/eloop-materials.jpg";
import carbonImage from "@/assets/eloop-carbon.jpg";

const PILLAR_IMAGES: Record<string, { src: string; alt: string }> = {
  "Tecnologia Eloop Token": {
    src: processImage,
    alt: "Pesagem certificada INMETRO com leitura de QR code no ponto de coleta",
  },
  "Interface Digital": {
    src: appImage,
    alt: "App Eloop exibindo lote de coleta, peso e hash blockchain",
  },
  "Impacto Socioambiental": {
    src: materialsImage,
    alt: "Cobre, placas e componentes recuperados retornando à cadeia produtiva",
  },
  "Diferencial Competitivo": {
    src: dashboardImage,
    alt: "Dashboard ESG com KPIs e mapa de pontos de coleta no Brasil",
  },
};

const SITE_URL = "https://eloop-investidores.lovable.app";

export const Route = createFileRoute("/projeto")({
  head: () => ({
    meta: [
      { title: "Projeto Eloop Token — Como funciona a plataforma REEE" },
      {
        name: "description",
        content:
          "Conheça os 8 pilares do Eloop Token: pesagem certificada INMETRO, QR de coleta, MTR/CDF on-chain em Polygon, dashboards ESG e exportação SINIR/ISO 14001.",
      },
      { property: "og:title", content: "Projeto Eloop Token — Como funciona" },
      {
        property: "og:description",
        content:
          "Pesagem INMETRO + QR + on-chain + SINIR/ISO 14001 em um único fluxo de compliance REEE.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/projeto` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/projeto` }],
  }),
  component: ProjetoPage,
});

const SECTIONS = [
  {
    icon: ScrollText,
    title: "O Ponto Crítico",
    desc: "A Política Nacional de Resíduos Sólidos (Lei 12.305/2010) responsabiliza fabricantes, importadores, distribuidores e comerciantes pela logística reversa de eletroeletrônicos. Mesmo com o Decreto 10.240/2020, cerca de 70% do volume REEE no Brasil ainda circula fora da cadeia formal, sem rastreabilidade, sem MTR e sem CDF — o que expõe OEMs a multas e perda de pontuação ESG.",
  },
  {
    icon: Layers,
    title: "Cadeia de Custódia Formal",
    desc: "Cada lote coletado gera um registro vinculado a quem o gerou, quem transportou, quem beneficiou e quem deu destino final. Documentos de transporte (MTR) e certificados de destinação final (CDF) deixam de ser PDFs soltos para virar um histórico contínuo, auditável por OEM, reciclador e órgão ambiental.",
  },
  {
    icon: Cpu,
    title: "Tecnologia Eloop Token",
    desc: "Integração nativa com balanças INMETRO, leitura de QR code no operador, assinatura digital do responsável e registro on-chain na rede Polygon. O hash do lote é imutável e verificável publicamente, sem digitação manual e sem risco de adulteração.",
  },
  {
    icon: FileCheck2,
    title: "Interface Digital",
    desc: "App mobile-first para o operador no ponto de coleta, dashboard web para o gestor acompanhar volumes e KPIs, e área de auditoria com filtros por OEM, beneficiador, tipo de material e período para o regulador.",
  },
  {
    icon: Recycle,
    title: "Impacto Socioambiental",
    desc: "Formalização de cooperativas e catadores que hoje operam sem documentação, redução de contaminação por metais pesados (chumbo, cádmio, mercúrio) e devolução de cobre, alumínio, ouro e terras raras à economia produtiva.",
  },
  {
    icon: TrendingUp,
    title: "Mercado de Reciclagem",
    desc: "O mundo gera mais de 62 milhões de toneladas de REEE por ano (Global E-Waste Monitor) e o segmento de logística reversa cresce a ~12% ao ano. O Brasil é o maior gerador da América Latina e tem o ambiente regulatório mais maduro da região após o Decreto 10.240.",
  },
  {
    icon: Users,
    title: "Modelo de Negócio",
    desc: "SaaS B2B com cobrança por tonelada rastreada, contratos plurianuais com OEMs e taxa de adesão para beneficiadores. Receita previsível alinhada ao volume operacional, com margem bruta típica de software.",
  },
  {
    icon: ShieldCheck,
    title: "Diferencial Competitivo",
    desc: "Único stack no Brasil que une pesagem certificada INMETRO, registro on-chain e exportação automatizada para SINIR e ISO 14001. Concorrentes resolvem só pedaços do fluxo — formulário web, planilha, app sem prova ou blockchain sem integração física.",
  },
];

function ProjetoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="border-b border-border/40">
          <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 md:pt-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Projeto Eloop Token
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Compliance REEE rastreável, do ponto de coleta ao relatório.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              Os 8 pilares que sustentam a plataforma — do problema regulatório
              que resolvemos ao stack técnico que entrega a prova.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl space-y-14 px-4 py-16 md:py-20">
          {SECTIONS.map(({ icon: Icon, title, desc }, i) => {
            const img = PILLAR_IMAGES[title];
            const reverse = i % 2 === 1;
            return (
              <article
                key={title}
                className={`grid gap-8 md:grid-cols-2 md:items-center ${
                  reverse ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Pilar {String(i + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                    {title}
                  </h2>
                  <p className="mt-3 text-muted-foreground">{desc}</p>
                </div>
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                  {img ? (
                    <img
                      src={img.src}
                      alt={img.alt}
                      width={1536}
                      height={1024}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="relative grid aspect-[4/3] place-items-center bg-gradient-to-br from-primary/20 via-surface to-surface-2"
                    >
                      <Icon className="h-20 w-20 text-primary/40" />
                      <div className="absolute right-4 top-4 rounded-md bg-background/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary backdrop-blur">
                        {String(i + 1).padStart(2, "0")} · {title.split(" ")[0]}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                GHG Protocol · Escopo 3
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                Métrica de carbono integrada à cadeia de valor
              </h2>
              <p className="mt-4 text-muted-foreground">
                O Escopo 3 do GHG Protocol obriga empresas a reportarem emissões
                indiretas da cadeia de valor — incluindo resíduos de produtos
                vendidos. O Eloop transforma cada quilograma de REEE coletado em
                dados de CO₂e mitigado, com rastreabilidade desde o gerador até
                a destinação final.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-4">
                  <TreePine className="h-5 w-5 text-primary" />
                  <p className="mt-2 text-sm font-semibold">CO₂e evitado</p>
                  <p className="text-xs text-muted-foreground">até 3,5 kg / kg REEE</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <p className="mt-2 text-sm font-semibold">Mensuração automatizada</p>
                  <p className="text-xs text-muted-foreground">kg → tCO₂e em tempo real</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <Leaf className="h-5 w-5 text-primary" />
                  <p className="mt-2 text-sm font-semibold">Lastro auditável</p>
                  <p className="text-xs text-muted-foreground">Hash on-chain + MTR</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
              <img
                src={carbonImage}
                alt="Dashboard de métricas de carbono integrado ao fluxo REEE"
                width={1536}
                height={1024}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-8 md:p-12">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Quer ver o fluxo rodando?
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Agendamos uma demo gratuita com seu time de sustentabilidade ou
              compliance. Mostramos a pesagem, o QR e o registro on-chain ao
              vivo.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/contato"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Solicitar demo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/investidores"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-5 py-3 text-sm font-semibold hover:bg-surface-2"
              >
                Para investidores
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
