/**
 * TRANSFORMATION TRACKING DATABASE
 *
 * Measures REAL LIFE CHANGE, not just task completion.
 * Tracks outcomes across all 4 pillars over time.
 */

import { getDatabase } from './init';

// ============================================
// TYPES
// ============================================

export interface TransformationSnapshot {
  id?: number;
  user_id: number;
  snapshot_date: string; // ISO date

  // FINANCE OUTCOMES
  net_worth: number;
  emergency_fund: number;
  total_debt: number;
  monthly_savings: number;

  // MENTAL OUTCOMES
  stress_level: number; // 1-10 scale
  sleep_quality: number; // 1-10 scale
  meditation_frequency: number; // times per week
  mood_score: number; // 1-10 scale

  // PHYSICAL OUTCOMES
  weight_kg: number;
  body_fat_percentage: number | null;
  strength_score: number; // composite: push-ups + other tests
  cardio_score: number; // resting heart rate or VO2 max proxy

  // NUTRITION OUTCOMES
  energy_level: number; // 1-10 scale
  diet_quality: 'poor' | 'fair' | 'good' | 'excellent';
  hydration_score: number; // glasses per day average

  created_at?: string;
}

export interface WeeklyCheckIn {
  id?: number;
  user_id: number;
  week_start_date: string; // Monday of that week

  // Subjective self-assessments
  stress_level: number; // 1-10
  energy_level: number; // 1-10
  mood: number; // 1-10
  sleep_quality: number; // 1-10
  financial_control: number; // 1-10 "how in control of finances?"
  diet_quality: number; // 1-10

  // Optional notes
  wins: string; // "What went well this week?"
  challenges: string; // "What was difficult?"

  completed_at: string;
}

export interface FitnessTest {
  id?: number;
  user_id: number;
  test_date: string;

  // Strength tests
  pushups_max: number | null;
  pullups_max: number | null;
  squats_max: number | null;
  plank_seconds: number | null;

  // Cardio tests
  resting_heart_rate: number | null;
  mile_time_seconds: number | null;

  // Body composition
  weight_kg: number;
  body_fat_percentage: number | null;

  created_at?: string;
}

export interface OutcomeMilestone {
  id?: number;
  user_id: number;
  pillar: 'finance' | 'mental' | 'physical' | 'nutrition';
  milestone_type: string; // e.g., "emergency_fund_complete", "stress_reduced_50"
  achieved_date: string;
  value: number; // numeric value of achievement
  description: string;
  created_at?: string;
}

// ============================================
// DATABASE INITIALIZATION
// ============================================

export const initTransformationTables = async () => {
  const db = await getDatabase();
  if (!db) {
    console.log('⚠️ Database not available (web platform)');
    return;
  }

  await db.execAsync(`
    -- Transformation snapshots (weekly/monthly)
    CREATE TABLE IF NOT EXISTS transformation_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      snapshot_date TEXT NOT NULL,

      -- Finance outcomes
      net_worth REAL DEFAULT 0,
      emergency_fund REAL DEFAULT 0,
      total_debt REAL DEFAULT 0,
      monthly_savings REAL DEFAULT 0,

      -- Mental outcomes
      stress_level INTEGER DEFAULT 5,
      sleep_quality INTEGER DEFAULT 5,
      meditation_frequency INTEGER DEFAULT 0,
      mood_score INTEGER DEFAULT 5,

      -- Physical outcomes
      weight_kg REAL DEFAULT 0,
      body_fat_percentage REAL,
      strength_score REAL DEFAULT 0,
      cardio_score REAL DEFAULT 0,

      -- Nutrition outcomes
      energy_level INTEGER DEFAULT 5,
      diet_quality TEXT DEFAULT 'fair',
      hydration_score REAL DEFAULT 4,

      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, snapshot_date)
    );

    -- Weekly check-ins (subjective self-assessment)
    CREATE TABLE IF NOT EXISTS weekly_check_ins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      week_start_date TEXT NOT NULL,

      stress_level INTEGER NOT NULL,
      energy_level INTEGER NOT NULL,
      mood INTEGER NOT NULL,
      sleep_quality INTEGER NOT NULL,
      financial_control INTEGER NOT NULL,
      diet_quality INTEGER NOT NULL,

      wins TEXT,
      challenges TEXT,

      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, week_start_date)
    );

    -- Fitness tests (objective measurements)
    CREATE TABLE IF NOT EXISTS fitness_tests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      test_date TEXT NOT NULL,

      pushups_max INTEGER,
      pullups_max INTEGER,
      squats_max INTEGER,
      plank_seconds INTEGER,

      resting_heart_rate INTEGER,
      mile_time_seconds INTEGER,

      weight_kg REAL,
      body_fat_percentage REAL,

      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Outcome milestones (achievements of real change)
    CREATE TABLE IF NOT EXISTS outcome_milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      pillar TEXT NOT NULL,
      milestone_type TEXT NOT NULL,
      achieved_date TEXT NOT NULL,
      value REAL NOT NULL,
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_snapshots_user_date ON transformation_snapshots(user_id, snapshot_date);
    CREATE INDEX IF NOT EXISTS idx_checkins_user_date ON weekly_check_ins(user_id, week_start_date);
    CREATE INDEX IF NOT EXISTS idx_fitness_user_date ON fitness_tests(user_id, test_date);
    CREATE INDEX IF NOT EXISTS idx_milestones_user ON outcome_milestones(user_id, pillar);
  `);

  console.log('✅ Transformation tracking tables initialized');
};

