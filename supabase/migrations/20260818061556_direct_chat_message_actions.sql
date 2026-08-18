create table if not exists public.direct_chat_message_actions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.direct_chat_messages (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  action_type text not null check (action_type in ('favorite', 'pin')),
  pin_duration text,
  pinned_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (message_id, user_id, action_type),
  check (
    (action_type = 'pin' and pin_duration is not null and pinned_until is not null)
    or (action_type = 'favorite' and pin_duration is null and pinned_until is null)
  )
);

alter table public.direct_chat_message_actions enable row level security;

create policy "read direct chat message actions"
  on public.direct_chat_message_actions for select
  using (
    exists (
      select 1
      from public.direct_chat_messages
      where direct_chat_messages.id = direct_chat_message_actions.message_id
        and (
          direct_chat_messages.sender_id = auth.uid()
          or direct_chat_messages.receiver_id = auth.uid()
        )
    )
  );

create policy "insert own direct chat message actions"
  on public.direct_chat_message_actions for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.direct_chat_messages
      where direct_chat_messages.id = direct_chat_message_actions.message_id
        and (
          direct_chat_messages.sender_id = auth.uid()
          or direct_chat_messages.receiver_id = auth.uid()
        )
    )
  );

create policy "update own direct chat message actions"
  on public.direct_chat_message_actions for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.direct_chat_messages
      where direct_chat_messages.id = direct_chat_message_actions.message_id
        and (
          direct_chat_messages.sender_id = auth.uid()
          or direct_chat_messages.receiver_id = auth.uid()
        )
    )
  );

create policy "delete own direct chat message actions"
  on public.direct_chat_message_actions for delete
  using (user_id = auth.uid());

do $$
begin
  alter publication supabase_realtime add table public.direct_chat_reactions;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.direct_chat_message_actions;
exception
  when duplicate_object then null;
end $$;
