-- 1. Block privilege-escalation: operators cannot change role/operation_level/beta_score on their own row.
DROP POLICY IF EXISTS "Operators update their own row" ON public.operators;

CREATE POLICY "Operators update their own row"
  ON public.operators FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND role = (SELECT o.role FROM public.operators o WHERE o.user_id = auth.uid() LIMIT 1)
    AND operation_level = (SELECT o.operation_level FROM public.operators o WHERE o.user_id = auth.uid() LIMIT 1)
    AND COALESCE(beta_score, 0) = COALESCE((SELECT o.beta_score FROM public.operators o WHERE o.user_id = auth.uid() LIMIT 1), 0)
  );

-- 2. Restrict validators table reads: only the validator themselves or an admin.
DROP POLICY IF EXISTS "Validators readable by authenticated" ON public.validators;

CREATE POLICY "Validators read own row"
  ON public.validators FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR public.current_user_role() = 'admin'::public.user_role
  );
