/**
 * Advanced Meal Planning Algorithm
 * Optimizes meal selection based on nutrition, budget, variety, and cooking efficiency
 */

export interface Recipe {
  id: number;
  title: string;
  image?: string;
  readyInMinutes: number;
  servings: number;
  cuisines?: string[];
  diets?: string[];
  dishTypes?: string[];
  summary?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  extendedIngredients?: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
    original?: string;
  }>;
  instructions?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedCost?: number;
}

export interface MealPlanDay {
  date: Date;
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
  snack?: Recipe;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalCost: number;
  diversityScore: number;
}

export interface MealPlanWeek {
  days: MealPlanDay[];
  totalCost: number;
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  diversityScore: number;
  ingredientOverlap: number; // 0-100, higher = more efficient shopping
}

export interface NutritionalGoals {
  dailyCalories: number;
  dailyProtein: number; // grams
  dailyCarbs: number; // grams
  dailyFat: number; // grams
  weeklyBudget?: number;
}

export interface MealPlanPreferences {
  dietaryRestrictions?: string[]; // 'vegetarian', 'vegan', 'gluten-free', etc.
  excludedIngredients?: string[];
  preferredCuisines?: string[];
  maxCookingTime?: number; // minutes per meal
  difficultyPreference?: 'easy' | 'medium' | 'hard' | 'mixed';
  mealPrepFriendly?: boolean; // Prefer recipes that can be batch cooked
  allowMealRepetition?: boolean; // Allow same meals on consecutive days for cost/time savings
  repetitionDays?: number; // How many days to repeat meals (2 = Mon-Tue same, Wed-Thu same, etc.)
}

/**
 * Calculate nutritional score for a recipe based on goals
 */
export function calculateNutritionalScore(
  recipe: Recipe,
  goals: NutritionalGoals
): number {
  const calories = recipe.calories || 0;
  const protein = recipe.protein || 0;
  const carbs = recipe.carbs || 0;
  const fat = recipe.fat || 0;

  // Calculate how close the recipe is to target macros (per meal = daily/3)
  const targetCalories = goals.dailyCalories / 3;
  const targetProtein = goals.dailyProtein / 3;
  const targetCarbs = goals.dailyCarbs / 3;
  const targetFat = goals.dailyFat / 3;

  // Score each macro (0-100, where 100 = perfect match)
  const calorieScore = Math.max(0, 100 - Math.abs(calories - targetCalories) / targetCalories * 100);
  const proteinScore = Math.max(0, 100 - Math.abs(protein - targetProtein) / targetProtein * 100);
  const carbsScore = Math.max(0, 100 - Math.abs(carbs - targetCarbs) / targetCarbs * 100);
  const fatScore = Math.max(0, 100 - Math.abs(fat - targetFat) / targetFat * 100);

  // Weighted average (calories most important, then protein)
  return (calorieScore * 0.4 + proteinScore * 0.3 + carbsScore * 0.2 + fatScore * 0.1);
}

/**
 * Calculate diversity score - prefer varied cuisines, dish types, and ingredients
 */
export function calculateDiversityScore(
  recipes: Recipe[],
  existingRecipes: Recipe[] = []
): number {
  const allRecipes = [...existingRecipes, ...recipes];

  const cuisines = new Set(allRecipes.flatMap(r => r.cuisines || []));
  const dishTypes = new Set(allRecipes.flatMap(r => r.dishTypes || []));
  const ingredients = new Set(
    allRecipes.flatMap(r => r.extendedIngredients?.map(i => i.name.toLowerCase()) || [])
  );

  // More unique elements = higher diversity
  const cuisineScore = Math.min(100, cuisines.size * 10);
  const dishTypeScore = Math.min(100, dishTypes.size * 8);
  const ingredientScore = Math.min(100, ingredients.size * 2);

  return (cuisineScore * 0.3 + dishTypeScore * 0.3 + ingredientScore * 0.4);
}

/**
 * Calculate ingredient overlap percentage for efficient shopping
 */
export function calculateIngredientOverlap(recipes: Recipe[]): number {
  const allIngredients = recipes.flatMap(
    r => r.extendedIngredients?.map(i => i.name.toLowerCase()) || []
  );

  const uniqueIngredients = new Set(allIngredients);

  if (allIngredients.length === 0) return 0;

  // Higher overlap = fewer unique ingredients needed
  const overlapPercentage = (1 - uniqueIngredients.size / allIngredients.length) * 100;

  return Math.min(100, Math.max(0, overlapPercentage));
}

/**
 * Estimate recipe cost based on ingredients (simple heuristic)
 */
