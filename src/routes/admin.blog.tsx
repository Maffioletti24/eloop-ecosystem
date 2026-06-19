import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminListArticles, adminDeleteArticle, adminPublishScheduledNow } from "@/lib/admin-blog.functions";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { Plus, Trash2, Pencil, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/blog")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
  },
  component: AdminBlogPage,
});

function AdminBlogPage() {
  const listFn = useServerFn(adminListArticles);
  const delFn = useServerFn(adminDeleteArticle);
  const pubFn = useServerFn(adminPublishScheduledNow);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        navigate({ to: "/login" });
        return;
      }
      const { data: op } = await supabase
        .from("operators")
        .select("role")
        .eq("user_id", u.user.id)
        .maybeSingle();
      if (op?.role !== "admin") {
        toast.error("Acesso restrito a administradores");
        navigate({ to: "/dashboard" });
        return;
      }
      setAuthChecked(true);
    })();
  }, [navigate]);

  const articles = useQuery({
    queryKey: ["admin-articles"],
    queryFn: () => listFn(),
    enabled: authChecked,
  });

  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Artigo removido");
      qc.invalidateQueries({ queryKey: ["admin-articles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pub = useMutation({
    mutationFn: () => pubFn(),
    onSuccess: (r: { published: number }) => {
      toast.success(`${r.published} artigo(s) publicado(s)`);
      qc.invalidateQueries({ queryKey: ["admin-articles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!authChecked) return null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Gestão de artigos</h1>
            <p className="text-sm text-muted-foreground">Crie, agende e publique conteúdo do blog.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => pub.mutate()} disabled={pub.isPending}>
              {pub.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">Publicar agendados</span>
            </Button>
            <Button asChild>
              <Link to="/admin/blog/novo"><Plus className="h-4 w-4" /> <span className="ml-2">Novo artigo</span></Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/analytics">Analytics</Link>
            </Button>
          </div>
        </div>

        {articles.isLoading ? (
          <div className="text-sm text-muted-foreground">Carregando...</div>
        ) : (articles.data?.length ?? 0) === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
            Nenhum artigo. Comece criando o primeiro.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3 text-right">Views</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {articles.data!.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <Link to="/admin/blog/$id" params={{ id: a.id }} className="font-medium hover:text-primary">{a.title}</Link>
                      <div className="text-xs text-muted-foreground">/{a.slug}</div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{a.category ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {a.status === "scheduled" && a.scheduled_at
                        ? `Agendado: ${new Date(a.scheduled_at).toLocaleString("pt-BR")}`
                        : a.published_at
                          ? new Date(a.published_at).toLocaleDateString("pt-BR")
                          : "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{a.views_count}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to="/admin/blog/$id" params={{ id: a.id }} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => { if (confirm("Remover artigo?")) del.mutate(a.id); }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    scheduled: "bg-amber-500/15 text-amber-400",
    published: "bg-primary/15 text-primary",
    archived: "bg-surface text-muted-foreground",
  };
  const labels: Record<string, string> = {
    draft: "Rascunho",
    scheduled: "Agendado",
    published: "Publicado",
    archived: "Arquivado",
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs ${map[status] ?? ""}`}>{labels[status] ?? status}</span>;
}
