-- Create chat_messages table
create table public.chat_messages (
  id uuid not null default gen_random_uuid(),
  project_id uuid not null references public.projects on delete cascade,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  created_at timestamptz not null default now(),
  primary key (id)
);

alter table public.chat_messages enable row level security;

create policy "Users can view chat messages for their projects" on public.chat_messages
  for select using (
    exists (
      select 1 from public.projects
      where projects.id = chat_messages.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert chat messages for their projects" on public.chat_messages
  for insert with check (
    exists (
      select 1 from public.projects
      where projects.id = chat_messages.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Create resume_versions table
create table public.resume_versions (
  id uuid not null default gen_random_uuid(),
  project_id uuid not null references public.projects on delete cascade,
  chat_message_id uuid references public.chat_messages on delete set null,
  patch_content jsonb, -- The patch operations array
  full_code text, -- Snapshot of the code after the patch
  created_at timestamptz not null default now(),
  primary key (id)
);

alter table public.resume_versions enable row level security;

create policy "Users can view resume versions for their projects" on public.resume_versions
  for select using (
    exists (
      select 1 from public.projects
      where projects.id = resume_versions.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert resume versions for their projects" on public.resume_versions
  for insert with check (
    exists (
      select 1 from public.projects
      where projects.id = resume_versions.project_id
      and projects.user_id = auth.uid()
    )
  );
