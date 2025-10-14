import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { showSuccessToast, showErrorToast } from '../hooks/useAsyncOperation';

/**
 * Export data to CSV file and share
 */
export const exportToCSV = async (
  data: any[],
  filename: string,
  headers: string[]
): Promise<void> => {
  try {
    if (data.length === 0) {
      showErrorToast('No data to export');
      return;
    }

    // Create CSV content
    const csvContent = convertToCSV(data, headers);

    if (Platform.OS === 'web') {
      // Web: Download file
      downloadCSVWeb(csvContent, filename);
    } else {
      // Mobile: Save and share
      await saveAndShareCSV(csvContent, filename);
    }

    showSuccessToast(`Exported ${data.length} rows to ${filename}`);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    showErrorToast('Failed to export data');
  }
};

/**
 * Convert array of objects to CSV string
 */
const convertToCSV = (data: any[], headers: string[]): string => {
  // CSV Header
  const csvHeaders = headers.join(',');

  // CSV Rows
  const csvRows = data.map(item => {
    return headers.map(header => {
      const value = item[header];

      // Handle different types
      if (value === null || value === undefined) {
        return '';
      }

      // Escape quotes and wrap in quotes if contains comma
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }

      return stringValue;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
};

/**
 * Download CSV on web
 */
const downloadCSVWeb = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Save and share CSV on mobile
 */
const saveAndShareCSV = async (csvContent: string, filename: string): Promise<void> => {
  const fileUri = FileSystem.documentDirectory + filename;

  // Write CSV to file
  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  // Check if sharing is available
  const isAvailable = await Sharing.isAvailableAsync();

  if (isAvailable) {
    // Share file
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export CSV',
      UTI: 'public.comma-separated-values-text',
    });
  } else {
    showErrorToast('Sharing not available on this device');
  }
};

/**
 * Export expenses to CSV
 */
export const exportExpenses = async (expenses: any[]): Promise<void> => {
  const headers = ['date', 'category', 'amount', 'description'];
  const filename = `expenses_${new Date().toISOString().split('T')[0]}.csv`;

  const formattedData = expenses.map(expense => ({
    date: expense.expense_date || expense.expenseDate || '',
    category: expense.category || '',
    amount: expense.amount || 0,
    description: expense.description || '',
  }));

  await exportToCSV(formattedData, filename, headers);
};

/**
 * Export budget to CSV
 */
export const exportBudget = async (budget: any): Promise<void> => {
  const headers = ['category', 'allocated', 'spent', 'remaining', 'percentage'];
  const filename = `budget_${budget.month || new Date().toISOString().slice(0, 7)}.csv`;

  const formattedData = budget.categories.map((category: any) => {
    const allocated = category.allocated_amount || category.allocatedAmount || 0;
    const spent = category.spent || category.spent_amount || 0;
    const remaining = allocated - spent;
    const percentage = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;

    return {
      category: category.name || '',
      allocated: allocated.toFixed(2),
      spent: spent.toFixed(2),
      remaining: remaining.toFixed(2),
      percentage: `${percentage}%`,
    };
  });

  await exportToCSV(formattedData, filename, headers);
};

/**
 * Export debts to CSV
 */
export const exportDebts = async (debts: any[]): Promise<void> => {
  const headers = ['name', 'type', 'original_amount', 'current_balance', 'interest_rate', 'minimum_payment', 'status'];
  const filename = `debts_${new Date().toISOString().split('T')[0]}.csv`;

  const formattedData = debts.map(debt => ({
    name: debt.name || '',
    type: debt.type || '',
    original_amount: debt.original_amount || 0,
    current_balance: debt.current_balance || 0,
    interest_rate: debt.interest_rate || 0,
    minimum_payment: debt.minimum_payment || 0,
    status: debt.is_paid_off ? 'Paid Off' : 'Active',
  }));

  await exportToCSV(formattedData, filename, headers);
};

/**
 * Export savings goals to CSV
 */
export const exportSavingsGoals = async (goals: any[]): Promise<void> => {
  const headers = ['goal_name', 'target_amount', 'current_amount', 'progress_percentage', 'target_date', 'status'];
  const filename = `savings_goals_${new Date().toISOString().split('T')[0]}.csv`;

  const formattedData = goals.map(goal => {
    const progress = goal.target_amount > 0
      ? Math.round((goal.current_amount / goal.target_amount) * 100)
      : 0;

    return {
      goal_name: goal.goal_name || '',
      target_amount: goal.target_amount || 0,
      current_amount: goal.current_amount || 0,
      progress_percentage: `${progress}%`,
      target_date: goal.target_date || '',
      status: goal.is_completed ? 'Completed' : 'In Progress',
    };
  });

  await exportToCSV(formattedData, filename, headers);
};

/**
 * Export meal log to CSV
 */
export const exportMealLog = async (meals: any[]): Promise<void> => {
  const headers = ['date', 'meal_type', 'calories', 'protein', 'carbs', 'fat', 'notes'];
  const filename = `meals_${new Date().toISOString().split('T')[0]}.csv`;

  const formattedData = meals.map(meal => ({
    date: meal.meal_date || '',
    meal_type: meal.meal_type || '',
    calories: meal.total_calories || 0,
    protein: meal.total_protein || 0,
    carbs: meal.total_carbs || 0,
    fat: meal.total_fat || 0,
    notes: meal.notes || '',
  }));

  await exportToCSV(formattedData, filename, headers);
};

/**
 * Export workout history to CSV
 */
export const exportWorkouts = async (workouts: any[]): Promise<void> => {
  const headers = ['date', 'type', 'duration_minutes', 'intensity', 'calories_burned', 'notes'];
  const filename = `workouts_${new Date().toISOString().split('T')[0]}.csv`;

  const formattedData = workouts.map(workout => ({
    date: workout.workout_date || '',
    type: workout.type || '',
    duration_minutes: workout.duration_minutes || 0,
    intensity: workout.intensity || 0,
    calories_burned: workout.calories_burned || 0,
    notes: workout.notes || '',
  }));

  await exportToCSV(formattedData, filename, headers);
};
