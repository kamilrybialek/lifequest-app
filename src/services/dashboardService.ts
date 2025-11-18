/**
 * DASHBOARD DATA SERVICE
 *
 * Aggregates data from all pillars for the main dashboard
 * Provides real-time stats, progress tracking, and personalized insights
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserTasks } from './firebaseTaskService';
import {
  getFinancialProfile,
  getUserExpenses,
  getUserDebts,
  getUserBudget,
} from './firebaseFinanceService';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface DashboardStats {
  finance: FinanceStats;
  tasks: TaskStats;
  physical: PhysicalStats;
  mental: MentalStats;
  nutrition: NutritionStats;
}

export interface FinanceStats {
  monthlyExpenses: number;
  budgetRemaining: number;
  budgetUsagePercent: number;
  totalDebt: number;
  expensesThisWeek: number;
  emergencyFund: number;
  netWorth: number;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  todayTasks: number;
  flaggedTasks: number;
  overdueTasks: number;
}

export interface PhysicalStats {
  workoutsThisWeek: number;
  workoutGoal: number;
  currentStreak: number;
  weight: number;
  bmi: number;
  stepsToday: number;
}

export interface MentalStats {
  meditationMinutes: number;
  meditationStreak: number;
  journalEntries: number;
  stressLevel: number; // 1-5
}

export interface NutritionStats {
  caloriesConsumed: number;
  calorieGoal: number;
  waterIntake: number; // ml
  waterGoal: number;
  mealsLogged: number;
  mealGoal: number;
}

export interface DashboardInsight {
  id: string;
  type: 'achievement' | 'warning' | 'suggestion' | 'progress';
  pillar: 'finance' | 'physical' | 'mental' | 'nutrition' | 'general';
  title: string;
  description: string;
  icon: string;
  color: string;
  action?: {
    label: string;
    screen: string;
  };
}

// ============================================
// MAIN DASHBOARD DATA
// ============================================

/**
 * Get comprehensive dashboard stats for a user
 */
export const getDashboardStats = async (userId: string, isDemo: boolean = false): Promise<DashboardStats> => {
  try {
    const [financeStats, taskStats, physicalStats, mentalStats, nutritionStats] = await Promise.all([
      getFinanceStats(userId, isDemo),
      getTaskStats(userId, isDemo),
      getPhysicalStats(userId, isDemo),
      getMentalStats(userId, isDemo),
      getNutritionStats(userId, isDemo),
    ]);

    return {
      finance: financeStats,
      tasks: taskStats,
      physical: physicalStats,
      mental: mentalStats,
      nutrition: nutritionStats,
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return getDefaultStats();
  }
};

/**
 * Get personalized insights based on user data
 */
export const getDashboardInsights = async (userId: string, isDemo: boolean = false): Promise<DashboardInsight[]> => {
  const insights: DashboardInsight[] = [];
  const stats = await getDashboardStats(userId, isDemo);

  // Finance Insights
  if (stats.finance.budgetUsagePercent > 90) {
    insights.push({
      id: 'budget-warning',
      type: 'warning',
      pillar: 'finance',
      title: '⚠️ Budget Alert',
      description: `You've used ${stats.finance.budgetUsagePercent.toFixed(0)}% of your monthly budget`,
      icon: 'warning',
      color: '#FF9500',
      action: { label: 'View Budget', screen: 'FinanceDashboard' },
    });
  }

  if (stats.finance.emergencyFund < 1000 && stats.finance.emergencyFund > 0) {
    insights.push({
      id: 'emergency-fund',
      type: 'suggestion',
      pillar: 'finance',
      title: '💰 Build Emergency Fund',
      description: `$${stats.finance.emergencyFund.toFixed(0)} / $1,000 saved. Keep going!`,
      icon: 'cash',
      color: '#58CC02',
      action: { label: 'Add Savings', screen: 'FinanceDashboard' },
    });
  }

  // Task Insights
  if (stats.tasks.completionRate >= 80) {
    insights.push({
      id: 'task-achievement',
      type: 'achievement',
      pillar: 'general',
      title: '🎯 Great Progress!',
      description: `${stats.tasks.completionRate.toFixed(0)}% task completion rate`,
      icon: 'trophy',
      color: '#FFD700',
    });
  }

  if (stats.tasks.overdueTasks > 0) {
    insights.push({
      id: 'overdue-tasks',
      type: 'warning',
      pillar: 'general',
      title: '📌 Overdue Tasks',
      description: `You have ${stats.tasks.overdueTasks} overdue ${stats.tasks.overdueTasks === 1 ? 'task' : 'tasks'}`,
      icon: 'alert-circle',
      color: '#FF4B4B',
      action: { label: 'View Tasks', screen: 'TasksNew' },
    });
  }

  // Physical Insights
  if (stats.physical.currentStreak >= 7) {
    insights.push({
      id: 'workout-streak',
      type: 'achievement',
      pillar: 'physical',
      title: '🔥 Workout Streak!',
      description: `${stats.physical.currentStreak} day streak. Keep it up!`,
      icon: 'flame',
      color: '#FF4500',
    });
  }

  if (stats.physical.workoutsThisWeek < stats.physical.workoutGoal) {
    const remaining = stats.physical.workoutGoal - stats.physical.workoutsThisWeek;
    insights.push({
      id: 'workout-reminder',
      type: 'suggestion',
      pillar: 'physical',
      title: '💪 Workout Progress',
      description: `${stats.physical.workoutsThisWeek}/${stats.physical.workoutGoal} workouts this week. ${remaining} more to go!`,
      icon: 'fitness',
      color: '#00BCD4',
      action: { label: 'Log Workout', screen: 'PhysicalHealthPath' },
    });
  }

  // Mental Insights
  if (stats.mental.meditationStreak >= 7) {
    insights.push({
      id: 'meditation-streak',
      type: 'achievement',
      pillar: 'mental',
      title: '🧘 Mindful Streak!',
      description: `${stats.mental.meditationStreak} days of meditation`,
      icon: 'flower',
      color: '#9C27B0',
    });
  }

  // Nutrition Insights
  const calorieProgress = (stats.nutrition.caloriesConsumed / stats.nutrition.calorieGoal) * 100;
  if (calorieProgress >= 90 && calorieProgress <= 110) {
    insights.push({
      id: 'calorie-target',
      type: 'achievement',
      pillar: 'nutrition',
      title: '🎯 Perfect Nutrition!',
      description: `You're right on track with your calorie goal`,
      icon: 'checkmark-circle',
      color: '#4CAF50',
    });
  }

  const waterProgress = (stats.nutrition.waterIntake / stats.nutrition.waterGoal) * 100;
  if (waterProgress < 50) {
    insights.push({
      id: 'water-reminder',
      type: 'suggestion',
      pillar: 'nutrition',
      title: '💧 Stay Hydrated',
      description: `${stats.nutrition.waterIntake}ml / ${stats.nutrition.waterGoal}ml today`,
      icon: 'water',
      color: '#2196F3',
      action: { label: 'Log Water', screen: 'NutritionPath' },
    });
  }

  // Sort insights by priority (warnings first, then achievements, then suggestions)
  const priorityOrder = { warning: 1, achievement: 2, suggestion: 3, progress: 4 };
  insights.sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);

  return insights;
};

