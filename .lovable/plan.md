## Visão geral

Adicionar à plataforma Eloop um módulo de conteúdo (blog/artigos) com gestão pelo admin, publicação automática agendada, métricas de visitação (pública + dashboard) e espaços comerciais via Google AdSense.

## O que será entregue

### 1. Blog / Artigos (CMS no Lovable Cloud)
- Página pública `/blog` listando artigos publicados (ordenados por data, com paginação e filtro por categoria).
- Página `/blog/:slug` com o conteúdo do artigo, capa, autor, data, tempo de leitura, tags e botões de compartilhamento.
- Editor admin em `/admin/blog` (protegido por role `admin`/`editor`) com:
  - Lista de artigos (rascunho, agendado, publicado, arquivado)
  - Criar/editar artigo: título, slug, resumo, capa (upload), conteúdo (Markdown com preview), categoria, tags, autor, **data de publicação agendada**, status
- SEO por artigo: title, meta description, OG image, JSON-LD `Article`.
- Feed RSS em `/blog/rss.xml` e sitemap atualizado.

### 2. Publicação automática semanal
- Cron job semanal (segunda 09:00 BRT) que muda artigos com `status='scheduled'` e `scheduled_at <= now()` para `published`.
- Funciona também para qualquer cadência: basta agendar a data e o cron processa.

### 3. Contador de visitas
- **Público**: contador de visualizações em cada artigo (incrementado server-side, com deduplicação por IP+UA em janela de 30 min para evitar inflar).
- **Admin**: dashboard `/admin/analytics` com:
  - Visitas totais por dia (últimos 30/90 dias)
  - Top artigos por views
  - Origem (referrer) e país (via header)
  - Tempo médio na página (tracking leve client-side)

### 4. Espaços Google AdSense
- Slots reservados em posições estratégicas:
  - Topo do `/blog` (banner)
  - Entre artigos na listagem (in-feed, a cada 4 cards)
  - Dentro do artigo (após o 1º bloco + meio do conteúdo)
  - Sidebar do artigo (sticky)
  - Rodapé do site
- Componente `<AdSlot slot="..." />` que injeta o script do AdSense quando `VITE_ADSENSE_CLIENT_ID` estiver configurado; em dev mostra placeholder visual.
- Você cola seu **publisher ID** (`ca-pub-...`) e os **slot IDs** uma vez nas configurações.

## Detalhes técnicos

**Tabelas novas** (Lovable Cloud):
- `articles` (title, slug, excerpt, content_md, cover_url, author_id, category, tags[], status, scheduled_at, published_at, views_count, reading_minutes)
- `article_views` (article_id, ip_hash, ua_hash, referrer, country, created_at) — para dedupe e analytics
- `site_visits` (path, ip_hash, ua_hash, referrer, created_at) — visitas gerais do site
- `ad_slots` (slot_key, adsense_slot_id, enabled) — opcional, permite ligar/desligar slots sem deploy

**RLS**: leitura pública só de `articles` com `status='published'`; escrita restrita a `admin`/`editor` via `has_role`. Inserts em `*_views` permitidos para `anon` com colunas mínimas.

**Storage**: bucket `article-covers` (público) para capas.

**Server functions**:
- `publishScheduledArticles` (cron semanal)
- `trackPageView` (chamada do client em cada navegação)
- `getArticles`, `getArticleBySlug`, `getAnalytics` (admin)

**AdSense**: script `adsbygoogle.js` carregado uma vez no `__root.tsx` quando o publisher ID existir; componente `<AdSlot>` em cada posição.

## O que você precisará fornecer depois
- Publisher ID do Google AdSense (`ca-pub-...`) e os slot IDs de cada bloco — adicionados como variáveis (não secret, são públicos). Sem isso, os espaços ficam reservados mas não monetizam.
- AdSense exige aprovação da conta — posso deixar tudo pronto e você ativa quando aprovado.

## Fora do escopo desta etapa
- Comentários nos artigos
- Newsletter / inscrição por email
- A/B testing de anúncios
- Integração com Google Analytics (podemos adicionar depois se quiser)

Posso começar pela base (tabelas + página pública do blog + admin) e seguir para cron, analytics e ad slots — ou prefere outra ordem?