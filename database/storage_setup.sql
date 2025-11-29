-- STORAGE: spotify-assets
-- PURPOSE: Securely store images fetched from Spotify to prevent link rot.

-- 1. Create the bucket
insert into storage.buckets (id, name, public)
values ('spotify-assets', 'spotify-assets', true)
on conflict (id) do nothing;

-- 2. Enable RLS
alter table storage.objects enable row level security;

-- 3. Policy: Public Read Access
-- Allow anyone to view the images (needed for profile display)
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'spotify-assets' );

-- 4. Policy: Authenticated Upload Access
-- Allow authenticated users to upload files
create policy "Authenticated Upload"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'spotify-assets' );

-- 5. Policy: Owner Update/Delete
-- Allow users to update/delete their own files
create policy "Owner Manage"
on storage.objects for all
to authenticated
using ( bucket_id = 'spotify-assets' and auth.uid() = owner );
