import { createFileRoute, useNavigate, Link, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { marked } from "marked";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { adminGetArticle, adminSaveArticle } from "@/lib/admin-blog.functions";
import { ArrowLeft, Loader2, Eye, Edit3 } from "lucide-react";
import { toast } from "sonner";

type ArticleForm = {
  slug: string;
  title: string;
  excerpt: string;
  content_md: string;
  cover_url: string;
  author_name: string;
  category: string;
  tags: string;
  status: "draft" | "scheduled" | "published" | "archived";
  scheduled_at: string;
  seo_title: string;
  seo_description: string;
};

const empty: ArticleForm = {
  slug: "",
  title: "",
  excerpt: "",
  content_md: "",
  cover_url: "",
  author_name: "Equipe Eloop",
  category: "",
  tags: "",
  status: "draft",
  scheduled_at: "",
  seo_title: "",
  seo_description: "",
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

export const Route = createFileRoute("/admin/blog/$id")({
  component: EditArticlePage,
});

function EditArticlePage() {
  const { id } = useParams({ from: "/admin/blog/$id" });
  const isNew = id === "novo";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetArticle);
  const saveFn = useServerFn(adminSaveArticle);

  const [form, setForm] = useState<ArticleForm>(empty);
  const [authReady, setAuthReady] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { navigate({ to: "/login" }); return; }
      const { data: op } = await supabase.from("operators").select("role").eq("user_id", u.user.id).maybeSingle();
      if (op?.role !== "admin") { navigate({ to: "/dashboard" }); return; }
      setAuthReady(true);
    })();
  }, [navigate]);

  const existing = useQuery({
    queryKey: ["admin-article", id],
    queryFn: () => getFn({ data: { id } }),
    enabled: authReady && !isNew,
  });

  useEffect(() => {
    if (existing.data) {
      setForm({
        slug: existing.data.slug,
        title: existing.data.title,
        excerpt: existing.data.excerpt ?? "",
        content_md: existing.data.content_md,
        cover_url: existing.data.cover_url ?? "",
        author_name: existing.data.author_name,
        category: existing.data.category ?? "",
        tags: (existing.data.tags ?? []).join(", "),
        status: existing.data.status,
        scheduled_at: existing.data.scheduled_at ? existing.data.scheduled_at.slice(0, 16) : "",
        seo_title: existing.data.seo_title ?? "",
        seo_description: existing.data.seo_description ?? "",
      });
    }
  }, [existing.data]);

  const save = useMutation({
    mutationFn: () =>
      saveFn({
        data: {
          id: isNew ? undefined : id,
          slug: form.slug || slugify(form.title),
          title: form.title,
          excerpt: form.excerpt || null,
          content_md: form.content_md,
          cover_url: form.cover_url || null,
          author_name: form.author_name,
          category: form.category || null,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          status: form.status,
          scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
          seo_title: form.seo_title || null,
          seo_description: form.seo_description || null,
        },
      }),
    onSuccess: (r: { id: string }) => {
      toast.success("Artigo salvo");
      qc.invalidateQueries({ queryKey: ["admin-articles"] });
      if (isNew) navigate({ to: "/admin/blog/$id", params: { id: r.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!authReady) return null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Link to="/admin/blog" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{isNew ? "Novo artigo" : "Editar artigo"}</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreview((v) => !v)}>
              {preview ? <><Edit3 className="h-4 w-4" /> <span className="ml-2">Editar</span></> : <><Eye className="h-4 w-4" /> <span className="ml-2">Preview</span></>}
            </Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })}
                placeholder="Título do artigo"
              />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="meu-artigo" />
            </div>
            <div>
              <Label>Resumo</Label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={2}
                placeholder="Aparece nos cards e no compartilhamento social"
              />
            </div>
            <div>
              <Label>Conteúdo (Markdown)</Label>
              {preview ? (
                <div
                  className="prose prose-invert max-w-none rounded-lg border border-border bg-surface/40 p-4"
                  dangerouslySetInnerHTML={{ __html: marked.parse(form.content_md, { async: false }) as string }}
                />
              ) : (
                <Textarea
                  value={form.content_md}
                  onChange={(e) => setForm({ ...form, content_md: e.target.value })}
                  rows={20}
                  placeholder="# Título&#10;&#10;Use Markdown: **negrito**, *itálico*, [links](https://...), listas, etc."
                  className="font-mono text-sm"
                />
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <Label>Status</Label>
              <select
                className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ArticleForm["status"] })}
              >
                <option value="draft">Rascunho</option>
                <option value="scheduled">Agendado</option>
                <option value="published">Publicado</option>
                <option value="archived">Arquivado</option>
              </select>

              {form.status === "scheduled" && (
                <div className="mt-3">
                  <Label>Publicar em</Label>
                  <Input
                    type="datetime-local"
                    value={form.scheduled_at}
                    onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">O cron semanal publica automaticamente quando a data chegar.</p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div>
                <Label>Capa (URL)</Label>
                <Input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <Label>Autor</Label>
                <Input value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} />
              </div>
              <div>
                <Label>Categoria</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="REEE, ESG, Mercado..." />
              </div>
              <div>
                <Label>Tags (separadas por vírgula)</Label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="reee, esg, carbono" />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">SEO</div>
              <div>
                <Label>Title</Label>
                <Input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} maxLength={200} />
              </div>
              <div>
                <Label>Meta description</Label>
                <Textarea value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} rows={3} maxLength={320} />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
