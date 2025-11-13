/**
 * Enhanced Task Generator v3.0
 *
 * Leverages real tool data to generate truly personalized, actionable tasks
 * that adapt to user's actual progress and behavior.
 *
 * KEY IMPROVEMENT: Instead of hardcoded suggestions, tasks are dynamically
 * generated based on what the user has actually done in the tools.
 */

import { aggregateAllToolData, getActionableInsights, AggregatedToolData } from './toolDataAggregator';
import { SmartTask } from './intelligentTaskGenerator';

/**
 * Generate Finance Tasks from REAL tool data
 */
const generateFinanceTasksFromData = (toolData: AggregatedToolData['finance']): SmartTask[] => {
  const tasks: SmartTask[] = [];

  // EMERGENCY FUND - Based on actual progress
  if (toolData.emergencyFund.needsAction) {
    const remaining = toolData.emergencyFund.goal - toolData.emergencyFund.current;
    const percentage = toolData.emergencyFund.percentage;

    // Calculate suggested amount based on progress
    let suggestedAmount = 50;
    if (percentage < 25) {
      suggestedAmount = Math.min(100, Math.ceil(remaining / 10));
    } else if (percentage < 75) {
      suggestedAmount = Math.min(50, Math.ceil(remaining / 5));
    } else {
      suggestedAmount = Math.ceil(remaining); // Final push!
    }

    tasks.push({
      pillar: 'finance',
      title: `Add $${suggestedAmount} to Emergency Fund`,
      description: `You're ${percentage.toFixed(0)}% there! $${remaining.toFixed(0)} remaining to reach $${toolData.emergencyFund.goal}`,
      action_type: 'tool',
      action_screen: 'EmergencyFundScreen',
      duration: 5,
      xp_reward: percentage > 90 ? 30 : 20,
      difficulty: percentage > 90 ? 'easy' : 'medium',
      priority: percentage < 50 ? 10 : 8,
      streak_eligible: true,
    });
  } else if (toolData.emergencyFund.percentage >= 100 && toolData.emergencyFund.goal === 1000) {
    // Completed Baby Step 1, encourage Baby Step 2
    tasks.push({
      pillar: 'finance',
      title: '🎉 Emergency Fund Complete - Celebrate!',
      description: 'You did it! Now upgrade to 3-6 months emergency fund',
      action_type: 'tool',
      action_screen: 'EmergencyFundScreen',
      duration: 5,
      xp_reward: 50,
      difficulty: 'easy',
      priority: 7,
      streak_eligible: false,
    });
  }

  // DEBT SNOWBALL - Based on actual debts
  if (toolData.debts.hasDebts) {
    if (toolData.debts.smallestDebt! < 500) {
      tasks.push({
        pillar: 'finance',
        title: `Attack Smallest Debt - Quick Win!`,
        description: `Only $${toolData.debts.smallestDebt!.toFixed(0)} left! You can eliminate this debt FAST! `,
        action_type: 'tool',
        action_screen: 'DebtTrackerScreen',
        duration: 10,
        xp_reward: 30,
        difficulty: 'medium',
        priority: 10,
        streak_eligible: true,
      });
    } else {
      tasks.push({
        pillar: 'finance',
        title: 'Make Extra Debt Payment',
        description: `${toolData.debts.count} debt${toolData.debts.count > 1 ? 's' : ''} remaining. Keep the snowball rolling!`,
        action_type: 'tool',
        action_screen: 'DebtTrackerScreen',
        duration: 10,
        xp_reward: 25,
        difficulty: 'medium',
        priority: 9,
        streak_eligible: true,
      });
    }
  }

  // EXPENSE TRACKING - Based on actual tracking behavior
  if (!toolData.expenses.trackedToday) {
    const priority = toolData.expenses.last7Days === 0 ? 9 : 7;
    tasks.push({
      pillar: 'finance',
      title: toolData.expenses.last7Days === 0 ? 'Start Tracking Expenses Today!' : 'Log Today\'s Expenses',
      description: toolData.expenses.last7Days === 0
        ? 'You can\'t manage what you don\'t measure - start today!'
        : 'Stay in control by tracking every dollar',
      action_type: 'tool',
      action_screen: 'ExpenseLoggerScreen',
      duration: 5,
      xp_reward: 15,
      difficulty: 'easy',
      priority,
      streak_eligible: true,
    });
  }

  // BUDGET - Based on whether user has active budget
  if (!toolData.budget.hasActiveBudget) {
    tasks.push({
      pillar: 'finance',
      title: 'Create Your First Budget',
      description: 'Give every dollar a job - take control of your money',
      action_type: 'tool',
      action_screen: 'BudgetManagerScreen',
      duration: 15,
      xp_reward: 25,
      difficulty: 'medium',
      priority: 8,
      streak_eligible: true,
    });
  } else if (toolData.budget.savingsRate < 10) {
    tasks.push({
      pillar: 'finance',
      title: 'Increase Your Savings Rate',
      description: `Currently saving ${toolData.budget.savingsRate.toFixed(0)}% - aim for at least 20%!`,
      action_type: 'tool',
      action_screen: 'BudgetManagerScreen',
      duration: 10,
      xp_reward: 20,
      difficulty: 'medium',
      priority: 7,
      streak_eligible: false,
    });
  }

  return tasks;
};

