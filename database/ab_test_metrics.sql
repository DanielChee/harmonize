-- Add table for tracking A/B Test Profile Creation Metrics
CREATE TABLE public.ab_test_profile_creation_metrics (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  variant_assigned text NOT NULL CHECK (variant_assigned = ANY (ARRAY['A'::text, 'B'::text])),
  time_taken_seconds numeric,
  number_of_edits integer DEFAULT 0,
  satisfaction_score boolean, -- Thumbs up (true) / Thumbs down (false)
  perceived_accuracy_score integer CHECK (perceived_accuracy_score BETWEEN 1 AND 5),
  spotify_login_status text CHECK (spotify_login_status = ANY (ARRAY['success'::text, 'failed'::text, 'not_attempted'::text])),
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT ab_test_profile_creation_metrics_pkey PRIMARY KEY (id)
);
