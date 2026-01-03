-- Create the storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- DROP existing policies to avoid conflicts (if any)
drop policy if exists "Allow public uploads 123" on storage.objects;
drop policy if exists "Allow public select 123" on storage.objects;
drop policy if exists "Allow public update 123" on storage.objects;

-- ALLOW PUBLIC INSERTS
-- Note: We skipped 'alter table' because you need to be the table owner. 
-- RLS is likely already enabled on storage.objects.
create policy "Allow public uploads 123"
on storage.objects for insert
to public
with check ( bucket_id = 'product-images' );

-- ALLOW PUBLIC SELECT
create policy "Allow public select 123"
on storage.objects for select
to public
using ( bucket_id = 'product-images' );

-- ALLOW PUBLIC UPDATE
create policy "Allow public update 123"
on storage.objects for update
to public
using ( bucket_id = 'product-images' );
