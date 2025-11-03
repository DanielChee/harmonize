-- ============================================
-- Harmonize - Sprint 4 Passive A/B Testing Schema
-- Behavioral testing: Users naturally swipe, we track decisions
-- Variant A: Amazon-style reviews vs Variant B: Badge system
-- ============================================

-- ============================================
-- 1. User Variant Assignments
-- Tracks which variant each user is assigned to
-- ============================================
CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE, -- Participant ID (e.g., "P001", "P002")
  assigned_variant TEXT NOT NULL CHECK (assigned_variant IN ('A', 'B')),
  assigned_at TIMESTAMP DEFAULT NOW(),

  -- Device metadata
  device_type TEXT CHECK (device_type IN ('iOS', 'Android')),
  app_version TEXT,

  -- User demographics (optional, for segmentation)
  age INTEGER,
  university TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ab_assignments_user ON ab_test_assignments(user_id);
CREATE INDEX idx_ab_assignments_variant ON ab_test_assignments(assigned_variant);

-- RLS Policy (Prototyping mode - allow all)
ALTER TABLE ab_test_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for testing" ON ab_test_assignments
FOR ALL
USING (true)
WITH CHECK (true);


-- ============================================
-- 2. Profile Interactions (Core Behavioral Data)
-- Tracks every swipe decision on test profiles
-- ============================================
CREATE TABLE IF NOT EXISTS ab_test_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User & Assignment
  user_id TEXT NOT NULL,
  variant_shown TEXT NOT NULL CHECK (variant_shown IN ('A', 'B')),

  -- Profile Info
  profile_id TEXT NOT NULL, -- e.g., "test-positive", "test-neutral", "test-negative"
  profile_type TEXT NOT NULL CHECK (profile_type IN ('positive', 'neutral', 'negative')),

  -- Behavioral Metrics
  profile_load_time TIMESTAMP NOT NULL, -- When profile appeared
  decision_time TIMESTAMP, -- When user made decision
  time_spent_seconds NUMERIC(10, 2), -- Total time viewing profile

  -- User Decision
  decision TEXT CHECK (decision IN ('like', 'pass', 'block', 'skip')), -- skip = timeout/no decision
  decision_correct BOOLEAN, -- Matches expected behavior

  -- Session metadata
  session_id TEXT, -- For grouping interactions in same session
  device_type TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ab_interactions_user ON ab_test_interactions(user_id);
CREATE INDEX idx_ab_interactions_variant ON ab_test_interactions(variant_shown);
CREATE INDEX idx_ab_interactions_profile_type ON ab_test_interactions(profile_type);
CREATE INDEX idx_ab_interactions_decision ON ab_test_interactions(decision);
CREATE INDEX idx_ab_interactions_session ON ab_test_interactions(session_id);
CREATE INDEX idx_ab_interactions_created ON ab_test_interactions(created_at);

-- RLS Policy
ALTER TABLE ab_test_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for testing" ON ab_test_interactions
FOR ALL
USING (true)
WITH CHECK (true);


-- ============================================
-- 3. Test Profiles (Master Data)
-- Static data for positive/neutral/negative profiles
-- ============================================
CREATE TABLE IF NOT EXISTS ab_test_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id TEXT NOT NULL UNIQUE, -- e.g., "test-positive"
  profile_type TEXT NOT NULL CHECK (profile_type IN ('positive', 'neutral', 'negative')),

  -- Profile Info
  name TEXT NOT NULL,
  pronouns TEXT,
  age INTEGER NOT NULL,
  bio TEXT NOT NULL,
  university TEXT NOT NULL,
  university_verified BOOLEAN DEFAULT false,

  -- Trust Signals (controlled variables - identical for all profiles)
  concerts_attended INTEGER DEFAULT 0,
  account_age_months INTEGER NOT NULL,
  mutual_friends INTEGER DEFAULT 0,

  -- Type A Data (Amazon-style reviews)
  reviews_type_a JSONB, -- Array of review objects: [{stars, comment, reviewerName, daysAgo}]
  average_rating_type_a NUMERIC(2,1),

  -- Type B Data (Badge system)
  badges_type_b JSONB, -- {q1Badge: {emoji, name, score}, q2Badge: {...}, q3Badge: {...}, harmonies: {count, total}}

  total_reviews INTEGER NOT NULL,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ab_profiles_type ON ab_test_profiles(profile_type);
CREATE INDEX idx_ab_profiles_id ON ab_test_profiles(profile_id);

-- RLS Policy
ALTER TABLE ab_test_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for testing" ON ab_test_profiles
FOR ALL
USING (true)
WITH CHECK (true);