// ============================================
// PILLAR-SPECIFIC STATS
// ============================================

async function getFinanceStats(userId: string, isDemo: boolean): Promise<FinanceStats> {
  try {
    if (isDemo) {
      const data = await AsyncStorage.getItem('demo_finance_profile');
      if (data) {
        const profile = JSON.parse(data);
        return {
          monthlyExpenses: profile.monthly_expenses || 0,
          budgetRemaining: profile.budget_remaining || 0,
          budgetUsagePercent: profile.budget_usage || 0,
          totalDebt: profile.total_debt || 0,
          expensesThisWeek: profile.expenses_this_week || 0,
          emergencyFund: profile.emergency_fund || 0,
          netWorth: profile.net_worth || 0,
        };
      }
    } else {
      const [profile, expenses, debts, budget] = await Promise.all([
        getFinancialProfile(userId),
        getUserExpenses(userId, 7), // Last 7 days
        getUserDebts(userId),
        getUserBudget(userId, new Date().toISOString().substring(0, 7)),
      ]);

      const monthlyExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const totalDebt = debts.filter(d => d.status === 'active').reduce((sum, d) => sum + d.remaining_amount, 0);
      const budgetTotal = budget?.total_income || 0;
      const budgetUsagePercent = budgetTotal > 0 ? (monthlyExpenses / budgetTotal) * 100 : 0;

      return {
        monthlyExpenses: profile?.monthly_expenses || monthlyExpenses,
        budgetRemaining: Math.max(0, budgetTotal - monthlyExpenses),
        budgetUsagePercent,
        totalDebt,
        expensesThisWeek: monthlyExpenses,
        emergencyFund: profile?.emergency_fund_goal || 0,
        netWorth: profile?.net_worth || 0,
      };
    }
  } catch (error) {
    console.error('Error getting finance stats:', error);
  }

  return {
    monthlyExpenses: 0,
    budgetRemaining: 0,
    budgetUsagePercent: 0,
    totalDebt: 0,
    expensesThisWeek: 0,
    emergencyFund: 0,
    netWorth: 0,
  };
}

