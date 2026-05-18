import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { QrCode } from "lucide-react";

export const Route = createFileRoute("/registro")({
  head: () => ({ meta: [{ title: "Registrar Descarte" }] }),
  component: RegistroPage,
});

const categorias = [
  "Pequenos eletrodomésticos",
  "Grandes eletrodomésticos",
  "Equipamentos de TI",
  "Telefonia",
  "Lâmpadas",
  "Pilhas e baterias",
  "Brinquedos eletrônicos",
  "Ferramentas",
  "Painéis fotovoltaicos",
  "Dispositivos médicos",
  "Instrumentos de medição",
  "Outros REEE",
];

function RegistroPage() {
  return (
    <PageShell title="Registrar Descarte">
      <div className="space-y-4">
        <button
          type="button"
          className="w-full rounded-2xl border-2 border-dashed p-6 flex flex-col items-center gap-2"
          style={{ borderColor: "#1DB954", color: "#E8F5E8" }}
        >
          <QrCode className="h-8 w-8" style={{ color: "#1DB954" }} />
          <span className="text-sm font-medium">Escanear QR Code</span>
          <span className="text-[11px]" style={{ color: "#7a8a7a" }}>
            (placeholder)
          </span>
        </button>

        <div>
          <label className="block text-xs mb-1.5" style={{ color: "#7a8a7a" }}>
            Peso (kg)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="0,00"
            className="w-full rounded-xl px-4 py-3 border outline-none"
            style={{
              background: "#0F1A0F",
              borderColor: "#1f2a1f",
              color: "#E8F5E8",
            }}
          />
        </div>

        <div>
          <label className="block text-xs mb-1.5" style={{ color: "#7a8a7a" }}>
            Categoria REEE
          </label>
          <select
            className="w-full rounded-xl px-4 py-3 border outline-none"
            style={{
              background: "#0F1A0F",
              borderColor: "#1f2a1f",
              color: "#E8F5E8",
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Selecione…
            </option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="w-full rounded-xl py-3 font-semibold mt-2"
          style={{ background: "#1DB954", color: "#0A0F0A" }}
        >
          Registrar
        </button>
      </div>
    </PageShell>
  );
}
