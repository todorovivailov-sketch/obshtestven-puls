-- Strengthen duplicate vote prevention without requiring user accounts.
-- Run in Supabase SQL Editor before deploying api/vote.js changes.

ALTER TABLE votes ADD COLUMN IF NOT EXISTS voter_hash TEXT;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS fingerprint_hash TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_poll_voter_hash
  ON votes(poll_id, voter_hash)
  WHERE voter_hash IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_poll_fingerprint_hash
  ON votes(poll_id, fingerprint_hash)
  WHERE fingerprint_hash IS NOT NULL;
