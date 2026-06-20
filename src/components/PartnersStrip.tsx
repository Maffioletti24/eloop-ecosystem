import { ExternalLink } from "lucide-react";

type Partner = {
  name: string;
  tagline: string;
  href: string;
  badge?: string;
};

const PARTNERS: Partner[] = [
  {
    name: "Eloop Plataforma",
    tagline: "Compliance REEE, MTR e SINIR automatizados para o seu negócio.",
    href: "/contato?ref=partners",
    badge: "Recomendado",
  },
  {
    name: "Anuncie aqui",
    tagline: "Patrocine este espaço e alcance gestores de ESG e compliance.",
    href: "/contato?ref=anuncie",
    badge: "Disponível",
  },
  {
    name: "Parceria de afiliados",
    tagline: "Fornecedores de coletores, balanças e SaaS de resíduos — fale conosco.",
    href: "/contato?ref=afiliados",
    badge: "Programa",
  },
];

export function PartnersStrip({ className }: { className?: string }) {
  return (
    <section className={className}>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Parceiros & patrocinadores
        </div>
        <a href="/contato?ref=patrocinio" className="text-[11px] text-primary hover:underline">
          Quero patrocinar →
        </a>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {PARTNERS.map((p) => (
          <a
            key={p.name}
            href={p.href}
            className="group rounded-xl border border-border bg-surface/60 p-4 transition hover:border-primary/50 hover:bg-surface"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{p.name}</span>
              {p.badge && (
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {p.badge}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{p.tagline}</p>
            <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-primary opacity-70 group-hover:opacity-100">
              Saiba mais <ExternalLink className="h-3 w-3" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
