-- WALLETS
create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  saldo_elp numeric not null default 0,
  wallet_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.wallets enable row level security;

create policy "Users view own wallet" on public.wallets
  for select using (auth.uid() = user_id);
create policy "Users insert own wallet" on public.wallets
  for insert with check (auth.uid() = user_id);
create policy "Users update own wallet" on public.wallets
  for update using (auth.uid() = user_id);

create trigger update_wallets_updated_at
  before update on public.wallets
  for each row execute function public.update_updated_at_column();

-- KPIS
create table public.kpis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scan_rate numeric,
  uptime numeric,
  tx_custo numeric,
  beta_score numeric,
  periodo date not null default current_date,
  created_at timestamptz not null default now()
);
alter table public.kpis enable row level security;

create policy "Users view own kpis" on public.kpis
  for select using (auth.uid() = user_id);
create policy "Users insert own kpis" on public.kpis
  for insert with check (auth.uid() = user_id);
create policy "Users update own kpis" on public.kpis
  for update using (auth.uid() = user_id);

create index kpis_user_periodo_idx on public.kpis (user_id, periodo desc);

-- AUTO-CREATE WALLET when operator profile is created
create or replace function public.handle_new_operator_wallet()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.wallets (user_id, saldo_elp)
  values (new.user_id, 0)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_operator_created_make_wallet
  after insert on public.operators
  for each row execute function public.handle_new_operator_wallet();

-- BACKFILL wallets for existing operators
insert into public.wallets (user_id, saldo_elp)
select user_id, 0 from public.operators
on conflict (user_id) do nothing;

-- SEED categories (only if empty)
insert into public.categories (nome, gamma_factor, risk_level)
select * from (values
  ('Pilhas e Baterias', 4.0, 'alto'::risk_level),
  ('TI e Telecomunicações', 3.0, 'alto'::risk_level),
  ('Monitores e TVs', 2.5, 'alto'::risk_level),
  ('Iluminação', 2.5, 'alto'::risk_level),
  ('Equipamentos Médicos', 2.0, 'medio'::risk_level),
  ('Pequenos Eletrodomésticos', 1.8, 'medio'::risk_level),
  ('Áudio e Vídeo', 1.8, 'medio'::risk_level),
  ('Ferramentas Elétricas', 1.5, 'medio'::risk_level),
  ('Brinquedos Eletrônicos', 1.5, 'medio'::risk_level),
  ('Painéis Fotovoltaicos', 1.5, 'medio'::risk_level),
  ('Grandes Eletrodomésticos', 1.2, 'baixo'::risk_level),
  ('Cabos e Periféricos', 1.0, 'baixo'::risk_level)
) as v(nome, gamma_factor, risk_level)
where not exists (select 1 from public.categories);