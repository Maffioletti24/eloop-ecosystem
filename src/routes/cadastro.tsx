import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { EloopLogo } from "@/components/EloopLogo";
import { toast } from "sonner";
import { ensureCustodialWallet } from "@/lib/wallet.functions";

// Perfis de cadastro — cada um mapeia explicitamente para um user_role + operator_type
type Perfil =
  | "cooperativa"
  | "reciclador"
  | "gerador"
  | "doador_pf"
  | "doador_pj"
  | "comprador";

type PerfilConfig = {
  label: string;
  sub: string;
  role: "operator" | "donor_pf" | "donor_pj" | "buyer";
  tipo: "PF" | "PJ" | "Cooperativa" | "Reciclador";
  operation_level: 1 | 2 | 3 | 4;
  docPF: boolean; // pede CPF (true) ou CNPJ (false)
};

const PERFIS: Record<Perfil, PerfilConfig> = {
  cooperativa: {
    label: "Cooperativa",
    sub: "Nível 1 · coleta certificada",
    role: "operator",
    tipo: "Cooperativa",
    operation_level: 1,
    docPF: false,
  },
  reciclador: {
    label: "Reciclador",
    sub: "Nível 2 · logística reversa",
    role: "operator",
    tipo: "Reciclador",
    operation_level: 2,
    docPF: false,
  },
  gerador: {
    label: "Indústria / Gerador",
    sub: "Nível 3 · obrigado PNRS",
    role: "operator",
    tipo: "PJ",
    operation_level: 3,
    docPF: false,
  },
  doador_pf: {
    label: "Doador — Pessoa Física",
    sub: "Cidadão que descarta REE",
    role: "donor_pf",
    tipo: "PF",
    operation_level: 4,
    docPF: true,
  },
  doador_pj: {
    label: "Doador — Pessoa Jurídica",
    sub: "Empresa que doa REE",
    role: "donor_pj",
    tipo: "PJ",
    operation_level: 3,
    docPF: false,
  },
  comprador: {
    label: "Comprador de ELP",
    sub: "Compensa REE rastreáveis",
    role: "buyer",
    tipo: "PJ",
    operation_level: 3,
    docPF: false,
  },
};

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
  const [perfil, setPerfil] = useState<Perfil>("doador_pf");
  const [nome, setNome] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [aceite, setAceite] = useState(false);
  const [loading, setLoading] = useState(false);

  const cfg = PERFIS[perfil];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!aceite) {
      return toast.error("Você precisa aceitar os Termos de Uso e a Política de Privacidade.");
    }
    setLoading(true);
    const acceptedAt = new Date().toISOString();
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          nome,
          cpf_cnpj: cpfCnpj,
          tipo: cfg.tipo,
          operation_level: cfg.operation_level,
          role: cfg.role,
          accepted_terms_at: acceptedAt,
          accepted_privacy_at: acceptedAt,
          terms_version: "2026-07-20",
        },
      },
    });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    // Provisiona carteira custodial invisível (necessária para doador/comprador;
    // operadores não verão saldo via RLS, mas mantemos rastreabilidade).
    try {
      await ensureCustodialWallet();
    } catch (e) {
      console.warn("wallet provisioning falhou", e);
    }
    setLoading(false);
    toast.success(`Conta criada — perfil ${cfg.label}.`);
    navigate({ to: "/dashboard" });
  }


  const grupos: Array<{ titulo: string; itens: Perfil[] }> = [
    { titulo: "Operadores logísticos", itens: ["cooperativa", "reciclador", "gerador"] },
    { titulo: "Doadores de REE", itens: ["doador_pf", "doador_pj"] },
    { titulo: "Compradores de crédito", itens: ["comprador"] },
  ];

  return (
    <div className="app-shell flex flex-col px-6 py-10 pb-16">
      <div className="flex flex-col items-center mb-6">
        <EloopLogo size={88} withText />
      </div>
      <h1 className="text-3xl font-bold leading-tight">Habilitar operação</h1>
      <p className="text-sm text-dim mt-2">
        Selecione seu perfil. A escolha define obrigações PNRS aplicáveis,
        certificado SINIR gerado e visibilidade de carteira ELP.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="space-y-4">
          {grupos.map((g) => (
            <div key={g.titulo}>
              <div className="text-[11px] uppercase tracking-wide text-dim mb-2">
                {g.titulo}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {g.itens.map((v) => {
                  const p = PERFIS[v];
                  const active = perfil === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setPerfil(v)}
                      className={`text-left rounded-xl border p-3 transition ${
                        active
                          ? "border-primary bg-primary/10"
                          : "border-border bg-surface hover:bg-surface-2"
                      }`}
                    >
                      <div className="text-sm font-semibold">{p.label}</div>
                      <div className="text-[11px] text-dim mt-0.5">{p.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nome">{cfg.docPF ? "Nome completo" : "Razão social"}</Label>
          <Input id="nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="doc">{cfg.docPF ? "CPF" : "CNPJ"}</Label>
          <Input
            id="doc"
            required
            value={cpfCnpj}
            onChange={(e) => setCpfCnpj(e.target.value)}
            placeholder={cfg.docPF ? "000.000.000-00" : "00.000.000/0000-00"}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="senha">Senha</Label>
          <Input
            id="senha"
            type="password"
            required
            minLength={6}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <label className="flex items-start gap-2 text-xs text-dim">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-primary"
            checked={aceite}
            onChange={(e) => setAceite(e.target.checked)}
            required
          />
          <span>
            Li e aceito os{" "}
            <Link to="/termos" target="_blank" className="text-primary underline">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link to="/privacidade" target="_blank" className="text-primary underline">
              Política de Privacidade
            </Link>{" "}
            (LGPD).
          </span>
        </label>

        <Button type="submit" className="w-full h-11" disabled={loading || !aceite}>
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

