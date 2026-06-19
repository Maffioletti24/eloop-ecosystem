import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export const listPublishedArticles = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        category: z.string().trim().min(1).max(60).optional(),
        limit: z.number().int().min(1).max(50).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb
      .from("articles")
      .select(
        "id, slug, title, excerpt, cover_url, author_name, category, tags, published_at, reading_minutes, views_count",
      )
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(data.limit ?? 24);
    if (data.category) q = q.eq("category", data.category);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row, error } = await sb
      .from("articles")
      .select("*")
      .eq("slug", data.slug)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("articles")
    .select("category")
    .eq("status", "published")
    .not("category", "is", null);
  if (error) throw new Error(error.message);
  const set = new Set<string>();
  (data ?? []).forEach((r) => r.category && set.add(r.category as string));
  return Array.from(set).sort();
});
