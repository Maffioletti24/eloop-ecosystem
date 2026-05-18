import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, PlusCircle, FileCheck2, Leaf } from "lucide-react";

const items = [
  { to: "/dashboard", label: "Início", icon: LayoutDashboard },
  { to: "/registro", label: "Registrar", icon: PlusCircle },
  { to: "/conformidade", label: "SINIR", icon: FileCheck2 },
  { to: "/esg", label: "ESG", icon: Leaf },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 mx-auto max-w-[430px] border-t border-border bg-surface/90 backdrop-blur-xl">
      <div className="grid grid-cols-4">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "drop-shadow-[0_0_6px_oklch(0.71_0.18_145/0.7)]" : ""}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
