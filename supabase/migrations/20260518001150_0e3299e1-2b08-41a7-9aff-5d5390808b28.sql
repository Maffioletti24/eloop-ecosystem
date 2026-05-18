
-- 1) Certificates bucket: private + path-scoped read
update storage.buckets set public = false where id = 'certificates';

drop policy if exists "Public read certificates" on storage.objects;
create policy "Users read own certificates"
  on storage.objects for select
  using (bucket_id = 'certificates' and auth.uid()::text = (storage.foldername(name))[1]);

-- 2) Revoke EXECUTE on SECURITY DEFINER helper functions from public roles
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.update_updated_at_column() from public, anon, authenticated;
