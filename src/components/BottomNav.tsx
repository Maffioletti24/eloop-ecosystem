import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, PlusCircle, FileText, Leaf, LogOut, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const baseItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/registro", label: "Descarte", icon: PlusCircle },
  { to: "/conformidade", label: "Relatório", icon: FileText },
  { to: "/esg", label: "ESG", icon: Leaf },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isValidator, setIsValidator] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("validators")
        .select("id")
        .eq("user_id", u.user.id)
        .eq("ativo", true)
        .maybeSingle();
      if (!cancel) setIsValidator(!!data);
    })();
    return () => {
      cancel = true;
    };
  }, [pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  const items = isValidator
    ? [...baseItems.slice(0, 3), { to: "/validador" as const, label: "Validar", icon: ShieldCheck }, baseItems[3]]
    : baseItems;

  const cols = items.length + 1;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 mx-auto max-w-[390px] border-t"
      style={{
        background: "#111A11",
        borderColor: "rgba(29,185,84,0.15)",
        height: 72,
      }}
    >
      <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium"
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
          className="flex flex-col items-center justify-center gap-1 text-[10px] font-medium"
          style={{ color: "#7a8a7a" }}
          aria-label="Sair"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </nav>
  );
}
