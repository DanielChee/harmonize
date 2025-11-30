-- STORAGE: spotify-assets
-- FIX: Allow UPSERT (Insert, Update, Delete) for authenticated users on their own files.

-- 1. Drop existing policies to ensure a clean slate
drop policy if exists "Public View" on storage.objects;
drop policy if exists "Authenticated Insert" on storage.objects;
drop policy if exists "Authenticated Select" on storage.objects;
drop policy if exists "Admin Full Access" on storage.objects;
drop policy if exists "Authenticated Update" on storage.objects;
drop policy if exists "Authenticated Delete" on storage.objects;

-- 2. Policy: Public Read Access (Required for displaying images)
create policy "Public View"
on storage.objects for select
using ( bucket_id = 'spotify-assets' );

-- 3. Policy: Authenticated Insert (Upload)
create policy "Authenticated Insert"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'spotify-assets' );

-- 4. Policy: Authenticated Update (Overwrite own files)
create policy "Authenticated Update"
on storage.objects for update
to authenticated
using ( bucket_id = 'spotify-assets' and auth.uid() = owner );

-- 5. Policy: Authenticated Delete (Remove own files)
create policy "Authenticated Delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'spotify-assets' and auth.uid() = owner );

-- 6. Policy: Admin Full Access (Optional, but good for management)
create policy "Admin Full Access"
on storage.objects for all
to authenticated
using ( 
  bucket_id = 'spotify-assets' 
  and exists (
    select 1 from public.profiles 
    where id = auth.uid() 
    and role = 'admin'
  )
);
