import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/publish-scheduled-articles")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("articles")
          .update({ status: "published", published_at: new Date().toISOString() })
          .eq("status", "scheduled")
          .lte("scheduled_at", new Date().toISOString())
          .select("id, slug");
        if (error) {
          return new Response(JSON.stringify({ ok: false, error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(
          JSON.stringify({ ok: true, published: data?.length ?? 0, items: data ?? [] }),
          { headers: { "Content-Type": "application/json" } },
        );
      },
      GET: async () =>
        new Response(JSON.stringify({ ok: true, hint: "POST to trigger" }), {
          headers: { "Content-Type": "application/json" },
        }),
    },
  },
});
