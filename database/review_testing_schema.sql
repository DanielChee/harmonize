-- ============================================
-- Harmonize - Sprint 4 A/B Testing Database Schema
-- Review System Testing Tables
-- Created: 2025-11-02
-- ============================================

-- ============================================
-- 1. Testing Sessions Table
-- Tracks overall test session metadata
-- ============================================
CREATE TABLE IF NOT EXISTS review_testing_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id TEXT NOT NULL UNIQUE,
  variant_group TEXT NOT NULL CHECK (variant_group IN ('A', 'B')),
  creation_order TEXT NOT NULL CHECK (creation_order IN ('A_then_B', 'B_then_A')),
  age INTEGER,
  gender TEXT,
  university TEXT,
  device_type TEXT CHECK (device_type IN ('iOS', 'Android')),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  notes TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_review_sessions_participant ON review_testing_sessions(participant_id);
CREATE INDEX idx_review_sessions_variant ON review_testing_sessions(variant_group);
CREATE INDEX idx_review_sessions_completed ON review_testing_sessions(completed_at);

-- RLS Policy (Prototyping mode - allow all)
ALTER TABLE review_testing_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for testing" ON review_testing_sessions
FOR ALL
USING (true)
WITH CHECK (true);


-- ============================================
-- 2. Review Creation Metrics Table
-- Tracks metrics when users CREATE reviews (Stage 1)
-- ============================================
CREATE TABLE IF NOT EXISTS review_creation_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES review_testing_sessions(id) ON DELETE CASCADE,
  review_type TEXT NOT NULL CHECK (review_type IN ('A', 'B')),

  -- Time metrics
  time_to_complete_seconds INTEGER NOT NULL,

  -- Type A metrics (Amazon-style: 1-5 star + comment)
  rating_given INTEGER CHECK (rating_given >= 1 AND rating_given <= 5),
  comment_text TEXT,
  comment_length INTEGER,

  -- Type B metrics (Survey: 3 questions + harmonize)
  q1_rating INTEGER CHECK (q1_rating >= 1 AND q1_rating <= 5),
  q2_rating INTEGER CHECK (q2_rating >= 1 AND q2_rating <= 5),
  q3_rating INTEGER CHECK (q3_rating >= 1 AND q3_rating <= 5),
  harmonize_selected BOOLEAN,

  -- Post-task survey
  comfort_level INTEGER CHECK (comfort_level >= 1 AND comfort_level <= 7),
  honesty_level INTEGER CHECK (honesty_level >= 1 AND honesty_level <= 7),
  difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 7),
  open_feedback TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_review_creation_session ON review_creation_metrics(session_id);
CREATE INDEX idx_review_creation_type ON review_creation_metrics(review_type);

-- RLS Policy
ALTER TABLE review_creation_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for testing" ON review_creation_metrics
FOR ALL
USING (true)
WITH CHECK (true);


-- ============================================
-- 3. Profile Viewing Metrics Table
-- Tracks metrics when users VIEW profiles with reviews (Stage 2)
-- ============================================
CREATE TABLE IF NOT EXISTS profile_viewing_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES review_testing_sessions(id) ON DELETE CASCADE,
  profile_type TEXT NOT NULL CHECK (profile_type IN ('positive', 'neutral', 'negative')),
  profile_id UUID NOT NULL,
  review_variant_shown TEXT NOT NULL CHECK (review_variant_shown IN ('A', 'B')),

  -- Time metrics
  time_to_decision_seconds INTEGER NOT NULL,
  time_on_reviews_seconds INTEGER,

  -- Decision metrics
  decision_made TEXT NOT NULL CHECK (decision_made IN ('like', 'pass', 'block')),
  decision_correct BOOLEAN NOT NULL,

  -- Post-decision survey
  trust_rating INTEGER NOT NULL CHECK (trust_rating >= 1 AND trust_rating <= 10),
  confidence_level INTEGER NOT NULL CHECK (confidence_level >= 1 AND confidence_level <= 7),
  recall_correct BOOLEAN NOT NULL,
  recall_answer TEXT,
  reasoning TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profile_viewing_session ON profile_viewing_metrics(session_id);
