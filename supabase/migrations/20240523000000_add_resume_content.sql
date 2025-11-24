-- Add resume content table to store resume data
create table public.resume_content (
  id uuid not null default gen_random_uuid(),
  project_id uuid not null references public.projects on delete cascade,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (id),
  unique(project_id)
);

alter table public.resume_content enable row level security;

-- RLS policies for resume_content
create policy "Users can view resume content for their projects" on public.resume_content
  for select using (
    exists (
      select 1 from public.projects
      where projects.id = resume_content.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert resume content for their projects" on public.resume_content
  for insert with check (
    exists (
      select 1 from public.projects
      where projects.id = resume_content.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can update resume content for their projects" on public.resume_content
  for update using (
    exists (
      select 1 from public.projects
      where projects.id = resume_content.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete resume content for their projects" on public.resume_content
  for delete using (
    exists (
      select 1 from public.projects
      where projects.id = resume_content.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Function to auto-update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger update_resume_content_updated_at
  before update on public.resume_content
  for each row execute procedure public.update_updated_at_column();
