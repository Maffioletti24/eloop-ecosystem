import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo } from "react";
import { marked } from "marked";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AdSlot } from "@/components/AdSlot";
import { getArticleBySlug } from "@/lib/blog.functions";
import { trackArticleView, getArticlePublicViews } from "@/lib/analytics.functions";
import { ArrowLeft, Clock, Eye, Calendar } from "lucide-react";

const SITE_URL = "https://eloop-investidores.lovable.app";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { getArticleBySlug } = await import("@/lib/blog.functions");
    const article = await getArticleBySlug({ data: { slug: params.slug } });
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.article;
    if (!a) return { meta: [{ title: "Artigo — Eloop" }] };
    const title = a.seo_title || `${a.title} — Blog Eloop`;
    const desc = a.seo_description || a.excerpt || "Artigo do blog Eloop sobre REEE, ESG e logística reversa.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `${SITE_URL}/blog/${a.slug}` },
        ...(a.cover_url ? [{ property: "og:image", content: a.cover_url }, { name: "twitter:image", content: a.cover_url }] : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/blog/${a.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: a.title,
            description: desc,
            image: a.cover_url ?? undefined,
            datePublished: a.published_at,
            dateModified: a.updated_at,
            author: { "@type": "Person", name: a.author_name },
            publisher: {
              "@type": "Organization",
              name: "Eloop Token",
              logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.svg` },
            },
            mainEntityOfPage: `${SITE_URL}/blog/${a.slug}`,
          }),
        },
      ],
    };
  },
  component: ArticlePage,
  errorComponent: ({ error }) => (
    <div className="p-8 text-sm text-muted-foreground">Erro: {error.message}</div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Artigo não encontrado</h1>
        <p className="mt-2 text-muted-foreground">O artigo pode ter sido removido ou ainda não foi publicado.</p>
        <Link to="/blog" className="mt-6 inline-flex items-center gap-2 text-primary">
          <ArrowLeft className="h-4 w-4" /> Voltar ao blog
        </Link>
      </div>
    </div>
  ),
});

function ArticlePage() {
  const { article } = Route.useLoaderData();
  const trackFn = useServerFn(trackArticleView);
  const viewsFn = useServerFn(getArticlePublicViews);

  useEffect(() => {
    if (typeof window === "undefined") return;
    trackFn({ data: { articleId: article.id, referrer: document.referrer || null } }).catch(() => undefined);
  }, [article.id, trackFn]);

  const views = useQuery({
    queryKey: ["article-views", article.id],
    queryFn: () => viewsFn({ data: { articleId: article.id } }),
    refetchInterval: 60_000,
  });

  const html = useMemo(() => {
    const raw = marked.parse(article.content_md ?? "", { async: false }) as string;
    // Split into halves to inject mid-article ad
    const blocks = raw.split(/(<\/p>)/);
    const mid = Math.floor(blocks.length / 2);
    return { top: blocks.slice(0, mid).join(""), bottom: blocks.slice(mid).join("") };
  }, [article.content_md]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link to="/blog" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Blog
        </Link>

        {article.category && (
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {article.category}
          </div>
        )}
        <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">{article.title}</h1>
        {article.excerpt && (
          <p className="mt-3 text-lg text-muted-foreground">{article.excerpt}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-4 border-y border-border py-3 text-xs text-muted-foreground">
          <span>Por {article.author_name}</span>
          {article.published_at && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(article.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </span>
          )}
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {article.reading_minutes} min de leitura</span>
          <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {views.data?.views ?? article.views_count} visualizações</span>
        </div>

        {article.cover_url && (
          <img
            src={article.cover_url}
            alt={article.title}
            className="mt-6 aspect-[16/9] w-full rounded-xl object-cover"
          />
        )}

        <article className="prose prose-invert prose-headings:font-semibold prose-a:text-primary mt-8 max-w-none">
          <div dangerouslySetInnerHTML={{ __html: html.top }} />
          <AdSlot slot={undefined} label="Anúncio meio do artigo" className="my-6" />
          <div dangerouslySetInnerHTML={{ __html: html.bottom }} />
        </article>

        {(article.tags?.length ?? 0) > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags!.map((t) => (
              <span key={t} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                #{t}
              </span>
            ))}
          </div>
        )}

        <AdSlot slot={undefined} label="Anúncio final do artigo" className="my-10" />

        <Link to="/blog" className="mt-6 inline-flex items-center gap-2 text-primary">
          <ArrowLeft className="h-4 w-4" /> Ver mais artigos
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