/**
 * Generate Mental Tasks from REAL tool data
 */
const generateMentalTasksFromData = (toolData: AggregatedToolData['mental']): SmartTask[] => {
  const tasks: SmartTask[] = [];

  // MEDITATION - Based on actual sessions
  if (toolData.meditation.sessionsThisWeek === 0) {
    tasks.push({
      pillar: 'mental',
      title: 'Start Your First Meditation',
      description: 'Just 5 minutes can reduce stress and improve focus',
      action_type: 'tool',
      action_screen: 'MeditationTimer',
      duration: 5,
      xp_reward: 20,
      difficulty: 'easy',
      priority: 8,
      streak_eligible: true,
    });
  } else if (toolData.meditation.sessionsThisWeek < 3) {
    tasks.push({
      pillar: 'mental',
      title: 'Continue Meditation Practice',
      description: `${toolData.meditation.sessionsThisWeek} session${toolData.meditation.sessionsThisWeek > 1 ? 's' : ''} this week - aim for 5!`,
      action_type: 'tool',
      action_screen: 'MeditationTimer',
      duration: 10,
      xp_reward: 15,
      difficulty: 'easy',
      priority: 7,
      streak_eligible: true,
    });
  } else {
    tasks.push({
      pillar: 'mental',
      title: '🔥 Meditation Streak Going!',
      description: `${toolData.meditation.sessionsThisWeek} sessions this week - you're crushing it!`,
      action_type: 'tool',
      action_screen: 'MeditationTimer',
      duration: 10,
      xp_reward: 15,
      difficulty: 'easy',
      priority: 6,
      streak_eligible: true,
    });
  }

  // SCREEN TIME - Based on actual usage
  if (toolData.screenTime.exceedsLimit) {
    tasks.push({
      pillar: 'mental',
      title: '⚠️ Reduce Screen Time',
      description: `${toolData.screenTime.todayMinutes} min today - try to stay under 180 min`,
      action_type: 'tool',
      action_screen: 'ScreenTimeTracker',
      duration: 5,
      xp_reward: 20,
      difficulty: 'hard',
      priority: 9,
      streak_eligible: true,
    });
  } else if (toolData.screenTime.todayMinutes > 0) {
    tasks.push({
      pillar: 'mental',
      title: 'Track Screen Time',
      description: 'Monitor digital habits for better mental health',
      action_type: 'tool',
      action_screen: 'ScreenTimeTracker',
      duration: 3,
      xp_reward: 10,
      difficulty: 'easy',
      priority: 6,
      streak_eligible: true,
    });
  }

  // MORNING ROUTINE - Based on completion
  if (!toolData.morningRoutine.completedToday) {
    const hour = new Date().getHours();
    if (hour < 12) {
      tasks.push({
        pillar: 'mental',
        title: 'Complete Morning Routine',
        description: 'Start your day right with your morning ritual',
        action_type: 'tool',
        action_screen: 'MorningRoutine',
        duration: 15,
        xp_reward: 20,
        difficulty: 'easy',
        priority: 8,
        streak_eligible: true,
      });
    }
  }

  return tasks;
};

