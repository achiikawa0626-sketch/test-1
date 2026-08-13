create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null,
  account_mode text not null check (account_mode in ('kid', 'grandparent')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> receiver_id),
  unique (requester_id, receiver_id)
);

alter table public.profiles enable row level security;
alter table public.family_requests enable row level security;

create policy "read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "read own family requests"
  on public.family_requests for select
  using (auth.uid() = requester_id or auth.uid() = receiver_id);

create policy "insert sent family requests"
  on public.family_requests for insert
  with check (auth.uid() = requester_id);

create policy "update received family requests"
  on public.family_requests for update
  using (auth.uid() = receiver_id)
  with check (auth.uid() = receiver_id);

create policy "delete own family requests"
  on public.family_requests for delete
  using (auth.uid() = requester_id or auth.uid() = receiver_id);

create or replace function public.search_profiles(search_text text)
returns table (
  id uuid,
  email text,
  display_name text,
  account_mode text
)
language sql
security definer
set search_path = public
as $$
  select profiles.id, profiles.email, profiles.display_name, profiles.account_mode
  from public.profiles
  where auth.uid() is not null
    and profiles.id <> auth.uid()
    and (
      profiles.email ilike '%' || search_text || '%'
      or profiles.display_name ilike '%' || search_text || '%'
    )
  order by profiles.updated_at desc
  limit 8;
$$;
