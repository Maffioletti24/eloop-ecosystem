import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Mail, Recycle } from "lucide-react";

const EMAIL = "elooptoken.project@elooptoken.com";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-surface/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
              <Recycle className="h-4.5 w-4.5" />
            </div>
            <span className="font-semibold tracking-tight">Eloop Token</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Infraestrutura de compliance para a logística reversa de resíduos
            eletrônicos no Brasil — PNRS, SINIR, ISO 14001, com prova on-chain.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <a
              href="https://www.linkedin.com/company/eloop-token"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="LinkedIn"
              className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="https://instagram.com/elooptoken"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Instagram"
              className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${EMAIL}`}
              aria-label="E-mail"
              className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Navegação
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/" className="hover:text-foreground">Início</Link></li>
            <li><Link to="/projeto" className="hover:text-foreground">Projeto</Link></li>
            <li><Link to="/quem-somos" className="hover:text-foreground">Quem somos</Link></li>
            <li><Link to="/investidores" className="hover:text-foreground">Investidores</Link></li>
            <li><Link to="/contato" className="hover:text-foreground">Contato</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contato
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`mailto:${EMAIL}`} className="hover:text-foreground">
                {EMAIL}
              </a>
            </li>
            <li>
              <Link to="/privacidade" className="hover:text-foreground">
                Política de Privacidade
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Eloop Token — Conformidade REEE rastreável.
        </div>
      </div>
    </footer>
  );
}