/**
 * Generate Physical Tasks from REAL tool data
 */
const generatePhysicalTasksFromData = (toolData: AggregatedToolData['physical']): SmartTask[] => {
  const tasks: SmartTask[] = [];

  // WORKOUT - Based on actual logging
  if (!toolData.workout.loggedToday) {
    const weekCount = toolData.workout.thisWeekCount;
    tasks.push({
      pillar: 'physical',
      title: weekCount === 0 ? 'Start Moving Today!' : 'Log Today\'s Workout',
      description: weekCount === 0
        ? 'Any movement counts - even a 10-minute walk!'
        : `${weekCount} workout${weekCount > 1 ? 's' : ''} this week - keep it up!`,
      action_type: 'tool',
      action_screen: 'WorkoutTrackerScreen',
      duration: 20,
      xp_reward: 25,
      difficulty: 'medium',
      priority: weekCount < 3 ? 9 : 7,
      streak_eligible: true,
    });
  }

  // SLEEP - Based on actual sleep data
  if (toolData.sleep.lastNightHours !== null) {
    if (toolData.sleep.lastNightHours < 6) {
      tasks.push({
        pillar: 'physical',
        title: '😴 Prioritize Sleep Tonight',
        description: `Last night: ${toolData.sleep.lastNightHours}h - aim for 7-9 hours!`,
        action_type: 'tool',
        action_screen: 'SleepTrackerScreen',
        duration: 5,
        xp_reward: 20,
        difficulty: 'medium',
        priority: 10,
        streak_eligible: true,
      });
    } else if (toolData.sleep.lastNightHours >= 7) {
      tasks.push({
        pillar: 'physical',
        title: 'Track Last Night\'s Sleep',
        description: `Great sleep (${toolData.sleep.lastNightHours}h)! Keep tracking`,
        action_type: 'tool',
        action_screen: 'SleepTrackerScreen',
        duration: 3,
        xp_reward: 15,
        difficulty: 'easy',
        priority: 6,
        streak_eligible: true,
      });
    }
  } else {
    // No sleep data
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      tasks.push({
        pillar: 'physical',
        title: 'Log Last Night\'s Sleep',
        description: 'Track sleep quality and duration for better health',
        action_type: 'tool',
        action_screen: 'SleepTrackerScreen',
        duration: 3,
        xp_reward: 15,
        difficulty: 'easy',
        priority: 7,
        streak_eligible: true,
      });
    }
  }

  // BODY MEASUREMENTS - Weekly reminder
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 1 && !toolData.bodyMeasurements.currentWeight) {
    tasks.push({
      pillar: 'physical',
      title: 'Monday Weigh-In',
      description: 'Track your progress weekly for best results',
      action_type: 'tool',
      action_screen: 'BodyMeasurementsScreen',
      duration: 5,
      xp_reward: 15,
      difficulty: 'easy',
      priority: 7,
      streak_eligible: true,
    });
  }

  return tasks;
};

/**
 * Generate Nutrition Tasks from REAL tool data
 */
