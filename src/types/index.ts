export type Pillar = 'finance' | 'mental' | 'physical' | 'diet';

export interface User {
  id: string; // Changed from number to string for Firebase UID compatibility
  email: string;
  firstName?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: 'male' | 'female' | 'other';
  currency?: string; // User's preferred currency (supports all 40+ currencies)
  financialStatus?: 'debt' | 'paycheck' | 'stable' | 'saving' | 'investing';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active';
  sleepQuality?: number; // 1-10
  // Nutrition baseline (from onboarding)
  mealsPerDay?: number; // 0-3 (0: 1-2 meals, 1: 3 meals, 2: 4-5 meals, 3: 6+ meals)
  fastFoodFrequency?: number; // 0-3 (0: every day, 1: 3-4/week, 2: 1-2/week, 3: rarely)
  waterIntakeLevel?: number; // 0-3 (0: <1L, 1: 1-2L, 2: 2-3L, 3: 3L+)
  dietQuality?: number; // 1-10 rating
  onboarded: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  pillar: Pillar;
  title: string;
  description: string;
  duration: number; // minutes
  completed: boolean;
  completedAt?: string;
  points: number;
  // Smart task integration
  action_type?: 'lesson' | 'tool' | 'habit' | 'challenge';
  action_screen?: string; // Screen to navigate to when tapping task
  action_params?: Record<string, any>; // Parameters for navigation
  difficulty?: 'easy' | 'medium' | 'hard';
  streak_eligible?: boolean;
}

export interface Streak {
  pillar: Pillar;
  current: number;
  longest: number;
  lastCompletedDate?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  pillar?: Pillar;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserProgress {
  level: number;
  xp: number;
  totalPoints: number;
  streaks: Streak[];
  achievements: Achievement[];
}

export interface FinanceData {
  emergencyFund: number;
  emergencyFundGoal: number;
  debts: Debt[];
  budgetCategories: BudgetCategory[];
}

export interface Debt {
  id: string;
  name: string;
  amount: number;
  minimumPayment: number;
  priority: number;
}

export interface BudgetCategory {
  id: string;
  name: string;
  planned: number;
  spent: number;
}

export interface MentalHealthData {
  morningLightTime?: string;
  gratitudeEntries: GratitudeEntry[];
  sleepLog: SleepEntry[];
  stressLevel?: number; // 1-10
}

export interface GratitudeEntry {
  id: string;
  text: string;
  date: string;
}

export interface SleepEntry {
  id: string;
  bedTime: string;
  wakeTime: string;
  quality: number; // 1-5
  date: string;
}

export interface PhysicalHealthData {
  dailySteps: number;
  stepsGoal: number;
  workouts: Workout[];
  weight?: number; // kg
  height?: number; // cm
}

export interface Workout {
  id: string;
  type: 'strength' | 'cardio' | 'mobility' | 'other';
  duration: number;
  intensity: number; // 1-10 RPE
  date: string;
}

export interface NutritionData {
  waterIntake: number;
  waterGoal: number;
  firstMealTime?: string;
  mealQuality?: number; // 1-5
  hadProtein: boolean;
  caloriesConsumed?: number;
  calorieGoal?: number;
}