import { OnboardingData, AssessmentResult, BMIResult, ImmediateAction, PathPlacement } from '../types/onboarding';

/**
 * Calculate BMI and category
 */
export function calculateBMI(weightKg: number, heightCm: number): BMIResult {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  let category: BMIResult['category'];
  if (bmi < 18.5) category = 'underweight';
  else if (bmi < 25) category = 'normal';
  else if (bmi < 30) category = 'overweight';
  else category = 'obese';

  // Calculate ideal weight range (BMI 18.5-24.9)
  const idealMin = 18.5 * heightM * heightM;
  const idealMax = 24.9 * heightM * heightM;

  return {
    value: Math.round(bmi * 10) / 10,
    category,
    idealWeightRange: {
      min: Math.round(idealMin),
      max: Math.round(idealMax),
    },
  };
}

/**
 * Calculate physical health score (0-100)
 */
export function calculatePhysicalScore(data: OnboardingData): number {
  const exerciseScore = (data.exerciseFrequency / 3) * 25;
  const fitnessScore = (data.fitnessLevel / 10) * 25;

  let sleepScore = 5;
  if (data.sleepHours >= 7 && data.sleepHours <= 9) sleepScore = 25;
  else if (data.sleepHours >= 6 && data.sleepHours <= 10) sleepScore = 15;

  const healthScore = ((2 - data.healthIssues) / 2) * 25;

  return Math.round(exerciseScore + fitnessScore + sleepScore + healthScore);
}

/**
 * Calculate mental health score (0-100)
 */
export function calculateMentalScore(data: OnboardingData): number {
  const stressScore = ((10 - data.stressLevel) / 10) * 30;
  const overwhelmedScore = ((3 - data.overwhelmedFrequency) / 3) * 30;
  const meditationScore = (data.meditationPractice / 2) * 20;
  const lifeQualityScore = (data.lifeQuality / 10) * 20;

  return Math.round(stressScore + overwhelmedScore + meditationScore + lifeQualityScore);
}

/**
 * Calculate finance score (0-100)
 */
export function calculateFinanceScore(data: OnboardingData): number {
  const incomeScore = (data.incomeLevel / 4) * 25;
  const debtScore = ((3 - data.debtLevel) / 3) * 25;
  const savingsScore = (data.savingsLevel / 4) * 25;
  const budgetingScore = (data.budgeting / 2) * 25;

  return Math.round(incomeScore + debtScore + savingsScore + budgetingScore);
}

/**
 * Calculate nutrition score (0-100)
 */
export function calculateNutritionScore(data: OnboardingData): number {
  const mealsScore = (data.mealsPerDay / 3) * 20;
  const fastFoodScore = (data.fastFoodFrequency / 3) * 30;
  const waterScore = (data.waterIntake / 3) * 20;
  const dietScore = (data.dietQuality / 10) * 30;

  return Math.round(mealsScore + fastFoodScore + waterScore + dietScore);
}

/**
 * Get score category and description
 */
export function getScoreCategory(score: number): {
  category: string;
  color: string;
  description: string;
} {
  if (score >= 86) {
    return {
      category: 'Excellent',
      color: '#10B981',
      description: 'Outstanding! Maintain this level',
    };
  } else if (score >= 71) {
    return {
      category: 'Good',
      color: '#22C55E',
      description: 'Great work! Keep it up',
    };
  } else if (score >= 51) {
    return {
      category: 'Fair',
      color: '#EAB308',
      description: "You're on the right track",
    };
  } else if (score >= 31) {
    return {
      category: 'Poor',
      color: '#F97316',
      description: 'Needs improvement',
    };
  } else {
    return {
      category: 'Critical',
      color: '#EF4444',
      description: 'Immediate action needed',
    };
  }
}

/**
 * Determine path placement based on score
 */
export function determinePathPlacement(score: number): PathPlacement {
  if (score >= 86) {
    return { foundation: 5, lesson: 41 };
  } else if (score >= 71) {
    return { foundation: 4, lesson: 31 };
  } else if (score >= 56) {
    return { foundation: 3, lesson: 21 };
  } else if (score >= 41) {
    return { foundation: 2, lesson: 11 };
  } else {
    return { foundation: 1, lesson: 1 };
  }
}

/**
 * Get immediate actions based on scores and data
 */
