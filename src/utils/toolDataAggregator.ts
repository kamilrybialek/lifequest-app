/**
 * Tool Data Aggregator
 *
 * Centralized system that collects data from ALL tools across all pillars
 * and makes it available for intelligent task generation.
 *
 * This is the bridge between tools (data collection) and tasks (personalized actions).
 */

import { getFinanceProgress, getUserDebts, getEmergencyFundProgress } from '../database/finance';
import { getMentalProgress } from '../database/mental';
import { getPhysicalProgress } from '../database/physical';
import { getNutritionProgress, getWaterIntake, getDailyCalories } from '../database/nutrition';
import { getDatabase } from '../database/init';

// ============================================
// AGGREGATED DATA TYPES
// ============================================

export interface FinanceToolData {
  netWorth: number | null;
  emergencyFund: {
    current: number;
    goal: number;
    percentage: number;
    needsAction: boolean;
  };
  debts: {
    count: number;
    totalAmount: number;
    smallestDebt: number | null;
    hasDebts: boolean;
  };
  budget: {
    hasActiveBudget: boolean;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
  };
  expenses: {
    trackedToday: boolean;
    last7Days: number;
  };
}

export interface MentalToolData {
  meditation: {
    sessionsThisWeek: number;
    totalMinutes: number;
    lastSession: string | null;
  };
  screenTime: {
    todayMinutes: number;
    weeklyAverage: number;
    exceedsLimit: boolean;
  };
  morningRoutine: {
    completedToday: boolean;
    weeklyStreak: number;
  };
  dopamineDetox: {
    inProgress: boolean;
    lastCompleted: string | null;
  };
}

export interface PhysicalToolData {
  workout: {
    loggedToday: boolean;
    thisWeekCount: number;
    lastWorkout: string | null;
  };
  sleep: {
    lastNightHours: number | null;
    weeklyAverage: number;
    qualityScore: number;
  };
  bodyMeasurements: {
    currentWeight: number | null;
    currentBMI: number | null;
    goalWeight: number | null;
    progress: number;
  };
}

