## Diagnóstico do site Squarespace atual (elooptoken.com)

**O que existe hoje:**
- Home única com hero "Infraestrutura de Compliance para Resíduos Eletrônicos"
- Carrossel "Como a Eloop Funciona" com 8 blocos: Ponto Crítico, Cadeia de Custódia Formal, Tecnologia Eloop Token, Interface Digital, Impacto Socioambiental, Mercado de Reciclagem, Modelo de Negócio, Diferencial Competitivo
- Stats (62M ton REEE/ano, etc.)
- Página /contact com formulário
- Links da nav (Quem somos, Projeto Eloop Token, Política de Privacidade) estão **quebrados (404)**
- HTML com CSS inline vazado no conteúdo (problema visível no markdown)
- SEO fraco: sem meta description otimizada, sem OG image dedicada, sem sitemap, sem JSON-LD

**Problemas que vou corrigir:**
1. Páginas da navegação inexistentes → criar de verdade
2. HTML/CSS quebrado renderizando como texto
3. SEO inexistente (title, description, OG, sitemap, JSON-LD)
4. Identidade visual fragmentada entre o site institucional e a landing /investidores

## Escopo proposto no Lovable

Recriar **elooptoken.com inteiro** dentro deste projeto, mantendo a landing `/investidores` que já existe, e unificando a identidade visual (paleta verde escuro + ciano já em uso).

### Estrutura de rotas

```text
/                    Home institucional (substitui app atual da home)
/projeto             Projeto Eloop Token (como funciona, 8 pilares)
/quem-somos          Time, missão, visão
/contato             Formulário + canais
/privacidade         Política de Privacidade (LGPD)
/investidores        (mantém — já existe)
```

### Seções da Home

1. **Hero** — "Infraestrutura de Compliance para Resíduos Eletrônicos" + CTA "Solicitar demo" / "Seja parceiro"
2. **Problema** — PNRS (Lei 12.305/2010), ~70% REEE informal no Brasil
3. **Como funciona** — grid com os 8 pilares (Ponto Crítico → Diferencial Competitivo)
4. **Stats** — 62M ton REEE globais, 12% CAGR, OEMs sob pressão regulatória
5. **Tecnologia** — Balança INMETRO + QR + MTR/CDF on-chain Polygon + SINIR/ISO 14001
6. **Para quem é** — OEMs, beneficiadores, órgãos ambientais, investidores
7. **CTA final** — demo + link investidores
8. **Footer** — contato, redes (Instagram, TikTok, LinkedIn), políticas

### Página /projeto

Detalha os 8 blocos do carrossel atual com ícones, descrição longa e diagrama do fluxo (balança → QR → on-chain → SINIR).

### Página /contato

Formulário (nome, e-mail, mensagem) que persiste em `investor_leads` (ou nova tabela `contact_leads` se quiser separar), + e-mail direto + redes sociais.

### Página /privacidade

LGPD: dados coletados, base legal, retenção, direitos do titular, contato do DPO (elooptoken.project@elooptoken.com).

### SEO (em todas as rotas)

- `head()` por rota com title único, description, og:title, og:description, og:type, og:url, canonical
- JSON-LD Organization no `__root.tsx` (já tem), + Service na /projeto, + ContactPoint na /contato
- `src/routes/sitemap[.]xml.ts` listando todas as rotas
- `public/robots.txt` permitindo crawl + apontando sitemap
- Imagem OG dedicada (gerada com imagegen, premium para legibilidade do texto)

### Design

Manter a paleta atual do projeto (verde escuro + accent ciano + tipografia já configurada). O Squarespace usa verde mais "musgo" + bege — vou puxar essa influência para reforçar o tom "socioambiental", mas dentro dos tokens semânticos já em `src/styles.css`, sem hardcode.

## O que NÃO vou fazer agora

- Migrar e-commerce/cart do Squarespace (não tem produtos reais lá, é só link nativo)
- Configurar o domínio `elooptoken.com` apontando para Lovable — isso é feito por você em **Project Settings → Domains** depois que aprovarmos o conteúdo. Hoje o domínio está no Squarespace; o cutover de DNS é uma etapa separada, sem rollback automático.
- Migrar logins/usuários do Squarespace (não há área logada lá)

## Detalhes técnicos

- Rotas em `src/routes/*.tsx` com `createFileRoute` e `head()` por rota
- Formulário de contato reaproveita o padrão de `src/lib/investor-leads.functions.ts` (server function + tabela Supabase com RLS)
- Nova tabela `contact_leads` com GRANTs e RLS (anon INSERT, authenticated SELECT via role)
- Imagens hero geradas via imagegen e importadas como ES6
- Header/Footer extraídos em `src/components/SiteHeader.tsx` e `SiteFooter.tsx` para reuso entre rotas institucionais (a `/investidores` continua com header próprio mais focado em conversão)

## Próximo passo

Confirme:
1. **Pode prosseguir** com toda essa estrutura, ou prefere começar só pela **Home + /projeto + /contato** e deixar /quem-somos e /privacidade para depois?
2. **Conteúdo de /quem-somos**: você manda o texto sobre o time/missão, ou eu redijo a partir do que já existe na /investidores e você revisa?
3. **Cutover de domínio elooptoken.com**: faço só depois da sua aprovação visual, certo?
