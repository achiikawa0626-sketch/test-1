drop function if exists public.search_profiles(text);

create function public.search_profiles(search_text text)
returns table (
  id uuid,
  email text,
  display_name text,
  username text,
  account_mode text,
  avatar_path text
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
    profiles.account_mode,
    profiles.avatar_path
  from public.profiles
  where auth.uid() is not null
    and profiles.id <> auth.uid()
    and length(trim(search_text)) >= 2
    and (
      profiles.email ilike '%' || trim(search_text) || '%'
      or profiles.display_name ilike '%' || trim(search_text) || '%'
      or profiles.username ilike '%' || trim(search_text) || '%'
    )
  order by
    case
      when lower(profiles.username) = lower(trim(search_text)) then 0
      when lower(profiles.email) = lower(trim(search_text)) then 1
      else 2
    end,
    profiles.updated_at desc
  limit 12;
$$;

drop policy if exists "read profile avatars while searching" on storage.objects;

create policy "read profile avatars while searching"
  on storage.objects for select
  using (
    bucket_id = 'profile-avatars'
    and auth.uid() is not null
  );
