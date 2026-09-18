-- USCF Leaderboard Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Users table: one account per USCF ID
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  uscf_id TEXT UNIQUE NOT NULL,
  uscf_verified BOOLEAN NOT NULL DEFAULT false,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Friend requests: pending/accepted/declined
CREATE TABLE friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (from_user_id, to_user_id),
  CHECK (status IN ('pending', 'accepted', 'declined')),
  CHECK (from_user_id != to_user_id)
);

-- Friendships: mutual connections (both directions stored)
CREATE TABLE friendships (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Watchlist: private one-directional tracking
CREATE TABLE watchlist (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  uscf_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, uscf_id)
);

-- Rate limiting: fixed-window request counters keyed by e.g. "login:<ip>".
-- Backed by Postgres (rather than in-memory) so counts are shared across
-- serverless instances instead of resetting on every cold start.
CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_friend_requests_to_user ON friend_requests(to_user_id) WHERE status = 'pending';
CREATE INDEX idx_friend_requests_from_user ON friend_requests(from_user_id);
CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_watchlist_user ON watchlist(user_id);
CREATE INDEX idx_users_uscf_id ON users(uscf_id);
