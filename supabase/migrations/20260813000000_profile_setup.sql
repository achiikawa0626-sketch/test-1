alter table public.profiles
add column if not exists username text,
add column if not exists avatar_path text;

create unique index if not exists profiles_username_unique
on public.profiles (lower(username))
where username is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_username_format'
  ) then
    alter table public.profiles
    add constraint profiles_username_format
    check (
      username is null
      or (
        username ~ '^[a-z0-9_]{3,20}$'
        and username !~ '(admin|support|moderator|fuck|shit|bitch|dick|asshole)'
      )
    );
  end if;
end $$;

create or replace function public.search_profiles(search_text text)
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
    and (
      profiles.email ilike '%' || search_text || '%'
      or profiles.display_name ilike '%' || search_text || '%'
      or profiles.username ilike '%' || search_text || '%'
    )
  order by profiles.updated_at desc
  limit 8;
$$;

insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', false)
on conflict (id) do nothing;

create policy "read profile avatars"
  on storage.objects for select
  using (
    bucket_id = 'profile-avatars'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or exists (
        select 1
        from public.family_requests
        where status = 'accepted'
          and (
            (
              family_requests.requester_id = auth.uid()
              and family_requests.receiver_id::text = (storage.foldername(name))[1]
            )
            or (
              family_requests.receiver_id = auth.uid()
              and family_requests.requester_id::text = (storage.foldername(name))[1]
            )
          )
      )
    )
  );

create policy "insert own profile avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "update own profile avatars"
  on storage.objects for update
  using (
    bucket_id = 'profile-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'profile-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