export function estimateRecipeCost(recipe: Recipe): number {
  if (recipe.estimatedCost) return recipe.estimatedCost;

  const ingredientCount = recipe.extendedIngredients?.length || 5;

  // Budget-friendly ingredients cost less
  const budgetKeywords = ['rice', 'pasta', 'beans', 'lentils', 'egg', 'potato', 'carrot', 'onion'];
  const expensiveKeywords = ['beef', 'salmon', 'shrimp', 'lobster', 'truffle'];

  const ingredients = recipe.extendedIngredients?.map(i => i.name.toLowerCase()) || [];
  const budgetCount = ingredients.filter(ing =>
    budgetKeywords.some(keyword => ing.includes(keyword))
  ).length;
  const expensiveCount = ingredients.filter(ing =>
    expensiveKeywords.some(keyword => ing.includes(keyword))
  ).length;

  // Base cost per ingredient: $2
  // Budget ingredients: -$0.50
  // Expensive ingredients: +$3
  const baseCost = ingredientCount * 2;
  const budgetDiscount = budgetCount * 0.5;
  const expensivePremium = expensiveCount * 3;

  return Math.max(1, baseCost - budgetDiscount + expensivePremium);
}

/**
 * Check if recipe meets dietary preferences
 */
export function meetsPreferences(
  recipe: Recipe,
  preferences: MealPlanPreferences
): boolean {
  // Check dietary restrictions
  if (preferences.dietaryRestrictions?.length) {
    const recipeDiets = recipe.diets?.map(d => d.toLowerCase()) || [];
    const recipeTitleLower = recipe.title.toLowerCase();
    const recipeIngredientsLower = recipe.extendedIngredients?.map(i => i.name.toLowerCase()) || [];

    for (const restriction of preferences.dietaryRestrictions) {
      const restrictionLower = restriction.toLowerCase();

      if (restrictionLower === 'vegetarian') {
        const meatKeywords = ['chicken', 'beef', 'pork', 'sausage', 'bacon', 'meat', 'fish', 'salmon', 'tuna'];
        const hasMeat = meatKeywords.some(keyword =>
          recipeTitleLower.includes(keyword) ||
          recipeIngredientsLower.some(ing => ing.includes(keyword))
        );
        if (hasMeat) return false;
      }

      if (restrictionLower === 'vegan') {
        const animalKeywords = ['chicken', 'beef', 'pork', 'egg', 'milk', 'cheese', 'yogurt', 'butter', 'cream', 'meat', 'fish'];
        const hasAnimal = animalKeywords.some(keyword =>
          recipeTitleLower.includes(keyword) ||
          recipeIngredientsLower.some(ing => ing.includes(keyword))
        );
        if (hasAnimal) return false;
      }

      if (restrictionLower === 'gluten-free' || restrictionLower === 'gluten free') {
        const glutenKeywords = ['wheat', 'bread', 'pasta', 'flour', 'barley', 'rye'];
        const hasGluten = glutenKeywords.some(keyword =>
          recipeTitleLower.includes(keyword) ||
          recipeIngredientsLower.some(ing => ing.includes(keyword))
        );
        if (hasGluten) return false;
      }
    }
  }

  // Check excluded ingredients
  if (preferences.excludedIngredients?.length) {
    const recipeIngredientsLower = recipe.extendedIngredients?.map(i => i.name.toLowerCase()) || [];
    const recipeTitleLower = recipe.title.toLowerCase();

    for (const excluded of preferences.excludedIngredients) {
      const excludedLower = excluded.toLowerCase();
      if (recipeIngredientsLower.some(ing => ing.includes(excludedLower)) ||
          recipeTitleLower.includes(excludedLower)) {
        return false;
      }
    }
  }

  // Check cooking time
  if (preferences.maxCookingTime && recipe.readyInMinutes > preferences.maxCookingTime) {
    return false;
  }

  // Check difficulty
  if (preferences.difficultyPreference && preferences.difficultyPreference !== 'mixed') {
    if (recipe.difficulty && recipe.difficulty !== preferences.difficultyPreference) {
      return false;
    }
  }

  return true;
}

/**
 * Score recipe for meal prep efficiency
 */
export function calculateMealPrepScore(recipe: Recipe): number {
  let score = 50; // Base score

  // High servings = good for meal prep
  if (recipe.servings >= 6) score += 30;
  else if (recipe.servings >= 4) score += 20;

  // One-pot/one-pan dishes are meal prep friendly
  const mealPrepKeywords = ['one-pot', 'one pot', 'batch', 'casserole', 'bake', 'slow cooker', 'instant pot', 'stew', 'soup', 'curry'];
  const titleLower = recipe.title.toLowerCase();
  if (mealPrepKeywords.some(keyword => titleLower.includes(keyword))) {
    score += 20;
  }

  // Easy difficulty = better for meal prep
  if (recipe.difficulty === 'easy') score += 10;

  return Math.min(100, score);
}

