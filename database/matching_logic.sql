-- FUNCTION: get_potential_matches
-- PURPOSE: Finds potential concert buddies based on shared music taste and proximity.
-- LOGIC:
-- 1. Filters out the requesting user.
-- 2. Filters out users who are not "active" or "profile_complete".
-- 3. Calculates a 'match_score' based on:
--    - Shared Genres (3 points each)
--    - Shared Artists (5 points each)
--    - Same City (10 points)
--    - Same University (5 points)
-- 4. Returns users ordered by match_score DESC.

-- DROP first to allow return type changes (adding image arrays)
DROP FUNCTION IF EXISTS get_potential_matches(uuid, int);

create or replace function get_potential_matches(
  requesting_user_id uuid,
  limit_count int default 20
)
returns table (
  id uuid,
  username text,
  display_name text,
  bio text,
  profile_picture_url text,
  top_genres text[],
  top_artists text[],
  top_songs text[],
  artist_images text[],
  song_images text[],
  city text,
  university text,
  match_score bigint
)
language plpgsql
security definer
as $$
declare
  my_genres text[];
  my_artists text[];
  my_city text;
  my_uni text;
begin
  -- Get requesting user's preferences
  select p.top_genres, p.top_artists, p.city, p.university
  into my_genres, my_artists, my_city, my_uni
  from profiles p
  where p.id = requesting_user_id;

  return query
  select
    p.id,
    p.username,
    p.display_name,
    p.bio,
    p.profile_picture_url,
    p.top_genres::text[],
    p.top_artists::text[],
    p.top_songs::text[],
    p.artist_images::text[],
    p.song_images::text[],
    p.city,
    p.university,
    (
      -- Score Calculation
      (select count(*) from unnest(p.top_genres) g where g = any(my_genres)) * 3 +
      (select count(*) from unnest(p.top_artists) a where a = any(my_artists)) * 5 +
      (case when p.city = my_city then 10 else 0 end) +
      (case when p.university = my_uni then 5 else 0 end)
    ) as match_score
  from profiles p
  where p.id != requesting_user_id
    and p.profile_complete = true
    and p.is_active = true
  order by match_score desc
  limit limit_count;
end;
$$;