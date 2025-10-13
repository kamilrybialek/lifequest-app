import { getDatabase } from './init';

// Create pillar_assessments table
export const initAssessmentsTable = async () => {
  const db = await getDatabase();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS pillar_assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      pillar TEXT NOT NULL CHECK(pillar IN ('finance', 'mental', 'physical', 'nutrition')),
      assessment_data TEXT NOT NULL,
      recommended_level INTEGER NOT NULL,
      completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, pillar)
    );
  `);
};

export interface AssessmentResult {
  userId: number;
  pillar: 'finance' | 'mental' | 'physical' | 'nutrition';
  assessmentData: any;
  recommendedLevel: number;
}

export const saveAssessment = async (result: AssessmentResult): Promise<void> => {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT OR REPLACE INTO pillar_assessments (user_id, pillar, assessment_data, recommended_level, completed_at)
     VALUES (?, ?, ?, ?, datetime('now'))`,
    [
      result.userId,
      result.pillar,
      JSON.stringify(result.assessmentData),
      result.recommendedLevel,
    ]
  );

  console.log(`✅ Assessment saved for ${result.pillar}: Level ${result.recommendedLevel}`);
};

export const getAssessment = async (
  userId: number,
  pillar: 'finance' | 'mental' | 'physical' | 'nutrition'
): Promise<AssessmentResult | null> => {
  const db = await getDatabase();

  const result = await db.getFirstAsync<any>(
    `SELECT * FROM pillar_assessments WHERE user_id = ? AND pillar = ?`,
    [userId, pillar]
  );

  if (!result) return null;

  return {
    userId: result.user_id,
    pillar: result.pillar,
    assessmentData: JSON.parse(result.assessment_data),
    recommendedLevel: result.recommended_level,
  };
};

export const hasCompletedAssessment = async (
  userId: number,
  pillar: 'finance' | 'mental' | 'physical' | 'nutrition'
): Promise<boolean> => {
  const assessment = await getAssessment(userId, pillar);
  return assessment !== null;
};

export const deleteAssessment = async (
  userId: number,
  pillar: 'finance' | 'mental' | 'physical' | 'nutrition'
): Promise<void> => {
  const db = await getDatabase();

  await db.runAsync(
    `DELETE FROM pillar_assessments WHERE user_id = ? AND pillar = ?`,
    [userId, pillar]
  );

  console.log(`🗑️ Assessment deleted for ${pillar}`);
};
