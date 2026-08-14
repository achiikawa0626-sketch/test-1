create table if not exists public.chat_streaks (
  user_id uuid primary key references auth.users (id) on delete cascade,
  current_streak integer not null default 0 check (current_streak >= 0),
  best_streak integer not null default 0 check (best_streak >= 0),
  last_chat_date date,
  updated_at timestamptz not null default now()
);

alter table public.chat_streaks enable row level security;

create policy "read own chat streak"
  on public.chat_streaks for select
  using (auth.uid() = user_id);

create policy "insert own chat streak"
  on public.chat_streaks for insert
  with check (auth.uid() = user_id);

create policy "update own chat streak"
  on public.chat_streaks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.record_chat_streak()
returns table (
  current_streak integer,
  best_streak integer,
  last_chat_date date
)
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := current_date;
  existing public.chat_streaks%rowtype;
  next_streak integer;
begin
  if auth.uid() is null then
    raise exception 'Log in before updating streak.';
  end if;

  select * into existing
  from public.chat_streaks
  where user_id = auth.uid();

  if not found then
    insert into public.chat_streaks (user_id, current_streak, best_streak, last_chat_date)
    values (auth.uid(), 1, 1, today)
    returning chat_streaks.current_streak, chat_streaks.best_streak, chat_streaks.last_chat_date
    into current_streak, best_streak, last_chat_date;
    return next;
  end if;

  if existing.last_chat_date = today then
    next_streak := existing.current_streak;
  elsif existing.last_chat_date = today - 1 then
    next_streak := existing.current_streak + 1;
  else
    next_streak := 1;
  end if;

  update public.chat_streaks
  set
    current_streak = next_streak,
    best_streak = greatest(existing.best_streak, next_streak),
    last_chat_date = today,
    updated_at = now()
  where user_id = auth.uid()
  returning chat_streaks.current_streak, chat_streaks.best_streak, chat_streaks.last_chat_date
  into current_streak, best_streak, last_chat_date;

  return next;
end;
$$;
