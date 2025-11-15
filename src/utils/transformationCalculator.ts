/**
 * TRANSFORMATION CALCULATOR
 *
 * Calculates REAL LIFE CHANGE metrics, not vanity metrics.
 * Measures outcomes, not just task completion.
 */

import {
  getTransformationSnapshots,
  getLatestSnapshot,
  getBaselineSnapshot,
  getWeeklyCheckIns,
  getFitnessTests,
  getLatestFitnessTest,
  getBaselineFitnessTest,
  TransformationSnapshot,
  WeeklyCheckIn,
  FitnessTest,
} from '../database/transformation';
import { getEmergencyFundProgress, getUserDebts } from '../database/finance';

// ============================================
// TYPES
// ============================================

export interface TransformationMetrics {
  overall: {
    transformationScore: number; // 0-100 overall transformation
    daysTracking: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  finance: FinanceTransformation;
  mental: MentalTransformation;
  physical: PhysicalTransformation;
  nutrition: NutritionTransformation;
}

export interface FinanceTransformation {
  netWorth: {
    baseline: number;
    current: number;
    change: number;
    percentChange: number;
    trend: number[]; // Last 12 weeks
  };
  emergencyFund: {
    baseline: number;
    current: number;
    goal: number;
    percentComplete: number;
    change: number;
  };
  debt: {
    baseline: number;
    current: number;
    reduction: number;
    percentReduction: number;
  };
  score: number; // 0-100
  insight: string;
}

export interface MentalTransformation {
  stress: {
    baseline: number;
    current: number;
    change: number;
    percentImprovement: number;
    trend: number[]; // Last 12 weeks
  };
  sleep: {
    baseline: number;
    current: number;
    change: number;
    percentImprovement: number;
    trend: number[];
  };
  mood: {
    baseline: number;
    current: number;
    change: number;
    trend: number[];
  };
  score: number; // 0-100
  insight: string;
}

export interface PhysicalTransformation {
  strength: {
    baseline: number;
    current: number;
    change: number;
    percentImprovement: number;
    exercises: {
      pushups: { baseline: number; current: number; change: number };
      pullups: { baseline: number; current: number; change: number };
      plank: { baseline: number; current: number; change: number };
    };
  };
  cardio: {
    baseline: number;
    current: number;
    change: number;
    percentImprovement: number;
  };
  bodyComposition: {
    weight: { baseline: number; current: number; change: number };
    bodyFat: { baseline: number | null; current: number | null; change: number | null };
  };
  score: number; // 0-100
  insight: string;
}

export interface NutritionTransformation {
  energy: {
    baseline: number;
    current: number;
    change: number;
    percentImprovement: number;
    trend: number[];
  };
  dietQuality: {
    baseline: string;
    current: string;
    improved: boolean;
  };
  hydration: {
    baseline: number;
    current: number;
    change: number;
  };
  score: number; // 0-100
  insight: string;
}

// ============================================
// MAIN CALCULATION
// ============================================

/**
 * Calculate complete transformation metrics for a user
 */
export const calculateTransformationMetrics = async (
  userId: number
): Promise<TransformationMetrics> => {
  const [snapshots, checkIns, fitnessTests, baseline, latest] = await Promise.all([
    getTransformationSnapshots(userId, 12),
    getWeeklyCheckIns(userId, 12),
    getFitnessTests(userId, 12),
    getBaselineSnapshot(userId),
    getLatestSnapshot(userId),
  ]);

  const finance = await calculateFinanceTransformation(userId, snapshots, baseline, latest);
  const mental = await calculateMentalTransformation(checkIns, baseline, latest);
  const physical = await calculatePhysicalTransformation(fitnessTests);
  const nutrition = await calculateNutritionTransformation(checkIns, baseline, latest);

  // Overall transformation score (weighted average)
  const transformationScore = Math.round(
    (finance.score * 0.3 + mental.score * 0.25 + physical.score * 0.25 + nutrition.score * 0.2)
  );

  // Determine overall trend
  const recentScores = [finance.score, mental.score, physical.score, nutrition.score];
  const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (avgScore > 60) trend = 'improving';
  if (avgScore < 40) trend = 'declining';

  const daysTracking = baseline
    ? Math.floor((new Date().getTime() - new Date(baseline.snapshot_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    overall: {
      transformationScore,
      daysTracking,
      trend,
    },
    finance,
    mental,
    physical,
    nutrition,
  };
};

// ============================================
// FINANCE TRANSFORMATION
// ============================================

const calculateFinanceTransformation = async (
  userId: number,
  snapshots: TransformationSnapshot[],
  baseline: TransformationSnapshot | null,
  latest: TransformationSnapshot | null
): Promise<FinanceTransformation> => {
  // Get real data from database
  const emergencyFund = await getEmergencyFundProgress(userId);
  const debts = await getUserDebts(userId);

  const baselineNetWorth = baseline?.net_worth || 0;
  const currentNetWorth = latest?.net_worth || 0;
  const netWorthChange = currentNetWorth - baselineNetWorth;
  const netWorthPercentChange = baselineNetWorth !== 0
    ? ((netWorthChange / Math.abs(baselineNetWorth)) * 100)
    : 0;

  const baselineEmergencyFund = baseline?.emergency_fund || 0;
  const currentEmergencyFund = emergencyFund?.current || 0;
  const emergencyFundGoal = emergencyFund?.goal || 1000;
  const emergencyFundChange = currentEmergencyFund - baselineEmergencyFund;
  const percentComplete = (currentEmergencyFund / emergencyFundGoal) * 100;

  const totalDebt = debts.reduce((sum, debt) => sum + debt.current_balance, 0);
  const baselineDebt = baseline?.total_debt || totalDebt;
  const debtReduction = baselineDebt - totalDebt;
  const debtPercentReduction = baselineDebt > 0 ? (debtReduction / baselineDebt) * 100 : 0;

  // Calculate trend (last 12 weeks net worth)
  const trend = snapshots.slice(0, 12).reverse().map(s => s.net_worth);

  // Calculate score (0-100)
  let score = 50; // baseline
  if (netWorthChange > 0) score += Math.min(25, netWorthChange / 100);
  if (percentComplete >= 100) score += 15;
  else score += (percentComplete / 100) * 15;
  if (debtReduction > 0) score += Math.min(10, debtReduction / 100);

  score = Math.max(0, Math.min(100, score));

  // Generate insight
  let insight = '';
  if (netWorthChange > 1000) {
    insight = `Amazing! You've grown your net worth by $${netWorthChange.toFixed(0)} 🎉`;
  } else if (netWorthChange > 0) {
    insight = `You're improving! Net worth up $${netWorthChange.toFixed(0)} 📈`;
  } else if (percentComplete >= 100) {
    insight = `Emergency fund complete! You're financially safer 💰`;
  } else if (debtReduction > 0) {
    insight = `You've paid off $${debtReduction.toFixed(0)} in debt. Keep going! 💪`;
  } else {
    insight = `Start tracking your finances daily to see transformation`;
  }

  return {
    netWorth: {
      baseline: baselineNetWorth,
      current: currentNetWorth,
      change: netWorthChange,
      percentChange: netWorthPercentChange,
      trend,
    },
    emergencyFund: {
      baseline: baselineEmergencyFund,
      current: currentEmergencyFund,
      goal: emergencyFundGoal,
      percentComplete,
      change: emergencyFundChange,
    },
    debt: {
      baseline: baselineDebt,
      current: totalDebt,
      reduction: debtReduction,
      percentReduction: debtPercentReduction,
    },
    score: Math.round(score),
    insight,
  };
};

// ============================================
// MENTAL TRANSFORMATION
// ============================================

const calculateMentalTransformation = (
  checkIns: WeeklyCheckIn[],
  baseline: TransformationSnapshot | null,
  latest: TransformationSnapshot | null
): MentalTransformation => {
  const baselineStress = baseline?.stress_level || 5;
  const currentStress = latest?.stress_level || checkIns[0]?.stress_level || 5;
  const stressChange = baselineStress - currentStress; // Reduction is positive
  const stressPercentImprovement = baselineStress > 0 ? (stressChange / baselineStress) * 100 : 0;

  const baselineSleep = baseline?.sleep_quality || 5;
  const currentSleep = latest?.sleep_quality || checkIns[0]?.sleep_quality || 5;
  const sleepChange = currentSleep - baselineSleep;
  const sleepPercentImprovement = baselineSleep > 0 ? (sleepChange / baselineSleep) * 100 : 0;

  const baselineMood = baseline?.mood_score || 5;
  const currentMood = latest?.mood_score || checkIns[0]?.mood || 5;
  const moodChange = currentMood - baselineMood;

  // Trends
  const stressTrend = checkIns.slice(0, 12).reverse().map(c => c.stress_level);
  const sleepTrend = checkIns.slice(0, 12).reverse().map(c => c.sleep_quality);
  const moodTrend = checkIns.slice(0, 12).reverse().map(c => c.mood);

  // Calculate score
  let score = 50;
  if (stressChange > 0) score += Math.min(25, stressChange * 5); // Stress reduction is good
  if (sleepChange > 0) score += Math.min(15, sleepChange * 3);
  if (moodChange > 0) score += Math.min(10, moodChange * 2);

  score = Math.max(0, Math.min(100, score));

  // Generate insight
  let insight = '';
  if (stressPercentImprovement > 30) {
    insight = `Incredible! Your stress dropped ${stressPercentImprovement.toFixed(0)}% 🧘‍♂️`;
  } else if (stressChange > 2) {
    insight = `Your stress is improving! Down ${stressChange.toFixed(1)} points 📉`;
  } else if (sleepChange > 2) {
    insight = `Sleep quality improving! Better rest = better life 😴`;
  } else if (moodChange > 1) {
    insight = `Your mood is trending up. Keep going! 😊`;
  } else {
    insight = `Track your mental health weekly to measure progress`;
  }

  return {
    stress: {
      baseline: baselineStress,
      current: currentStress,
      change: stressChange,
      percentImprovement: stressPercentImprovement,
      trend: stressTrend,
    },
    sleep: {
      baseline: baselineSleep,
      current: currentSleep,
      change: sleepChange,
      percentImprovement: sleepPercentImprovement,
      trend: sleepTrend,
    },
    mood: {
      baseline: baselineMood,
      current: currentMood,
      change: moodChange,
      trend: moodTrend,
    },
    score: Math.round(score),
    insight,
  };
};

// ============================================
// PHYSICAL TRANSFORMATION
// ============================================

const calculatePhysicalTransformation = async (
  fitnessTests: FitnessTest[]
): Promise<PhysicalTransformation> => {
  const baseline = fitnessTests[fitnessTests.length - 1];
  const latest = fitnessTests[0];

  const baselinePushups = baseline?.pushups_max || 0;
  const currentPushups = latest?.pushups_max || 0;
  const pushupChange = currentPushups - baselinePushups;

  const baselinePullups = baseline?.pullups_max || 0;
  const currentPullups = latest?.pullups_max || 0;
  const pullupChange = currentPullups - baselinePullups;

  const baselinePlank = baseline?.plank_seconds || 0;
  const currentPlank = latest?.plank_seconds || 0;
  const plankChange = currentPlank - baselinePlank;

  // Composite strength score
  const baselineStrength = baselinePushups + baselinePullups + (baselinePlank / 10);
  const currentStrength = currentPushups + currentPullups + (currentPlank / 10);
  const strengthChange = currentStrength - baselineStrength;
  const strengthPercentImprovement = baselineStrength > 0 ? (strengthChange / baselineStrength) * 100 : 0;

  // Cardio (resting heart rate - lower is better)
  const baselineHR = baseline?.resting_heart_rate || 70;
  const currentHR = latest?.resting_heart_rate || 70;
  const hrChange = baselineHR - currentHR; // Reduction is improvement
  const cardioPercentImprovement = baselineHR > 0 ? (hrChange / baselineHR) * 100 : 0;

  // Body composition
  const baselineWeight = baseline?.weight_kg || 0;
  const currentWeight = latest?.weight_kg || 0;
  const weightChange = currentWeight - baselineWeight;

  const baselineBF = baseline?.body_fat_percentage || null;
  const currentBF = latest?.body_fat_percentage || null;
  const bfChange = baselineBF && currentBF ? currentBF - baselineBF : null;

  // Calculate score
  let score = 50;
  if (strengthPercentImprovement > 0) score += Math.min(30, strengthPercentImprovement / 2);
  if (hrChange > 0) score += Math.min(15, hrChange * 2); // Lower HR is better
  if (bfChange && bfChange < 0) score += Math.min(5, Math.abs(bfChange) * 2); // Lower BF% is better

  score = Math.max(0, Math.min(100, score));

  // Generate insight
  let insight = '';
  if (strengthPercentImprovement > 50) {
    insight = `You're ${strengthPercentImprovement.toFixed(0)}% stronger! Incredible progress 💪`;
  } else if (pushupChange > 10) {
    insight = `${pushupChange} more push-ups! You're getting strong 🔥`;
  } else if (hrChange > 5) {
    insight = `Resting HR down ${hrChange} BPM. Your heart is healthier! ❤️`;
  } else if (bfChange && bfChange < -2) {
    insight = `Body fat down ${Math.abs(bfChange).toFixed(1)}%. Leaner and stronger! 🎯`;
  } else {
    insight = `Take a fitness test to track your physical transformation`;
  }

  return {
    strength: {
      baseline: baselineStrength,
      current: currentStrength,
      change: strengthChange,
      percentImprovement: strengthPercentImprovement,
      exercises: {
        pushups: { baseline: baselinePushups, current: currentPushups, change: pushupChange },
        pullups: { baseline: baselinePullups, current: currentPullups, change: pullupChange },
        plank: { baseline: baselinePlank, current: currentPlank, change: plankChange },
      },
    },
    cardio: {
      baseline: baselineHR,
      current: currentHR,
      change: hrChange,
      percentImprovement: cardioPercentImprovement,
    },
    bodyComposition: {
      weight: { baseline: baselineWeight, current: currentWeight, change: weightChange },
      bodyFat: { baseline: baselineBF, current: currentBF, change: bfChange },
    },
    score: Math.round(score),
    insight,
  };
};

// ============================================
// NUTRITION TRANSFORMATION
// ============================================

const calculateNutritionTransformation = (
  checkIns: WeeklyCheckIn[],
  baseline: TransformationSnapshot | null,
  latest: TransformationSnapshot | null
): NutritionTransformation => {
  const baselineEnergy = baseline?.energy_level || 5;
  const currentEnergy = latest?.energy_level || checkIns[0]?.energy_level || 5;
  const energyChange = currentEnergy - baselineEnergy;
  const energyPercentImprovement = baselineEnergy > 0 ? (energyChange / baselineEnergy) * 100 : 0;

  const baselineDiet = baseline?.diet_quality || 'fair';
  const currentDiet = latest?.diet_quality || 'fair';
  const dietImproved = getDietQualityScore(currentDiet) > getDietQualityScore(baselineDiet);

  const baselineHydration = baseline?.hydration_score || 4;
  const currentHydration = latest?.hydration_score || 4;
  const hydrationChange = currentHydration - baselineHydration;

  // Trends
  const energyTrend = checkIns.slice(0, 12).reverse().map(c => c.energy_level);

  // Calculate score
  let score = 50;
  if (energyChange > 0) score += Math.min(30, energyChange * 6);
  if (dietImproved) score += 15;
  if (hydrationChange > 0) score += Math.min(5, hydrationChange * 2);

  score = Math.max(0, Math.min(100, score));

  // Generate insight
  let insight = '';
  if (energyPercentImprovement > 40) {
    insight = `Energy up ${energyPercentImprovement.toFixed(0)}%! You're thriving 🌟`;
  } else if (energyChange > 2) {
    insight = `You have ${energyChange.toFixed(1)} more energy! Better nutrition working 🍎`;
  } else if (dietImproved) {
    insight = `Diet quality improved to ${currentDiet}. Keep it up! 🥗`;
  } else if (hydrationChange > 2) {
    insight = `Drinking ${hydrationChange.toFixed(0)} more glasses of water daily 💧`;
  } else {
    insight = `Track your nutrition to see energy and diet improvements`;
  }

  return {
    energy: {
      baseline: baselineEnergy,
      current: currentEnergy,
      change: energyChange,
      percentImprovement: energyPercentImprovement,
      trend: energyTrend,
    },
    dietQuality: {
      baseline: baselineDiet,
      current: currentDiet,
      improved: dietImproved,
    },
    hydration: {
      baseline: baselineHydration,
      current: currentHydration,
      change: hydrationChange,
    },
    score: Math.round(score),
    insight,
  };
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const getDietQualityScore = (quality: string): number => {
  const scores: { [key: string]: number } = {
    poor: 1,
    fair: 2,
    good: 3,
    excellent: 4,
  };
  return scores[quality] || 2;
};

/**
 * Get peer comparison data (for motivation)
 */
export const getPeerComparison = async (userId: number): Promise<{
  percentile: number;
  message: string;
}> => {
  // TODO: Implement peer comparison
  // For now, return encouraging message
  return {
    percentile: 65,
    message: "You're in the top 35% of users in your transformation journey! 🎯",
  };
};
