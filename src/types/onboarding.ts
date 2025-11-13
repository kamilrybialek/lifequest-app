export interface OnboardingData {
  // Personal
  firstName: string;
  age: number;
  gender?: string;
  heightCm: number;
  weightKg: number;

  // Physical
  exerciseFrequency: number; // 0-3
  fitnessLevel: number; // 1-10
  sleepHours: number; // 0-24
  healthIssues: number; // 0-2
  physicalScore?: number;

  // Mental
  stressLevel: number; // 1-10
  overwhelmedFrequency: number; // 0-3
  meditationPractice: number; // 0-2
  lifeQuality: number; // 1-10
  mentalScore?: number;

  // Finance
  incomeLevel: number; // 0-4
  debtLevel: number; // 0-3
  savingsLevel: number; // 0-4
  budgeting: number; // 0-2
  financeScore?: number;

  // Nutrition
  mealsPerDay: number; // 0-3
  fastFoodFrequency: number; // 0-3
  waterIntake: number; // 0-3
  dietQuality: number; // 1-10
  nutritionScore?: number;

  // Overall
  overallScore?: number;
  bmi?: number;

  // Goals
  selectedGoals: string[];
}

export interface BMIResult {
  value: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  idealWeightRange: { min: number; max: number };
}

export interface ImmediateAction {
  pillar: 'finance' | 'mental' | 'physical' | 'nutrition';
  title: string;
  description: string;
  lessonId?: number;
}

export interface PathPlacement {
  foundation: number; // 1-5
  lesson: number; // Starting lesson number
}

export interface AssessmentResult {
  overallScore: number;
  scores: {
    physical: number;
    mental: number;
    finance: number;
    nutrition: number;
  };
  bmi: BMIResult;
  immediateActions: ImmediateAction[];
  pathPlacement: {
    finance: PathPlacement;
    mental: PathPlacement;
    physical: PathPlacement;
    nutrition: PathPlacement;
  };
}

export type OnboardingStep =
  | 'welcome'
  | 'personal'
  | 'physical'
  | 'mental'
  | 'finance'
  | 'nutrition'
  | 'goals'
  | 'assessment';

export interface OnboardingGoal {
  id: string;
  pillar: 'finance' | 'mental' | 'physical' | 'nutrition';
  title: string;
  description: string;
}