CREATE INDEX idx_profile_viewing_type ON profile_viewing_metrics(profile_type);
CREATE INDEX idx_profile_viewing_variant ON profile_viewing_metrics(review_variant_shown);
CREATE INDEX idx_profile_viewing_decision ON profile_viewing_metrics(decision_made);

-- RLS Policy
ALTER TABLE profile_viewing_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for testing" ON profile_viewing_metrics
FOR ALL
USING (true)
WITH CHECK (true);


-- ============================================
-- 4. Abuse Potential Metrics Table
-- Tracks participant perceptions of system abuse potential
-- ============================================
CREATE TABLE IF NOT EXISTS abuse_potential_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES review_testing_sessions(id) ON DELETE CASCADE,
  variant_tested TEXT NOT NULL CHECK (variant_tested IN ('A', 'B')),

  -- Likert scale questions (1-7)
  gaming_likelihood INTEGER NOT NULL CHECK (gaming_likelihood >= 1 AND gaming_likelihood <= 7),
  safety_concern_level INTEGER NOT NULL CHECK (safety_concern_level >= 1 AND safety_concern_level <= 7),
  trust_in_system INTEGER NOT NULL CHECK (trust_in_system >= 1 AND trust_in_system <= 7),

  -- Qualitative feedback
  fake_review_noticed BOOLEAN,
  suspicious_patterns TEXT,
  suggestions TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_abuse_metrics_session ON abuse_potential_metrics(session_id);
CREATE INDEX idx_abuse_metrics_variant ON abuse_potential_metrics(variant_tested);

-- RLS Policy
ALTER TABLE abuse_potential_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for testing" ON abuse_potential_metrics
FOR ALL
USING (true)
WITH CHECK (true);


-- ============================================
-- 5. Test Profiles Table
-- Stores the positive/neutral/negative test profiles
-- ============================================
CREATE TABLE IF NOT EXISTS test_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_type TEXT NOT NULL CHECK (profile_type IN ('positive', 'neutral', 'negative')),
  username TEXT NOT NULL,
  age INTEGER NOT NULL,
  pronouns TEXT,
  bio TEXT NOT NULL,
  university TEXT NOT NULL,
  university_verified BOOLEAN DEFAULT false,
  city TEXT,

  -- Music data
  top_genres TEXT[],
  top_artists TEXT[],
  top_songs TEXT[],

  -- Trust signals
  concerts_attended INTEGER DEFAULT 0,
  account_age_days INTEGER NOT NULL,
  mutual_friends INTEGER DEFAULT 0,

  -- Type A reviews data
  type_a_reviews JSONB, -- Array of review objects
  type_a_average_rating NUMERIC(2,1),

  -- Type B badges data
  type_b_q1_average NUMERIC(2,1),
  type_b_q2_average NUMERIC(2,1),
  type_b_q3_average NUMERIC(2,1),
  type_b_harmonies_count INTEGER DEFAULT 0,
  type_b_total_reviews INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_test_profiles_type ON test_profiles(profile_type);
CREATE INDEX idx_test_profiles_username ON test_profiles(username);

-- RLS Policy
ALTER TABLE test_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for testing" ON test_profiles
FOR ALL
USING (true)
WITH CHECK (true);


-- ============================================
-- 6. Helper Views for Analysis
-- ============================================

-- View: Session Summary
CREATE OR REPLACE VIEW session_summary AS
SELECT
  s.id,
  s.participant_id,
  s.variant_group,
  s.creation_order,
  s.age,
  s.university,
  COUNT(DISTINCT rcm.id) as reviews_created,
  COUNT(DISTINCT pvm.id) as profiles_viewed,
  AVG(pvm.trust_rating) as avg_trust_rating,
  AVG(pvm.time_to_decision_seconds) as avg_decision_time,
  s.completed_at IS NOT NULL as completed