// ============================================
// SNAPSHOT OPERATIONS
// ============================================

/**
 * Create a transformation snapshot (captures current state)
 */
export const createTransformationSnapshot = async (
  userId: number,
  snapshot: Omit<TransformationSnapshot, 'id' | 'user_id' | 'created_at'>
): Promise<void> => {
  const db = await getDatabase();
  if (!db) return;

  await db.runAsync(
    `INSERT OR REPLACE INTO transformation_snapshots (
      user_id, snapshot_date,
      net_worth, emergency_fund, total_debt, monthly_savings,
      stress_level, sleep_quality, meditation_frequency, mood_score,
      weight_kg, body_fat_percentage, strength_score, cardio_score,
      energy_level, diet_quality, hydration_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId, snapshot.snapshot_date,
      snapshot.net_worth, snapshot.emergency_fund, snapshot.total_debt, snapshot.monthly_savings,
      snapshot.stress_level, snapshot.sleep_quality, snapshot.meditation_frequency, snapshot.mood_score,
      snapshot.weight_kg, snapshot.body_fat_percentage, snapshot.strength_score, snapshot.cardio_score,
      snapshot.energy_level, snapshot.diet_quality, snapshot.hydration_score
    ]
  );
};

/**
 * Get transformation snapshots for a user (time series)
 */
export const getTransformationSnapshots = async (
  userId: number,
  limit: number = 12
): Promise<TransformationSnapshot[]> => {
  const db = await getDatabase();
  if (!db) return [];

  const snapshots = await db.getAllAsync<TransformationSnapshot>(
    `SELECT * FROM transformation_snapshots
     WHERE user_id = ?
     ORDER BY snapshot_date DESC
     LIMIT ?`,
    [userId, limit]
  );

  return snapshots;
};

/**
 * Get latest snapshot
 */
export const getLatestSnapshot = async (userId: number): Promise<TransformationSnapshot | null> => {
  const db = await getDatabase();
  if (!db) return null;

  const snapshot = await db.getFirstAsync<TransformationSnapshot>(
    `SELECT * FROM transformation_snapshots
     WHERE user_id = ?
     ORDER BY snapshot_date DESC
     LIMIT 1`,
    [userId]
  );

  return snapshot || null;
};

/**
 * Get first (baseline) snapshot
 */
export const getBaselineSnapshot = async (userId: number): Promise<TransformationSnapshot | null> => {
  const db = await getDatabase();
  if (!db) return null;

  const snapshot = await db.getFirstAsync<TransformationSnapshot>(
    `SELECT * FROM transformation_snapshots
     WHERE user_id = ?
     ORDER BY snapshot_date ASC
     LIMIT 1`,
    [userId]
  );

  return snapshot || null;
};

// ============================================
// WEEKLY CHECK-IN OPERATIONS
// ============================================

/**
 * Save weekly check-in
 */
export const saveWeeklyCheckIn = async (
  userId: number,
  checkIn: Omit<WeeklyCheckIn, 'id' | 'user_id' | 'completed_at'>
): Promise<void> => {
  const db = await getDatabase();
  if (!db) return;

  await db.runAsync(
    `INSERT OR REPLACE INTO weekly_check_ins (
      user_id, week_start_date,
      stress_level, energy_level, mood, sleep_quality, financial_control, diet_quality,
      wins, challenges
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId, checkIn.week_start_date,
      checkIn.stress_level, checkIn.energy_level, checkIn.mood,
      checkIn.sleep_quality, checkIn.financial_control, checkIn.diet_quality,
      checkIn.wins, checkIn.challenges
    ]
  );
};

/**
 * Get weekly check-ins for a user
 */
