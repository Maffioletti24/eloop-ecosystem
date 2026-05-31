import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Leaf,
  LogOut,
  ShieldCheck,
  Wallet,
  Flame,
  Package,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Item = { to: string; label: string; icon: typeof LayoutDashboard };

const baseDashboard: Item = { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard };
const itemRegistro: Item = { to: "/registro", label: "Descarte", icon: PlusCircle };
const itemLotes: Item = { to: "/lotes", label: "Lotes", icon: Package };
const itemRelatorio: Item = { to: "/conformidade", label: "Relatório", icon: FileText };
const itemESG: Item = { to: "/esg", label: "ESG", icon: Leaf };
const itemValidar: Item = { to: "/validador", label: "Validar", icon: ShieldCheck };
const itemCarteira: Item = { to: "/carteira", label: "Carteira", icon: Wallet };
const itemCompensar: Item = { to: "/compensar", label: "Compensar", icon: Flame };

export function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState<string>("operator");
  const [isValidator, setIsValidator] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const [{ data: op }, { data: val }] = await Promise.all([
        supabase.from("operators").select("role").eq("user_id", u.user.id).maybeSingle(),
        supabase
          .from("validators")
          .select("id")
          .eq("user_id", u.user.id)
          .eq("ativo", true)
          .maybeSingle(),
      ]);
      if (cancel) return;
      setRole(op?.role ?? "operator");
      setIsValidator(!!val);
    })();
    return () => {
      cancel = true;
    };
  }, [pathname]);

  // Monta navegação conforme perfil
  let items: Item[] = [];
  if (role === "buyer") {
    // Comprador: foca em saldo e compensação; sem registro de descarte
    items = [baseDashboard, itemCarteira, itemCompensar, itemRelatorio];
  } else if (role === "donor_pf" || role === "donor_pj") {
    // Doador: carteira (recibo + certificado) + ESG
    items = [baseDashboard, itemRegistro, itemLotes, itemCarteira, itemESG];
  } else {
    // Operador / validador / admin: visão logística — sem carteira
    items = [baseDashboard, itemRegistro, itemLotes, itemRelatorio, itemESG];
    if (isValidator) items.splice(4, 0, itemValidar);
  }

  const cols = items.length + 1;

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

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