FROM review_testing_sessions s
LEFT JOIN review_creation_metrics rcm ON s.id = rcm.session_id
LEFT JOIN profile_viewing_metrics pvm ON s.id = pvm.session_id
GROUP BY s.id;

-- View: Profile Viewing Comparison (A vs B)
CREATE OR REPLACE VIEW profile_viewing_comparison AS
SELECT
  profile_type,
  review_variant_shown,
  COUNT(*) as view_count,
  AVG(trust_rating) as avg_trust,
  AVG(confidence_level) as avg_confidence,
  AVG(time_to_decision_seconds) as avg_time,
  SUM(CASE WHEN decision_correct THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as accuracy_rate,
  SUM(CASE WHEN decision_made = 'like' THEN 1 ELSE 0 END) as like_count,
  SUM(CASE WHEN decision_made = 'pass' THEN 1 ELSE 0 END) as pass_count,
  SUM(CASE WHEN decision_made = 'block' THEN 1 ELSE 0 END) as block_count
FROM profile_viewing_metrics
GROUP BY profile_type, review_variant_shown
ORDER BY profile_type, review_variant_shown;

-- View: Review Creation Comparison (A vs B)
CREATE OR REPLACE VIEW review_creation_comparison AS
SELECT
  review_type,
  COUNT(*) as review_count,
  AVG(time_to_complete_seconds) as avg_completion_time,
  AVG(comfort_level) as avg_comfort,
  AVG(honesty_level) as avg_honesty,
  AVG(difficulty_level) as avg_difficulty,
  AVG(CASE WHEN review_type = 'A' THEN comment_length ELSE NULL END) as avg_comment_length
FROM review_creation_metrics
GROUP BY review_type
ORDER BY review_type;


-- ============================================
-- 7. Utility Functions
-- ============================================

-- Function: Calculate decision correctness
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

-- Function: Get badge for Type B rating
CREATE OR REPLACE FUNCTION get_type_b_badge(
  p_question_number INTEGER,
  p_average_rating NUMERIC
) RETURNS TEXT AS $$
BEGIN
  RETURN CASE
    WHEN p_question_number = 1 THEN
      CASE
        WHEN p_average_rating >= 4.0 THEN '🏆 Platinum'
        WHEN p_average_rating >= 3.0 THEN '🥇 Gold'
        ELSE NULL
      END
    WHEN p_question_number = 2 THEN
      CASE
        WHEN p_average_rating >= 4.0 THEN '🎉 Crowd Favorite'
        WHEN p_average_rating >= 3.0 THEN '✨ Good Vibes'
        ELSE '🎧 Chill Listener'
      END
    WHEN p_question_number = 3 THEN
      CASE
        WHEN p_average_rating >= 4.0 THEN '🪨 Rock Solid'
        WHEN p_average_rating >= 3.0 THEN '✅ Dependable'
        ELSE '🎵 Getting in Sync'
      END
    ELSE NULL
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- ============================================
-- 8. Seed Data (Example Test Profiles)
-- ============================================

-- Positive Profile
INSERT INTO test_profiles (
  profile_type, username, age, pronouns, bio, university, university_verified,
  city, top_genres, top_artists, concerts_attended, account_age_days,
  mutual_friends, type_a_average_rating, type_b_q1_average, type_b_q2_average,
  type_b_q3_average, type_b_harmonies_count, type_b_total_reviews
) VALUES (
  'positive',
  'jordanmiller',
  22,
  'he/him',
  'Love finding new music! Been to 15+ concerts this year. Always down to explore venues around ATL 🎶',
  'Georgia Tech',
  true,
  'Atlanta, GA',
  ARRAY['Indie', 'Alternative', 'Rock', 'Pop'],
  ARRAY['The 1975', 'Arctic Monkeys', 'Tame Impala', 'Glass Animals', 'Mac DeMarco'],
  12,
  240, -- 8 months
  3,
  4.6,
  4.7,
  4.6,
  4.8,
  7,
  8
) ON CONFLICT DO NOTHING;

-- Neutral Profile
INSERT INTO test_profiles (
  profile_type, username, age, pronouns, bio, university, university_verified,
  city, top_genres, top_artists, concerts_attended, account_age_days,
  mutual_friends, type_a_average_rating, type_b_q1_average, type_b_q2_average,
  type_b_q3_average, type_b_harmonies_count, type_b_total_reviews
) VALUES (
  'neutral',
  'samtaylor',
  20,
  'they/them',
  'New to the concert scene. Looking for people to go to shows with!',
  'Emory University',
  false,
  'Atlanta, GA',
  ARRAY['Pop', 'Indie', 'Electronic'],
  ARRAY['Billie Eilish', 'Lorde', 'MUNA'],
  2,
  21, -- 3 weeks
  0,
  3.5,
  3.5,
  3.5,
  3.5,
  1,
  2
) ON CONFLICT DO NOTHING;

-- Negative Profile
INSERT INTO test_profiles (
  profile_type, username, age, pronouns, bio, university, university_verified,
  city, top_genres, top_artists, concerts_attended, account_age_days,
  mutual_friends, type_a_average_rating, type_b_q1_average, type_b_q2_average,
  type_b_q3_average, type_b_harmonies_count, type_b_total_reviews
) VALUES (
  'negative',
  'alexjohnson',
  24,
  'she/her',
  'Concerts are life',
  'Georgia State',
  false,
  'Atlanta, GA',
  ARRAY['Hip-Hop', 'Pop'],
  ARRAY['Drake', 'The Weeknd'],
  5,
  180, -- 6 months
  0,
  2.1,
  2.0,
  2.3,
  1.8,
  0,
  6
) ON CONFLICT DO NOTHING;


-- ============================================
-- 9. Data Export Helper
-- ============================================

-- Function: Export session data as JSON (for CSV conversion)
CREATE OR REPLACE FUNCTION export_session_data(p_session_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'session', row_to_json(s),
    'review_creation', (
      SELECT jsonb_agg(row_to_json(rcm))
      FROM review_creation_metrics rcm
      WHERE rcm.session_id = p_session_id
    ),
    'profile_viewing', (
      SELECT jsonb_agg(row_to_json(pvm))
      FROM profile_viewing_metrics pvm
      WHERE pvm.session_id = p_session_id
    ),
    'abuse_metrics', (
      SELECT jsonb_agg(row_to_json(apm))
      FROM abuse_potential_metrics apm
      WHERE apm.session_id = p_session_id
    )
  ) INTO result
  FROM review_testing_sessions s
  WHERE s.id = p_session_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- 10. Cleanup/Reset Functions
-- ============================================

-- Function: Delete all test data (for pilot testing)
CREATE OR REPLACE FUNCTION reset_testing_data()
RETURNS VOID AS $$
BEGIN
  DELETE FROM abuse_potential_metrics;
  DELETE FROM profile_viewing_metrics;
  DELETE FROM review_creation_metrics;
  DELETE FROM review_testing_sessions;

  RAISE NOTICE 'All testing data has been reset';
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- Schema Complete
-- ============================================

-- Verify tables created
DO $$
BEGIN
  RAISE NOTICE 'Sprint 4 Testing Schema Setup Complete';
  RAISE NOTICE 'Tables created: review_testing_sessions, review_creation_metrics, profile_viewing_metrics, abuse_potential_metrics, test_profiles';
  RAISE NOTICE 'Views created: session_summary, profile_viewing_comparison, review_creation_comparison';
  RAISE NOTICE 'Functions created: is_decision_correct, get_type_b_badge, export_session_data, reset_testing_data';
END $$;
