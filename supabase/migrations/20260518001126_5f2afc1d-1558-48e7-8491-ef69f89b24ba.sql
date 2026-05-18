
-- =========================================================
-- ENUMS
-- =========================================================
create type public.operator_type as enum ('PF','PJ','Cooperativa','Reciclador');
create type public.validator_type as enum ('Cooperativa','Transportadora','Reciclador');
create type public.risk_level as enum ('alto','medio','baixo');
create type public.batch_status as enum ('pendente','validado','cancelado');
create type public.event_status as enum ('pendente','aprovado','rejeitado');
create type public.certificate_type as enum ('PF','PJ');

-- =========================================================
-- TIMESTAMP TRIGGER
-- =========================================================
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- OPERATORS
-- =========================================================
create table public.operators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  nome text not null,
  cpf_cnpj text unique,
  tipo public.operator_type not null default 'PF',
  wallet_address text,
  beta_score numeric not null default 1.0 check (beta_score between 1.0 and 1.2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.operators enable row level security;

create policy "Operators view their own row"
  on public.operators for select
  using (auth.uid() = user_id);
create policy "Operators update their own row"
  on public.operators for update
  using (auth.uid() = user_id);
create policy "Operators insert their own row"
  on public.operators for insert
  with check (auth.uid() = user_id);

create trigger trg_operators_updated_at
  before update on public.operators
  for each row execute function public.update_updated_at_column();

-- =========================================================
-- CATEGORIES (read-only para todos autenticados)
-- =========================================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  gamma_factor numeric not null,
  descricao text,
  risk_level public.risk_level not null,
  created_at timestamptz not null default now()
);
alter table public.categories enable row level security;
create policy "Categories readable by authenticated"
  on public.categories for select
  to authenticated
  using (true);

insert into public.categories (nome, gamma_factor, descricao, risk_level) values
  ('Pilhas e Baterias', 4.0, 'Li-ion, chumbo-ácido, AA/AAA', 'alto'),
  ('TI e Telecomunicações', 3.0, 'Smartphones, tablets, notebooks, PCs', 'alto'),
  ('Monitores e TVs', 2.5, 'LCD, LED, OLED, projetores', 'alto'),
  ('Iluminação', 2.5, 'Fluorescentes, CFL, LED', 'alto'),
  ('Equipamentos Médicos', 2.0, 'Monitores cardíacos, diagnóstico', 'medio'),
  ('Pequenos Eletrodomésticos', 1.8, 'Batedeiras, cafeteiras, ferros', 'medio'),
  ('Áudio e Vídeo', 1.8, 'Rádios, DVDs, câmeras, videogames', 'medio'),
  ('Ferramentas Elétricas', 1.5, 'Furadeiras, serras', 'medio'),
  ('Brinquedos Eletrônicos', 1.5, 'Drones, consoles portáteis', 'medio'),
  ('Painéis Fotovoltaicos', 1.5, 'Painéis solares', 'medio'),
  ('Grandes Eletrodomésticos', 1.2, 'Geladeiras, lavadoras, ar-cond', 'baixo'),
  ('Cabos e Periféricos', 1.0, 'Fios, teclados, mouses', 'baixo');

