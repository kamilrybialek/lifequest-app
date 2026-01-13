/**
 * Health Data Types
 * Tracks user's health metrics from onboarding and weekly quizzes
 */

export interface HealthMetrics {
  id?: string;
  user_id: string;

  // Physical metrics
  age: number;
  weight: number;  // in kg
  height: number;  // in cm
  gender: 'male' | 'female' | 'other';

  // Activity & Exercise
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extremely_active';
  weeklyExerciseHours: number;

  // Sleep
  sleepQuality: number;  // 1-5 scale
  averageSleepHours: number;

  // Mental Health
  stressLevel: number;  // 1-5 scale (1=low, 5=high)
  screenTimeHours: number;  // daily average
  meditationMinutes: number;  // daily average

  // Nutrition
  waterIntakeLiters: number;  // daily average
  mealsPerDay: number;
  dietType: 'regular' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'other';

  // Financial (separate but tracked)
  financialStatus: 'struggling' | 'managing' | 'comfortable' | 'wealthy';

  // Timestamps
  created_at: string;
  updated_at: string;
  last_quiz_date?: string;
}

export interface HealthQuizAnswer {
  question: string;
  answer: string | number;
  category: 'physical' | 'mental' | 'nutrition' | 'sleep';
}

export interface WeeklyHealthQuiz {
  id?: string;
  user_id: string;
  quiz_date: string;

  // Answers
  sleepQuality: number;
  sleepHours: number;
  stressLevel: number;
  screenTime: number;
  exerciseHours: number;
  waterIntake: number;
  mealsCount: number;
  mood: number;  // 1-5 scale
  energy: number;  // 1-5 scale

  // Optional notes
  notes?: string;

  created_at: string;
}

export interface HealthStats {
  // Averages from last 4 weeks
  avgSleepQuality: number;
  avgStressLevel: number;
  avgExerciseHours: number;
  avgWaterIntake: number;

  // Trends (positive, negative, neutral)
  sleepTrend: 'up' | 'down' | 'stable';
  stressTrend: 'up' | 'down' | 'stable';
  exerciseTrend: 'up' | 'down' | 'stable';

  // Current metrics
  currentBMI: number;
  idealWeightRange: { min: number; max: number };
  calorieTarget: number;
}
