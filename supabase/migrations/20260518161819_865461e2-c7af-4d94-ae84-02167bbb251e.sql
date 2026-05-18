
ALTER TABLE public.validators ADD COLUMN IF NOT EXISTS user_id uuid UNIQUE;

CREATE OR REPLACE FUNCTION public.is_validator(_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.validators
    WHERE user_id = _uid AND ativo = true
  );
$$;

-- Validators can SELECT and UPDATE all disposal_events
CREATE POLICY "Validators view all events"
ON public.disposal_events FOR SELECT
TO authenticated
USING (public.is_validator(auth.uid()));

CREATE POLICY "Validators update all events"
ON public.disposal_events FOR UPDATE
TO authenticated
USING (public.is_validator(auth.uid()));

-- Validators can read batches and operators to display context
CREATE POLICY "Validators view all batches"
ON public.batches FOR SELECT
TO authenticated
USING (public.is_validator(auth.uid()));

CREATE POLICY "Validators view all operators"
ON public.operators FOR SELECT
TO authenticated
USING (public.is_validator(auth.uid()));
