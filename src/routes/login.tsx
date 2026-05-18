import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4" style={{ backgroundColor: "#0A0F0A" }}>
      <div className="w-full" style={{ maxWidth: "390px" }}>
        <h1 className="text-2xl font-semibold text-white mb-6 text-center">Entrar</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-md px-4 py-3 bg-neutral-900 text-white border border-neutral-800 focus:outline-none focus:border-[#1DB954]"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="w-full rounded-md px-4 py-3 bg-neutral-900 text-white border border-neutral-800 focus:outline-none focus:border-[#1DB954]"
          />
          <button
            type="submit"
            className="w-full rounded-md py-3 font-semibold text-black transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#1DB954" }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
