drop policy if exists "read request profile cards" on public.profiles;

create policy "read request profile cards"
  on public.profiles for select
  using (
    auth.uid() is not null
    and (
      auth.uid() = id
      or exists (
        select 1
        from public.family_requests
        where (
          family_requests.requester_id = auth.uid()
          and family_requests.receiver_id = profiles.id
        )
        or (
          family_requests.receiver_id = auth.uid()
          and family_requests.requester_id = profiles.id
        )
      )
    )
  );

drop function if exists public.search_profiles(text);

create function public.search_profiles(search_text text)
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
