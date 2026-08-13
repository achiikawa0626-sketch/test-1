create or replace function public.recent_profiles()
returns table (
  id uuid,
  email text,
  display_name text,
  username text,
  account_mode text
)
language sql
security definer
set search_path = public
as $$
  select
    profiles.id,
    profiles.email,
    profiles.display_name,
    profiles.username,
    profiles.account_mode
  from public.profiles
  where auth.uid() is not null
    and profiles.id <> auth.uid()
  order by profiles.updated_at desc
  limit 12;
$$;
