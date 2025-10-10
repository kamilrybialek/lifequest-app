import { getDatabase } from './init';

// ===== NUTRITION PROGRESS =====

export const getNutritionProgress = async (userId: number): Promise<any> => {
  const db = await getDatabase();
  const result: any = await db.getFirstAsync(
    'SELECT * FROM nutrition_progress WHERE user_id = ?',
    [userId]
  );

  if (!result) {
    // Create initial progress
    await db.runAsync(
      'INSERT INTO nutrition_progress (user_id, current_foundation, total_lessons_completed, total_meals_logged) VALUES (?, 1, 0, 0)',
      [userId]
    );
    return { user_id: userId, current_foundation: 1, total_lessons_completed: 0, total_meals_logged: 0 };
  }

  return result;
};

export const updateNutritionProgress = async (userId: number, data: {
  current_foundation?: number;
  total_lessons_completed?: number;
  total_meals_logged?: number;
}) => {
  const db = await getDatabase();
  const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), userId];

  await db.runAsync(
    `UPDATE nutrition_progress SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
    values
  );
};

// ===== FOOD ITEMS =====

export const addFoodItem = async (foodData: {
  name: string;
  brand?: string;
  serving_size?: string;
  serving_unit?: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  category?: string;
  barcode?: string;
  is_verified?: boolean;
  is_admin_created?: boolean;
  created_by?: number;
}) => {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO food_items (
      name, brand, serving_size, serving_unit, calories, protein, carbs, fat,
      fiber, sugar, sodium, category, barcode, is_verified, is_admin_created, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      foodData.name,
      foodData.brand || null,
      foodData.serving_size || null,
      foodData.serving_unit || null,
      foodData.calories,
      foodData.protein || 0,
      foodData.carbs || 0,
      foodData.fat || 0,
      foodData.fiber || 0,
      foodData.sugar || 0,
      foodData.sodium || 0,
      foodData.category || null,
      foodData.barcode || null,
      foodData.is_verified ? 1 : 0,
      foodData.is_admin_created ? 1 : 0,
      foodData.created_by || null,
    ]
  );
  return result.lastInsertRowId;
};

export const searchFoodItems = async (query: string, limit: number = 50) => {
  const db = await getDatabase();
  const results = await db.getAllAsync(
    `SELECT * FROM food_items
     WHERE name LIKE ? OR brand LIKE ?
     ORDER BY is_verified DESC, is_admin_created DESC, name ASC
     LIMIT ?`,
    [`%${query}%`, `%${query}%`, limit]
  );
  return results;
};

export const getFoodItemById = async (id: number): Promise<any> => {
  const db = await getDatabase();
  return await db.getFirstAsync('SELECT * FROM food_items WHERE id = ?', [id]);
};

export const getFoodItemByBarcode = async (barcode: string) => {
  const db = await getDatabase();
  return await db.getFirstAsync('SELECT * FROM food_items WHERE barcode = ?', [barcode]);
};

// ===== MEALS =====

export const logMeal = async (
  userId: number,
  mealData: {
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
    meal_date: string;
    meal_time?: string;
    notes?: string;
    photo_url?: string;
  },
  foodItems: Array<{
    food_item_id: number;
    quantity: number;
    servings: number;
  }>
) => {
  const db = await getDatabase();

  // Calculate totals
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const item of foodItems) {
    const food = await getFoodItemById(item.food_item_id);
    if (food) {
      const multiplier = item.servings;
      totalCalories += (food.calories || 0) * multiplier;
      totalProtein += (food.protein || 0) * multiplier;
      totalCarbs += (food.carbs || 0) * multiplier;
      totalFat += (food.fat || 0) * multiplier;
    }
  }

  // Insert meal
  const mealResult = await db.runAsync(
    `INSERT INTO meals (
      user_id, meal_type, meal_date, meal_time, total_calories,
      total_protein, total_carbs, total_fat, notes, photo_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      mealData.meal_type,
      mealData.meal_date,
      mealData.meal_time || null,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      mealData.notes || null,
      mealData.photo_url || null,
    ]
  );

  const mealId = mealResult.lastInsertRowId;

  // Insert meal food items
  for (const item of foodItems) {
    await db.runAsync(
      'INSERT INTO meal_food_items (meal_id, food_item_id, quantity, servings) VALUES (?, ?, ?, ?)',
      [mealId, item.food_item_id, item.quantity, item.servings]
    );
  }

  // Update daily summary
  await updateDailySummary(userId, mealData.meal_date);

  // Update nutrition progress
  const progress = await getNutritionProgress(userId);
  await updateNutritionProgress(userId, {
    total_meals_logged: (progress.total_meals_logged || 0) + 1,
  });

  return mealId;
};

