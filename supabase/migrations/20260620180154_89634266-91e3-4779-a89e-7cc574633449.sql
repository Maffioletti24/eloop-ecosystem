INSERT INTO public.articles (
  slug, title, excerpt, content_md, cover_url, author_name,
  category, tags, status, published_at, reading_minutes,
  seo_title, seo_description
) VALUES (
  'da-ideia-ao-mvp-eloop',
  'Da ideia ao MVP: como o Eloop saiu do Figma e virou infraestrutura de compliance',
  'Há 6 meses, o Eloop era um conceito em mockups. Hoje, é uma plataforma funcional para rastreabilidade de REEE — com pesagem INMETRO, hash on-chain e relatórios SINIR automatizados.',
  E'## De protótipo a produto em 90 dias\n\nHá 6 meses, o Eloop era um conceito no Figma. Protótipos, fluxos, telas que pareciam reais — mas não eram.\n\nHoje, fechamos o MVP e estamos rodando com operadores reais. Esta é a história curta de como tiramos a ideia do papel.\n\n## O que saiu do papel e virou código\n\n- **Rastreabilidade ponta a ponta** para Resíduos de Equipamentos Eletroeletrônicos (REEE), do ponto de coleta ao destinador final.\n- **Token ELP com cálculo transparente**: peso × γ (fator de risco da categoria) × α (fator operacional) × β16 (fator de impacto). Sem caixa-preta.\n- **Hash SHA-256 ancorado na Polygon** — cada evento de coleta vira proof-of-existence imutável.\n- **Relatórios SINIR e ISO 14001** gerados automaticamente a partir dos lotes assinados.\n- **QR code por lote** para auditoria pública.\n\n## Por que isso importa\n\nA Política Nacional de Resíduos Sólidos (Lei 12.305/2010) obriga rastreabilidade da logística reversa, mas ~70% dos REEE no Brasil ainda circulam fora da cadeia formal. Sem prova auditável de quem coletou, pesou, tratou e destinou, não existe compliance real — nem reporte ESG confiável para Escopo 3.\n\nO Eloop converte cada coleta em registro digital assinado, com peso certificado por balança INMETRO, foto, geolocalização e hash on-chain. O resultado: a OEM tem prova; o beneficiador tem MTR/CDF; o regulador tem trilha auditável.\n\n## O que vem agora\n\n- **Pilotos remunerados** com cooperativas e recicladores.\n- **Expansão para novas cadeias**: embalagens, RCC, pilhas e baterias, OLUC, resíduos de saúde.\n- **Integração com sistemas de gestão ambiental** das OEMs parceiras.\n\nSe você lida com logística reversa, compliance de REEE ou contabilidade de Escopo 3, vale a conversa.\n\n👉 [Solicitar demo](https://elooptoken.com/contato)',
  NULL,
  'Equipe Eloop',
  'Produto',
  ARRAY['REEE','PNRS','MVP','Blockchain','Compliance']::text[],
  'published',
  now(),
  4,
  'Da ideia ao MVP: Eloop Token e a infraestrutura de compliance para REEE',
  'Como o Eloop saiu de mockups no Figma e virou plataforma funcional de rastreabilidade de resíduos eletrônicos com pesagem INMETRO, hash on-chain e relatórios SINIR.'
)
ON CONFLICT (slug) DO NOTHING;