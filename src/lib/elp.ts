/**
 * Fórmula ELP — Eloop Token
 * ELP = peso_kg × γ(categoria) × α × β
 * Teto por evento: 500 ELP (beta)
 */

export const ALPHA_DEFAULT = 2.0;
export const TETO_EVENTO = 500;
export const TETO_MENSAL_OPERADOR = 5000;

export function calcularELP(
  peso_kg: number,
  gamma: number,
  alpha: number = ALPHA_DEFAULT,
  beta: number = 1.0,
): number {
  if (peso_kg <= 0) return 0;
  const elp = peso_kg * gamma * alpha * beta;
  return Math.min(Math.round(elp * 100) / 100, TETO_EVENTO);
}

/**
 * CO₂e estimado (kg CO₂ evitado por kg de REEE reciclado).
 * Aproximação simplificada baseada em ABRELPE / ISO 14064-2.
 */
export function estimarCO2e(peso_kg: number, risk: "alto" | "medio" | "baixo"): number {
  const fator = risk === "alto" ? 3.5 : risk === "medio" ? 2.0 : 1.1;
  return Math.round(peso_kg * fator * 100) / 100;
}

export function formatELP(n: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatKg(n: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