-- ============================================
-- 4. Session Logs (Optional - for debugging)
-- Tracks app sessions for context
-- ============================================
CREATE TABLE IF NOT EXISTS ab_test_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,

  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,

  -- Session context
  device_type TEXT,
  app_version TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ab_sessions_user ON ab_test_sessions(user_id);
CREATE INDEX idx_ab_sessions_id ON ab_test_sessions(session_id);

-- RLS Policy
ALTER TABLE ab_test_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for testing" ON ab_test_sessions
FOR ALL
USING (true)
WITH CHECK (true);


-- ============================================
-- 5. Analytics Views
-- ============================================

-- View: Overall Variant Performance
CREATE OR REPLACE VIEW ab_test_variant_performance AS
SELECT
  variant_shown,
  COUNT(*) as total_interactions,
  COUNT(DISTINCT user_id) as unique_users,

  -- Decision metrics
  SUM(CASE WHEN decision = 'like' THEN 1 ELSE 0 END) as like_count,
  SUM(CASE WHEN decision = 'pass' THEN 1 ELSE 0 END) as pass_count,
  SUM(CASE WHEN decision = 'block' THEN 1 ELSE 0 END) as block_count,
  SUM(CASE WHEN decision = 'skip' THEN 1 ELSE 0 END) as skip_count,

  -- Decision rates
  ROUND(100.0 * SUM(CASE WHEN decision = 'like' THEN 1 ELSE 0 END) / COUNT(*), 2) as like_rate_pct,
  ROUND(100.0 * SUM(CASE WHEN decision = 'pass' THEN 1 ELSE 0 END) / COUNT(*), 2) as pass_rate_pct,
  ROUND(100.0 * SUM(CASE WHEN decision = 'block' THEN 1 ELSE 0 END) / COUNT(*), 2) as block_rate_pct,

  -- Accuracy metrics
  ROUND(100.0 * SUM(CASE WHEN decision_correct = true THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_rate_pct,

  -- Time metrics
  ROUND(AVG(time_spent_seconds), 2) as avg_time_spent_seconds,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY time_spent_seconds), 2) as median_time_spent_seconds

FROM ab_test_interactions
WHERE decision IS NOT NULL
GROUP BY variant_shown
ORDER BY variant_shown;


