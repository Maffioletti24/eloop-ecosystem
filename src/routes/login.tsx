import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { EloopLogo } from "@/components/EloopLogo";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "Entrar — Eloop Token" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setLoading(false);
    if (error) return toast.error(error.message);
    navigate({ to: "/dashboard" });
  }

  async function handleGoogle() {
    const r = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/dashboard`,
    });
    if (r.error) toast.error(r.error.message);
  }

  return (
    <div className="app-shell flex flex-col px-6 py-10">
      <div className="flex flex-col items-center mb-8">
        <EloopLogo size={120} withText subtitle />
      </div>

      <div className="mt-4">
        <h1 className="text-3xl font-bold leading-tight">Acessar plataforma</h1>
        <p className="text-sm text-dim mt-2">
          Infraestrutura de conformidade REEE — rastreabilidade auditável,
          relatórios SINIR e prova on-chain Polygon.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["PNRS", "SINIR", "INMETRO", "ABNT NBR 16156", "ISO 14064-2"].map((b) => (
            <span
              key={b}
              className="text-[9px] font-semibold tracking-wider px-2 py-1 rounded-md border"
              style={{ borderColor: "rgba(29,185,84,0.30)", color: "#7A9E7A" }}
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleEmailLogin} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="senha">Senha</Label>
          <Input id="senha" type="password" required value={senha}
            onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
        </div>
        <Button type="submit" className="w-full h-11" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Entrar
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-dim">
        <div className="h-px flex-1 bg-border" /> ou <div className="h-px flex-1 bg-border" />
      </div>

      <Button variant="outline" className="w-full h-11" onClick={handleGoogle}>
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
          <path fill="#EA4335" d="M12 5.04c1.7 0 3.23.59 4.43 1.74l3.31-3.31C17.74 1.55 15.1.5 12 .5 7.39.5 3.41 3.14 1.5 7l3.86 3c.92-2.76 3.5-4.96 6.64-4.96z"/>
          <path fill="#4285F4" d="M23.5 12.27c0-.78-.07-1.53-.2-2.27H12v4.51h6.45c-.28 1.48-1.11 2.73-2.36 3.58l3.79 2.94c2.21-2.04 3.62-5.05 3.62-8.76z"/>
          <path fill="#FBBC05" d="M5.36 14c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18l-3.86-3C.55 8.22 0 10.05 0 12c0 1.95.55 3.78 1.5 5.36l3.86-3z"/>
          <path fill="#34A853" d="M12 23.5c3.24 0 5.95-1.07 7.93-2.91l-3.79-2.94c-1.05.71-2.4 1.13-4.14 1.13-3.14 0-5.72-2.2-6.64-4.96l-3.86 3C3.41 20.86 7.39 23.5 12 23.5z"/>
        </svg>
        Continuar com Google
      </Button>

      <p className="text-sm text-dim text-center mt-10">
        Não tem conta?{" "}
        <Link to="/cadastro" className="text-primary font-medium">
          Cadastre-se
        </Link>
      </p>

      <p className="text-[11px] text-dim text-center mt-4">
        <Link to="/termos" className="underline">Termos</Link>
        {" · "}
        <Link to="/privacidade" className="underline">Privacidade</Link>
      </p>

    </div>
  );
}