const generateNutritionTasksFromData = (toolData: AggregatedToolData['nutrition']): SmartTask[] => {
  const tasks: SmartTask[] = [];
  const hour = new Date().getHours();

  // WATER - Based on actual intake
  if (toolData.water.percentage < 50 && hour > 12) {
    tasks.push({
      pillar: 'nutrition',
      title: '💧 Drink Water NOW!',
      description: `Only ${toolData.water.percentage.toFixed(0)}% of goal - you're falling behind!`,
      action_type: 'tool',
      action_screen: 'WaterTrackerScreen',
      duration: 2,
      xp_reward: 15,
      difficulty: 'easy',
      priority: 10,
      streak_eligible: true,
    });
  } else if (toolData.water.percentage < 100) {
    tasks.push({
      pillar: 'nutrition',
      title: 'Stay Hydrated',
      description: `${toolData.water.todayMl}ml / ${toolData.water.goalMl}ml - keep drinking!`,
      action_type: 'tool',
      action_screen: 'WaterTrackerScreen',
      duration: 2,
      xp_reward: 10,
      difficulty: 'easy',
      priority: 7,
      streak_eligible: true,
    });
  }

  // MEALS - Based on actual logging
  if (toolData.meals.loggedToday === 0 && hour > 12) {
    tasks.push({
      pillar: 'nutrition',
      title: 'Log Your Meals Today',
      description: 'Track what you eat to reach your nutrition goals',
      action_type: 'tool',
      action_screen: 'MealLoggerScreen',
      duration: 5,
      xp_reward: 20,
      difficulty: 'easy',
      priority: 9,
      streak_eligible: true,
    });
  } else if (toolData.meals.loggedToday > 0 && toolData.meals.loggedToday < 3) {
    tasks.push({
      pillar: 'nutrition',
      title: 'Log Remaining Meals',
      description: `${toolData.meals.loggedToday} meal${toolData.meals.loggedToday > 1 ? 's' : ''} logged - track them all!`,
      action_type: 'tool',
      action_screen: 'MealLoggerScreen',
      duration: 5,
      xp_reward: 15,
      difficulty: 'easy',
      priority: 7,
      streak_eligible: true,
    });
  }

  // CALORIES - Based on actual consumption
  if (toolData.meals.caloriesGoal > 0) {
    const caloriePercentage = (toolData.meals.caloriesConsumed / toolData.meals.caloriesGoal) * 100;
    if (caloriePercentage > 120) {
      tasks.push({
        pillar: 'nutrition',
        title: 'Calories Over Goal',
        description: `${toolData.meals.caloriesConsumed} / ${toolData.meals.caloriesGoal} cal - adjust tomorrow`,
        action_type: 'tool',
        action_screen: 'CalorieCalculatorScreen',
        duration: 5,
        xp_reward: 10,
        difficulty: 'medium',
        priority: 6,
        streak_eligible: false,
      });
    }
  }

  return tasks;
};

/**
 * MAIN ENHANCED TASK GENERATOR
 * Generates truly personalized tasks based on REAL tool data
 */
export const generateEnhancedTasks = async (userId: number): Promise<SmartTask[]> => {
  console.log('🚀 Enhanced Task Generator v3.0 - Starting...');

  try {
    // Step 1: Aggregate ALL tool data
    const toolData = await aggregateAllToolData(userId);
    console.log('📊 Tool data collected:', {
      finance: `${toolData.finance.emergencyFund.percentage.toFixed(0)}% emergency fund`,
      mental: `${toolData.mental.meditation.sessionsThisWeek} meditations this week`,
      physical: `${toolData.physical.workout.thisWeekCount} workouts this week`,
      nutrition: `${toolData.nutrition.water.percentage.toFixed(0)}% water goal`,
    });

    // Step 2: Generate tasks from REAL data
    const financeTasks = generateFinanceTasksFromData(toolData.finance);
    const mentalTasks = generateMentalTasksFromData(toolData.mental);
    const physicalTasks = generatePhysicalTasksFromData(toolData.physical);
    const nutritionTasks = generateNutritionTasksFromData(toolData.nutrition);

    // Step 3: Combine all tasks
    const allTasks = [...financeTasks, ...mentalTasks, ...physicalTasks, ...nutritionTasks];

    // Step 4: Get insights for priority adjustment
    const insights = getActionableInsights(toolData);
    console.log('💡 Insights:', insights);

    // Step 5: Sort by priority and return balanced set
    const sortedTasks = allTasks.sort((a, b) => b.priority - a.priority);

    // Step 6: Balance across pillars (2 per pillar max for daily list)
    const balanced: SmartTask[] = [];
    const byPillar = {
      finance: sortedTasks.filter(t => t.pillar === 'finance'),
      mental: sortedTasks.filter(t => t.pillar === 'mental'),
      physical: sortedTasks.filter(t => t.pillar === 'physical'),
      nutrition: sortedTasks.filter(t => t.pillar === 'nutrition'),
    };

    // Take top 2 from each pillar
    Object.values(byPillar).forEach(tasks => {
      balanced.push(...tasks.slice(0, 2));
    });

    console.log(`✅ Generated ${balanced.length} enhanced tasks`);
    return balanced.sort((a, b) => b.priority - a.priority);

  } catch (error) {
    console.error('❌ Error in enhanced task generator:', error);
    // Fallback to basic tasks if aggregation fails
    return [];
  }
};
