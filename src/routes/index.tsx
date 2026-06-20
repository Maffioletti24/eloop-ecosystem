import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Recycle,
  TrendingUp,
  ScrollText,
  Layers,
  FileCheck2,
  Users,
  CheckCircle2,
  TreePine,
  Leaf,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import heroImage from "@/assets/eloop-hero.jpg";
import processImage from "@/assets/eloop-process.jpg";
import appImage from "@/assets/eloop-app.jpg";
import dashboardImage from "@/assets/eloop-dashboard.jpg";
import materialsImage from "@/assets/eloop-materials.jpg";
import carbonImage from "@/assets/eloop-carbon.jpg";

const SITE_URL = "https://elooptoken.com";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Eloop — Compliance Digital para Logística Reversa de REEE | PNRS" },
      {
        name: "description",
        content:
          "Plataforma de conformidade PNRS para resíduos eletrônicos: balança INMETRO, QR no ponto de coleta, MTR/CDF on-chain e relatórios SINIR/ISO 14001 automatizados.",
      },
      { property: "og:title", content: "Eloop — Compliance Digital para REEE | PNRS" },
      {
        property: "og:description",
        content:
          "Infraestrutura B2B SaaS para logística reversa de eletroeletrônicos no Brasil: rastreabilidade auditável e prova on-chain.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: `${SITE_URL}/og-eloop.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Eloop — Compliance Digital para REEE" },
      {
        name: "twitter:description",
        content: "PNRS, SINIR e ISO 14001 com prova on-chain.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
  }),
  component: HomePage,
});

