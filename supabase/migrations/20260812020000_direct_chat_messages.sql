create table if not exists public.direct_chat_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  receiver_id uuid not null references public.profiles (id) on delete cascade,
  body text,
  media_type text check (media_type is null or media_type in ('audio', 'video')),
  media_path text,
  created_at timestamptz not null default now(),
  check (sender_id <> receiver_id),
  check (body is not null or media_path is not null)
);

alter table public.direct_chat_messages enable row level security;

create policy "read direct chat messages"
  on public.direct_chat_messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "insert direct chat messages"
  on public.direct_chat_messages for insert
  with check (auth.uid() = sender_id);

create policy "delete sent direct chat messages"
  on public.direct_chat_messages for delete
  using (auth.uid() = sender_id);

create policy "read requested family profiles"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1
      from public.family_requests
      where (
        (family_requests.requester_id = auth.uid() and family_requests.receiver_id = profiles.id)
        or (family_requests.receiver_id = auth.uid() and family_requests.requester_id = profiles.id)
      )
    )
  );

insert into storage.buckets (id, name, public)
values ('chat-media', 'chat-media', false)
on conflict (id) do nothing;

create policy "read direct chat media"
  on storage.objects for select
  using (
    bucket_id = 'chat-media'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or auth.uid()::text = (storage.foldername(name))[2]
    )
  );

create policy "insert direct chat media"
  on storage.objects for insert
  with check (
    bucket_id = 'chat-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