-- =========================================================
-- VALIDATORS
-- =========================================================
create table public.validators (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text,
  tipo public.validator_type not null,
  licenca text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.validators enable row level security;
create policy "Validators readable by authenticated"
  on public.validators for select
  to authenticated
  using (true);

-- seed de um validador padrão (auto)
insert into public.validators (nome, cnpj, tipo, licenca, ativo) values
  ('Eloop Validador Automático', '00.000.000/0001-00', 'Cooperativa', 'BETA-AUTO-2026', true);

-- =========================================================
-- BATCHES
-- =========================================================
create table public.batches (
  id uuid primary key default gen_random_uuid(),
  qr_code text unique not null,
  operator_id uuid references public.operators(id) on delete cascade,
  validator_id uuid references public.validators(id),
  status public.batch_status not null default 'pendente',
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now()
);
alter table public.batches enable row level security;

create policy "Operators view own batches"
  on public.batches for select
  using (exists (select 1 from public.operators o where o.id = batches.operator_id and o.user_id = auth.uid()));
create policy "Operators insert own batches"
  on public.batches for insert
  with check (exists (select 1 from public.operators o where o.id = operator_id and o.user_id = auth.uid()));
create policy "Operators update own batches"
  on public.batches for update
  using (exists (select 1 from public.operators o where o.id = batches.operator_id and o.user_id = auth.uid()));

-- =========================================================
-- DISPOSAL EVENTS
-- =========================================================
create table public.disposal_events (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid references public.batches(id) on delete set null,
  operator_id uuid not null references public.operators(id) on delete cascade,
  validator_id uuid references public.validators(id),
  category_id uuid not null references public.categories(id),
  weight_kg numeric not null check (weight_kg > 0),
  photo_url text,
  elp_amount numeric,
  alpha numeric not null default 2.0,
  beta numeric not null default 1.0,
  hash_sha256 text,
  polygon_tx_hash text,
  status public.event_status not null default 'pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.disposal_events enable row level security;

create policy "Operators view own events"
  on public.disposal_events for select
  using (exists (select 1 from public.operators o where o.id = disposal_events.operator_id and o.user_id = auth.uid()));
create policy "Operators insert own events"
  on public.disposal_events for insert
  with check (exists (select 1 from public.operators o where o.id = operator_id and o.user_id = auth.uid()));
create policy "Operators update own events"
  on public.disposal_events for update
  using (exists (select 1 from public.operators o where o.id = disposal_events.operator_id and o.user_id = auth.uid()));

create index idx_events_operator on public.disposal_events(operator_id, created_at desc);
create index idx_events_status on public.disposal_events(status);

create trigger trg_events_updated_at
  before update on public.disposal_events
  for each row execute function public.update_updated_at_column();

-- =========================================================
-- CERTIFICATES
-- =========================================================
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.disposal_events(id) on delete cascade,
  tipo public.certificate_type not null default 'PF',
  numero_sequencial text unique not null,
  pdf_url text,
  assinado_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.certificates enable row level security;

create policy "Operators view own certificates"
  on public.certificates for select
  using (exists (
    select 1 from public.disposal_events e
    join public.operators o on o.id = e.operator_id
    where e.id = certificates.event_id and o.user_id = auth.uid()
  ));
create policy "Operators insert own certificates"
  on public.certificates for insert
  with check (exists (
    select 1 from public.disposal_events e
    join public.operators o on o.id = e.operator_id
    where e.id = event_id and o.user_id = auth.uid()
  ));

-- sequencial humano-legível
create sequence if not exists public.certificate_seq start 1000;

-- =========================================================
-- SINIR REPORTS
-- =========================================================
create table public.sinir_reports (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references public.operators(id) on delete cascade,
  periodo_inicio date not null,
  periodo_fim date not null,
  total_kg numeric not null default 0,
  total_elp numeric not null default 0,
  total_eventos integer not null default 0,
  pdf_url text,
  csv_url text,
  exported_at timestamptz not null default now()
);
alter table public.sinir_reports enable row level security;

create policy "Operators view own reports"
  on public.sinir_reports for select
  using (exists (select 1 from public.operators o where o.id = sinir_reports.operator_id and o.user_id = auth.uid()));
create policy "Operators insert own reports"
  on public.sinir_reports for insert
  with check (exists (select 1 from public.operators o where o.id = operator_id and o.user_id = auth.uid()));

-- =========================================================
-- AUTO-CREATE OPERATOR ON SIGNUP
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.operators (user_id, nome, cpf_cnpj, tipo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'cpf_cnpj',
    coalesce((new.raw_user_meta_data ->> 'tipo')::public.operator_type, 'PF')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- STORAGE BUCKETS
-- =========================================================
insert into storage.buckets (id, name, public) values
  ('disposal-photos', 'disposal-photos', false),
  ('certificates', 'certificates', true)
on conflict (id) do nothing;

-- Disposal photos: usuário só acessa pasta com o próprio user_id
create policy "Users upload own disposal photos"
  on storage.objects for insert
  with check (bucket_id = 'disposal-photos' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users read own disposal photos"
  on storage.objects for select
  using (bucket_id = 'disposal-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- Certificates: leitura pública (PDFs assinados), escrita por usuário dono da pasta
create policy "Public read certificates"
  on storage.objects for select
  using (bucket_id = 'certificates');
create policy "Users upload own certificates"
  on storage.objects for insert
  with check (bucket_id = 'certificates' and auth.uid()::text = (storage.foldername(name))[1]);
