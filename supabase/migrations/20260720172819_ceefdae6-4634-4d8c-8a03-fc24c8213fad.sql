CREATE POLICY "Admins can read unsubscribe tokens"
ON public.email_unsubscribe_tokens
FOR SELECT
TO authenticated
USING (public.user_has_role(auth.uid(), 'admin'::public.user_role));