do $$
begin
  alter publication supabase_realtime add table public.direct_chat_messages;
exception
  when duplicate_object then null;
end $$;
