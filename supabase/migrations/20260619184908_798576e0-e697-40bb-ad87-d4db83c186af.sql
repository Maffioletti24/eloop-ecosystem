
-- 1. Remove broad validator access to operators (exposed cpf_cnpj, wallet_address)
DROP POLICY IF EXISTS "Validators view all operators" ON public.operators;

-- 2. Prevent role/operation_level/beta_score escalation via UPDATE.
--    Replace the racy USING/WITH CHECK subquery with a trigger that blocks
--    privileged column changes unless the caller is service_role.
DROP POLICY IF EXISTS "Operators update their own row" ON public.operators;
CREATE POLICY "Operators update their own row"
  ON public.operators
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.prevent_operator_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.operation_level IS DISTINCT FROM OLD.operation_level
     OR COALESCE(NEW.beta_score, 0) IS DISTINCT FROM COALESCE(OLD.beta_score, 0)
     OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Privilege escalation blocked: role/operation_level/beta_score/user_id cannot be changed by the user'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_operator_privilege_escalation ON public.operators;
CREATE TRIGGER trg_prevent_operator_privilege_escalation
  BEFORE UPDATE ON public.operators
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_operator_privilege_escalation();

REVOKE EXECUTE ON FUNCTION public.prevent_operator_privilege_escalation() FROM PUBLIC, anon, authenticated;

-- 3. Wallets — restrict INSERT/UPDATE to wallet-eligible roles, add DELETE policy
DROP POLICY IF EXISTS "Users insert own wallet" ON public.wallets;
CREATE POLICY "Users insert own wallet"
  ON public.wallets
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.current_user_role() = ANY (ARRAY['donor_pf'::user_role,'donor_pj'::user_role,'buyer'::user_role,'admin'::user_role])
  );

DROP POLICY IF EXISTS "Users update own wallet" ON public.wallets;
CREATE POLICY "Users update own wallet"
  ON public.wallets
  FOR UPDATE
  USING (
    auth.uid() = user_id
    AND public.current_user_role() = ANY (ARRAY['donor_pf'::user_role,'donor_pj'::user_role,'buyer'::user_role,'admin'::user_role])
  )
  WITH CHECK (
    auth.uid() = user_id
    AND public.current_user_role() = ANY (ARRAY['donor_pf'::user_role,'donor_pj'::user_role,'buyer'::user_role,'admin'::user_role])
  );

DROP POLICY IF EXISTS "Users delete own wallet" ON public.wallets;
CREATE POLICY "Users delete own wallet"
  ON public.wallets
  FOR DELETE
  USING (
    auth.uid() = user_id
    AND public.current_user_role() = 'admin'::user_role
  );

-- 4. Storage UPDATE/DELETE policies scoped to owner folder
DROP POLICY IF EXISTS "Users update own disposal photos" ON storage.objects;
CREATE POLICY "Users update own disposal photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'disposal-photos' AND (auth.uid())::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'disposal-photos' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users delete own disposal photos" ON storage.objects;
CREATE POLICY "Users delete own disposal photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'disposal-photos' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users update own certificates" ON storage.objects;
CREATE POLICY "Users update own certificates"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'certificates' AND (auth.uid())::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'certificates' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users delete own certificates" ON storage.objects;
CREATE POLICY "Users delete own certificates"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'certificates' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 5. Set fixed search_path on SECURITY DEFINER helpers that were missing it
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;

-- 6. Revoke EXECUTE from anon/authenticated on SECURITY DEFINER helpers that
--    must never be called via the public API. Trigger functions and internal
--    queue helpers belong to service_role only.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_operator_wallet() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_wallet_on_event() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_hard_cap_and_track_supply() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sign_elp_audit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
