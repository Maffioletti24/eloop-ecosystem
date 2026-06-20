import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AdSlot } from "@/components/AdSlot";
import { PartnersStrip } from "@/components/PartnersStrip";
import { LeadMagnetCTA } from "@/components/LeadMagnetCTA";
import { listPublishedArticles, listCategories } from "@/lib/blog.functions";
import { useState, Fragment } from "react";
import { Eye, Clock, Tag } from "lucide-react";

const SITE_URL = "https://eloop-investidores.lovable.app";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog Eloop — Conteúdo sobre REEE, ESG e logística reversa" },
      {
        name: "description",
        content:
          "Artigos semanais sobre logística reversa, REEE, PNRS, GHG Protocol Escopo 3, crédito de carbono e operação de cooperativas. Conteúdo da equipe Eloop Token.",
      },
      { property: "og:title", content: "Blog Eloop — REEE, ESG e logística reversa" },
      { property: "og:description", content: "Conteúdo semanal sobre REEE, PNRS, ESG e crédito de carbono." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/blog` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/blog` }],
  }),
  component: BlogPage,
  errorComponent: ({ error }) => (
    <div className="p-8 text-sm text-muted-foreground">Erro ao carregar blog: {error.message}</div>
  ),
  notFoundComponent: () => <div className="p-8 text-sm text-muted-foreground">Não encontrado.</div>,
});

function BlogPage() {
  const [category, setCategory] = useState<string | null>(null);
  const listFn = useServerFn(listPublishedArticles);
  const catFn = useServerFn(listCategories);
  const articles = useQuery({
    queryKey: ["blog", "articles", category],
    queryFn: () => listFn({ data: category ? { category } : {} }),
  });
  const categories = useQuery({ queryKey: ["blog", "categories"], queryFn: () => catFn() });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Conteúdo Eloop
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Insights sobre REEE, ESG e crédito de carbono
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Publicações semanais para investidores, cooperativas, OEMs e gestores de sustentabilidade.
          </p>
        </header>

        <PartnersStrip className="mb-8" />
        <AdSlot slot={undefined} label="Banner topo do blog (728x90)" className="mb-8" />

        {(categories.data?.length ?? 0) > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setCategory(null)}
              className={`rounded-full border px-3 py-1 text-xs ${!category ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
            >
              Todos
            </button>
            {categories.data?.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full border px-3 py-1 text-xs ${category === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {articles.isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
        ) : (articles.data?.length ?? 0) === 0 ? (
          <div className="rounded-xl border border-border bg-surface/40 p-10 text-center text-muted-foreground">
            Nenhum artigo publicado ainda. Volte em breve — publicamos toda semana.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.data!.map((a, idx) => (
              <Fragment key={a.id}>
                <ArticleCard a={a} />
                {idx > 0 && (idx + 1) % 4 === 0 && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <LeadMagnetCTA source="blog_feed_cta" />
                  </div>
                )}
                {idx > 0 && (idx + 1) % 6 === 0 && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <AdSlot slot={undefined} label="In-feed (responsivo)" />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function ArticleCard({ a }: { a: { slug: string; title: string; excerpt: string | null; cover_url: string | null; category: string | null; tags: string[]; published_at: string | null; reading_minutes: number; views_count: number } }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: a.slug }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-lg"
    >
      <div className="aspect-[16/9] overflow-hidden bg-surface">
        {a.cover_url ? (
          <img
            src={a.cover_url}
            alt={a.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Tag className="h-8 w-8" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {a.category && (
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
            {a.category}
          </div>
        )}
        <h2 className="text-lg font-semibold leading-snug group-hover:text-primary">{a.title}</h2>
        {a.excerpt && <p className="line-clamp-3 text-sm text-muted-foreground">{a.excerpt}</p>}
        <div className="mt-auto flex items-center gap-4 pt-2 text-xs text-muted-foreground">
          {a.published_at && (
            <time dateTime={a.published_at}>
              {new Date(a.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
            </time>
          )}
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {a.reading_minutes} min</span>
          <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {a.views_count}</span>
        </div>
      </div>
    </Link>
  );
}
