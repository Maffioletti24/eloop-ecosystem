create table public.contact_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  source text not null default 'contato',
  created_at timestamptz not null default now()
);

grant insert on public.contact_leads to anon, authenticated;
grant all on public.contact_leads to service_role;

alter table public.contact_leads enable row level security;

create policy "Anyone can submit contact leads"
  on public.contact_leads
  for insert
  to anon, authenticated
  with check (true);