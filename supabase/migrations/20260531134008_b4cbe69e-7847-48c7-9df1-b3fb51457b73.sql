
-- 1. Enum de perfis
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('operator','donor_pf','donor_pj','buyer','validator','admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Coluna role em operators
ALTER TABLE public.operators
  ADD COLUMN IF NOT EXISTS role public.user_role NOT NULL DEFAULT 'operator';

-- 3. Carteira: campos de custódia
ALTER TABLE public.wallets
  ADD COLUMN IF NOT EXISTS encrypted_pk text,
  ADD COLUMN IF NOT EXISTS custody text NOT NULL DEFAULT 'custodial'
    CHECK (custody IN ('custodial','external'));

-- 4. Helper: role do usuário atual
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.operators WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 5. Atualiza RLS de wallets — operadores e validadores não devem acessar
DROP POLICY IF EXISTS "Users view own wallet" ON public.wallets;
CREATE POLICY "Wallet visible only to donors/buyers/admin"
ON public.wallets FOR SELECT
USING (
  auth.uid() = user_id
  AND public.current_user_role() IN ('donor_pf','donor_pj','buyer','admin')
);

-- 6. handle_new_user: respeita role passado no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.operators (user_id, nome, cpf_cnpj, tipo, operation_level, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'cpf_cnpj',
    COALESCE((NEW.raw_user_meta_data ->> 'tipo')::public.operator_type, 'PF'),
    COALESCE((NEW.raw_user_meta_data ->> 'operation_level')::smallint, 4),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'operator')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
