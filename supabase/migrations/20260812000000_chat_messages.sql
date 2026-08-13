create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  memory_id uuid not null references public.memories (id) on delete cascade,
  sender_role text not null check (sender_role in ('kid', 'grandparent')),
  body text,
  media_type text check (media_type is null or media_type in ('audio', 'video')),
  media_path text,
  created_at timestamptz not null default now(),
  check (body is not null or media_path is not null)
);

alter table public.chat_messages enable row level security;

create policy "read own chat messages"
  on public.chat_messages for select
  using (auth.uid() = user_id);

create policy "insert own chat messages"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

create policy "update own chat messages"
  on public.chat_messages for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete own chat messages"
  on public.chat_messages for delete
  using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('chat-media', 'chat-media', false)
on conflict (id) do nothing;

create policy "read own chat media"
  on storage.objects for select
  using (
    bucket_id = 'chat-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "insert own chat media"
  on storage.objects for insert
  with check (
    bucket_id = 'chat-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "delete own chat media"
  on storage.objects for delete
  using (
    bucket_id = 'chat-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
