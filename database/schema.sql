-- Harmonize Live Supabase Schema
-- Last Updated: 2025-11-28
-- This file represents the source of truth for the database schema.

-- ============================================
-- CORE TABLES
-- ============================================

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text UNIQUE,
  bio text,
  pronouns text,
  city text,
  top_genres ARRAY,
  top_artists ARRAY,
  created_at timestamp without time zone DEFAULT now(),
  academic_field text,
  mbti text,
  concert_preferences ARRAY,
  age smallint,
  profile_picture_url text,
  top_songs ARRAY,
  email text UNIQUE,
  display_name text,
  is_active boolean,
  looking_for text,
  university text,
  academic_year text,
  concert_budget text,
  concert_seating text,
  concert_transportation text,
  profile_complete boolean,
  sprint_5_variant text,
  artist_images ARRAY,
  song_images ARRAY,
  role text DEFAULT 'user'::text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE public.matches (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  matched_at timestamp without time zone DEFAULT now(),
  concert_date date,
  profile_snapshot jsonb,
  name text,
  avatar_url text,
  city text,
  age integer,
  review jsonb,
  test_profile_id text,
  CONSTRAINT matches_pkey PRIMARY KEY (id)
);

-- ============================================
-- A/B TESTING TABLES
-- ============================================

CREATE TABLE public.ab_test_assignments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id text NOT NULL UNIQUE,
  assigned_variant text NOT NULL CHECK (assigned_variant = ANY (ARRAY['A'::text, 'B'::text])),
  assigned_at timestamp without time zone DEFAULT now(),
  device_type text CHECK (device_type = ANY (ARRAY['iOS'::text, 'Android'::text])),
  app_version text,
  age integer,
  university text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT ab_test_assignments_pkey PRIMARY KEY (id)
);

CREATE TABLE public.ab_test_interactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,
  variant_shown text NOT NULL CHECK (variant_shown = ANY (ARRAY['A'::text, 'B'::text])),
  profile_id text NOT NULL,
  profile_type text NOT NULL CHECK (profile_type = ANY (ARRAY['positive'::text, 'neutral'::text, 'negative'::text])),
  profile_load_time timestamp without time zone NOT NULL,
  decision_time timestamp without time zone,
  time_spent_seconds numeric,
  decision text CHECK (decision = ANY (ARRAY['like'::text, 'pass'::text, 'block'::text, 'skip'::text])),
  decision_correct boolean,
  session_id text,
  device_type text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT ab_test_interactions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.ab_test_profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  profile_id text NOT NULL UNIQUE,
  profile_type text NOT NULL CHECK (profile_type = ANY (ARRAY['positive'::text, 'neutral'::text, 'negative'::text])),
  name text NOT NULL,
  pronouns text,
  age integer NOT NULL,
  bio text NOT NULL,
  university text NOT NULL,
  university_verified boolean DEFAULT false,
  concerts_attended integer DEFAULT 0,
  account_age_months integer NOT NULL,
  mutual_friends integer DEFAULT 0,
  reviews_type_a jsonb,
  average_rating_type_a numeric,
  badges_type_b jsonb,
  total_reviews integer NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT ab_test_profiles_pkey PRIMARY KEY (id)
);

CREATE TABLE public.ab_test_sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  session_id text NOT NULL UNIQUE,
  user_id text NOT NULL,
  started_at timestamp without time zone DEFAULT now(),
  ended_at timestamp without time zone,
  device_type text,
  app_version text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT ab_test_sessions_pkey PRIMARY KEY (id)
);
