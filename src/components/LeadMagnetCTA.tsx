import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitContactLead } from "@/lib/contact-leads.functions";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

type Props = {
  title?: string;
  description?: string;
  source?: string;
  className?: string;
};

export function LeadMagnetCTA({
  title = "Receba o material exclusivo de compliance REEE",
  description = "Cadastre seu e-mail e nossa equipe envia o guia + agenda uma demo gratuita da plataforma Eloop.",
  source = "blog_lead_magnet",
  className,
}: Props) {
  const submit = useServerFn(submitContactLead);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await submit({
        data: {
          name: name || "Lead via blog",
          email,
          message: `Lead capturado em artigo do blog. Origem: ${source}`,
          source,
        },
      });
      setDone(true);
      toast.success("Recebemos seu contato! Em breve nossa equipe responde.");
      setName("");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-surface to-surface p-6 md:p-8 ${className ?? ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/15 p-2 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            Conteúdo patrocinado · Eloop
          </div>
          <h3 className="mt-1 text-lg font-semibold md:text-xl">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {done ? (
        <div className="mt-5 rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm text-primary">
          Obrigado! Em até 1 dia útil entraremos em contato.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            type="email"
            required
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Quero receber"}
          </button>
        </form>
      )}
    </div>
  );
}