export const getMeals = async (userId: number, startDate?: string, endDate?: string) => {
  const db = await getDatabase();
  let query = 'SELECT * FROM meals WHERE user_id = ?';
  const params: any[] = [userId];

  if (startDate) {
    query += ' AND meal_date >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND meal_date <= ?';
    params.push(endDate);
  }

  query += ' ORDER BY meal_date DESC, meal_time DESC';

  return await db.getAllAsync(query, params);
};

export const getMealById = async (mealId: number): Promise<any> => {
  const db = await getDatabase();
  const meal: any = await db.getFirstAsync('SELECT * FROM meals WHERE id = ?', [mealId]);

  if (meal) {
    // Get food items
    const foodItems = await db.getAllAsync(
      `SELECT mfi.*, fi.name, fi.brand, fi.calories, fi.protein, fi.carbs, fi.fat
       FROM meal_food_items mfi
       JOIN food_items fi ON mfi.food_item_id = fi.id
       WHERE mfi.meal_id = ?`,
      [mealId]
    );
    return { ...meal, foodItems };
  }

  return null;
};

export const deleteMeal = async (mealId: number) => {
  const db = await getDatabase();
  const meal: any = await db.getFirstAsync('SELECT user_id, meal_date FROM meals WHERE id = ?', [mealId]);

  if (meal) {
    await db.runAsync('DELETE FROM meal_food_items WHERE meal_id = ?', [mealId]);
    await db.runAsync('DELETE FROM meals WHERE id = ?', [mealId]);
    await updateDailySummary(meal.user_id, meal.meal_date);
  }
};

// ===== DAILY NUTRITION SUMMARY =====

const updateDailySummary = async (userId: number, date: string) => {
  const db = await getDatabase();

  // Get all meals for the day
  const meals: any[] = await db.getAllAsync(
    'SELECT * FROM meals WHERE user_id = ? AND meal_date = ?',
    [userId, date]
  );

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;

  for (const meal of meals) {
    totalCalories += meal.total_calories || 0;
    totalProtein += meal.total_protein || 0;
    totalCarbs += meal.total_carbs || 0;
    totalFat += meal.total_fat || 0;
  }

  // Get water intake for the day
  const waterResult: any = await db.getFirstAsync(
    'SELECT SUM(amount_ml) as total FROM nutrition_water_intake WHERE user_id = ? AND intake_date = ?',
    [userId, date]
  );
  const waterIntake = waterResult?.total || 0;

  // Upsert summary
  await db.runAsync(
    `INSERT INTO daily_nutrition_summary (
      user_id, summary_date, total_calories, total_protein, total_carbs, total_fat,
      total_fiber, water_intake_ml, meals_logged
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, summary_date) DO UPDATE SET
      total_calories = excluded.total_calories,
      total_protein = excluded.total_protein,
      total_carbs = excluded.total_carbs,
      total_fat = excluded.total_fat,
      total_fiber = excluded.total_fiber,
      water_intake_ml = excluded.water_intake_ml,
      meals_logged = excluded.meals_logged`,
    [userId, date, totalCalories, totalProtein, totalCarbs, totalFat, totalFiber, waterIntake, meals.length]
  );
};

export const getDailyNutritionSummary = async (userId: number, date: string) => {
  const db = await getDatabase();
  let summary = await db.getFirstAsync(
    'SELECT * FROM daily_nutrition_summary WHERE user_id = ? AND summary_date = ?',
    [userId, date]
  );

  if (!summary) {
    // Create empty summary
    await db.runAsync(
      'INSERT INTO daily_nutrition_summary (user_id, summary_date) VALUES (?, ?)',
      [userId, date]
    );
    summary = await db.getFirstAsync(
      'SELECT * FROM daily_nutrition_summary WHERE user_id = ? AND summary_date = ?',
      [userId, date]
    );
  }

  return summary;
};

// ===== WATER INTAKE =====

export const logWaterIntake = async (userId: number, amountMl: number, date: string, time?: string) => {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO nutrition_water_intake (user_id, intake_date, amount_ml, intake_time) VALUES (?, ?, ?, ?)',
    [userId, date, amountMl, time || null]
  );

  // Update daily summary
  await updateDailySummary(userId, date);
};

export const getWaterIntake = async (userId: number, date: string) => {
  const db = await getDatabase();
  const result: any = await db.getFirstAsync(
    'SELECT SUM(amount_ml) as total FROM nutrition_water_intake WHERE user_id = ? AND intake_date = ?',
    [userId, date]
  );
  return result?.total || 0;
};

