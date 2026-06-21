DROP POLICY IF EXISTS "Operators update their own row" ON public.operators;

CREATE POLICY "Operators update their own row"
ON public.operators
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND role = (SELECT o.role FROM public.operators o WHERE o.user_id = auth.uid())
  AND operation_level = (SELECT o.operation_level FROM public.operators o WHERE o.user_id = auth.uid())
  AND COALESCE(beta_score, 0) = COALESCE((SELECT o.beta_score FROM public.operators o WHERE o.user_id = auth.uid()), 0)
);