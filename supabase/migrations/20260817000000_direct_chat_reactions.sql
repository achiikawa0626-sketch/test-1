create table if not exists public.direct_chat_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.direct_chat_messages (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  reaction text not null check (char_length(reaction) between 1 and 12),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (message_id, user_id)
);

alter table public.direct_chat_reactions enable row level security;

create policy "read direct chat reactions"
  on public.direct_chat_reactions for select
  using (
    exists (
      select 1
      from public.direct_chat_messages
      where direct_chat_messages.id = direct_chat_reactions.message_id
        and (
          direct_chat_messages.sender_id = auth.uid()
          or direct_chat_messages.receiver_id = auth.uid()
        )
    )
  );

create policy "insert own direct chat reactions"
  on public.direct_chat_reactions for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.direct_chat_messages
      where direct_chat_messages.id = direct_chat_reactions.message_id
        and (
          direct_chat_messages.sender_id = auth.uid()
          or direct_chat_messages.receiver_id = auth.uid()
        )
    )
  );

create policy "update own direct chat reactions"
  on public.direct_chat_reactions for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "delete own direct chat reactions"
  on public.direct_chat_reactions for delete
  using (user_id = auth.uid());
