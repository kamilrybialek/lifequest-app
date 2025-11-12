import AsyncStorage from '@react-native-async-storage/async-storage';

const NUTRITION_PROGRESS_KEY = 'lifequest.db:nutrition_progress';

interface NutritionProgress {
  user_id: number;
  current_foundation: number;
  total_lessons_completed: number;
  total_meals_logged: number;
}

// Helper to get all nutrition progress records
const getAllNutritionProgress = async (): Promise<NutritionProgress[]> => {
  const data = await AsyncStorage.getItem(NUTRITION_PROGRESS_KEY);
  return data ? JSON.parse(data) : [];
};

// Helper to save all nutrition progress records
const saveAllNutritionProgress = async (records: NutritionProgress[]): Promise<void> => {
  await AsyncStorage.setItem(NUTRITION_PROGRESS_KEY, JSON.stringify(records));
};

export const getNutritionProgress = async (userId: number): Promise<NutritionProgress> => {
  const allRecords = await getAllNutritionProgress();
  let record = allRecords.find(r => r.user_id === userId);

  if (!record) {
    // Create initial progress
    record = {
      user_id: userId,
      current_foundation: 1,
      total_lessons_completed: 0,
      total_meals_logged: 0,
    };
    allRecords.push(record);
    await saveAllNutritionProgress(allRecords);
  }

  return record;
};

export const updateNutritionProgress = async (userId: number, data: {
  current_foundation?: number;
  total_lessons_completed?: number;
  total_meals_logged?: number;
}): Promise<void> => {
  const allRecords = await getAllNutritionProgress();
  const recordIndex = allRecords.findIndex(r => r.user_id === userId);

  if (recordIndex === -1) {
    throw new Error('Nutrition progress not found');
  }

  allRecords[recordIndex] = {
    ...allRecords[recordIndex],
    ...data,
  };

  await saveAllNutritionProgress(allRecords);
};

// Stub implementations for other functions (not used by taskGenerator, but may be needed later)
export const addFoodItem = async (foodData: any) => {
  console.log('🌐 Food items not yet implemented on web');
  return 0;
};

export const searchFoodItems = async (query: string, limit: number = 50) => {
  console.log('🌐 Food search not yet implemented on web');
  return [];
};

export const getFoodItemById = async (id: number): Promise<any> => {
  console.log('🌐 Food items not yet implemented on web');
  return null;
};

export const logMeal = async (userId: number, mealData: any, foodItems: any[]) => {
  console.log('🌐 Meal logging not yet implemented on web');
  return 0;
};

export const getMeals = async (userId: number, startDate?: string, endDate?: string) => {
  console.log('🌐 Meal retrieval not yet implemented on web');
  return [];
};

export const getDailyNutritionSummary = async (userId: number, date: string) => {
  console.log('🌐 Nutrition summary not yet implemented on web');
  return {
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0,
    water_intake_ml: 0,
    meals_logged: 0,
  };
};

export const logWaterIntake = async (userId: number, amountMl: number, date: string, time?: string) => {
  console.log('🌐 Water intake tracking not yet implemented on web');
};

export const getWaterIntake = async (userId: number, date: string) => {
  console.log('🌐 Water intake not yet implemented on web');
  return 0;
};
