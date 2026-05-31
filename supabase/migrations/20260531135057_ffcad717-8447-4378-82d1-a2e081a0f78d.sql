
CREATE TABLE public.compensations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
  elp_burned numeric NOT NULL CHECK (elp_burned > 0),
  finalidade text,
  numero_sequencial text NOT NULL UNIQUE,
  polygon_tx_hash text,
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_compensations_operator ON public.compensations(operator_id, created_at DESC);

GRANT SELECT, INSERT ON public.compensations TO authenticated;
GRANT ALL ON public.compensations TO service_role;

ALTER TABLE public.compensations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers insert own compensations"
  ON public.compensations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.operators o
    WHERE o.id = compensations.operator_id
      AND o.user_id = auth.uid()
      AND o.role = 'buyer'
  ));

CREATE POLICY "Buyers view own compensations"
  ON public.compensations FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.operators o
    WHERE o.id = compensations.operator_id AND o.user_id = auth.uid()
  ));

CREATE POLICY "Validators view all compensations"
  ON public.compensations FOR SELECT TO authenticated
  USING (public.is_validator(auth.uid()));
