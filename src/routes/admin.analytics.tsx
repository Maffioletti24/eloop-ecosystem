import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminGetAnalytics } from "@/lib/admin-blog.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { ArrowLeft, Eye, FileText, Globe } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const navigate = useNavigate();
  const [authReady, setAuthReady] = useState(false);
  const [days, setDays] = useState<30 | 90>(30);
  const fn = useServerFn(adminGetAnalytics);

  useEffect(() => {
    void (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { navigate({ to: "/login" }); return; }
      const { data: op } = await supabase.from("operators").select("role").eq("user_id", u.user.id).maybeSingle();
      if (op?.role !== "admin") { navigate({ to: "/dashboard" }); return; }
      setAuthReady(true);
    })();
  }, [navigate]);

  const data = useQuery({
    queryKey: ["admin-analytics", days],
    queryFn: () => fn({ data: { days } }),
    enabled: authReady,
  });

  if (!authReady) return null;

  const maxVal = Math.max(1, ...(data.data?.series.map((s) => s.site + s.articles) ?? [1]));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Link to="/admin/blog" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-muted-foreground">Visitas do site e visualizações de artigos.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setDays(30)} className={`rounded-md border px-3 py-1.5 text-xs ${days === 30 ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>30 dias</button>
            <button onClick={() => setDays(90)} className={`rounded-md border px-3 py-1.5 text-xs ${days === 90 ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>90 dias</button>
          </div>
        </div>

        {data.isLoading ? (
          <div className="text-sm text-muted-foreground">Carregando...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <KpiCard label="Visitas no site" value={data.data!.totals.site} icon={<Globe className="h-4 w-4" />} />
              <KpiCard label="Visualizações de artigos" value={data.data!.totals.articles} icon={<FileText className="h-4 w-4" />} />
              <KpiCard label="Total geral" value={data.data!.totals.site + data.data!.totals.articles} icon={<Eye className="h-4 w-4" />} />
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 text-sm font-semibold">Visitas por dia</div>
              <div className="flex h-48 items-end gap-1">
                {data.data!.series.map((s) => (
                  <div key={s.day} className="group flex-1" title={`${s.day}: site ${s.site}, artigos ${s.articles}`}>
                    <div className="flex h-full flex-col justify-end gap-px">
                      <div className="w-full rounded-t bg-primary" style={{ height: `${(s.articles / maxVal) * 100}%` }} />
                      <div className="w-full rounded-t bg-primary/40" style={{ height: `${(s.site / maxVal) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded bg-primary" /> Artigos</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded bg-primary/40" /> Site</span>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card title="Top páginas">
                <ul className="divide-y divide-border text-sm">
                  {data.data!.topPaths.map((p) => (
                    <li key={p.path} className="flex justify-between py-2">
                      <span className="truncate text-muted-foreground">{p.path}</span>
                      <span className="tabular-nums">{p.count}</span>
                    </li>
                  ))}
                  {data.data!.topPaths.length === 0 && <li className="py-2 text-muted-foreground">Sem dados</li>}
                </ul>
              </Card>
              <Card title="Origens (referrers)">
                <ul className="divide-y divide-border text-sm">
                  {data.data!.topReferrers.map((p) => (
                    <li key={p.source} className="flex justify-between py-2">
                      <span className="truncate text-muted-foreground">{p.source}</span>
                      <span className="tabular-nums">{p.count}</span>
                    </li>
                  ))}
                  {data.data!.topReferrers.length === 0 && <li className="py-2 text-muted-foreground">Sem dados</li>}
                </ul>
              </Card>
            </div>

            <Card title="Artigos mais lidos">
              <ul className="divide-y divide-border text-sm">
                {data.data!.topArticles.map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-2">
                    <Link to="/blog/$slug" params={{ slug: a.slug }} className="truncate hover:text-primary">{a.title}</Link>
                    <span className="tabular-nums text-muted-foreground">{a.views_count}</span>
                  </li>
                ))}
                {data.data!.topArticles.length === 0 && <li className="py-2 text-muted-foreground">Sem artigos ainda</li>}
              </ul>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

function KpiCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-2 text-3xl font-bold tabular-nums">{value.toLocaleString("pt-BR")}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-2 text-sm font-semibold">{title}</div>
      {children}
    </div>
  );
}