async function getTaskStats(userId: string, isDemo: boolean): Promise<TaskStats> {
  try {
    let tasks;
    if (isDemo) {
      const data = await AsyncStorage.getItem('user_tasks');
      tasks = data ? JSON.parse(data) : [];
    } else {
      tasks = await getUserTasks(userId);
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.completed).length;
    const todayTasks = tasks.filter((t: any) => {
      if (!t.due_date) return false;
      const dueDate = new Date(t.due_date);
      const today = new Date();
      return dueDate.toDateString() === today.toDateString();
    }).length;
    const flaggedTasks = tasks.filter((t: any) => t.flagged && !t.completed).length;
    const overdueTasks = tasks.filter((t: any) => {
      if (!t.due_date || t.completed) return false;
      return new Date(t.due_date) < new Date();
    }).length;

    return {
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      todayTasks,
      flaggedTasks,
      overdueTasks,
    };
  } catch (error) {
    console.error('Error getting task stats:', error);
    return {
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      todayTasks: 0,
      flaggedTasks: 0,
      overdueTasks: 0,
    };
  }
}

async function getPhysicalStats(userId: string, isDemo: boolean): Promise<PhysicalStats> {
  try {
    const data = await AsyncStorage.getItem(isDemo ? 'demo_physical_data' : `physical_data_${userId}`);
    if (data) {
      const physical = JSON.parse(data);
      return {
        workoutsThisWeek: physical.workouts_this_week || 0,
        workoutGoal: physical.workout_goal || 5,
        currentStreak: physical.current_streak || 0,
        weight: physical.weight || 0,
        bmi: physical.bmi || 0,
        stepsToday: physical.steps_today || 0,
      };
    }
  } catch (error) {
    console.error('Error getting physical stats:', error);
  }

  return {
    workoutsThisWeek: 0,
    workoutGoal: 5,
    currentStreak: 0,
    weight: 0,
    bmi: 0,
    stepsToday: 0,
  };
}

async function getMentalStats(userId: string, isDemo: boolean): Promise<MentalStats> {
  try {
    const data = await AsyncStorage.getItem(isDemo ? 'demo_mental_data' : `mental_data_${userId}`);
    if (data) {
      const mental = JSON.parse(data);
      return {
        meditationMinutes: mental.meditation_minutes || 0,
        meditationStreak: mental.meditation_streak || 0,
        journalEntries: mental.journal_entries || 0,
        stressLevel: mental.stress_level || 3,
      };
    }
  } catch (error) {
    console.error('Error getting mental stats:', error);
  }

  return {
    meditationMinutes: 0,
    meditationStreak: 0,
    journalEntries: 0,
    stressLevel: 3,
  };
}

async function getNutritionStats(userId: string, isDemo: boolean): Promise<NutritionStats> {
  try {
    const data = await AsyncStorage.getItem(isDemo ? 'demo_nutrition_data' : `nutrition_data_${userId}`);
    if (data) {
      const nutrition = JSON.parse(data);
      return {
        caloriesConsumed: nutrition.calories_consumed || 0,
        calorieGoal: nutrition.calorie_goal || 2000,
        waterIntake: nutrition.water_intake || 0,
        waterGoal: nutrition.water_goal || 2000,
        mealsLogged: nutrition.meals_logged || 0,
        mealGoal: nutrition.meal_goal || 3,
      };
    }
  } catch (error) {
    console.error('Error getting nutrition stats:', error);
  }

  return {
    caloriesConsumed: 0,
    calorieGoal: 2000,
    waterIntake: 0,
    waterGoal: 2000,
    mealsLogged: 0,
    mealGoal: 3,
  };
}

function getDefaultStats(): DashboardStats {
  return {
    finance: {
      monthlyExpenses: 0,
      budgetRemaining: 0,
      budgetUsagePercent: 0,
      totalDebt: 0,
      expensesThisWeek: 0,
      emergencyFund: 0,
      netWorth: 0,
    },
    tasks: {
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      todayTasks: 0,
      flaggedTasks: 0,
      overdueTasks: 0,
    },
    physical: {
      workoutsThisWeek: 0,
      workoutGoal: 5,
      currentStreak: 0,
      weight: 0,
      bmi: 0,
      stepsToday: 0,
    },
    mental: {
      meditationMinutes: 0,
      meditationStreak: 0,
      journalEntries: 0,
      stressLevel: 3,
    },
    nutrition: {
      caloriesConsumed: 0,
      calorieGoal: 2000,
      waterIntake: 0,
      waterGoal: 2000,
      mealsLogged: 0,
      mealGoal: 3,
    },
  };
}
