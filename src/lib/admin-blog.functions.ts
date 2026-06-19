import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const articleSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  title: z.string().trim().min(2).max(200),
  excerpt: z.string().trim().max(500).optional().nullable(),
  content_md: z.string().min(1).max(120000),
  cover_url: z.string().trim().url().max(500).optional().nullable(),
  author_name: z.string().trim().min(1).max(120),
  category: z.string().trim().max(60).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  status: z.enum(["draft", "scheduled", "published", "archived"]),
  scheduled_at: z.string().datetime().optional().nullable(),
  seo_title: z.string().trim().max(200).optional().nullable(),
  seo_description: z.string().trim().max(320).optional().nullable(),
});

async function requireAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // The caller context is enforced via require-auth on the client; server-side we trust RLS,
  // but admin functions use service role so we check role explicitly.
  const { getRequestHeader } = await import("@tanstack/react-start/server");
  const auth = getRequestHeader("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Não autenticado");
  const { data: u, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !u.user) throw new Error("Não autenticado");
  const { data: op } = await supabaseAdmin
    .from("operators")
    .select("role")
    .eq("user_id", u.user.id)
    .maybeSingle();
  if (op?.role !== "admin") throw new Error("Acesso restrito a administradores");
  return { userId: u.user.id, supabaseAdmin };
}

function estimateReadingMinutes(md: string) {
  const words = md.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export const adminListArticles = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await requireAdmin();
  const { data, error } = await supabaseAdmin
    .from("articles")
    .select("id, slug, title, status, category, scheduled_at, published_at, views_count, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const adminGetArticle = createServerFn({ method: "GET" })
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await requireAdmin();
    const { data: row, error } = await supabaseAdmin
      .from("articles")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminSaveArticle = createServerFn({ method: "POST" })
  .inputValidator((i) => articleSchema.parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin, userId } = await requireAdmin();
    const reading_minutes = estimateReadingMinutes(data.content_md);
    const payload = {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt ?? null,
      content_md: data.content_md,
      cover_url: data.cover_url ?? null,
      author_name: data.author_name,
      author_id: userId,
      category: data.category ?? null,
      tags: data.tags,
      status: data.status,
      scheduled_at: data.scheduled_at ?? null,
      seo_title: data.seo_title ?? null,
      seo_description: data.seo_description ?? null,
      reading_minutes,
      published_at:
        data.status === "published"
          ? new Date().toISOString()
          : data.status === "scheduled"
            ? null
            : null,
    };
    if (data.id) {
      // Preserve existing published_at when updating an already-published article
      if (data.status === "published") {
        const { data: existing } = await supabaseAdmin
          .from("articles")
          .select("published_at, status")
          .eq("id", data.id)
          .maybeSingle();
        if (existing?.published_at) payload.published_at = existing.published_at;
      }
      const { error } = await supabaseAdmin.from("articles").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: inserted, error } = await supabaseAdmin
      .from("articles")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const adminDeleteArticle = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await requireAdmin();
    const { error } = await supabaseAdmin.from("articles").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminGetAnalytics = createServerFn({ method: "GET" })
  .inputValidator((i) => z.object({ days: z.number().int().min(7).max(180).default(30) }).parse(i ?? {}))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await requireAdmin();
    const since = new Date(Date.now() - data.days * 86400000).toISOString();

    const [{ data: siteRows }, { data: artRows }, { data: topArticles }] = await Promise.all([
      supabaseAdmin
        .from("site_visits")
        .select("created_at, path, referrer, country")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(5000),
      supabaseAdmin
        .from("article_views")
        .select("created_at, article_id, referrer, country")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(5000),
      supabaseAdmin
        .from("articles")
        .select("id, title, slug, views_count, status, published_at")
        .order("views_count", { ascending: false })
        .limit(10),
    ]);

    // Group by day
    const byDay: Record<string, { site: number; articles: number }> = {};
    const ensureDay = (d: string) => (byDay[d] ??= { site: 0, articles: 0 });
    for (let i = 0; i < data.days; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      ensureDay(d);
    }
    (siteRows ?? []).forEach((r) => ensureDay(r.created_at.slice(0, 10)).site++);
    (artRows ?? []).forEach((r) => ensureDay(r.created_at.slice(0, 10)).articles++);

    // Top paths
    const pathCount: Record<string, number> = {};
    (siteRows ?? []).forEach((r) => (pathCount[r.path] = (pathCount[r.path] ?? 0) + 1));
    const topPaths = Object.entries(pathCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    // Top referrers
    const refCount: Record<string, number> = {};
    [...(siteRows ?? []), ...(artRows ?? [])].forEach((r) => {
      const ref = (r.referrer || "direto").replace(/^https?:\/\//, "").split("/")[0] || "direto";
      refCount[ref] = (refCount[ref] ?? 0) + 1;
    });
    const topReferrers = Object.entries(refCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([source, count]) => ({ source, count }));

    return {
      totals: {
        site: siteRows?.length ?? 0,
        articles: artRows?.length ?? 0,
      },
      series: Object.entries(byDay)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([day, v]) => ({ day, ...v })),
      topPaths,
      topReferrers,
      topArticles: topArticles ?? [],
    };
  });

export const adminPublishScheduledNow = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await requireAdmin();
  const { data, error } = await supabaseAdmin
    .from("articles")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString())
    .select("id");
  if (error) throw new Error(error.message);
  return { published: data?.length ?? 0 };
});
