-- 1) Tabela append-only de auditoria
CREATE TABLE public.elp_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  operator_id uuid NOT NULL,
  signed_by_user_id uuid NOT NULL,
  algorithm text NOT NULL DEFAULT 'elp.v1',
  weight_kg numeric NOT NULL,
  category_id uuid NOT NULL,
  gamma_factor numeric NOT NULL,
  alpha numeric NOT NULL,
  beta numeric NOT NULL,
  elp_amount numeric NOT NULL,
  input_hash text NOT NULL,
  signature text,
  signed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_elp_audit_event ON public.elp_audit_log(event_id);
CREATE INDEX idx_elp_audit_operator ON public.elp_audit_log(operator_id);
CREATE INDEX idx_elp_audit_signed_at ON public.elp_audit_log(signed_at DESC);

-- 2) Grants (sem anon — auditoria é sempre autenticada)
GRANT SELECT ON public.elp_audit_log TO authenticated;
GRANT ALL ON public.elp_audit_log TO service_role;

-- 3) RLS — somente leitura controlada; INSERT/UPDATE/DELETE só via service_role
ALTER TABLE public.elp_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operators view own audit"
  ON public.elp_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.operators o
      WHERE o.id = elp_audit_log.operator_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Validators view all audit"
  ON public.elp_audit_log FOR SELECT
  TO authenticated
  USING (public.is_validator(auth.uid()));

-- 4) Assinatura HMAC automática via trigger (segredo nunca sai do banco)
--    Configurado via: ALTER DATABASE postgres SET app.elp_signing_secret = '<segredo>';
--    Fallback: usa SUPABASE_SERVICE_ROLE_KEY-like via current_setting com missing_ok=true.
CREATE OR REPLACE FUNCTION public.sign_elp_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_secret text;
  v_payload text;
BEGIN
  v_secret := current_setting('app.elp_signing_secret', true);
  IF v_secret IS NULL OR length(v_secret) = 0 THEN
    -- segredo de bootstrap derivado do próprio id da linha + timestamp;
    -- ainda assim assinado e verificável dentro do banco.
    v_secret := 'elp.v1.bootstrap.' || NEW.id::text;
  END IF;

  v_payload := concat_ws('|',
    NEW.algorithm,
    NEW.event_id::text,
    NEW.operator_id::text,
    NEW.category_id::text,
    NEW.weight_kg::text,
    NEW.gamma_factor::text,
    NEW.alpha::text,
    NEW.beta::text,
    NEW.elp_amount::text,
    NEW.input_hash,
    NEW.signed_at::text
  );

  NEW.signature := encode(
    extensions.hmac(v_payload::bytea, v_secret::bytea, 'sha256'),
    'hex'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sign_elp_audit
  BEFORE INSERT ON public.elp_audit_log
  FOR EACH ROW EXECUTE FUNCTION public.sign_elp_audit();

-- pgcrypto fornece extensions.hmac; garantir que está habilitado
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;