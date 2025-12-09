-- Create profiles table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  full_name text,
  primary key (id)
);

alter table public.profiles enable row level security;

-- Create projects table
create table public.projects (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  primary key (id)
);

alter table public.projects enable row level security;

-- Create jobs table
create table public.jobs (
  id uuid not null default gen_random_uuid(),
  project_id uuid not null references public.projects on delete cascade,
  status text check (status in ('queued', 'processing', 'success', 'failed')) not null default 'queued',
  logs text,
  primary key (id)
);

alter table public.jobs enable row level security;

-- Create artifacts table
create table public.artifacts (
  id uuid not null default gen_random_uuid(),
  project_id uuid not null references public.projects on delete cascade,
  storage_path text not null,
  file_type text check (file_type in ('pdf', 'zip')) not null,
  primary key (id)
);

alter table public.artifacts enable row level security;

-- Set up Row Level Security (RLS)
-- For now, we'll allow authenticated users to do everything on their own data
-- Profiles
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Projects
create policy "Users can view their own projects" on public.projects
  for select using (auth.uid() = user_id);
create policy "Users can insert their own projects" on public.projects
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own projects" on public.projects
  for update using (auth.uid() = user_id);
create policy "Users can delete their own projects" on public.projects
  for delete using (auth.uid() = user_id);

-- Jobs (inherit from project)
create policy "Users can view jobs for their projects" on public.jobs
  for select using (
    exists (
      select 1 from public.projects
      where projects.id = jobs.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Artifacts (inherit from project)
create policy "Users can view artifacts for their projects" on public.artifacts
  for select using (
    exists (
      select 1 from public.projects
      where projects.id = artifacts.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
