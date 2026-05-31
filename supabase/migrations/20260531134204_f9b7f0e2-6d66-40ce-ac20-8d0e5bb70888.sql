
-- Uso único do QR: cria unique index se ainda não houver
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'batches_qr_code_unique'
  ) THEN
    CREATE UNIQUE INDEX batches_qr_code_unique ON public.batches (qr_code);
  END IF;
END $$;
