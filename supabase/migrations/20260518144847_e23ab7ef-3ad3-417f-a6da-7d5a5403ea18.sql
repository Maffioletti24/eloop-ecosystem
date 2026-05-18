
-- 1) operation_level on operators
ALTER TABLE public.operators
  ADD COLUMN IF NOT EXISTS operation_level smallint NOT NULL DEFAULT 4
  CHECK (operation_level BETWEEN 1 AND 4);

-- 2) token supply registry (single row)
CREATE TABLE IF NOT EXISTS public.token_supply (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  total_emitido numeric NOT NULL DEFAULT 0,
  hard_cap numeric NOT NULL DEFAULT 250000000,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.token_supply (id, total_emitido, hard_cap)
VALUES (true, 0, 250000000)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.token_supply ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "token_supply readable by authenticated" ON public.token_supply;
CREATE POLICY "token_supply readable by authenticated"
  ON public.token_supply FOR SELECT TO authenticated USING (true);

-- 3) Guard + supply update trigger on disposal_events
CREATE OR REPLACE FUNCTION public.enforce_hard_cap_and_track_supply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cap numeric;
  v_total numeric;
  v_delta numeric := 0;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'aprovado' THEN
      v_delta := COALESCE(NEW.elp_amount, 0);
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'aprovado' THEN
      v_delta := v_delta - COALESCE(OLD.elp_amount, 0);
    END IF;
    IF NEW.status = 'aprovado' THEN
      v_delta := v_delta + COALESCE(NEW.elp_amount, 0);
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status = 'aprovado' THEN
      v_delta := -COALESCE(OLD.elp_amount, 0);
    END IF;
  END IF;

  IF v_delta = 0 THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT hard_cap, total_emitido INTO v_cap, v_total
  FROM public.token_supply WHERE id = true FOR UPDATE;

  IF (v_total + v_delta) > v_cap THEN
    RAISE EXCEPTION 'Hard cap de % ELP excedido (atual: %, delta: %)', v_cap, v_total, v_delta
      USING ERRCODE = 'check_violation';
  END IF;

  UPDATE public.token_supply
    SET total_emitido = v_total + v_delta,
        updated_at = now()
    WHERE id = true;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_hard_cap ON public.disposal_events;
CREATE TRIGGER trg_enforce_hard_cap
  BEFORE INSERT OR UPDATE OR DELETE ON public.disposal_events
  FOR EACH ROW EXECUTE FUNCTION public.enforce_hard_cap_and_track_supply();

-- 4) Ensure existing wallet sync trigger is attached (idempotent)
DROP TRIGGER IF EXISTS trg_sync_wallet ON public.disposal_events;
CREATE TRIGGER trg_sync_wallet
  AFTER INSERT OR UPDATE OR DELETE ON public.disposal_events
  FOR EACH ROW EXECUTE FUNCTION public.sync_wallet_on_event();

-- 5) handle_new_user: persist operation_level from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.operators (user_id, nome, cpf_cnpj, tipo, operation_level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'cpf_cnpj',
    COALESCE((NEW.raw_user_meta_data ->> 'tipo')::public.operator_type, 'PF'),
    COALESCE((NEW.raw_user_meta_data ->> 'operation_level')::smallint, 4)
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
