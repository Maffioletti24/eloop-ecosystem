import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export type AppRole =
  | "operator"
  | "donor_pf"
  | "donor_pj"
  | "buyer"
  | "validator"
  | "admin";

export const WALLET_ROLES: AppRole[] = ["donor_pf", "donor_pj", "buyer", "admin"];
export const BUYER_ROLES: AppRole[] = ["buyer", "admin"];
export const DISPOSAL_ROLES: AppRole[] = [
  "operator",
  "donor_pf",
  "donor_pj",
  "validator",
  "admin",
];

/**
 * Garante autenticação + role autorizado. Redireciona:
 *  - /login se não autenticado
 *  - /dashboard se autenticado porém sem permissão
 */
export async function requireRole(allowed: AppRole[]): Promise<AppRole> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw redirect({ to: "/login" });
  const { data: op } = await supabase
    .from("operators")
    .select("role")
    .eq("user_id", u.user.id)
    .maybeSingle();
  const role = (op?.role ?? "operator") as AppRole;
  if (!allowed.includes(role)) throw redirect({ to: "/dashboard" });
  return role;
}
