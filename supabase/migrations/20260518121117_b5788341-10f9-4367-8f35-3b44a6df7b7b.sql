-- Function: sync wallet balance from disposal_events
create or replace function public.sync_wallet_on_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_delta numeric := 0;
begin
  -- Resolve user_id from operator
  if tg_op = 'DELETE' then
    select user_id into v_user_id from public.operators where id = old.operator_id;
  else
    select user_id into v_user_id from public.operators where id = new.operator_id;
  end if;

  if v_user_id is null then
    return coalesce(new, old);
  end if;

  if tg_op = 'INSERT' then
    if new.status = 'aprovado' then
      v_delta := coalesce(new.elp_amount, 0);
    end if;
  elsif tg_op = 'UPDATE' then
    -- old contribution
    if old.status = 'aprovado' then
      v_delta := v_delta - coalesce(old.elp_amount, 0);
    end if;
    -- new contribution
    if new.status = 'aprovado' then
      v_delta := v_delta + coalesce(new.elp_amount, 0);
    end if;
  elsif tg_op = 'DELETE' then
    if old.status = 'aprovado' then
      v_delta := -coalesce(old.elp_amount, 0);
    end if;
  end if;

  if v_delta <> 0 then
    insert into public.wallets (user_id, saldo_elp)
    values (v_user_id, v_delta)
    on conflict (user_id)
    do update set saldo_elp = public.wallets.saldo_elp + v_delta,
                  updated_at = now();
  end if;

  return coalesce(new, old);
end;
$$;

revoke execute on function public.sync_wallet_on_event() from public;

drop trigger if exists trg_sync_wallet_on_event on public.disposal_events;
create trigger trg_sync_wallet_on_event
after insert or update or delete on public.disposal_events
for each row execute function public.sync_wallet_on_event();

-- Ensure wallets has unique constraint on user_id for upsert
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'wallets_user_id_key' and conrelid = 'public.wallets'::regclass
  ) then
    alter table public.wallets add constraint wallets_user_id_key unique (user_id);
  end if;
end$$;

-- Backfill: recompute every wallet from approved events
with totals as (
  select o.user_id, coalesce(sum(e.elp_amount), 0) as total
  from public.operators o
  left join public.disposal_events e
    on e.operator_id = o.id and e.status = 'aprovado'
  group by o.user_id
)
insert into public.wallets (user_id, saldo_elp)
select user_id, total from totals
on conflict (user_id)
do update set saldo_elp = excluded.saldo_elp, updated_at = now();