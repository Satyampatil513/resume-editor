
-- Ensure RLS policies for artifacts are correctly applied
-- Drop existing policies to avoid conflicts
drop policy if exists "Users can view artifacts for their projects" on public.artifacts;
drop policy if exists "Users can insert artifacts for their projects" on public.artifacts;
drop policy if exists "Users can update artifacts for their projects" on public.artifacts;
drop policy if exists "Users can delete artifacts for their projects" on public.artifacts;

-- Re-create policies
create policy "Users can view artifacts for their projects" on public.artifacts
  for select using (
    exists (
      select 1 from public.projects
      where projects.id = artifacts.project_id
      and projects.user_id = auth.uid()
    )
  );

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
