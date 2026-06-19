
-- Helper: check role using operators table
CREATE OR REPLACE FUNCTION public.user_has_role(_uid uuid, _role public.user_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.operators WHERE user_id = _uid AND role = _role);
$$;

-- Articles
CREATE TYPE public.article_status AS ENUM ('draft', 'scheduled', 'published', 'archived');

CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  content_md text NOT NULL DEFAULT '',
  cover_url text,
  author_name text NOT NULL DEFAULT 'Equipe Eloop',
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  category text,
  tags text[] NOT NULL DEFAULT '{}',
  status public.article_status NOT NULL DEFAULT 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  views_count integer NOT NULL DEFAULT 0,
  reading_minutes integer NOT NULL DEFAULT 1,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX articles_status_pub_idx ON public.articles (status, published_at DESC);
CREATE INDEX articles_category_idx ON public.articles (category);

GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published articles"
  ON public.articles FOR SELECT TO anon, authenticated
  USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));

CREATE POLICY "Admins can read all articles"
  ON public.articles FOR SELECT TO authenticated
  USING (public.user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert articles"
  ON public.articles FOR INSERT TO authenticated
  WITH CHECK (public.user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update articles"
  ON public.articles FOR UPDATE TO authenticated
  USING (public.user_has_role(auth.uid(), 'admin'))
  WITH CHECK (public.user_has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete articles"
  ON public.articles FOR DELETE TO authenticated
  USING (public.user_has_role(auth.uid(), 'admin'));

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Article views
CREATE TABLE public.article_views (
  id bigserial PRIMARY KEY,
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  ip_hash text,
  ua_hash text,
  referrer text,
  country text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX article_views_article_idx ON public.article_views (article_id, created_at DESC);
CREATE INDEX article_views_created_idx ON public.article_views (created_at DESC);

GRANT INSERT ON public.article_views TO anon, authenticated;
GRANT SELECT ON public.article_views TO authenticated;
GRANT ALL ON public.article_views TO service_role;
GRANT USAGE ON SEQUENCE public.article_views_id_seq TO anon, authenticated, service_role;
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record an article view"
  ON public.article_views FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read article views"
  ON public.article_views FOR SELECT TO authenticated
  USING (public.user_has_role(auth.uid(), 'admin'));

-- Site visits
CREATE TABLE public.site_visits (
  id bigserial PRIMARY KEY,
  path text NOT NULL,
  ip_hash text,
  ua_hash text,
  referrer text,
  country text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX site_visits_path_idx ON public.site_visits (path, created_at DESC);
CREATE INDEX site_visits_created_idx ON public.site_visits (created_at DESC);

GRANT INSERT ON public.site_visits TO anon, authenticated;
GRANT SELECT ON public.site_visits TO authenticated;
GRANT ALL ON public.site_visits TO service_role;
GRANT USAGE ON SEQUENCE public.site_visits_id_seq TO anon, authenticated, service_role;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a site visit"
  ON public.site_visits FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read site visits"
  ON public.site_visits FOR SELECT TO authenticated
  USING (public.user_has_role(auth.uid(), 'admin'));

-- Ad slots (admin controlled toggle / slot ids)
CREATE TABLE public.ad_slots (
  slot_key text PRIMARY KEY,
  adsense_slot_id text,
  enabled boolean NOT NULL DEFAULT true,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ad_slots TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ad_slots TO authenticated;
GRANT ALL ON public.ad_slots TO service_role;
ALTER TABLE public.ad_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ad slots"
  ON public.ad_slots FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins manage ad slots"
  ON public.ad_slots FOR ALL TO authenticated
  USING (public.user_has_role(auth.uid(), 'admin'))
  WITH CHECK (public.user_has_role(auth.uid(), 'admin'));

INSERT INTO public.ad_slots (slot_key, description) VALUES
  ('blog_top', 'Banner topo da página /blog'),
  ('blog_infeed', 'In-feed entre cards de artigos'),
  ('article_top', 'Dentro do artigo, após introdução'),
  ('article_mid', 'Dentro do artigo, no meio do conteúdo'),
  ('article_sidebar', 'Sidebar do artigo'),
  ('site_footer', 'Rodapé do site');
