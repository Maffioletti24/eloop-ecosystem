import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import eloopLogo from "@/assets/eloop-logo.png";
import { toast } from "sonner";

type Tipo = "PF" | "PJ" | "Cooperativa" | "Reciclador";

export const Route = createFileRoute("/cadastro")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/dashboard" });
  },
  head: () => ({ meta: [{ title: "Cadastro — Eloop Token" }] }),
  component: CadastroPage,
});

function CadastroPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<Tipo>("PF");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { nome, cpf_cnpj: cpfCnpj, tipo },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Conta criada!");
    navigate({ to: "/dashboard" });
  }

  const tipos: Array<{ v: Tipo; label: string; sub: string }> = [
    { v: "PF", label: "Pessoa Física", sub: "Cidadão / autônomo" },
    { v: "PJ", label: "Empresa", sub: "Indústria / comércio" },
    { v: "Cooperativa", label: "Cooperativa", sub: "Catadores associados" },
    { v: "Reciclador", label: "Reciclador", sub: "Logística reversa" },
  ];

  return (
    <div className="app-shell flex flex-col px-6 py-10 pb-16">
      <div className="flex items-center gap-2 mb-8">
        <div className="h-9 w-9 rounded-xl bg-primary/15 grid place-items-center">
          <Leaf className="h-5 w-5 text-primary" />
        </div>
        <div className="text-base font-bold tracking-tight">Eloop Token</div>
      </div>

      <h1 className="text-3xl font-bold leading-tight">Criar conta</h1>
      <p className="text-sm text-dim mt-2">Selecione o perfil que melhor descreve sua operação.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <Label className="mb-2 block">Perfil</Label>
          <div className="grid grid-cols-2 gap-2">
            {tipos.map((t) => (
              <button
                key={t.v}
                type="button"
                onClick={() => setTipo(t.v)}
                className={`text-left rounded-xl border p-3 transition ${
                  tipo === t.v
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface hover:bg-surface-2"
                }`}
              >
                <div className="text-sm font-semibold">{t.label}</div>
                <div className="text-[11px] text-dim mt-0.5">{t.sub}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nome">{tipo === "PF" ? "Nome completo" : "Razão social"}</Label>
          <Input id="nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="doc">{tipo === "PF" ? "CPF" : "CNPJ"}</Label>
          <Input id="doc" required value={cpfCnpj} onChange={(e) => setCpfCnpj(e.target.value)}
            placeholder={tipo === "PF" ? "000.000.000-00" : "00.000.000/0000-00"} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="senha">Senha</Label>
          <Input id="senha" type="password" required minLength={6} value={senha}
            onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
        </div>

        <Button type="submit" className="w-full h-11" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Criar conta
        </Button>
      </form>

      <p className="text-sm text-dim text-center mt-8">
        Já tem conta?{" "}
        <Link to="/login" className="text-primary font-medium">
          Entrar
        </Link>
      </p>
    </div>
  );
}