export const getWeeklyCheckIns = async (
  userId: number,
  limit: number = 12
): Promise<WeeklyCheckIn[]> => {
  const db = await getDatabase();
  if (!db) return [];

  const checkIns = await db.getAllAsync<WeeklyCheckIn>(
    `SELECT * FROM weekly_check_ins
     WHERE user_id = ?
     ORDER BY week_start_date DESC
     LIMIT ?`,
    [userId, limit]
  );

  return checkIns;
};

/**
 * Get latest weekly check-in
 */
export const getLatestCheckIn = async (userId: number): Promise<WeeklyCheckIn | null> => {
  const db = await getDatabase();
  if (!db) return null;

  const checkIn = await db.getFirstAsync<WeeklyCheckIn>(
    `SELECT * FROM weekly_check_ins
     WHERE user_id = ?
     ORDER BY week_start_date DESC
     LIMIT 1`,
    [userId]
  );

  return checkIn || null;
};

/**
 * Check if check-in needed this week
 */
export const needsWeeklyCheckIn = async (userId: number): Promise<boolean> => {
  const latest = await getLatestCheckIn(userId);
  if (!latest) return true;

  const lastCheckInDate = new Date(latest.week_start_date);
  const now = new Date();
  const daysSinceLastCheckIn = Math.floor((now.getTime() - lastCheckInDate.getTime()) / (1000 * 60 * 60 * 24));

  return daysSinceLastCheckIn >= 7;
};

// ============================================
// FITNESS TEST OPERATIONS
// ============================================

/**
 * Save fitness test results
 */
export const saveFitnessTest = async (
  userId: number,
  test: Omit<FitnessTest, 'id' | 'user_id' | 'created_at'>
): Promise<void> => {
  const db = await getDatabase();
  if (!db) return;

  await db.runAsync(
    `INSERT INTO fitness_tests (
      user_id, test_date,
      pushups_max, pullups_max, squats_max, plank_seconds,
      resting_heart_rate, mile_time_seconds,
      weight_kg, body_fat_percentage
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId, test.test_date,
      test.pushups_max, test.pullups_max, test.squats_max, test.plank_seconds,
      test.resting_heart_rate, test.mile_time_seconds,
      test.weight_kg, test.body_fat_percentage
    ]
  );
};

/**
 * Get fitness tests for a user
 */
export const getFitnessTests = async (
  userId: number,
  limit: number = 12
): Promise<FitnessTest[]> => {
  const db = await getDatabase();
  if (!db) return [];

  const tests = await db.getAllAsync<FitnessTest>(
    `SELECT * FROM fitness_tests
     WHERE user_id = ?
     ORDER BY test_date DESC
     LIMIT ?`,
    [userId, limit]
  );

  return tests;
};

/**
 * Get latest fitness test
 */
export const getLatestFitnessTest = async (userId: number): Promise<FitnessTest | null> => {
  const db = await getDatabase();
  if (!db) return null;

  const test = await db.getFirstAsync<FitnessTest>(
    `SELECT * FROM fitness_tests
     WHERE user_id = ?
     ORDER BY test_date DESC
     LIMIT 1`,
    [userId]
  );

  return test || null;
};

/**
 * Get baseline (first) fitness test
 */
export const getBaselineFitnessTest = async (userId: number): Promise<FitnessTest | null> => {
  const db = await getDatabase();
  if (!db) return null;

  const test = await db.getFirstAsync<FitnessTest>(
    `SELECT * FROM fitness_tests
     WHERE user_id = ?
     ORDER BY test_date ASC
     LIMIT 1`,
    [userId]
  );

  return test || null;
};

// ============================================
// MILESTONE OPERATIONS
// ============================================

/**
 * Record an outcome milestone
 */
export const recordMilestone = async (
  userId: number,
  milestone: Omit<OutcomeMilestone, 'id' | 'user_id' | 'created_at'>
): Promise<void> => {
  const db = await getDatabase();
  if (!db) return;

  await db.runAsync(
    `INSERT INTO outcome_milestones (
      user_id, pillar, milestone_type, achieved_date, value, description
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, milestone.pillar, milestone.milestone_type, milestone.achieved_date, milestone.value, milestone.description]
  );
};

/**
 * Get milestones for a user
 */
export const getMilestones = async (
  userId: number,
  pillar?: 'finance' | 'mental' | 'physical' | 'nutrition'
): Promise<OutcomeMilestone[]> => {
  const db = await getDatabase();
  if (!db) return [];

  let query = 'SELECT * FROM outcome_milestones WHERE user_id = ?';
  const params: any[] = [userId];

  if (pillar) {
    query += ' AND pillar = ?';
    params.push(pillar);
  }

  query += ' ORDER BY achieved_date DESC';

  const milestones = await db.getAllAsync<OutcomeMilestone>(query, params);
  return milestones;
};
