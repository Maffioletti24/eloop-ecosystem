import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { createHash } from "crypto";
import { z } from "zod";

function hash(input: string | null | undefined) {
  if (!input) return null;
  return createHash("sha256").update(input).digest("hex").slice(0, 32);
}

async function recordVisit(opts: {
  type: "site" | "article";
  path?: string;
  articleId?: string;
  referrer?: string | null;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const ip = (() => {
    try { return getRequestIP({ xForwardedFor: true }); } catch { return null; }
  })();
  const ua = (() => {
    try { return getRequestHeader("user-agent"); } catch { return null; }
  })();
  const country = (() => {
    try { return getRequestHeader("cf-ipcountry") || getRequestHeader("x-vercel-ip-country") || null; } catch { return null; }
  })();
  const ipHash = hash(ip ?? "");
  const uaHash = hash(ua ?? "");

  // Dedup within 30 minutes for the same fingerprint
  const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  if (opts.type === "article" && opts.articleId) {
    const { data: dupe } = await supabaseAdmin
      .from("article_views")
      .select("id")
      .eq("article_id", opts.articleId)
      .eq("ip_hash", ipHash!)
      .gte("created_at", since)
      .limit(1)
      .maybeSingle();
    if (dupe) return { counted: false };
    await supabaseAdmin.from("article_views").insert({
      article_id: opts.articleId,
      ip_hash: ipHash,
      ua_hash: uaHash,
      referrer: opts.referrer ?? null,
      country: country,
    });
    // Increment counter
    await supabaseAdmin.rpc("increment_article_views" as never, {} as never).then(
      () => undefined,
      async () => {
        // Fallback: read+update
        const { data: a } = await supabaseAdmin
          .from("articles")
          .select("views_count")
          .eq("id", opts.articleId!)
          .maybeSingle();
        await supabaseAdmin
          .from("articles")
          .update({ views_count: (a?.views_count ?? 0) + 1 })
          .eq("id", opts.articleId!);
      },
    );
    return { counted: true };
  }
  if (opts.type === "site" && opts.path) {
    const { data: dupe } = await supabaseAdmin
      .from("site_visits")
      .select("id")
      .eq("path", opts.path)
      .eq("ip_hash", ipHash!)
      .gte("created_at", since)
      .limit(1)
      .maybeSingle();
    if (dupe) return { counted: false };
    await supabaseAdmin.from("site_visits").insert({
      path: opts.path,
      ip_hash: ipHash,
      ua_hash: uaHash,
      referrer: opts.referrer ?? null,
      country: country,
    });
    return { counted: true };
  }
  return { counted: false };
}

export const trackSiteVisit = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({
      path: z.string().trim().min(1).max(300),
      referrer: z.string().trim().max(500).optional().nullable(),
    }).parse(i),
  )
  .handler(async ({ data }) => recordVisit({ type: "site", path: data.path, referrer: data.referrer }));

export const trackArticleView = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    z.object({
      articleId: z.string().uuid(),
      referrer: z.string().trim().max(500).optional().nullable(),
    }).parse(i),
  )
  .handler(async ({ data }) => recordVisit({ type: "article", articleId: data.articleId, referrer: data.referrer }));

export const getArticlePublicViews = createServerFn({ method: "GET" })
  .inputValidator((i) => z.object({ articleId: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: a } = await supabaseAdmin
      .from("articles")
      .select("views_count")
      .eq("id", data.articleId)
      .maybeSingle();
    return { views: a?.views_count ?? 0 };
  });
