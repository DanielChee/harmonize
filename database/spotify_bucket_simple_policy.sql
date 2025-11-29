-- STORAGE: spotify-assets
-- PURPOSE: Securely store images from Spotify.
-- ACCESS: Authenticated users can INSERT. Admins can do EVERYTHING. Public can VIEW.

-- 1. Create the bucket (if it doesn't exist)
insert into storage.buckets (id, name, public)
values ('spotify-assets', 'spotify-assets', true)
on conflict (id) do nothing;

-- 2. (Skipped) Enable RLS
-- We skip 'alter table storage.objects enable row level security' 
-- because it is enabled by default and causes permission errors.

-- 3. Drop existing policies if they exist (to allow re-running this script)
drop policy if exists "Public View" on storage.objects;
drop policy if exists "Authenticated Insert" on storage.objects;
drop policy if exists "Admin Full Access" on storage.objects;

-- 4. Policy: Public View Access
-- Anyone (even logged out users) can VIEW images. 
create policy "Public View"
on storage.objects for select
using ( bucket_id = 'spotify-assets' );

-- 5. Policy: Authenticated User Upload ONLY
-- Any logged-in user can upload files.
create policy "Authenticated Insert"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'spotify-assets' );

-- 6. Policy: Admin Full Access
-- Users with role='admin' in the profiles table can do anything.
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