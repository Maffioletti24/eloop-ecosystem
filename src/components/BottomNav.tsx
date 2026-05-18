import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, PlusCircle, FileText, Leaf, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/registro", label: "Descarte", icon: PlusCircle },
  { to: "/conformidade", label: "Relatório", icon: FileText },
  { to: "/esg", label: "ESG", icon: Leaf },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 mx-auto max-w-[390px] border-t"
      style={{ background: "#0A0F0A", borderColor: "#1f2a1f" }}
    >
      <div className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium"
              style={{ color: active ? "#1DB954" : "#7a8a7a" }}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium"
          style={{ color: "#7a8a7a" }}
          aria-label="Sair"
        >
          <LogOut className="h-5 w-5" />
          Perfil
        </button>
      </div>
    </nav>
  );
}