const PILARES = [
  {
    icon: ScrollText,
    title: "O Ponto Crítico",
    desc: "PNRS (Lei 12.305/2010) obriga rastreabilidade, mas ~70% dos REEE no Brasil ainda circulam fora da cadeia formal.",
  },
  {
    icon: Layers,
    title: "Cadeia de Custódia Formal",
    desc: "Cada coleta gera registro auditável: geradora, transportador, beneficiador e destinador final — todos identificados.",
  },
  {
    icon: Cpu,
    title: "Tecnologia Eloop Token",
    desc: "Balança INMETRO + QR code + assinatura digital + registro on-chain em Polygon. Sem digitação manual.",
  },
  {
    icon: FileCheck2,
    title: "Interface Digital",
    desc: "App e dashboard com fluxo guiado para o operador, monitoramento para o gestor e área de auditoria para o regulador.",
  },
  {
    icon: Recycle,
    title: "Impacto Socioambiental",
    desc: "Formalização de cooperativas e catadores, redução de contaminação e devolução de materiais críticos à economia.",
  },
  {
    icon: TrendingUp,
    title: "Mercado de Reciclagem",
    desc: "62 milhões de toneladas de REEE geradas/ano no mundo, com CAGR de 12% em logística reversa.",
  },
  {
    icon: Users,
    title: "Modelo de Negócio",
    desc: "B2B SaaS com cobrança por tonelada rastreada — receita previsível alinhada ao volume operacional das OEMs.",
  },
  {
    icon: ShieldCheck,
    title: "Diferencial Competitivo",
    desc: "Único stack no Brasil que une pesagem certificada + on-chain + exportação automatizada para SINIR e ISO 14001.",
  },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-70"
            style={{
              background:
                "radial-gradient(60% 50% at 15% 0%, oklch(0.35 0.12 145 / 0.55) 0%, transparent 60%), radial-gradient(45% 35% at 90% 30%, oklch(0.45 0.10 200 / 0.30) 0%, transparent 70%)",
            }}
          />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 pt-16 md:grid-cols-2 md:pb-24 md:pt-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span className="compliance-dot" /> Novo site Eloop · PNRS · SINIR · ISO 14001 · on-chain
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
                Infraestrutura de{" "}
                <span className="text-primary">Compliance</span> para Resíduos
                Eletrônicos
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Convertemos a obrigação regulatória da logística reversa em
                registros digitais auditáveis, imutáveis e prontos para
                fiscalização. PNRS, rastreabilidade de REE e relatórios ESG —
                em uma única plataforma.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/contato"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Solicitar demo <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/projeto"
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-5 py-3 text-sm font-semibold hover:bg-surface-2"
                >
                  Como funciona
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                <img
                  src={heroImage}
                  alt="Balança industrial pesando eletroeletrônicos com QR code e registro on-chain de logística reversa no Brasil"
                  width={1536}
                  height={1024}
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="border-b border-border/40 bg-surface/40">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-4">
            {[
              { k: "62M t", v: "REEE gerados/ano no mundo" },
              { k: "12%", v: "CAGR logística reversa global" },
              { k: "~70%", v: "REEE Brasil fora da cadeia formal" },
              { k: "Lei 12.305", v: "PNRS — rastreabilidade obrigatória" },
            ].map((s) => (
              <div
                key={s.k}
                className="rounded-xl border border-border bg-card p-5 text-center md:text-left"
              >
                <div className="text-2xl font-bold text-primary md:text-3xl">{s.k}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </section>

        {/* PROCESSO */}
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Operação
            </span>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Do ponto de coleta ao registro on-chain
            </h2>
            <p className="mt-3 text-muted-foreground">
              Pesagem certificada, leitura de QR no operador e hash imutável na
              rede Polygon — em segundos, sem digitação manual.
            </p>
          </div>

          <div className="mt-10 grid items-center gap-8 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
              <img
                src={processImage}
                alt="Operador pesando eletroeletrônicos em balança INMETRO e escaneando QR code para registro de coleta"
                width={1536}
                height={1024}
                loading="lazy"
                className="h-auto w-full"
              />
            </div>
            <ol className="space-y-5">
              {[
                { n: "01", t: "Coleta identificada", d: "Operador escaneia QR no ponto de origem (OEM, varejo ou ecoponto)." },
                { n: "02", t: "Pesagem certificada", d: "Balança INMETRO envia o peso direto para o app — sem chance de adulteração." },
                { n: "03", t: "Assinatura digital", d: "Responsável assina o lote no aplicativo e gera MTR automaticamente." },
                { n: "04", t: "Registro on-chain", d: "Hash do lote é gravado em Polygon e exportado para SINIR e ISO 14001." },
              ].map((s) => (
                <li key={s.n} className="flex gap-4 rounded-xl border border-border bg-card p-4">
                  <div className="text-lg font-bold text-primary">{s.n}</div>
                  <div>
                    <div className="font-semibold">{s.t}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* APP + DASHBOARD */}
        <section className="border-y border-border/40 bg-surface/40">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-20">
            <div className="order-2 md:order-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                App e Dashboard
              </span>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                Mobile para o campo, web para o gestor
              </h2>
              <p className="mt-3 text-muted-foreground">
                O operador usa o app para escanear, pesar e fechar o lote em
                poucos toques. O gestor acompanha volumes, KPIs ESG e
                rastreabilidade por OEM em um dashboard auditável.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Fluxo guiado para coleta em segundos",
                  "Histórico completo por OEM, beneficiador e período",
                  "Exportação direta SINIR / ISO 14001 / GRI",
                  "Verificação pública do hash on-chain",
                ].map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{i}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 md:order-2">
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                <img
                  src={appImage}
                  alt="App mobile Eloop mostrando coleta de resíduos eletrônicos com peso, QR code e registro blockchain"
                  width={1280}
                  height={1280}
                  loading="lazy"
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Os 8 pilares da plataforma
            </h2>
            <p className="mt-3 text-muted-foreground">
              Conectados em um único fluxo, do ponto de coleta ao relatório
              regulatório.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {PILARES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-border">
              <img
                src={dashboardImage}
                alt="Dashboard web Eloop com KPIs ESG, mapa de pontos de coleta no Brasil e materiais recuperados"
                width={1536}
                height={1024}
                loading="lazy"
                className="h-auto w-full"
              />
            </div>
            <div className="overflow-hidden rounded-2xl border border-border">
              <img
                src={materialsImage}
                alt="Componentes eletrônicos recuperados — placas, cobre e contatos dourados retornando à cadeia produtiva"
                width={1536}
                height={1024}
                loading="lazy"
                className="h-auto w-full"
              />
            </div>
          </div>
        </section>

        {/* PARA QUEM */}
        <section className="border-y border-border/40 bg-surface/40">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Para quem é a Eloop
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  t: "OEMs e Fabricantes",
                  d: "Cumpra PNRS e ISO 14001 com prova auditável por lote. Relatórios SINIR em poucos cliques.",
                },
                {
                  t: "Beneficiadores e Recicladores",
                  d: "Documente CDF de forma automatizada, integre com balança e exporte para órgão ambiental.",
                },
                {
                  t: "Investidores e Parceiros",
                  d: "Climatetech B2B com receita por tonelada rastreada e pipeline de pilotos remunerados.",
                },
              ].map((b) => (
                <div key={b.t} className="rounded-xl border border-border bg-card p-6">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 font-semibold">{b.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{b.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GHG PROTOCOL · ESCOPO 3 */}
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              GHG Protocol · Escopo 3
            </span>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Transforme resíduos em crédito de carbono mensurável
            </h2>
            <p className="mt-3 text-muted-foreground">
              O Escopo 3 do GHG Protocol exige que empresas contabilizem emissões
              indiretas da cadeia — incluindo resíduos de produtos vendidos.
              A Eloop converte cada coleta de REEE em métrica de CO₂e mitigado,
              pronta para relatórios ESG, CDP e Science Based Targets.
            </p>
          </div>

          <div className="mt-10 grid items-start gap-8 md:grid-cols-2">
            <div className="order-2 md:order-1 grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                {[
                  {
                    icon: TreePine,
                    k: "Emissões evitadas por tonelada",
                    v: "até 3,5 tCO₂e / t REEE",
                    d: "Cada tonelada reciclada gera crédito de carbono quantificável. Quanto mais complexo o resíduo, maior o potencial de mitigação.",
                  },
                  {
                    icon: BarChart3,
                    k: "Cálculo automático de carbono",
                    v: "Peso → tCO₂e em tempo real",
                    d: "A balança alimenta o dashboard ESG diretamente. Sem planilhas, sem retrabalho — a métrica nasce no momento da coleta.",
                  },
                  {
                    icon: Leaf,
                    k: "Prova verificável",
                    v: "Hash on-chain + MTR",
                    d: "Documento de transporte e registro blockchain comprovam que o material foi efetivamente recuperado — não apenas declarado.",
                  },
                ].map(({ icon: Icon, k, v, d }) => (
                  <div
                    key={k}
                    className="flex gap-4 rounded-xl border border-border bg-card p-5"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-primary">{k}</div>
                      <div className="mt-0.5 text-lg font-bold">{v}</div>
                      <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-primary/20 bg-surface/60 p-5">
                <h3 className="text-sm font-semibold text-primary">Glossário rápido</h3>
                <dl className="mt-3 space-y-3 text-sm">
                  <div>
                    <dt className="font-semibold">CO₂e</dt>
                    <dd className="text-muted-foreground">Dióxido de carbono equivalente — unidade padrão para medir o potencial de aquecimento global de diferentes gases.</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Escopo 3</dt>
                    <dd className="text-muted-foreground">Emissões indiretas da cadeia de valor: fornecedores, transporte, resíduos de produtos vendidos e uso final.</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">MTR</dt>
                    <dd className="text-muted-foreground">Manifesto de Transporte de Resíduos — documento obrigatório no Brasil para rastrear resíduos do gerador ao destinador.</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">Lastro auditável</dt>
                    <dd className="text-muted-foreground">Comprovação documental e técnica que sustenta uma métrica ou crédito de carbono, evitando double counting.</dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                <img
                  src={carbonImage}
                  alt="Visualização de métricas de carbono e compensação de CO2 com dados de logística reversa de REEE"
                  width={1536}
                  height={1024}
                  loading="lazy"
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ARTIGOS EM DESTAQUE */}
        <section className="border-y border-border/40 bg-surface/40">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Blog
                </span>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                  Artigos em destaque
                </h2>
              </div>
              <Link
                to="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <Link
                to="/blog/mineradoras-urbanas-brasil-compliance"
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-lg"
              >
                <div className="aspect-[16/9] overflow-hidden bg-muted">
                  <img
                    src="https://eloop-investidores.lovable.app/__l5e/assets-v1/084aab50-349b-48d2-8e8a-738f62dd535c/blog-urban-mining.png"
                    alt="Mineradoras urbanas do Brasil — problema de compliance"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    <span>Compliance · REEE · PNRS</span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold leading-snug group-hover:text-primary">
                    As Mineradoras Urbanas no Brasil estão invisíveis? — Veja como o compliance pode resolver isso
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">
                    Uma tonelada de placas de circuito pode conter até 200g de ouro. Mas ~70% dos REEE no Brasil circulam fora da cadeia formal — sem visibilidade, sem compliance PNRS, sem crédito de carbono. Veja como a infraestrutura digital resolve.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Ler artigo <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>

              <Link
                to="/blog/mineradoras-urbanas-visibilidade-blockchain"
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-lg"
              >
                <div className="aspect-[16/9] overflow-hidden bg-muted">
                  <img
                    src="https://eloop-investidores.lovable.app/__l5e/assets-v1/a8125ea8-eaa2-4880-a250-1bd94a859041/blog-blockchain-visibility.png"
                    alt="Mineradoras urbanas com visibilidade na blockchain"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    <span>Blockchain · Rastreabilidade · Oportunidade</span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold leading-snug group-hover:text-primary">
                    Como as mineradoras urbanas do Brasil podem ganhar visibilidade na blockchain — e por que a Eloop é a oportunidade
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">
                    Uma tonelada de placas de circuito pode conter até 200g de ouro. Mas ~70% dos REEE no Brasil circulam fora da cadeia formal — sem visibilidade, sem compliance PNRS, sem crédito de carbono. Veja como a blockchain e a infraestrutura digital da Eloop transformam esse cenário em oportunidade.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Ler artigo <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* SOLUÇÕES & OPORTUNIDADES */}
        <section className="border-y border-border/40 bg-surface/40">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Soluções & Oportunidades
              </span>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                Além do REEE: um motor de compliance para outras cadeias
              </h2>
              <p className="mt-3 text-muted-foreground">
                A mesma infraestrutura — pesagem certificada, QR no ponto de coleta
                e prova on-chain — pode ser estendida a outras classes de resíduos
                e operações reguladas. Estamos abertos a pilotos e parcerias.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { t: "Embalagens pós-consumo", d: "Vidro, plástico, papel e alumínio sob acordos setoriais da PNRS." },
                { t: "Resíduos da construção civil", d: "Rastreabilidade de RCC com MTR digital e destinação certificada." },
                { t: "Pilhas e baterias", d: "Logística reversa obrigatória (CONAMA 401) com cadeia de custódia auditável." },
                { t: "Óleo lubrificante usado (OLUC)", d: "Coleta, transporte e re-refino com prova on-chain por lote." },
                { t: "Resíduos de saúde (RSS)", d: "Rastreabilidade do gerador ao destinador final, com assinatura digital." },
                { t: "Créditos de logística reversa", d: "Lastro auditável para certificados emitidos por entidades gestoras." },
              ].map((s) => (
                <div key={s.t} className="rounded-xl border border-border bg-card p-5">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 font-semibold">{s.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-5 text-sm text-muted-foreground">
              Tem uma cadeia de resíduos ou um caso de uso regulado que precisa de
              rastreabilidade auditável?{" "}
              <Link to="/contato" className="font-semibold text-primary hover:underline">
                Fale com a gente sobre um piloto →
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-8 md:p-12">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  Pronto para tornar sua logística reversa auditável?
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Agende uma demo gratuita ou converse com nossos fundadores
                  sobre piloto, parceria e investimento.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
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
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
