-- 1) Storage policies for blog-covers bucket
DROP POLICY IF EXISTS "blog-covers public read" ON storage.objects;
CREATE POLICY "blog-covers public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-covers');

DROP POLICY IF EXISTS "blog-covers admin insert" ON storage.objects;
CREATE POLICY "blog-covers admin insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-covers' AND public.user_has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "blog-covers admin update" ON storage.objects;
CREATE POLICY "blog-covers admin update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-covers' AND public.user_has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'blog-covers' AND public.user_has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "blog-covers admin delete" ON storage.objects;
CREATE POLICY "blog-covers admin delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-covers' AND public.user_has_role(auth.uid(), 'admin'));

-- 2) Tighten operators self-insert with explicit WITH CHECK on privileged columns
DROP POLICY IF EXISTS "Operators insert their own row" ON public.operators;
CREATE POLICY "Operators insert their own row"
  ON public.operators FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND role = 'operator'::public.user_role
    AND operation_level = 4
    AND COALESCE(beta_score, 0) = 0
  );