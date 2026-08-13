create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  role text not null check (role in ('grandma', 'grandpa', 'mom', 'dad', 'me')),
  birth_year int check (birth_year is null or birth_year between 1900 and 2026),
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  family_member_id uuid not null references public.family_members (id) on delete cascade,
  question text not null,
  topic text not null check (topic in ('Grandma at My Age', 'Childhood', 'Love and Family', 'Hard Choices', 'Advice for Me', 'Traditions')),
  created_at timestamptz not null default now()
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  family_member_id uuid not null references public.family_members (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  answer_text text,
  audio_path text,
  topic text not null check (topic in ('Grandma at My Age', 'Childhood', 'Love and Family', 'Hard Choices', 'Advice for Me', 'Traditions')),
  memory_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.family_members enable row level security;
alter table public.questions enable row level security;
alter table public.memories enable row level security;

create policy "read own family members"
  on public.family_members for select
  using (auth.uid() = user_id);

create policy "insert own family members"
  on public.family_members for insert
  with check (auth.uid() = user_id);

create policy "update own family members"
  on public.family_members for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete own family members"
  on public.family_members for delete
  using (auth.uid() = user_id);

create policy "read own questions"
  on public.questions for select
  using (auth.uid() = user_id);

create policy "insert own questions"
  on public.questions for insert
  with check (auth.uid() = user_id);

create policy "update own questions"
  on public.questions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete own questions"
  on public.questions for delete
  using (auth.uid() = user_id);

create policy "read own memories"
  on public.memories for select
  using (auth.uid() = user_id);

create policy "insert own memories"
  on public.memories for insert
  with check (auth.uid() = user_id);

create policy "update own memories"
  on public.memories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete own memories"
  on public.memories for delete
  using (auth.uid() = user_id);