-- View: Performance by Profile Type
CREATE OR REPLACE VIEW ab_test_profile_type_performance AS
SELECT
  variant_shown,
  profile_type,
  COUNT(*) as view_count,

  -- Decision counts
  SUM(CASE WHEN decision = 'like' THEN 1 ELSE 0 END) as like_count,
  SUM(CASE WHEN decision = 'pass' THEN 1 ELSE 0 END) as pass_count,
  SUM(CASE WHEN decision = 'block' THEN 1 ELSE 0 END) as block_count,

  -- Decision rates
  ROUND(100.0 * SUM(CASE WHEN decision = 'like' THEN 1 ELSE 0 END) / COUNT(*), 2) as like_rate_pct,
  ROUND(100.0 * SUM(CASE WHEN decision = 'pass' THEN 1 ELSE 0 END) / COUNT(*), 2) as pass_rate_pct,
  ROUND(100.0 * SUM(CASE WHEN decision = 'block' THEN 1 ELSE 0 END) / COUNT(*), 2) as block_rate_pct,

  -- Accuracy
  ROUND(100.0 * SUM(CASE WHEN decision_correct = true THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_rate_pct,

  -- Time
  ROUND(AVG(time_spent_seconds), 2) as avg_time_spent_seconds

FROM ab_test_interactions
WHERE decision IS NOT NULL
GROUP BY variant_shown, profile_type
ORDER BY variant_shown, profile_type;


-- View: User Summary
CREATE OR REPLACE VIEW ab_test_user_summary AS
SELECT
  a.user_id,
  a.assigned_variant,
  a.assigned_at,
  COUNT(i.id) as total_interactions,
  SUM(CASE WHEN i.decision_correct = true THEN 1 ELSE 0 END) as correct_decisions,
  ROUND(100.0 * SUM(CASE WHEN i.decision_correct = true THEN 1 ELSE 0 END) / NULLIF(COUNT(i.id), 0), 2) as accuracy_pct,
  ROUND(AVG(i.time_spent_seconds), 2) as avg_time_spent
FROM ab_test_assignments a
LEFT JOIN ab_test_interactions i ON a.user_id = i.user_id
GROUP BY a.user_id, a.assigned_variant, a.assigned_at
ORDER BY a.assigned_at DESC;


-- View: Hourly Interaction Volume (for monitoring)
CREATE OR REPLACE VIEW ab_test_interaction_volume AS
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  variant_shown,
  COUNT(*) as interaction_count,
  COUNT(DISTINCT user_id) as unique_users
FROM ab_test_interactions
GROUP BY DATE_TRUNC('hour', created_at), variant_shown
ORDER BY hour DESC, variant_shown;


-- ============================================
-- 6. Utility Functions
-- ============================================

-- Function: Calculate if decision is correct
CREATE OR REPLACE FUNCTION is_decision_correct(
  p_profile_type TEXT,
  p_decision TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN CASE
    WHEN p_profile_type = 'positive' AND p_decision = 'like' THEN true
    WHEN p_profile_type = 'neutral' AND p_decision IN ('like', 'pass') THEN true
    WHEN p_profile_type = 'negative' AND p_decision IN ('pass', 'block') THEN true
    ELSE false
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- Function: Get next test profile for user (not yet shown)
CREATE OR REPLACE FUNCTION get_next_test_profile(p_user_id TEXT)
RETURNS TABLE(profile_id TEXT, profile_type TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT p.profile_id, p.profile_type
  FROM ab_test_profiles p
  WHERE p.profile_id NOT IN (
    SELECT i.profile_id
    FROM ab_test_interactions i
    WHERE i.user_id = p_user_id
  )
  ORDER BY RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;


-- Function: Record interaction
CREATE OR REPLACE FUNCTION record_interaction(
  p_user_id TEXT,
  p_variant TEXT,
  p_profile_id TEXT,
  p_profile_type TEXT,
  p_decision TEXT,
  p_time_spent_seconds NUMERIC,
  p_session_id TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_interaction_id UUID;
  v_decision_correct BOOLEAN;
BEGIN
  -- Calculate if decision is correct
  v_decision_correct := is_decision_correct(p_profile_type, p_decision);

  -- Insert interaction
  INSERT INTO ab_test_interactions (
    user_id,
    variant_shown,
    profile_id,
    profile_type,
    profile_load_time,
    decision_time,
    time_spent_seconds,
    decision,
    decision_correct,
    session_id
  ) VALUES (
    p_user_id,
    p_variant,
    p_profile_id,
    p_profile_type,
    NOW() - (p_time_spent_seconds || ' seconds')::INTERVAL,
    NOW(),
    p_time_spent_seconds,
    p_decision,
    v_decision_correct,
    p_session_id
  ) RETURNING id INTO v_interaction_id;

  RETURN v_interaction_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- 7. Seed Test Profiles
-- ============================================

-- Positive Profile
INSERT INTO ab_test_profiles (
  profile_id, profile_type, name, pronouns, age, bio,
  university, university_verified, concerts_attended, account_age_months,
  mutual_friends, average_rating_type_a, total_reviews,
  reviews_type_a,
  badges_type_b
) VALUES (
  'test-positive',
  'positive',
  'Jordan Miller',
  'he/him',
  22,
  'Love live music! Always looking for concert buddies 🎶',
  'Georgia Tech',
  true,
  8,
  6,
  0,
  4.6,
  8,
  '[
    {"type": "A", "stars": 5, "comment": "Jordan was super chill and we had a great time!", "reviewerName": "Sarah K.", "daysAgo": 2},
    {"type": "A", "stars": 5, "comment": "Reliable buddy, showed up on time and had extra tickets ready. Very organized!", "reviewerName": "Mike L.", "daysAgo": 5},
    {"type": "A", "stars": 5, "comment": "Good vibes, would definitely go to another show together!", "reviewerName": "Alex P.", "daysAgo": 7},
    {"type": "A", "stars": 4, "comment": "Met at Terminal West, really fun night. Would meet up again.", "reviewerName": "Jamie R.", "daysAgo": 12},
    {"type": "A", "stars": 4, "comment": "Cool person, we didn''t click musically but still enjoyable.", "reviewerName": "Taylor M.", "daysAgo": 18},
    {"type": "A", "stars": 5, "comment": "Solid concert buddy, no complaints. Very chill!", "reviewerName": "Chris D.", "daysAgo": 21},
    {"type": "A", "stars": 5, "comment": "Jordan introduced me to some new artists, awesome experience!", "reviewerName": "Morgan F.", "daysAgo": 28},
    {"type": "A", "stars": 4, "comment": "Had a blast at the festival together!", "reviewerName": "Riley B.", "daysAgo": 35}
  ]'::jsonb,
  '{
    "q1Badge": {"emoji": "🏆", "name": "Platinum Tier"},
    "q2Badge": {"emoji": "🎉", "name": "Gold Tier"},
    "q3Badge": {"emoji": "🪨", "name": "Diamond Tier"},
    "harmonies": {"count": 7, "total": 8}
  }'::jsonb
) ON CONFLICT (profile_id) DO NOTHING;


-- Neutral Profile (NEW USER - NO REVIEWS)
INSERT INTO ab_test_profiles (
  profile_id, profile_type, name, pronouns, age, bio,
  university, university_verified, concerts_attended, account_age_months,
  mutual_friends, average_rating_type_a, total_reviews,
  reviews_type_a,
  badges_type_b
) VALUES (
  'test-neutral',
  'neutral',
  'Sam Taylor',
  'they/them',
  22,
  'Love live music! Always looking for concert buddies 🎶',
  'Georgia Tech',
  true,
  8,
  6,
  0,
  0,
  0,
  '[]'::jsonb,
  '{
    "q1Badge": null,
    "q2Badge": null,
    "q3Badge": null,
    "harmonies": {"count": 0, "total": 0}
  }'::jsonb
) ON CONFLICT (profile_id) DO NOTHING;


-- Negative Profile (OBVIOUSLY BAD REVIEWS)
INSERT INTO ab_test_profiles (
  profile_id, profile_type, name, pronouns, age, bio,
  university, university_verified, concerts_attended, account_age_months,
  mutual_friends, average_rating_type_a, total_reviews,
  reviews_type_a,
  badges_type_b
) VALUES (
  'test-negative',
  'negative',
  'Alex Johnson',
  'she/her',
  22,
  'Love live music! Always looking for concert buddies 🎶',
  'Georgia Tech',
  true,
  8,
  6,
  0,
  1.5,
  6,
  '[
    {"type": "A", "stars": 1, "comment": "Showed up 30 minutes late with no apology or heads up.", "reviewerName": "Sam J.", "daysAgo": 5},
    {"type": "A", "stars": 1, "comment": "Flaked last minute on tickets, had to scramble to find new ones.", "reviewerName": "Alex T.", "daysAgo": 12},
    {"type": "A", "stars": 2, "comment": "Really pushy about going to after-party when I said I was tired. Uncomfortable.", "reviewerName": "Morgan P.", "daysAgo": 18},
    {"type": "A", "stars": 1, "comment": "Spent the whole show on their phone instead of watching the band.", "reviewerName": "Riley K.", "daysAgo": 25},
    {"type": "A", "stars": 2, "comment": "Seemed nice at first but kept asking to borrow money?", "reviewerName": "Jordan L.", "daysAgo": 32},
    {"type": "A", "stars": 2, "comment": "Not a good experience overall. Wouldn''t recommend meeting up.", "reviewerName": "Casey R.", "daysAgo": 40}
  ]'::jsonb,
  '{
    "q1Badge": null,
    "q2Badge": {"emoji": "🎧", "name": "Bronze Tier"},
    "q3Badge": {"emoji": "🎵", "name": "Bronze Tier"},
    "harmonies": {"count": 0, "total": 6}
  }'::jsonb
) ON CONFLICT (profile_id) DO NOTHING;