/**
 * Smart filter recipes with scoring
 */
export function smartFilterRecipes(
  recipes: Recipe[],
  goals: NutritionalGoals,
  preferences: MealPlanPreferences,
  options: {
    prioritizeBudget?: boolean;
    prioritizeMealPrep?: boolean;
    prioritizeNutrition?: boolean;
    prioritizeVariety?: boolean;
  } = {}
): Recipe[] {
  // First, filter by hard preferences
  let filtered = recipes.filter(recipe => meetsPreferences(recipe, preferences));

  // Score each recipe
  const scoredRecipes = filtered.map(recipe => {
    const nutritionScore = calculateNutritionalScore(recipe, goals);
    const mealPrepScore = calculateMealPrepScore(recipe);
    const diversityScore = 50; // Will be calculated in context of other recipes
    const cost = estimateRecipeCost(recipe);
    const budgetScore = Math.max(0, 100 - cost * 5); // Lower cost = higher score

    // Weighted total score based on priorities
    const weights = {
      nutrition: options.prioritizeNutrition ? 0.4 : 0.25,
      budget: options.prioritizeBudget ? 0.4 : 0.25,
      mealPrep: options.prioritizeMealPrep ? 0.3 : 0.15,
      variety: options.prioritizeVariety ? 0.3 : 0.15,
    };

    // Normalize weights to sum to 1
    const totalWeight = weights.nutrition + weights.budget + weights.mealPrep + weights.variety;
    Object.keys(weights).forEach(key => {
      weights[key as keyof typeof weights] /= totalWeight;
    });

    const totalScore =
      nutritionScore * weights.nutrition +
      budgetScore * weights.budget +
      mealPrepScore * weights.mealPrep +
      diversityScore * weights.variety;

    return {
      recipe,
      score: totalScore,
      nutritionScore,
      budgetScore,
      mealPrepScore,
      cost,
    };
  });

  // Sort by score (highest first)
  scoredRecipes.sort((a, b) => b.score - a.score);

  return scoredRecipes.map(sr => sr.recipe);
}

/**
 * Generate optimized weekly meal plan
 */