export function getImmediateActions(
  data: OnboardingData,
  scores: { physical: number; mental: number; finance: number; nutrition: number }
): ImmediateAction[] {
  const actions: Array<ImmediateAction & { score: number }> = [];

  // Physical health actions
  if (data.exerciseFrequency === 0) {
    actions.push({
      pillar: 'physical',
      title: 'Start Moving',
      description: 'Begin with 10-minute daily walks',
      lessonId: 1,
      score: scores.physical,
    });
  } else if (data.sleepHours < 6 || data.sleepHours > 10) {
    actions.push({
      pillar: 'physical',
      title: 'Fix Your Sleep',
      description: 'Establish a consistent sleep schedule (7-9h)',
      lessonId: 3,
      score: scores.physical,
    });
  } else if (data.fitnessLevel <= 4) {
    actions.push({
      pillar: 'physical',
      title: 'Build Fitness',
      description: 'Try our beginner bodyweight workout',
      lessonId: 5,
      score: scores.physical,
    });
  }

  // Mental health actions
  if (data.stressLevel >= 7) {
    actions.push({
      pillar: 'mental',
      title: 'Reduce Stress',
      description: 'Try our 5-minute breathing exercise',
      lessonId: 1,
      score: scores.mental,
    });
  } else if (data.meditationPractice === 0) {
    actions.push({
      pillar: 'mental',
      title: 'Start Mindfulness',
      description: 'Begin with 2-minute daily meditation',
      lessonId: 2,
      score: scores.mental,
    });
  } else if (data.overwhelmedFrequency >= 2) {
    actions.push({
      pillar: 'mental',
      title: 'Set Boundaries',
      description: 'Learn to say no and protect your energy',
      lessonId: 4,
      score: scores.mental,
    });
  }

  // Finance actions
  if (data.debtLevel >= 2) {
    actions.push({
      pillar: 'finance',
      title: 'Tackle Debt',
      description: 'Use snowball method - pay smallest debt first',
      lessonId: 3,
      score: scores.finance,
    });
  } else if (data.savingsLevel <= 1) {
    actions.push({
      pillar: 'finance',
      title: 'Build Emergency Fund',
      description: 'Start saving 50 zł per week',
      lessonId: 1,
      score: scores.finance,
    });
  } else if (data.budgeting === 0) {
    actions.push({
      pillar: 'finance',
      title: 'Track Expenses',
      description: 'Monitor your spending for 7 days',
      lessonId: 2,
      score: scores.finance,
    });
  }

  // Nutrition actions
  if (data.waterIntake <= 1) {
    actions.push({
      pillar: 'nutrition',
      title: 'Hydrate More',
      description: 'Drink 1 glass of water before each meal',
      lessonId: 1,
      score: scores.nutrition,
    });
  } else if (data.fastFoodFrequency <= 1) {
    actions.push({
      pillar: 'nutrition',
      title: 'Cook at Home',
      description: 'Prepare one healthy meal this week',
      lessonId: 3,
      score: scores.nutrition,
    });
  } else if (data.mealsPerDay <= 1) {
    actions.push({
      pillar: 'nutrition',
      title: 'Eat Regularly',
      description: 'Add one healthy snack between meals',
      lessonId: 2,
      score: scores.nutrition,
    });
  }

  // Sort by score (lowest first) and return top 3
  actions.sort((a, b) => a.score - b.score);
  return actions.slice(0, 3).map(({ score, ...action }) => action);
}

/**
 * Perform full assessment
 */
export function performAssessment(data: OnboardingData): AssessmentResult {
  // Calculate all scores
  const physicalScore = calculatePhysicalScore(data);
  const mentalScore = calculateMentalScore(data);
  const financeScore = calculateFinanceScore(data);
  const nutritionScore = calculateNutritionScore(data);
  const overallScore = Math.round((physicalScore + mentalScore + financeScore + nutritionScore) / 4);

  // Calculate BMI
  const bmi = calculateBMI(data.weightKg, data.heightCm);

  // Determine path placements
  const pathPlacement = {
    finance: determinePathPlacement(financeScore),
    mental: determinePathPlacement(mentalScore),
    physical: determinePathPlacement(physicalScore),
    nutrition: determinePathPlacement(nutritionScore),
  };

  // Get immediate actions
  const immediateActions = getImmediateActions(data, {
    physical: physicalScore,
    mental: mentalScore,
    finance: financeScore,
    nutrition: nutritionScore,
  });

  return {
    overallScore,
    scores: {
      physical: physicalScore,
      mental: mentalScore,
      finance: financeScore,
      nutrition: nutritionScore,
    },
    bmi,
    immediateActions,
    pathPlacement,
  };
}

/**
 * BMI category descriptions
 */
export function getBMIDescription(category: BMIResult['category']): string {
  switch (category) {
    case 'underweight':
      return 'Below healthy weight range';
    case 'normal':
      return 'Healthy weight range';
    case 'overweight':
      return 'Above healthy weight range';
    case 'obese':
      return 'Significantly above healthy weight';
  }
}
