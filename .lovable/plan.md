# Eloop Token (ELP) — MVP Fase 1

App mobile-first (máx. 390px) para compliance e rastreabilidade de REEE, com tema escuro, conectando operadores ao Polygon via Thirdweb.

## Escopo desta entrega

### Infraestrutura
- Ativar **Lovable Cloud** (Supabase: Auth + Postgres + Storage + RLS)
- Criar tabelas: `operators`, `categories`, `validators`, `batches`, `disposal_events`, `certificates`, `sinir_reports`
- Seed das **12 categorias REEE** com γ
- Bucket `disposal-photos` para fotos da balança e `certificates` para PDFs
- RLS: cada operador só vê seus dados; admin vê tudo
- Trigger `handle_new_user` que cria registro em `operators` no signup

### Secrets a configurar (vou pedir após aprovação)
- `GOOGLE_VISION_API_KEY` — OCR
- `THIRDWEB_SECRET_KEY` — registro on-chain via server function
- `VITE_THIRDWEB_CLIENT_ID`, `VITE_CONTRACT_ADDRESS`, `VITE_POLYGON_CHAIN_ID` ficam em código (são públicos)

### Design system (`src/styles.css`)
- Cores oklch convertidas exatas da paleta: bg, surface, surface2, green, amber, blue, purple, white, dim, muted
- Fonte Inter via Google Fonts
- Tokens semânticos + variants Shadcn (Button: hero/ghost-dark; Card: surface; Badge: compliance/warning/info)

### Telas (TanStack Router, file-based)
1. `/login` — email/senha + Google OAuth (via broker Lovable) + link cadastro
2. `/cadastro` — formulário institucional (nome, CPF/CNPJ, tipo: PF/PJ/Cooperativa/Reciclador, email, senha)
3. `/_authenticated/dashboard` — saldo ELP, KPIs, eventos recentes, grid 4 ações
4. `/_authenticated/registro` — fluxo 5 etapas: QR scan → peso (OCR) → foto → hash SHA-256 → confirmação ELP
5. `/_authenticated/conformidade` — relatórios SINIR, status regulatório, export PDF/CSV
6. `/_authenticated/esg` — gráfico Recharts mensal, KPIs CO₂e, certificado PNRS PDF

Layout `_authenticated.tsx` faz gate de sessão e contém a Navbar inferior fixa.

### Lógica de negócio
- `calcularELP(peso, γ, α=2.0, β)` com teto de 500 ELP/evento
- Hash SHA-256 client-side via `crypto.subtle`
- QR único por lote, 24h de validade
- Cálculo de β (1.0–1.2) com base no histórico aprovado do operador

### Server functions (`createServerFn`)
- `vision-ocr` — proxy seguro para Google Vision API (não expõe key)
- `register-onchain` — usa Thirdweb SDK server-side com THIRDWEB_SECRET_KEY para registrar hash na Polygon; retorna `tx_hash`
- `generate-certificate-pf` — gera PDF com pdf-lib e faz upload pro storage
- `generate-sinir-report` — agrega eventos e gera CSV/PDF

### Dependências a instalar
`thirdweb`, `pdf-lib`, `qrcode`, `html5-qrcode`, `recharts`, `zod` (já vem), `date-fns`

## Fora do escopo (próximas fases)
- Tela `/carteira` (pulada conforme acordado)
- Certificado PJ com ICP-Brasil
- Painel de validador / aprovação manual de eventos (Fase 1 auto-aprova após hash gerado, com flag para evoluir)
- Painel admin para ajuste de α e gestão de operadores
- Sentry

## Detalhes técnicos

```text
src/
  routes/
    __root.tsx
    index.tsx              → redirect /login
    login.tsx
    cadastro.tsx
    _authenticated.tsx     → gate + navbar
    _authenticated/
      dashboard.tsx
      registro.tsx
      conformidade.tsx
      esg.tsx
  components/
    BottomNav.tsx
    ComplianceBadge.tsx
    ElpBalanceCard.tsx
    QrScanner.tsx
    PhotoCapture.tsx
    StepProgress.tsx
  lib/
    elp.ts                 → calcularELP
    hash.ts                → SHA-256
    vision.functions.ts    → server fn OCR
    onchain.functions.ts   → server fn Polygon
    certificate.functions.ts
    sinir.functions.ts
```

A regra "ELP só é emitido após aprovação do validador" será respeitada via `status='pendente'` ao criar, e na Fase 1 um pseudo-validador automático aprova ao registrar hash com sucesso. Já fica preparado para Fase 2 plugar um validador humano sem refatorar schema.