export function generateWeeklyMealPlan(
  availableRecipes: Recipe[],
  goals: NutritionalGoals,
  preferences: MealPlanPreferences
): MealPlanWeek {
  const days: MealPlanDay[] = [];
  const usedRecipes = new Set<number>();

  // Filter recipes by preferences
  const filteredRecipes = availableRecipes.filter(r => meetsPreferences(r, preferences));

  // Separate by meal type (based on dish type and keywords)
  const breakfastRecipes = filteredRecipes.filter(r => {
    const title = r.title.toLowerCase();
    const dishTypes = r.dishTypes?.map(d => d.toLowerCase()) || [];
    return dishTypes.includes('breakfast') ||
           title.includes('breakfast') ||
           title.includes('omelette') ||
           title.includes('eggs');
  });

  const dinnerRecipes = filteredRecipes.filter(r => {
    const title = r.title.toLowerCase();
    const dishTypes = r.dishTypes?.map(d => d.toLowerCase()) || [];
    return dishTypes.includes('dinner') ||
           dishTypes.includes('main course') ||
           title.includes('curry') ||
           title.includes('stew') ||
           title.includes('pasta') ||
           title.includes('rice');
  });

  const lunchRecipes = filteredRecipes.filter(r => {
    const title = r.title.toLowerCase();
    const dishTypes = r.dishTypes?.map(d => d.toLowerCase()) || [];
    return dishTypes.includes('lunch') ||
           dishTypes.includes('soup') ||
           title.includes('soup') ||
           title.includes('salad') ||
           title.includes('bowl');
  });

  // If not enough categorized recipes, use all for each meal
  const breakfasts = breakfastRecipes.length > 0 ? breakfastRecipes : filteredRecipes;
  const lunches = lunchRecipes.length > 0 ? lunchRecipes : filteredRecipes;
  const dinners = dinnerRecipes.length > 0 ? dinnerRecipes : filteredRecipes;

  // Check if meal repetition is enabled
  const allowRepetition = preferences.allowMealRepetition || false;
  const repetitionDays = preferences.repetitionDays || 2; // Default: 2 days (Mon-Tue, Wed-Thu, etc.)

  // Store last selected meals for repetition
  let lastBreakfast: Recipe | undefined;
  let lastLunch: Recipe | undefined;
  let lastDinner: Recipe | undefined;

  // Generate 7 days
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const dayDate = new Date();
    dayDate.setDate(dayDate.getDate() + dayIndex);

    let breakfast: Recipe | undefined;
    let lunch: Recipe | undefined;
    let dinner: Recipe | undefined;

    // Determine if we should repeat meals from previous day
    const shouldRepeat = allowRepetition && (dayIndex % repetitionDays !== 0);

    if (shouldRepeat && dayIndex > 0) {
      // Repeat meals from the start of the repetition cycle
      breakfast = lastBreakfast;
      lunch = lastLunch;
      dinner = lastDinner;
    } else {
      // Select new recipes
      breakfast = selectBestRecipe(breakfasts, usedRecipes, goals, 'breakfast');
      lunch = selectBestRecipe(lunches, usedRecipes, goals, 'lunch');
      dinner = selectBestRecipe(dinners, usedRecipes, goals, 'dinner');

      // If meal repetition is enabled, don't mark these as "used" for future selections
      // This allows for variety across different repetition cycles
      if (!allowRepetition) {
        if (breakfast) usedRecipes.add(breakfast.id);
        if (lunch) usedRecipes.add(lunch.id);
        if (dinner) usedRecipes.add(dinner.id);
      }

      // Store for potential repetition
      lastBreakfast = breakfast;
      lastLunch = lunch;
      lastDinner = dinner;
    }

    const dayRecipes = [breakfast, lunch, dinner].filter(Boolean) as Recipe[];

    const totalCalories = dayRecipes.reduce((sum, r) => sum + (r.calories || 0), 0);
    const totalProtein = dayRecipes.reduce((sum, r) => sum + (r.protein || 0), 0);
    const totalCarbs = dayRecipes.reduce((sum, r) => sum + (r.carbs || 0), 0);
    const totalFat = dayRecipes.reduce((sum, r) => sum + (r.fat || 0), 0);
    const totalCost = dayRecipes.reduce((sum, r) => sum + estimateRecipeCost(r), 0);
    const diversityScore = calculateDiversityScore(dayRecipes);

    days.push({
      date: dayDate,
      breakfast,
      lunch,
      dinner,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      totalCost,
      diversityScore,
    });
  }

  // Calculate week totals
  const totalCost = days.reduce((sum, day) => sum + day.totalCost, 0);
  const averageCalories = days.reduce((sum, day) => sum + day.totalCalories, 0) / 7;
  const averageProtein = days.reduce((sum, day) => sum + day.totalProtein, 0) / 7;
  const averageCarbs = days.reduce((sum, day) => sum + day.totalCarbs, 0) / 7;
  const averageFat = days.reduce((sum, day) => sum + day.totalFat, 0) / 7;

  const allWeekRecipes = days.flatMap(day =>
    [day.breakfast, day.lunch, day.dinner].filter(Boolean) as Recipe[]
  );

  const diversityScore = calculateDiversityScore(allWeekRecipes);
  const ingredientOverlap = calculateIngredientOverlap(allWeekRecipes);

  return {
    days,
    totalCost,
    averageCalories,
    averageProtein,
    averageCarbs,
    averageFat,
    diversityScore,
    ingredientOverlap,
  };
}

/**
 * Helper: Select best recipe for a meal type
 */
function selectBestRecipe(
  recipes: Recipe[],
  usedRecipes: Set<number>,
  goals: NutritionalGoals,
  mealType: 'breakfast' | 'lunch' | 'dinner'
): Recipe | undefined {
  // Filter out already used recipes
  const availableRecipes = recipes.filter(r => !usedRecipes.has(r.id));

  if (availableRecipes.length === 0) return undefined;

  // Score each recipe
  const scoredRecipes = availableRecipes.map(recipe => ({
    recipe,
    score: calculateNutritionalScore(recipe, goals),
  }));

  // Sort by score
  scoredRecipes.sort((a, b) => b.score - a.score);

  // Return best recipe
  return scoredRecipes[0]?.recipe;
}

/**
 * Get recipe recommendations based on multiple criteria
 */
export function getRecommendedRecipes(
  recipes: Recipe[],
  goals: NutritionalGoals,
  preferences: MealPlanPreferences,
  limit: number = 10
): Recipe[] {
  const filtered = smartFilterRecipes(recipes, goals, preferences, {
    prioritizeBudget: true,
    prioritizeNutrition: true,
    prioritizeMealPrep: preferences.mealPrepFriendly || false,
    prioritizeVariety: true,
  });

  return filtered.slice(0, limit);
}
