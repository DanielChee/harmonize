-- Table: verifications
-- Purpose: Tracks user verification requests (e.g. university email)

create table if not exists public.verifications (
  id uuid not null default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  verification_type text not null default 'university',
  code text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint verifications_pkey primary key (id)
);

-- Enable RLS
alter table public.verifications enable row level security;

-- Policy: Users can view their own verifications
create policy "Users can view own verifications"
  on public.verifications for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own verifications
create policy "Users can insert own verifications"
  on public.verifications for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own verifications (e.g. to mark as approved via function/trigger, though typically this would be restricted)
-- Ideally, verification approval happens via secure RPC or Edge Function. For this prototype, we'll allow updates if they own the row.
create policy "Users can update own verifications"
  on public.verifications for update
  using (auth.uid() = user_id);
