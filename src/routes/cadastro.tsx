import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/cadastro")({
  component: CadastroPage,
});

function CadastroPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState("PF");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8" style={{ backgroundColor: "#0A0F0A" }}>
      <div className="w-full" style={{ maxWidth: "390px" }}>
        <h1 className="text-2xl font-semibold text-white mb-6 text-center">
          Criar Conta Institucional
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome completo"
            className="w-full rounded-md px-4 py-3 bg-neutral-900 text-white border border-neutral-800 focus:outline-none focus:border-[#1DB954]"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="w-full rounded-md px-4 py-3 bg-neutral-900 text-white border border-neutral-800 focus:outline-none focus:border-[#1DB954]"
          />
          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            className="w-full rounded-md px-4 py-3 bg-neutral-900 text-white border border-neutral-800 focus:outline-none focus:border-[#1DB954]"
          />
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full rounded-md px-4 py-3 bg-neutral-900 text-white border border-neutral-800 focus:outline-none focus:border-[#1DB954]"
          >
            <option value="PF">Pessoa Física (PF)</option>
            <option value="PJ">Pessoa Jurídica (PJ)</option>
            <option value="Cooperativa">Cooperativa</option>
          </select>
          <button
            type="submit"
            className="w-full rounded-md py-3 font-semibold text-black transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#1DB954" }}
          >
            Criar Conta
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm" style={{ color: "#1DB954" }}>
            Já tenho conta
          </Link>
        </div>
      </div>
    </div>
  );
}
