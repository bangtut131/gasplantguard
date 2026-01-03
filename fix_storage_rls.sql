-- Create the storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Enable RLS on objects (good practice, making sure we control it)
alter table storage.objects enable row level security;

-- ALLOW PUBLIC INSERTS (Fixes "new row violates row-level security policy")
-- This allows anyone (including the backend using anon key) to upload files.
-- Since the backend verifies the file type, this is an acceptable trade-off for now.
create policy "Allow public uploads 123"
on storage.objects for insert
to public
with check ( bucket_id = 'product-images' );

-- ALLOW PUBLIC SELECT (Viewing images)
create policy "Allow public select 123"
on storage.objects for select
to public
using ( bucket_id = 'product-images' );

-- OPTIONAL: Allow update/delete if needed
create policy "Allow public update 123"
on storage.objects for update
to public
using ( bucket_id = 'product-images' );
