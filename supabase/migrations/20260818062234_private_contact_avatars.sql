create table if not exists public.private_contact_avatars (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  contact_id uuid not null references public.profiles (id) on delete cascade,
  avatar_path text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, contact_id),
  check (owner_id <> contact_id)
);

alter table public.private_contact_avatars enable row level security;

create policy "read own private contact avatars"
  on public.private_contact_avatars for select
  using (owner_id = auth.uid());

create policy "insert own private contact avatars"
  on public.private_contact_avatars for insert
  with check (owner_id = auth.uid());

create policy "update own private contact avatars"
  on public.private_contact_avatars for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "delete own private contact avatars"
  on public.private_contact_avatars for delete
  using (owner_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('private-contact-avatars', 'private-contact-avatars', false)
on conflict (id) do nothing;

create policy "read own private contact avatar files"
  on storage.objects for select
  using (
    bucket_id = 'private-contact-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "insert own private contact avatar files"
  on storage.objects for insert
  with check (
    bucket_id = 'private-contact-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "update own private contact avatar files"
  on storage.objects for update
  using (
    bucket_id = 'private-contact-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'private-contact-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "delete own private contact avatar files"
  on storage.objects for delete
  using (
    bucket_id = 'private-contact-avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
