# Eloop Token (ELP) — REEE Compliance & Tokenização

App mobile-first para compliance e rastreabilidade de Resíduos de Equipamentos Eletroeletrônicos (REEE), conectando operadores ao Polygon via Thirdweb.

## Documentação oficial

- 📄 [White Paper 2026](docs/Eloop_Whitepaper_2026.pdf)
- 📊 [Pitch Deck 2026](docs/Eloop_PitchDeck_2026.pdf)
- 🎨 [Redesign 2026](docs/Eloop_Redesign_2026.pdf)
- 📋 [Plano técnico do MVP](.lovable/plan.md)

## Stack

- **Frontend:** TanStack Start v1 + React 19 + Vite 7 + Tailwind v4
- **Backend:** Lovable Cloud (Supabase: Postgres + Auth + Storage + RLS)
- **Blockchain:** Polygon via Thirdweb (registro on-chain de hashes SHA-256)
- **AI/OCR:** Google Vision API (leitura de balança)
- **Deploy:** Cloudflare Workers (edge runtime)

## Regras de negócio

- Cálculo ELP: `peso × γ × α × β`, teto de 500 ELP/evento
- Guard de emissão: 250M ELP máximo no sistema
- 12 categorias REEE com γ específico
- Hash SHA-256 client-side de cada evento de descarte
- QR único por lote com validade de 24h

## Desenvolvimento

Edição via [Lovable](https://lovable.dev) com sync bidirecional GitHub ↔ Lovable.
Todo commit aqui sobe automaticamente para este repositório.
