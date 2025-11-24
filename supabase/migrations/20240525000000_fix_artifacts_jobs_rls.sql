-- Add missing RLS policies for artifacts table

create policy "Users can insert artifacts for their projects" on public.artifacts
  for insert with check (
    exists (
      select 1 from public.projects
      where projects.id = artifacts.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can update artifacts for their projects" on public.artifacts
  for update using (
    exists (
      select 1 from public.projects
      where projects.id = artifacts.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete artifacts for their projects" on public.artifacts
  for delete using (
    exists (
      select 1 from public.projects
      where projects.id = artifacts.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Add missing RLS policies for jobs table

create policy "Users can insert jobs for their projects" on public.jobs
  for insert with check (
    exists (
      select 1 from public.projects
      where projects.id = jobs.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can update jobs for their projects" on public.jobs
  for update using (
    exists (
      select 1 from public.projects
      where projects.id = jobs.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete jobs for their projects" on public.jobs
  for delete using (
    exists (
      select 1 from public.projects
      where projects.id = jobs.project_id
      and projects.user_id = auth.uid()
    )
  );
