-- ============================================
-- LIFEQUEST DATABASE SCHEMA FOR SUPABASE
-- ============================================
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/bxofbbqocwnhwjgykhqd/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
-- Note: Supabase auth.users already exists, but we'll create our own users table
-- to store additional user data

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  age INTEGER,
  weight REAL,
  height REAL,
  gender TEXT,
  onboarded BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own data"
  ON public.users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Policy: Users can insert their own data
CREATE POLICY "Users can insert own data"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- ============================================
-- USER STATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  finance_streak INTEGER DEFAULT 0,
  mental_streak INTEGER DEFAULT 0,
  physical_streak INTEGER DEFAULT 0,
  nutrition_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own stats"
  ON public.user_stats
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own stats"
  ON public.user_stats
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own stats"
  ON public.user_stats
  FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON public.user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DAILY TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_date DATE NOT NULL,
  pillar TEXT NOT NULL CHECK (pillar IN ('finance', 'mental', 'physical', 'nutrition')),
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  xp_reward INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own tasks"
  ON public.daily_tasks
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own tasks"
  ON public.daily_tasks
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own tasks"
  ON public.daily_tasks
  FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own tasks"
  ON public.daily_tasks
  FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date
  ON public.daily_tasks(user_id, task_date);

-- ============================================
-- FINANCE PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.finance_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 1,
  monthly_income REAL DEFAULT 0,
  monthly_expenses REAL DEFAULT 0,
  net_worth REAL DEFAULT 0,
  emergency_fund_goal REAL DEFAULT 1000,
  emergency_fund_current REAL DEFAULT 0,
  total_debt REAL DEFAULT 0,
  debt_paid_off REAL DEFAULT 0,
  total_lessons_completed INTEGER DEFAULT 0,
  total_xp_earned INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.finance_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own finance progress"
  ON public.finance_progress
  FOR ALL
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- MENTAL PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.mental_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  current_foundation INTEGER DEFAULT 1,
  total_lessons_completed INTEGER DEFAULT 0,
  dopamine_detox_count INTEGER DEFAULT 0,
  last_detox_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.mental_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own mental progress"
  ON public.mental_progress
  FOR ALL
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- PHYSICAL PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.physical_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  current_foundation INTEGER DEFAULT 1,
  total_lessons_completed INTEGER DEFAULT 0,
  bmi REAL,
  tdee REAL,
  target_calories REAL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.physical_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own physical progress"
  ON public.physical_progress
  FOR ALL
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- NUTRITION PROGRESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.nutrition_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  current_foundation INTEGER DEFAULT 1,
  total_lessons_completed INTEGER DEFAULT 0,
  total_meals_logged INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.nutrition_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own nutrition progress"
  ON public.nutrition_progress
  FOR ALL
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  achievement_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  badge_color TEXT DEFAULT '#FFD700',
  is_secret BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Make achievements readable by everyone (no RLS needed for reference data)
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are viewable by everyone"
  ON public.achievements
  FOR SELECT
  USING (true);

-- Insert default achievements
INSERT INTO public.achievements (achievement_key, title, description, icon, category, requirement_type, requirement_value, xp_reward, badge_color)
VALUES
  ('first_lesson', 'First Steps', 'Complete your first lesson', '🎓', 'education', 'lessons_completed', 1, 50, '#58CC02'),
  ('streak_7', 'Week Warrior', 'Maintain a 7-day streak', '🔥', 'consistency', 'streak_days', 7, 100, '#FF9500'),
  ('streak_30', 'Monthly Master', 'Maintain a 30-day streak', '🏆', 'consistency', 'streak_days', 30, 500, '#FFD700'),
  ('level_5', 'Rising Star', 'Reach Level 5', '⭐', 'progression', 'level', 5, 200, '#CE82FF'),
  ('level_10', 'Elite Achiever', 'Reach Level 10', '💎', 'progression', 'level', 10, 500, '#1CB0F6')
ON CONFLICT (achievement_key) DO NOTHING;

-- ============================================
-- USER ACHIEVEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_key)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own achievements"
  ON public.user_achievements
  FOR ALL
  USING (auth.uid()::text = user_id::text);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically create user_stats when a user is created
CREATE OR REPLACE FUNCTION create_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_stats();

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_progress_user_id ON public.finance_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_mental_progress_user_id ON public.mental_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_physical_progress_user_id ON public.physical_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_progress_user_id ON public.nutrition_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant permissions on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- DONE!
-- ============================================
-- Schema created successfully. You can now use Supabase in your app.