export const getWaterIntakeLogs = async (userId: number, date: string) => {
  const db = await getDatabase();
  return await db.getAllAsync(
    'SELECT * FROM nutrition_water_intake WHERE user_id = ? AND intake_date = ? ORDER BY intake_time DESC, created_at DESC',
    [userId, date]
  );
};

// ===== MACRO GOALS =====

export const setMacroGoals = async (userId: number, goals: {
  goal_name: string;
  calories_target: number;
  protein_target: number;
  carbs_target: number;
  fat_target: number;
  start_date?: string;
  end_date?: string;
}) => {
  const db = await getDatabase();

  // Deactivate other goals
  await db.runAsync('UPDATE macro_goals SET is_active = 0 WHERE user_id = ?', [userId]);

  // Insert new goal
  const result = await db.runAsync(
    `INSERT INTO macro_goals (
      user_id, goal_name, calories_target, protein_target, carbs_target, fat_target,
      start_date, end_date, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      userId,
      goals.goal_name,
      goals.calories_target,
      goals.protein_target,
      goals.carbs_target,
      goals.fat_target,
      goals.start_date || null,
      goals.end_date || null,
    ]
  );

  return result.lastInsertRowId;
};

export const getActiveMacroGoals = async (userId: number) => {
  const db = await getDatabase();
  return await db.getFirstAsync(
    'SELECT * FROM macro_goals WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1',
    [userId]
  );
};

export const getAllMacroGoals = async (userId: number) => {
  const db = await getDatabase();
  return await db.getAllAsync(
    'SELECT * FROM macro_goals WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
};

// ===== MEAL PLANS =====

export const createMealPlan = async (userId: number, planData: {
  plan_name: string;
  start_date: string;
  end_date?: string;
  goal_type?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'general_health';
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
  notes?: string;
  is_ai_generated?: boolean;
}) => {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO meal_plans (
      user_id, plan_name, start_date, end_date, goal_type,
      target_calories, target_protein, target_carbs, target_fat,
      notes, is_ai_generated
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      planData.plan_name,
      planData.start_date,
      planData.end_date || null,
      planData.goal_type || null,
      planData.target_calories || null,
      planData.target_protein || null,
      planData.target_carbs || null,
      planData.target_fat || null,
      planData.notes || null,
      planData.is_ai_generated ? 1 : 0,
    ]
  );

  return result.lastInsertRowId;
};

export const getMealPlans = async (userId: number) => {
  const db = await getDatabase();
  return await db.getAllAsync(
    'SELECT * FROM meal_plans WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
};

export const getMealPlanById = async (planId: number) => {
  const db = await getDatabase();
  const plan = await db.getFirstAsync('SELECT * FROM meal_plans WHERE id = ?', [planId]);

  if (plan) {
    // Get planned meals
    const meals = await db.getAllAsync(
      'SELECT * FROM planned_meals WHERE meal_plan_id = ? ORDER BY meal_date, day_of_week, meal_type',
      [planId]
    );
    return { ...plan, meals };
  }

  return null;
};

export const addPlannedMeal = async (mealPlanId: number, mealData: {
  day_of_week?: number;
  meal_date?: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  meal_name: string;
  description?: string;
  recipe_url?: string;
  estimated_calories?: number;
  estimated_protein?: number;
  estimated_carbs?: number;
  estimated_fat?: number;
  prep_time_minutes?: number;
}) => {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO planned_meals (
      meal_plan_id, day_of_week, meal_date, meal_type, meal_name,
      description, recipe_url, estimated_calories, estimated_protein,
      estimated_carbs, estimated_fat, prep_time_minutes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      mealPlanId,
      mealData.day_of_week || null,
      mealData.meal_date || null,
      mealData.meal_type,
      mealData.meal_name,
      mealData.description || null,
      mealData.recipe_url || null,
      mealData.estimated_calories || null,
      mealData.estimated_protein || null,
      mealData.estimated_carbs || null,
      mealData.estimated_fat || null,
      mealData.prep_time_minutes || null,
    ]
  );

  return result.lastInsertRowId;
};

export const markPlannedMealComplete = async (plannedMealId: number) => {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE planned_meals SET is_completed = 1, completed_at = CURRENT_TIMESTAMP WHERE id = ?',
    [plannedMealId]
  );
};

// ===== RECIPES =====

export const createRecipe = async (
  userId: number,
  recipeData: {
    name: string;
    description?: string;
    category?: string;
    cuisine_type?: string;
    servings?: number;
    prep_time_minutes?: number;
    cook_time_minutes?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    instructions?: string;
    photo_url?: string;
    is_public?: boolean;
    is_admin_created?: boolean;
  },
  ingredients: Array<{
    food_item_id?: number;
    ingredient_name?: string;
    quantity?: number;
    unit?: string;
    notes?: string;
  }>
) => {
  const db = await getDatabase();

  // Calculate totals from ingredients
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const ing of ingredients) {
    if (ing.food_item_id) {
      const food = await getFoodItemById(ing.food_item_id);
      if (food && ing.quantity) {
        const multiplier = ing.quantity;
        totalCalories += (food.calories || 0) * multiplier;
        totalProtein += (food.protein || 0) * multiplier;
        totalCarbs += (food.carbs || 0) * multiplier;
        totalFat += (food.fat || 0) * multiplier;
      }
    }
  }

  // Insert recipe
  const recipeResult = await db.runAsync(
    `INSERT INTO recipes (
      name, description, category, cuisine_type, servings, prep_time_minutes,
      cook_time_minutes, difficulty, instructions, photo_url, total_calories,
      total_protein, total_carbs, total_fat, is_public, is_admin_created, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      recipeData.name,
      recipeData.description || null,
      recipeData.category || null,
      recipeData.cuisine_type || null,
      recipeData.servings || 1,
      recipeData.prep_time_minutes || null,
      recipeData.cook_time_minutes || null,
      recipeData.difficulty || null,
      recipeData.instructions || null,
      recipeData.photo_url || null,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      recipeData.is_public ? 1 : 0,
      recipeData.is_admin_created ? 1 : 0,
      userId,
    ]
  );

  const recipeId = recipeResult.lastInsertRowId;

  // Insert ingredients
  for (const ing of ingredients) {
    await db.runAsync(
      `INSERT INTO recipe_ingredients (
        recipe_id, food_item_id, ingredient_name, quantity, unit, notes
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        recipeId,
        ing.food_item_id || null,
        ing.ingredient_name || null,
        ing.quantity || null,
        ing.unit || null,
        ing.notes || null,
      ]
    );
  }

  return recipeId;
};

export const getRecipes = async (userId: number, filters?: {
  category?: string;
  difficulty?: string;
  max_prep_time?: number;
}) => {
  const db = await getDatabase();
  let query = 'SELECT * FROM recipes WHERE (created_by = ? OR is_public = 1)';
  const params: any[] = [userId];

  if (filters?.category) {
    query += ' AND category = ?';
    params.push(filters.category);
  }

  if (filters?.difficulty) {
    query += ' AND difficulty = ?';
    params.push(filters.difficulty);
  }

  if (filters?.max_prep_time) {
    query += ' AND prep_time_minutes <= ?';
    params.push(filters.max_prep_time);
  }

  query += ' ORDER BY created_at DESC';

  return await db.getAllAsync(query, params);
};

export const getRecipeById = async (recipeId: number) => {
  const db = await getDatabase();
  const recipe = await db.getFirstAsync('SELECT * FROM recipes WHERE id = ?', [recipeId]);

  if (recipe) {
    // Get ingredients
    const ingredients = await db.getAllAsync(
      `SELECT ri.*, fi.name as food_name, fi.brand
       FROM recipe_ingredients ri
       LEFT JOIN food_items fi ON ri.food_item_id = fi.id
       WHERE ri.recipe_id = ?`,
      [recipeId]
    );
    return { ...recipe, ingredients };
  }

  return null;
};

// ===== NUTRITION ANALYTICS =====

export const getNutritionStats = async (userId: number, days: number = 7) => {
  const db = await getDatabase();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  const stats: any = await db.getFirstAsync(
    `SELECT
      COUNT(*) as total_meals,
      AVG(total_calories) as avg_calories,
      AVG(total_protein) as avg_protein,
      AVG(total_carbs) as avg_carbs,
      AVG(total_fat) as avg_fat,
      AVG(water_intake_ml) as avg_water
     FROM daily_nutrition_summary
     WHERE user_id = ? AND summary_date >= ?`,
    [userId, startDateStr]
  );

  return stats;
};

export const getWeeklyNutritionTrend = async (userId: number) => {
  const db = await getDatabase();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const startDateStr = startDate.toISOString().split('T')[0];

  return await db.getAllAsync(
    `SELECT * FROM daily_nutrition_summary
     WHERE user_id = ? AND summary_date >= ?
     ORDER BY summary_date ASC`,
    [userId, startDateStr]
  );
};
