-- Create storage bucket for resume files
insert into storage.buckets (id, name, public)
values ('resume-files', 'resume-files', false);

-- Set up RLS policies for storage
create policy "Users can upload their own resume files"
on storage.objects for insert
with check (
  bucket_id = 'resume-files' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can view their own resume files"
on storage.objects for select
using (
  bucket_id = 'resume-files'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their own resume files"
on storage.objects for update
using (
  bucket_id = 'resume-files'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own resume files"
on storage.objects for delete
using (
  bucket_id = 'resume-files'
  and auth.uid()::text = (storage.foldername(name))[1]
);