export interface NutritionToolData {
  water: {
    todayMl: number;
    goalMl: number;
    percentage: number;
  };
  meals: {
    loggedToday: number;
    caloriesConsumed: number;
    caloriesGoal: number;
  };
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

export interface AggregatedToolData {
  finance: FinanceToolData;
  mental: MentalToolData;
  physical: PhysicalToolData;
  nutrition: NutritionToolData;
  lastUpdated: Date;
}

// ============================================
// DATA COLLECTION FUNCTIONS
// ============================================

/**
 * Collect all finance tool data
 */
export const collectFinanceToolData = async (userId: number): Promise<FinanceToolData> => {
  try {
    const db = await getDatabase();
    const progress: any = await getFinanceProgress(userId);
    const emergencyFund = await getEmergencyFundProgress(userId);
    const debts: any[] = await getUserDebts(userId);

    // Calculate debt stats
    const activeDebts = debts.filter(d => d.current_balance > 0);
    const totalDebt = activeDebts.reduce((sum, d) => sum + d.current_balance, 0);
    const smallestDebt = activeDebts.length > 0
      ? Math.min(...activeDebts.map(d => d.current_balance))
      : null;

    // Check if expenses tracked today
    const today = new Date().toISOString().split('T')[0];
    const expensesToday = await db.getAllAsync(
      `SELECT COUNT(*) as count FROM expenses WHERE user_id = ? AND date = ?`,
      [userId, today]
    );
    const trackedToday = (expensesToday[0] as any)?.count > 0;

    // Get last 7 days expense count
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const expenses7Days = await db.getAllAsync(
      `SELECT COUNT(*) as count FROM expenses WHERE user_id = ? AND date >= ?`,
      [userId, sevenDaysAgo.toISOString().split('T')[0]]
    );

    return {
      netWorth: progress?.net_worth || null,
      emergencyFund: {
        current: emergencyFund.current,
        goal: emergencyFund.goal,
        percentage: emergencyFund.percentage,
        needsAction: emergencyFund.current < emergencyFund.goal,
      },
      debts: {
        count: activeDebts.length,
        totalAmount: totalDebt,
        smallestDebt,
        hasDebts: activeDebts.length > 0,
      },
      budget: {
        hasActiveBudget: !!progress?.monthly_income,
        monthlyIncome: progress?.monthly_income || 0,
        monthlyExpenses: progress?.monthly_expenses || 0,
        savingsRate: progress?.monthly_income
          ? ((progress.monthly_income - progress.monthly_expenses) / progress.monthly_income) * 100
          : 0,
      },
      expenses: {
        trackedToday,
        last7Days: (expenses7Days[0] as any)?.count || 0,
      },
    };
  } catch (error) {
    console.error('Error collecting finance tool data:', error);
    throw error;
  }
};

/**
 * Collect all mental health tool data
 */
export const collectMentalToolData = async (userId: number): Promise<MentalToolData> => {
  try {
    const db = await getDatabase();
    const today = new Date().toISOString().split('T')[0];

    // Meditation sessions
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const meditations = await db.getAllAsync(
      `SELECT * FROM meditation_sessions WHERE user_id = ? AND DATE(completed_at) >= ?`,
      [userId, sevenDaysAgo.toISOString().split('T')[0]]
    );
    const totalMinutes = (meditations as any[]).reduce((sum, m) => sum + m.duration_minutes, 0);
    const lastSession = meditations.length > 0 ? (meditations[0] as any).completed_at : null;

    // Screen time (if table exists)
    let todayScreenTime = 0;
    try {
      const screenTime = await db.getFirstAsync(
        `SELECT minutes FROM screen_time WHERE user_id = ? AND date = ?`,
        [userId, today]
      );
      todayScreenTime = (screenTime as any)?.minutes || 0;
    } catch {
      // Table might not exist
    }

    // Morning routine (if table exists)
    let morningRoutineToday = false;
    try {
      const routine = await db.getFirstAsync(
        `SELECT * FROM morning_routines WHERE user_id = ? AND date = ?`,
        [userId, today]
      );
      morningRoutineToday = !!routine;
    } catch {
      // Table might not exist
    }

    return {
      meditation: {
        sessionsThisWeek: meditations.length,
        totalMinutes,
        lastSession,
      },
      screenTime: {
        todayMinutes: todayScreenTime,
        weeklyAverage: 0, // TODO: Calculate
        exceedsLimit: todayScreenTime > 180, // 3 hours
      },
      morningRoutine: {
        completedToday: morningRoutineToday,
        weeklyStreak: 0, // TODO: Calculate
      },
      dopamineDetox: {
        inProgress: false, // TODO: Track
        lastCompleted: null,
      },
    };
  } catch (error) {
    console.error('Error collecting mental tool data:', error);
    throw error;
  }
};

/**
 * Collect all physical health tool data
 */
export const collectPhysicalToolData = async (userId: number): Promise<PhysicalToolData> => {
  try {
    const db = await getDatabase();
    const today = new Date().toISOString().split('T')[0];
    const progress: any = await getPhysicalProgress(userId);

    // Workout logs
    const workoutToday = await db.getFirstAsync(
      `SELECT * FROM workout_logs WHERE user_id = ? AND date = ?`,
      [userId, today]
    );

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const workoutsThisWeek = await db.getAllAsync(
      `SELECT * FROM workout_logs WHERE user_id = ? AND date >= ?`,
      [userId, sevenDaysAgo.toISOString().split('T')[0]]
    );

    // Sleep data
    const lastSleep = await db.getFirstAsync(
      `SELECT * FROM sleep_logs WHERE user_id = ? ORDER BY date DESC LIMIT 1`,
      [userId]
    );

    // Body measurements
    const bodyMeasurement = await db.getFirstAsync(
      `SELECT * FROM body_measurements WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 1`,
      [userId]
    );

    return {
      workout: {
        loggedToday: !!workoutToday,
        thisWeekCount: workoutsThisWeek.length,
        lastWorkout: workoutToday ? (workoutToday as any).date : null,
      },
      sleep: {
        lastNightHours: lastSleep ? (lastSleep as any).duration_hours : null,
        weeklyAverage: 7, // TODO: Calculate from database
        qualityScore: lastSleep ? (lastSleep as any).quality_rating || 0 : 0,
      },
      bodyMeasurements: {
        currentWeight: bodyMeasurement ? (bodyMeasurement as any).weight_kg : null,
        currentBMI: bodyMeasurement ? (bodyMeasurement as any).bmi : null,
        goalWeight: progress?.goal_weight || null,
        progress: 0, // TODO: Calculate
      },
    };
  } catch (error) {
    console.error('Error collecting physical tool data:', error);
    throw error;
  }
};

/**
 * Collect all nutrition tool data
 */
export const collectNutritionToolData = async (userId: number): Promise<NutritionToolData> => {
  try {
    const db = await getDatabase();
    const today = new Date().toISOString().split('T')[0];

    // Water intake
    const waterToday = await getWaterIntake(userId, today);

    // Meal logs
    const meals = await db.getAllAsync(
      `SELECT * FROM meal_logs WHERE user_id = ? AND date = ?`,
      [userId, today]
    );

    // Daily calories
    const calories = await getDailyCalories(userId, today);

    return {
      water: {
        todayMl: waterToday,
        goalMl: 2000,
        percentage: (waterToday / 2000) * 100,
      },
      meals: {
        loggedToday: meals.length,
        caloriesConsumed: calories?.consumed || 0,
        caloriesGoal: calories?.goal || 2000,
      },
      macros: {
        protein: 0, // TODO: Calculate from meals
        carbs: 0,
        fats: 0,
      },
    };
  } catch (error) {
    console.error('Error collecting nutrition tool data:', error);
    throw error;
  }
};

/**
 * MAIN AGGREGATOR - Collects ALL tool data
 */
export const aggregateAllToolData = async (userId: number): Promise<AggregatedToolData> => {
  console.log('🔄 Aggregating tool data for user:', userId);

  try {
    const [finance, mental, physical, nutrition] = await Promise.all([
      collectFinanceToolData(userId),
      collectMentalToolData(userId),
      collectPhysicalToolData(userId),
      collectNutritionToolData(userId),
    ]);

    console.log('✅ Tool data aggregation complete');

    return {
      finance,
      mental,
      physical,
      nutrition,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('❌ Error aggregating tool data:', error);
    throw error;
  }
};

/**
 * Get actionable insights from aggregated data
 * This helps generate smart, personalized tasks
 */
export const getActionableInsights = (data: AggregatedToolData) => {
  const insights = {
    finance: {
      urgentActions: [] as string[],
      suggestions: [] as string[],
    },
    mental: {
      urgentActions: [] as string[],
      suggestions: [] as string[],
    },
    physical: {
      urgentActions: [] as string[],
      suggestions: [] as string[],
    },
    nutrition: {
      urgentActions: [] as string[],
      suggestions: [] as string[],
    },
  };

  // Finance insights
  if (data.finance.emergencyFund.needsAction && data.finance.emergencyFund.current < 500) {
    insights.finance.urgentActions.push('Build emergency fund - critical priority');
  }
  if (data.finance.debts.hasDebts && data.finance.debts.smallestDebt! < 500) {
    insights.finance.urgentActions.push('Small debt detected - easy win available!');
  }
  if (!data.finance.expenses.trackedToday) {
    insights.finance.suggestions.push('Track today\'s expenses');
  }

  // Mental insights
  if (data.mental.meditation.sessionsThisWeek === 0) {
    insights.mental.suggestions.push('Start meditation practice');
  }
  if (data.mental.screenTime.exceedsLimit) {
    insights.mental.urgentActions.push('Screen time exceeds healthy limit');
  }

  // Physical insights
  if (!data.physical.workout.loggedToday && data.physical.workout.thisWeekCount < 3) {
    insights.physical.suggestions.push('Log workout - stay active');
  }
  if (data.physical.sleep.lastNightHours && data.physical.sleep.lastNightHours < 6) {
    insights.physical.urgentActions.push('Sleep quality needs attention');
  }

  // Nutrition insights
  if (data.nutrition.water.percentage < 50 && new Date().getHours() > 15) {
    insights.nutrition.urgentActions.push('Water intake below 50% - drink up!');
  }
  if (data.nutrition.meals.loggedToday === 0 && new Date().getHours() > 12) {
    insights.nutrition.suggestions.push('Log your meals for better tracking');
  }

  return insights;
};