-- ============================================
-- 8. Example Queries for Analysis
-- ============================================

-- Check overall variant performance
-- SELECT * FROM ab_test_variant_performance;

-- Compare variants by profile type
-- SELECT * FROM ab_test_profile_type_performance;

-- Get all users and their performance
-- SELECT * FROM ab_test_user_summary;

-- Export all data for participant P001
-- SELECT * FROM ab_test_interactions WHERE user_id = 'P001' ORDER BY created_at;

-- Get interaction volume over time
-- SELECT * FROM ab_test_interaction_volume;


-- ============================================
-- 9. Reset Function (for development)
-- ============================================

CREATE OR REPLACE FUNCTION reset_ab_test_data()
RETURNS VOID AS $$
BEGIN
  DELETE FROM ab_test_interactions;
  DELETE FROM ab_test_sessions;
  DELETE FROM ab_test_assignments;

  RAISE NOTICE 'All A/B test data has been reset (profiles preserved)';
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- Schema Complete
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Harmonize A/B Testing Schema Ready';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables:';
  RAISE NOTICE '  - ab_test_assignments (user variant assignment)';
  RAISE NOTICE '  - ab_test_interactions (behavioral data)';
  RAISE NOTICE '  - ab_test_profiles (test profiles)';
  RAISE NOTICE '  - ab_test_sessions (session tracking)';
  RAISE NOTICE '';
  RAISE NOTICE 'Views:';
  RAISE NOTICE '  - ab_test_variant_performance';
  RAISE NOTICE '  - ab_test_profile_type_performance';
  RAISE NOTICE '  - ab_test_user_summary';
  RAISE NOTICE '  - ab_test_interaction_volume';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions:';
  RAISE NOTICE '  - is_decision_correct()';
  RAISE NOTICE '  - get_next_test_profile()';
  RAISE NOTICE '  - record_interaction()';
  RAISE NOTICE '  - reset_ab_test_data()';
  RAISE NOTICE '========================================';
END $$;
