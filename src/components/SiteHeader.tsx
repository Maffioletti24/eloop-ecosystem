import { Link } from "@tanstack/react-router";
import { Recycle, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/projeto", label: "Projeto" },
  { to: "/quem-somos", label: "Quem somos" },
  { to: "/blog", label: "Blog" },
  { to: "/investidores", label: "Investidores" },
  { to: "/contato", label: "Contato" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
            <Recycle className="h-4.5 w-4.5" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">Eloop</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Compliance REEE
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground [&.active]:text-foreground"
              activeProps={{ className: "active" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <div id="google_translate_element" className="[&_.goog-te-gadget]:text-[11px] [&_.goog-te-gadget]:text-muted-foreground [&_.goog-te-gadget>div>span>a]:text-foreground" />
          <Link
            to="/contato"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Solicitar demo
          </Link>
        </div>

        <button
          aria-label="Abrir menu"
          className="grid h-10 w-10 place-items-center rounded-md border border-border md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/40 bg-surface md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm hover:bg-surface-2 [&.active]:bg-surface-2 [&.active]:text-foreground"
                activeProps={{ className: "active" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/contato"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Solicitar demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
