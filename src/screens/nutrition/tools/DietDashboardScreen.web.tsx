import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  Dimensions,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/theme';
import { spacing } from '../../../theme/spacing';
import { shadows } from '../../../theme/theme';
import { useAuthStore } from '../../../store/authStore';
import { COMMON_INGREDIENTS } from '../../../data/ingredients';
import { DISH_TYPE_FILTERS, matchesDishTypeFilter } from '../../../data/recipeFilters';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  pricePerServing: number;
  cuisines: string[];
  diets: string[];
  summary: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  extendedIngredients?: Array<{
    id: number;
    name: string;
    amount: number;
    unit: string;
    original: string;
  }>;
  instructions?: string;
  analyzedInstructions?: Array<{
    steps: Array<{
      number: number;
      step: string;
    }>;
  }>;
}

interface MealPlanItem {
  id: string;
  recipeId: number;
  recipe: Recipe;
  day: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  portions: number;
  date: string;
}

interface ShoppingListItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  aisle: string;
  estimatedCost: number;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

// Responsive design
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_WEB = SCREEN_WIDTH > 768;

// API configuration - Priority: Firebase → TheMealDB → Spoonacular
const SPOONACULAR_API_KEY = '8b6cd47792ff4057ad699f9b0523d9df';
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';
const THEMEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Filter configurations
const DIET_FILTERS = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥬', color: colors.success },
  { id: 'vegan', label: 'Vegan', icon: '🌱', color: colors.primary },
  { id: 'glutenFree', label: 'Gluten Free', icon: '🌾', color: colors.warning },
  { id: 'ketogenic', label: 'Keto', icon: '🥑', color: colors.physical },
  { id: 'paleo', label: 'Paleo', icon: '🍖', color: colors.finance },
];

const TYPE_FILTERS = [
  { id: 'main course', label: 'Main Course', icon: '🍽️' },
  { id: 'breakfast', label: 'Breakfast', icon: '🥞' },
  { id: 'dessert', label: 'Dessert', icon: '🍰' },
  { id: 'soup', label: 'Soup', icon: '🍲' },
  { id: 'salad', label: 'Salad', icon: '🥗' },
  { id: 'snack', label: 'Snack', icon: '🍿' },
  { id: 'side dish', label: 'Side Dish', icon: '🥙' },
];

const CUISINE_FILTERS = [
  { id: 'italian', label: 'Italian', icon: '🇮🇹' },
  { id: 'polish', label: 'Polish', icon: '🇵🇱' },
  { id: 'mexican', label: 'Mexican', icon: '🇲🇽' },
  { id: 'chinese', label: 'Chinese', icon: '🥢' },
  { id: 'japanese', label: 'Japanese', icon: '🍱' },
  { id: 'thai', label: 'Thai', icon: '🌶️' },
  { id: 'indian', label: 'Indian', icon: '🇮🇳' },
  { id: 'american', label: 'American', icon: '🇺🇸' },
  { id: 'french', label: 'French', icon: '🇫🇷' },
  { id: 'greek', label: 'Greek', icon: '🇬🇷' },
];

export const DietDashboardScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();

  // State
  const [activeTab, setActiveTab] = useState<'recipe' | 'week' | 'shopping'>('recipe');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlanItem[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [selectedMealType, setSelectedMealType] = useState<typeof MEAL_TYPES[number]>('lunch');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [portionCount, setPortionCount] = useState(2);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showPortionModal, setShowPortionModal] = useState(false);

  // Filter state
  const [selectedDietFilters, setSelectedDietFilters] = useState<string[]>([]);
  const [selectedRecipeType, setSelectedRecipeType] = useState<string>('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [selectedDishType, setSelectedDishType] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Ingredient search state
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);

  // Auto meal planner state
  const [showAutoPlanner, setShowAutoPlanner] = useState(false);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [daysToGenerate, setDaysToGenerate] = useState(7);
  const [preferredCuisines, setPreferredCuisines] = useState<string[]>([]);
  const [autoPlannerDiets, setAutoPlannerDiets] = useState<string[]>([]);
  const [includeMealTypes, setIncludeMealTypes] = useState<string[]>(['breakfast', 'lunch', 'dinner']);
  const [maxCookingTime, setMaxCookingTime] = useState(60);

  // Calculate total calories and nutrition
  const totalWeeklyCalories = mealPlan.reduce((sum, item) => {
    return sum + ((item.recipe.nutrition?.calories || 0) * item.portions);
  }, 0);

  const totalDailyCalories = totalWeeklyCalories / 7;

  const totalWeeklyProtein = mealPlan.reduce((sum, item) => {
    return sum + ((item.recipe.nutrition?.protein || 0) * item.portions);
  }, 0);

  const totalWeeklyCarbs = mealPlan.reduce((sum, item) => {
    return sum + ((item.recipe.nutrition?.carbs || 0) * item.portions);
  }, 0);

  const totalWeeklyFat = mealPlan.reduce((sum, item) => {
    return sum + ((item.recipe.nutrition?.fat || 0) * item.portions);
  }, 0);

  // Toggle ingredient
  const toggleIngredient = (ingredientId: string) => {
    if (selectedIngredients.includes(ingredientId)) {
      setSelectedIngredients(selectedIngredients.filter(id => id !== ingredientId));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredientId]);
    }
  };

  // Toggle diet filter
  const toggleDietFilter = (filterId: string) => {
    if (selectedDietFilters.includes(filterId)) {
      setSelectedDietFilters(selectedDietFilters.filter(f => f !== filterId));
    } else {
      setSelectedDietFilters([...selectedDietFilters, filterId]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedDietFilters([]);
    setSelectedRecipeType('');
    setSelectedCuisine('');
    setSelectedDishType('');
  };

  // Helper: Transform TheMealDB meal to Recipe format
  const transformMealDBToRecipe = (meal: any): Recipe => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          id: i,
          name: ingredient,
          amount: 0,
          unit: measure || '',
          original: `${measure || ''} ${ingredient}`.trim(),
        });
      }
    }

    const instructions = meal.strInstructions || '';
    const steps = instructions
      .split(/\r?\n/)
      .filter((line: string) => line.trim().length > 0)
      .map((step: string, index: number) => ({
        number: index + 1,
        step: step.trim(),
      }));

    return {
      id: parseInt(meal.idMeal),
      title: meal.strMeal,
      image: meal.strMealThumb,
      readyInMinutes: 30,
      servings: 4,
      pricePerServing: 300,
      cuisines: meal.strArea ? [meal.strArea] : [],
      diets: meal.strCategory ? [meal.strCategory] : [],
      summary: `${meal.strMeal} is a ${meal.strCategory || ''} ${meal.strArea || ''} dish.`,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      extendedIngredients: ingredients,
      instructions: instructions,
      analyzedInstructions: steps.length > 0 ? [{ steps }] : [],
    };
  };

  // Filter recipes
  const filterRecipes = (recipes: Recipe[]): Recipe[] => {
    return recipes.filter((recipe) => {
      if (selectedDietFilters.length > 0) {
        const title = recipe.title.toLowerCase();

        for (const dietFilter of selectedDietFilters) {
          if (dietFilter === 'vegetarian' || dietFilter === 'vegan') {
            continue;
          }

          if (dietFilter === 'gluten free') {
            const glutenKeywords = ['wheat', 'bread', 'pasta'];
            const hasGluten = glutenKeywords.some(keyword => title.includes(keyword));
            if (hasGluten) {
              return false;
            }
          }
        }
      }

      if (selectedDishType) {
        const matches = matchesDishTypeFilter(recipe.title, recipe.extendedIngredients, selectedDishType);
        if (!matches) {
          return false;
        }
      }

      return true;
    });
  };

  // Search recipes by ingredients
  const searchByIngredients = async () => {
    setLoading(true);
    try {
      let recipes: Recipe[] = [];

      if (selectedIngredients.length > 0) {
        const ingredientNames = selectedIngredients
          .map((id) => COMMON_INGREDIENTS.find((i) => i.id === id)?.name)
          .filter(Boolean);

        console.log('🔍 Searching by ingredients:', ingredientNames);

        // Try TheMealDB first
        const searchPromises = ingredientNames.map(async (ingredient) => {
          try {
            const response = await fetch(`${THEMEALDB_BASE_URL}/filter.php?i=${ingredient}`);
            const data = await response.json();
            if (data.meals) {
              const detailedMeals = await Promise.all(
                data.meals.slice(0, 5).map(async (meal: any) => {
                  const detailResponse = await fetch(`${THEMEALDB_BASE_URL}/lookup.php?i=${meal.idMeal}`);
                  const detailData = await detailResponse.json();
                  return detailData.meals ? transformMealDBToRecipe(detailData.meals[0]) : null;
                })
              );
              return detailedMeals.filter(Boolean);
            }
            return [];
          } catch (error) {
            console.error('TheMealDB search error:', error);
            return [];
          }
        });

        const allResults = await Promise.all(searchPromises);
        recipes = allResults.flat();
      } else {
        // Random recipes
        try {
          const randomRecipes: Recipe[] = [];
          for (let i = 0; i < 10; i++) {
            const response = await fetch(`${THEMEALDB_BASE_URL}/random.php`);
            const data = await response.json();
            if (data.meals) {
              randomRecipes.push(transformMealDBToRecipe(data.meals[0]));
            }
          }
          recipes = randomRecipes;
        } catch (error) {
          console.error('Random recipes error:', error);
        }
      }

      // Apply filters
      const filteredRecipes = filterRecipes(recipes);

      // Remove duplicates
      const uniqueRecipes = Array.from(
        new Map(filteredRecipes.map(recipe => [recipe.id, recipe])).values()
      );

      setSearchResults(uniqueRecipes);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search recipes');
    } finally {
      setLoading(false);
    }
  };

  // Search recipes by text
  const searchRecipes = async (query: string) => {
    if (!query.trim()) {
      searchByIngredients();
      return;
    }

    setLoading(true);
    try {
      let recipes: Recipe[] = [];

      // Try TheMealDB first
      try {
        const response = await fetch(`${THEMEALDB_BASE_URL}/search.php?s=${query}`);
        const data = await response.json();
        if (data.meals) {
          recipes = data.meals.map(transformMealDBToRecipe);
        }
      } catch (error) {
        console.error('TheMealDB search error:', error);
      }

      // Apply filters
      const filteredRecipes = filterRecipes(recipes);
      setSearchResults(filteredRecipes);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search recipes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch recipe details
  const fetchRecipeDetails = async (recipeId: number) => {
    setLoading(true);
    try {
      let recipe: Recipe | null = null;

      // Try Firebase first
      const recipesRef = collection(db, 'recipes');
      const q = query(recipesRef, where('spoonacularId', '==', recipeId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        recipe = {
          id: data.spoonacularId || recipeId,
          title: data.title,
          image: data.image,
          readyInMinutes: data.readyInMinutes || 0,
          servings: data.servings || 0,
          pricePerServing: data.pricePerServing || 0,
          cuisines: data.cuisines || [],
          diets: data.diets || [],
          summary: data.summary || '',
          calories: data.calories || 0,
          protein: data.protein || 0,
          carbs: data.carbs || 0,
          fat: data.fat || 0,
          extendedIngredients: data.extendedIngredients || [],
          instructions: data.instructions || '',
          analyzedInstructions: data.analyzedInstructions || [],
        };
      }

      // Try TheMealDB
      if (!recipe) {
        try {
          const response = await fetch(`${THEMEALDB_BASE_URL}/lookup.php?i=${recipeId}`);
          const data = await response.json();
          if (data.meals && data.meals.length > 0) {
            recipe = transformMealDBToRecipe(data.meals[0]);
          }
        } catch (error) {
          console.log('TheMealDB lookup failed');
        }
      }

      if (!recipe) {
        throw new Error('Recipe not found');
      }

      setSelectedRecipe(recipe);
      setShowRecipeModal(true);
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      Alert.alert('Error', 'Failed to load recipe details');
    } finally {
      setLoading(false);
    }
  };

  // Add meal to plan
  const addMealToPlan = () => {
    if (!selectedRecipe) return;

    const newMeal: MealPlanItem = {
      id: `${selectedDay}-${selectedMealType}-${Date.now()}`,
      recipeId: selectedRecipe.id,
      recipe: selectedRecipe,
      day: selectedDay,
      mealType: selectedMealType,
      portions: portionCount,
      date: new Date().toISOString(),
    };

    setMealPlan([...mealPlan, newMeal]);
    setShowPortionModal(false);
    setShowRecipeModal(false);

    generateShoppingList([...mealPlan, newMeal]);
  };

  // Generate shopping list from meal plan
  const generateShoppingList = async (meals: MealPlanItem[]) => {
    const PANTRY_ITEMS = [
      'salt', 'pepper', 'black pepper', 'white pepper',
      'water', 'ice', 'ice cubes',
      'oil', 'olive oil', 'vegetable oil', 'canola oil', 'cooking oil',
      'sugar', 'white sugar', 'brown sugar',
      'flour', 'all-purpose flour',
    ];

    const ingredientMap = new Map<string, ShoppingListItem>();

    for (const meal of meals) {
      const ingredients = meal.recipe.extendedIngredients || [];

      ingredients.forEach((ingredient: any) => {
        const ingredientName = ingredient.name || ingredient.original || '';
        const key = ingredientName.toLowerCase();

        const isPantryItem = PANTRY_ITEMS.some(item =>
          key.includes(item) || item.includes(key)
        );
        if (isPantryItem) {
          return;
        }

        const amount = ingredient.amount || 0;
        const unit = ingredient.unit || '';

        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!;
          existing.amount += amount * meal.portions;
        } else {
          ingredientMap.set(key, {
            id: `ingredient-${key}`,
            name: ingredientName,
            amount: amount * meal.portions,
            unit: unit,
            aisle: 'Groceries',
            estimatedCost: 0,
          });
        }
      });
    }

    setShoppingList(Array.from(ingredientMap.values()));
  };

  // Remove meal from plan
  const removeMealFromPlan = (mealId: string) => {
    const updatedPlan = mealPlan.filter(meal => meal.id !== mealId);
    setMealPlan(updatedPlan);
    generateShoppingList(updatedPlan);
  };

  // Generate auto meal plan
  const generateAutoMealPlan = async () => {
    setPlannerLoading(true);
    try {
      const newMealPlan: MealPlanItem[] = [];
      const usedRecipeIds = new Set<number>();

      // Determine which days to plan
      const daysToUse = DAYS.slice(0, daysToGenerate);

      // For each day
      for (const day of daysToUse) {
        // For each meal type to include
        for (const mealType of includeMealTypes) {
          try {
            // Fetch random recipes from TheMealDB
            const response = await fetch(`${THEMEALDB_BASE_URL}/random.php`);
            const data = await response.json();

            if (data.meals && data.meals.length > 0) {
              const mealData = data.meals[0];
              const recipe = transformMealDBToRecipe(mealData);

              // Skip if already used
              if (usedRecipeIds.has(recipe.id)) {
                continue;
              }

              // Apply filters
              let skipRecipe = false;

              // Check cuisine filter
              if (preferredCuisines.length > 0) {
                const matchesCuisine = preferredCuisines.some(c =>
                  recipe.cuisines.some(rc => rc.toLowerCase() === c.toLowerCase())
                );
                if (!matchesCuisine) {
                  skipRecipe = true;
                }
              }

              // Check diet filters
              if (autoPlannerDiets.length > 0) {
                const title = recipe.title.toLowerCase();
                for (const dietFilter of autoPlannerDiets) {
                  if (dietFilter === 'vegetarian' && (title.includes('meat') || title.includes('chicken') || title.includes('beef'))) {
                    skipRecipe = true;
                  }
                  if (dietFilter === 'vegan' && (title.includes('cheese') || title.includes('egg') || title.includes('milk'))) {
                    skipRecipe = true;
                  }
                }
              }

              // Check cooking time
              if (recipe.readyInMinutes > maxCookingTime) {
                skipRecipe = true;
              }

              if (skipRecipe) {
                continue;
              }

              // Add to plan
              const mealPlanItem: MealPlanItem = {
                id: `${day}-${mealType}-${Date.now()}-${Math.random()}`,
                recipeId: recipe.id,
                recipe: recipe,
                day: day,
                mealType: mealType as any,
                portions: 2,
                date: new Date().toISOString(),
              };

              newMealPlan.push(mealPlanItem);
              usedRecipeIds.add(recipe.id);
            }
          } catch (error) {
            console.error(`Error fetching recipe for ${day} ${mealType}:`, error);
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Update state
      setMealPlan(newMealPlan);
      generateShoppingList(newMealPlan);
      setShowAutoPlanner(false);
      setActiveTab('week');

      Alert.alert(
        'Success',
        `Generated ${newMealPlan.length} meals for your weekly plan!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error generating auto meal plan:', error);
      Alert.alert('Error', 'Failed to generate meal plan. Please try again.');
    } finally {
      setPlannerLoading(false);
    }
  };

  // Render recipe search tab
  const renderRecipeSearch = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Quick Actions */}
        <View style={styles.quickActionsCard}>
          <View style={styles.quickActionsHeader}>
            <Ionicons name="flash" size={24} color={colors.diet} />
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          </View>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setShowAutoPlanner(true)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.diet + '20' }]}>
                <Ionicons name="sparkles" size={24} color={colors.diet} />
              </View>
              <Text style={styles.quickActionLabel}>Auto Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => {
                setSearchResults([]);
                searchByIngredients();
              }}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="search" size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickActionLabel}>Browse</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="options" size={24} color={colors.warning} />
              </View>
              <Text style={styles.quickActionLabel}>Filters</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => {
                setMealPlan([]);
                setShoppingList([]);
              }}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.error + '20' }]}>
                <Ionicons name="trash-outline" size={24} color={colors.error} />
              </View>
              <Text style={styles.quickActionLabel}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters (Collapsible) */}
        {showFilters && (
          <View style={styles.filtersCard}>
            <Text style={styles.filterSectionTitle}>Ingredients</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.ingredientScroll}
            >
              {COMMON_INGREDIENTS.slice(0, 15).map((ingredient) => {
                const isSelected = selectedIngredients.includes(ingredient.id);
                return (
                  <TouchableOpacity
                    key={ingredient.id}
                    style={[
                      styles.ingredientChip,
                      isSelected && styles.ingredientChipSelected,
                    ]}
                    onPress={() => toggleIngredient(ingredient.id)}
                  >
                    <Text style={styles.ingredientIcon}>{ingredient.icon}</Text>
                    <Text style={[
                      styles.ingredientLabel,
                      isSelected && styles.ingredientLabelSelected,
                    ]}>
                      {ingredient.name}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={16} color={colors.diet} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.filterSectionTitle}>Cuisine</Text>
            <View style={styles.filterChipsRow}>
              {CUISINE_FILTERS.slice(0, 6).map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterChip,
                    selectedCuisine === filter.id && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedCuisine(selectedCuisine === filter.id ? '' : filter.id)}
                >
                  <Text style={styles.filterChipIcon}>{filter.icon}</Text>
                  <Text style={[
                    styles.filterChipText,
                    selectedCuisine === filter.id && styles.filterChipTextActive,
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Diet Type</Text>
            <View style={styles.filterChipsRow}>
              {DIET_FILTERS.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterChip,
                    selectedDietFilters.includes(filter.id) && styles.filterChipActive,
                  ]}
                  onPress={() => toggleDietFilter(filter.id)}
                >
                  <Text style={styles.filterChipIcon}>{filter.icon}</Text>
                  <Text style={[
                    styles.filterChipText,
                    selectedDietFilters.includes(filter.id) && styles.filterChipTextActive,
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {(selectedIngredients.length > 0 || selectedCuisine || selectedDietFilters.length > 0) && (
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                <Ionicons name="close-circle" size={20} color={colors.error} />
                <Text style={styles.clearFiltersText}>Clear All Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchCard}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search recipes..."
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => searchRecipes(searchQuery)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => searchQuery ? searchRecipes(searchQuery) : searchByIngredients()}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="search" size={20} color="white" />
                <Text style={styles.searchButtonText}>
                  {searchQuery ? 'Search' : selectedIngredients.length > 0 ? `Find (${selectedIngredients.length})` : 'Browse'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsSectionHeader}>
              <Text style={styles.resultsSectionTitle}>
                {searchResults.length} Recipe{searchResults.length !== 1 ? 's' : ''} Found
              </Text>
            </View>
            <View style={styles.recipeGrid}>
              {searchResults.map((recipe) => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.recipeCard}
                  onPress={() => fetchRecipeDetails(recipe.id)}
                >
                  <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
                  <View style={styles.recipeInfo}>
                    <Text style={styles.recipeTitle} numberOfLines={2}>
                      {recipe.title}
                    </Text>
                    <View style={styles.recipeMetaRow}>
                      <View style={styles.recipeMeta}>
                        <Ionicons name="flame-outline" size={14} color={colors.diet} />
                        <Text style={styles.recipeMetaText}>
                          {recipe.nutrition?.calories ? Math.round(recipe.nutrition.calories) : '~200'} cal
                        </Text>
                      </View>
                      <View style={styles.recipeMeta}>
                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.recipeMetaText}>{recipe.readyInMinutes}min</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {searchResults.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyStateTitle}>Find Your Perfect Recipe</Text>
            <Text style={styles.emptyStateText}>
              Use filters and search to discover recipes, or browse random meals
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  // Render weekly view tab
  const renderWeeklyView = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {mealPlan.length > 0 ? (
          <>
            {/* Week Summary Card */}
            <View style={styles.weekSummaryCard}>
              <View style={styles.weekSummaryHeader}>
                <View style={styles.weekSummaryTitleRow}>
                  <Ionicons name="calendar" size={24} color={colors.diet} />
                  <Text style={styles.weekSummaryTitle}>Your Weekly Plan</Text>
                </View>
                <TouchableOpacity
                  style={styles.weekSummaryRefreshButton}
                  onPress={() => setShowAutoPlanner(true)}
                >
                  <Ionicons name="sparkles" size={20} color={colors.diet} />
                  <Text style={styles.weekSummaryRefreshText}>Regenerate</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.weekSummaryStats}>
                <View style={styles.weekSummaryStat}>
                  <Text style={styles.weekSummaryStatValue}>{Math.round(totalDailyCalories)}</Text>
                  <Text style={styles.weekSummaryStatLabel}>Cal/Day</Text>
                </View>
                <View style={styles.weekSummaryStatDivider} />
                <View style={styles.weekSummaryStat}>
                  <Text style={styles.weekSummaryStatValue}>
                    {Math.round(totalWeeklyProtein / 7)}g
                  </Text>
                  <Text style={styles.weekSummaryStatLabel}>Protein/Day</Text>
                </View>
                <View style={styles.weekSummaryStatDivider} />
                <View style={styles.weekSummaryStat}>
                  <Text style={styles.weekSummaryStatValue}>{mealPlan.length}</Text>
                  <Text style={styles.weekSummaryStatLabel}>Meals</Text>
                </View>
              </View>
            </View>

            {/* Day Selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.weekDaySelector}
              contentContainerStyle={styles.weekDaySelectorContent}
            >
              {DAYS.map((day, index) => {
                const dayMeals = mealPlan.filter(m => m.day === day);
                const isSelected = selectedDay === day;
                const today = new Date();
                const dayDate = new Date(today);
                dayDate.setDate(today.getDate() - today.getDay() + index + 1);

                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.weekDayChip,
                      isSelected && styles.weekDayChipSelected,
                    ]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text style={[
                      styles.weekDayChipDate,
                      isSelected && styles.weekDayChipDateSelected,
                    ]}>
                      {dayDate.getDate()}
                    </Text>
                    <Text style={[
                      styles.weekDayChipDay,
                      isSelected && styles.weekDayChipDaySelected,
                    ]}>
                      {day}
                    </Text>
                    {dayMeals.length > 0 && (
                      <View style={[
                        styles.weekDayChipBadge,
                        isSelected && styles.weekDayChipBadgeSelected,
                      ]}>
                        <Text style={styles.weekDayChipBadgeText}>{dayMeals.length}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Meals for Selected Day */}
            <View style={styles.weekDayMealsSection}>
              {MEAL_TYPES.map((mealType) => {
                const meal = mealPlan.find(m => m.day === selectedDay && m.mealType === mealType);

                return (
                  <View key={mealType} style={styles.weekMealSlot}>
                    <View style={styles.weekMealSlotHeader}>
                      <Text style={styles.weekMealSlotTitle}>
                        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                      </Text>
                      {!meal && (
                        <TouchableOpacity
                          style={styles.weekMealSlotAddButton}
                          onPress={() => {
                            setSelectedMealType(mealType);
                            setActiveTab('recipe');
                          }}
                        >
                          <Ionicons name="add-circle-outline" size={20} color={colors.diet} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {meal ? (
                      <TouchableOpacity
                        style={styles.weekMealCard}
                        onPress={() => fetchRecipeDetails(meal.recipe.id)}
                      >
                        <Image source={{ uri: meal.recipe.image }} style={styles.weekMealCardImage} />
                        <View style={styles.weekMealCardInfo}>
                          <Text style={styles.weekMealCardTitle} numberOfLines={2}>
                            {meal.recipe.title}
                          </Text>
                          <View style={styles.weekMealCardMeta}>
                            <View style={styles.weekMealCardMetaItem}>
                              <Ionicons name="flame-outline" size={14} color={colors.diet} />
                              <Text style={styles.weekMealCardMetaText}>
                                {meal.recipe.nutrition?.calories ? Math.round(meal.recipe.nutrition.calories * meal.portions) : '~'+(meal.portions*200)} cal
                              </Text>
                            </View>
                            <View style={styles.weekMealCardMetaItem}>
                              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                              <Text style={styles.weekMealCardMetaText}>{meal.recipe.readyInMinutes}min</Text>
                            </View>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={styles.weekMealCardDelete}
                          onPress={() => removeMealFromPlan(meal.id)}
                        >
                          <Ionicons name="trash-outline" size={18} color={colors.error} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.weekMealCardEmpty}>
                        <Ionicons name="add-outline" size={32} color={colors.textLight} />
                        <Text style={styles.weekMealCardEmptyText}>No meal planned</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Meal Prep Suggestions */}
            <View style={styles.mealPrepCard}>
              <View style={styles.mealPrepHeader}>
                <Ionicons name="restaurant" size={24} color={colors.diet} />
                <Text style={styles.mealPrepTitle}>Meal Prep Tips</Text>
              </View>
              <View style={styles.mealPrepTips}>
                <View style={styles.mealPrepTip}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.diet} />
                  <Text style={styles.mealPrepTipText}>
                    Cook larger portions to save time and money - most recipes can be doubled
                  </Text>
                </View>
                <View style={styles.mealPrepTip}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.diet} />
                  <Text style={styles.mealPrepTipText}>
                    Prepare {Math.min(mealPlan.filter(m => m.day === 'Mon' || m.day === 'Tue').length * 2, 8)} portions on Sunday for Mon-Tue
                  </Text>
                </View>
                <View style={styles.mealPrepTip}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.diet} />
                  <Text style={styles.mealPrepTipText}>
                    Store meals in airtight containers - most dishes last 3-4 days refrigerated
                  </Text>
                </View>
                <View style={styles.mealPrepTip}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.diet} />
                  <Text style={styles.mealPrepTipText}>
                    Batch cooking can reduce your weekly cooking time by 60%
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyStateTitle}>No Weekly Plan Yet</Text>
            <Text style={styles.emptyStateText}>
              Use Auto Plan to generate a full weekly meal plan, or add meals manually from the Recipe tab
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => setShowAutoPlanner(true)}
            >
              <Ionicons name="sparkles" size={20} color="white" />
              <Text style={styles.emptyStateButtonText}>Generate Auto Plan</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );

  // Render shopping list tab
  const renderShoppingList = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {shoppingList.length > 0 ? (
          <>
            <View style={styles.shoppingListHeader}>
              <View style={styles.shoppingListTitleRow}>
                <Ionicons name="cart" size={24} color={colors.diet} />
                <Text style={styles.shoppingListTitle}>Shopping List</Text>
              </View>
              <Text style={styles.shoppingListSubtitle}>
                {shoppingList.length} item{shoppingList.length !== 1 ? 's' : ''} needed
              </Text>
            </View>

            {shoppingList.map((item) => (
              <View key={item.id} style={styles.shoppingListItem}>
                <View style={styles.shoppingListItemIcon}>
                  <Ionicons name="basket-outline" size={20} color={colors.diet} />
                </View>
                <View style={styles.shoppingListItemInfo}>
                  <Text style={styles.shoppingListItemName}>{item.name}</Text>
                  <Text style={styles.shoppingListItemAmount}>
                    {item.amount > 0 ? `${item.amount.toFixed(1)} ${item.unit}` : 'As needed'}
                  </Text>
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyStateTitle}>No Shopping List Yet</Text>
            <Text style={styles.emptyStateText}>
              Add meals to your weekly plan to generate a shopping list
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  // Render recipe modal
  const renderRecipeModal = () => (
    <Modal
      visible={showRecipeModal}
      animationType="slide"
      onRequestClose={() => setShowRecipeModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowRecipeModal(false)}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Recipe Details</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          {selectedRecipe && (
            <>
              <Image source={{ uri: selectedRecipe.image }} style={styles.recipeModalImage} />
              <View style={styles.recipeModalInfo}>
                <Text style={styles.recipeModalTitle}>{selectedRecipe.title}</Text>
                <View style={styles.recipeModalMetaRow}>
                  <View style={styles.recipeModalMeta}>
                    <Ionicons name="time" size={20} color={colors.textSecondary} />
                    <Text style={styles.recipeModalMetaText}>{selectedRecipe.readyInMinutes} min</Text>
                  </View>
                  <View style={styles.recipeModalMeta}>
                    <Ionicons name="people" size={20} color={colors.textSecondary} />
                    <Text style={styles.recipeModalMetaText}>{selectedRecipe.servings} servings</Text>
                  </View>
                  <View style={styles.recipeModalMeta}>
                    <Ionicons name="cash" size={20} color={colors.textSecondary} />
                    <Text style={styles.recipeModalMetaText}>
                      ${(selectedRecipe.pricePerServing / 100).toFixed(2)}/serving
                    </Text>
                  </View>
                </View>

                {selectedRecipe.extendedIngredients && selectedRecipe.extendedIngredients.length > 0 && (
                  <View style={styles.recipeModalSection}>
                    <Text style={styles.recipeModalSectionTitle}>Ingredients</Text>
                    {selectedRecipe.extendedIngredients.map((ingredient) => (
                      <View key={ingredient.id} style={styles.ingredientItem}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.diet} />
                        <Text style={styles.ingredientItemText}>{ingredient.original}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {selectedRecipe.analyzedInstructions && selectedRecipe.analyzedInstructions.length > 0 && (
                  <View style={styles.recipeModalSection}>
                    <Text style={styles.recipeModalSectionTitle}>Instructions</Text>
                    {selectedRecipe.analyzedInstructions[0].steps.map((step) => (
                      <View key={step.number} style={styles.instructionStep}>
                        <View style={styles.instructionStepNumber}>
                          <Text style={styles.instructionStepNumberText}>{step.number}</Text>
                        </View>
                        <Text style={styles.instructionStepText}>{step.step}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.addToPlanButton}
            onPress={() => {
              setShowRecipeModal(false);
              setShowPortionModal(true);
            }}
          >
            <Ionicons name="add-circle" size={20} color="white" />
            <Text style={styles.addToPlanButtonText}>Add to Meal Plan</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  // Render portion modal
  const renderPortionModal = () => (
    <Modal
      visible={showPortionModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowPortionModal(false)}
    >
      <View style={styles.portionModalOverlay}>
        <View style={styles.portionModalContent}>
          <View style={styles.portionModalHeader}>
            <Text style={styles.portionModalTitle}>Add to Meal Plan</Text>
            <TouchableOpacity onPress={() => setShowPortionModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.portionModalLabel}>Select Day</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.portionDaySelector}
          >
            {DAYS.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.portionDayChip,
                  selectedDay === day && styles.portionDayChipSelected,
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[
                  styles.portionDayChipText,
                  selectedDay === day && styles.portionDayChipTextSelected,
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.portionModalLabel}>Meal Type</Text>
          <View style={styles.mealTypeSelector}>
            {MEAL_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.mealTypeChip,
                  selectedMealType === type && styles.mealTypeChipSelected,
                ]}
                onPress={() => setSelectedMealType(type)}
              >
                <Text style={[
                  styles.mealTypeChipText,
                  selectedMealType === type && styles.mealTypeChipTextSelected,
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.portionModalLabel}>Servings</Text>
          <View style={styles.portionCounter}>
            <TouchableOpacity
              style={styles.portionCounterButton}
              onPress={() => setPortionCount(Math.max(1, portionCount - 1))}
            >
              <Ionicons name="remove" size={24} color={colors.diet} />
            </TouchableOpacity>
            <Text style={styles.portionCounterValue}>{portionCount}</Text>
            <TouchableOpacity
              style={styles.portionCounterButton}
              onPress={() => setPortionCount(portionCount + 1)}
            >
              <Ionicons name="add" size={24} color={colors.diet} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.portionModalAddButton}
            onPress={addMealToPlan}
          >
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={styles.portionModalAddButtonText}>Add to Plan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Render auto planner modal
  const renderAutoPlannerModal = () => (
    <Modal
      visible={showAutoPlanner}
      transparent
      animationType="slide"
      onRequestClose={() => setShowAutoPlanner(false)}
    >
      <View style={styles.autoPlannerModalOverlay}>
        <View style={styles.autoPlannerModalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.autoPlannerModalHeader}>
              <View style={styles.autoPlannerModalTitleRow}>
                <Ionicons name="sparkles" size={28} color={colors.diet} />
                <Text style={styles.autoPlannerModalTitle}>AI Meal Planner</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAutoPlanner(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.autoPlannerModalSubtitle}>
              Generate a personalized weekly meal plan based on your preferences
            </Text>

            {/* Days to Generate */}
            <View style={styles.autoPlannerSection}>
              <Text style={styles.autoPlannerLabel}>Plan Duration</Text>
              <View style={styles.autoPlannerDaysSelector}>
                {[3, 5, 7].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.autoPlannerDaysChip,
                      daysToGenerate === days && styles.autoPlannerDaysChipSelected,
                    ]}
                    onPress={() => setDaysToGenerate(days)}
                  >
                    <Text style={[
                      styles.autoPlannerDaysChipText,
                      daysToGenerate === days && styles.autoPlannerDaysChipTextSelected,
                    ]}>
                      {days} days
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Meals Per Day */}
            <View style={styles.autoPlannerSection}>
              <Text style={styles.autoPlannerLabel}>Meals Per Day</Text>
              <View style={styles.autoPlannerMealTypesGrid}>
                {MEAL_TYPES.map((type) => {
                  const isSelected = includeMealTypes.includes(type);
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.autoPlannerMealTypeChip,
                        isSelected && styles.autoPlannerMealTypeChipSelected,
                      ]}
                      onPress={() => {
                        if (isSelected) {
                          setIncludeMealTypes(includeMealTypes.filter(t => t !== type));
                        } else {
                          setIncludeMealTypes([...includeMealTypes, type]);
                        }
                      }}
                    >
                      <Text style={[
                        styles.autoPlannerMealTypeChipText,
                        isSelected && styles.autoPlannerMealTypeChipTextSelected,
                      ]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={16} color={colors.diet} style={{ marginLeft: 4 }} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Diet Preferences */}
            <View style={styles.autoPlannerSection}>
              <Text style={styles.autoPlannerLabel}>Diet Preferences (Optional)</Text>
              <View style={styles.autoPlannerFiltersGrid}>
                {DIET_FILTERS.map((filter) => {
                  const isSelected = autoPlannerDiets.includes(filter.id);
                  return (
                    <TouchableOpacity
                      key={filter.id}
                      style={[
                        styles.autoPlannerFilterChip,
                        isSelected && styles.autoPlannerFilterChipSelected,
                      ]}
                      onPress={() => {
                        if (isSelected) {
                          setAutoPlannerDiets(autoPlannerDiets.filter(d => d !== filter.id));
                        } else {
                          setAutoPlannerDiets([...autoPlannerDiets, filter.id]);
                        }
                      }}
                    >
                      <Text style={styles.autoPlannerFilterChipIcon}>{filter.icon}</Text>
                      <Text style={[
                        styles.autoPlannerFilterChipText,
                        isSelected && styles.autoPlannerFilterChipTextSelected,
                      ]}>
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Cuisine Preferences */}
            <View style={styles.autoPlannerSection}>
              <Text style={styles.autoPlannerLabel}>Cuisine Preferences (Optional)</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.autoPlannerCuisineScroll}
              >
                {CUISINE_FILTERS.map((filter) => {
                  const isSelected = preferredCuisines.includes(filter.id);
                  return (
                    <TouchableOpacity
                      key={filter.id}
                      style={[
                        styles.autoPlannerCuisineChip,
                        isSelected && styles.autoPlannerCuisineChipSelected,
                      ]}
                      onPress={() => {
                        if (isSelected) {
                          setPreferredCuisines(preferredCuisines.filter(c => c !== filter.id));
                        } else {
                          setPreferredCuisines([...preferredCuisines, filter.id]);
                        }
                      }}
                    >
                      <Text style={styles.autoPlannerCuisineChipIcon}>{filter.icon}</Text>
                      <Text style={[
                        styles.autoPlannerCuisineChipText,
                        isSelected && styles.autoPlannerCuisineChipTextSelected,
                      ]}>
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Max Cooking Time */}
            <View style={styles.autoPlannerSection}>
              <View style={styles.autoPlannerLabelRow}>
                <Text style={styles.autoPlannerLabel}>Max Cooking Time</Text>
                <Text style={styles.autoPlannerLabelValue}>{maxCookingTime} min</Text>
              </View>
              <View style={styles.autoPlannerTimeSelector}>
                {[30, 45, 60, 90].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.autoPlannerTimeChip,
                      maxCookingTime === time && styles.autoPlannerTimeChipSelected,
                    ]}
                    onPress={() => setMaxCookingTime(time)}
                  >
                    <Text style={[
                      styles.autoPlannerTimeChipText,
                      maxCookingTime === time && styles.autoPlannerTimeChipTextSelected,
                    ]}>
                      {time}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              style={[
                styles.autoPlannerGenerateButton,
                plannerLoading && styles.autoPlannerGenerateButtonDisabled,
              ]}
              onPress={generateAutoMealPlan}
              disabled={plannerLoading || includeMealTypes.length === 0}
            >
              {plannerLoading ? (
                <>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={styles.autoPlannerGenerateButtonText}>Generating...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="white" />
                  <Text style={styles.autoPlannerGenerateButtonText}>
                    Generate Plan ({daysToGenerate} days × {includeMealTypes.length} meals)
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.autoPlannerNote}>
              Note: This will replace your current meal plan
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Diet Dashboard</Text>
          <Text style={styles.headerSubtitle}>Plan your weekly meals</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recipe' && styles.tabActive]}
          onPress={() => setActiveTab('recipe')}
        >
          <Ionicons
            name="search"
            size={20}
            color={activeTab === 'recipe' ? colors.diet : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'recipe' && styles.tabTextActive,
            ]}
          >
            Recipe
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'week' && styles.tabActive]}
          onPress={() => setActiveTab('week')}
        >
          <Ionicons
            name="calendar"
            size={20}
            color={activeTab === 'week' ? colors.diet : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'week' && styles.tabTextActive,
            ]}
          >
            Week
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'shopping' && styles.tabActive]}
          onPress={() => setActiveTab('shopping')}
        >
          <Ionicons
            name="cart"
            size={20}
            color={activeTab === 'shopping' ? colors.diet : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'shopping' && styles.tabTextActive,
            ]}
          >
            Shopping
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'recipe' && renderRecipeSearch()}
      {activeTab === 'week' && renderWeeklyView()}
      {activeTab === 'shopping' && renderShoppingList()}

      {/* Modals */}
      {renderRecipeModal()}
      {renderPortionModal()}
      {renderAutoPlannerModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBackButton: {
    padding: spacing.xs,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  headerRight: {
    width: 40,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.diet,
  },
  tabText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabTextActive: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.diet,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  quickActionsCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  quickActionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickActionsTitle: {
    ...typography.h4,
    color: colors.text,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    ...typography.caption,
    fontSize: 12,
    color: colors.text,
  },
  filtersCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  filterSectionTitle: {
    ...typography.h4,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  ingredientScroll: {
    marginBottom: spacing.sm,
  },
  ingredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundGray,
    borderRadius: 20,
    marginRight: spacing.sm,
    gap: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ingredientChipSelected: {
    backgroundColor: colors.diet + '20',
    borderColor: colors.diet,
  },
  ingredientIcon: {
    fontSize: 16,
  },
  ingredientLabel: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
  },
  ingredientLabelSelected: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.diet,
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundGray,
    borderRadius: 20,
    gap: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: colors.diet + '20',
    borderColor: colors.diet,
  },
  filterChipIcon: {
    fontSize: 14,
  },
  filterChipText: {
    ...typography.body,
    fontSize: 13,
    color: colors.text,
  },
  filterChipTextActive: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.diet,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  clearFiltersText: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.error,
  },
  searchCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
    ...shadows.small,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    fontSize: 15,
    color: colors.text,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.diet,
    borderRadius: 8,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  searchButtonText: {
    ...typography.bodyBold,
    fontSize: 15,
    color: 'white',
  },
  resultsSection: {
    marginBottom: spacing.md,
  },
  resultsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  resultsSectionTitle: {
    ...typography.h4,
    color: colors.text,
  },
  recipeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  recipeCard: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.small,
  },
  recipeImage: {
    width: '100%',
    height: 120,
    backgroundColor: colors.backgroundGray,
  },
  recipeInfo: {
    padding: spacing.sm,
  },
  recipeTitle: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipeMetaText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
  },
  weeklyPlanSection: {
    marginBottom: spacing.md,
  },
  weeklyPlanHeader: {
    marginBottom: spacing.md,
  },
  weeklyPlanTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  weeklyPlanTitle: {
    ...typography.h3,
    color: colors.text,
  },
  weeklyPlanSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  daySelector: {
    marginBottom: spacing.md,
  },
  dayChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dayChipSelected: {
    backgroundColor: colors.diet + '20',
    borderColor: colors.diet,
  },
  dayChipText: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
  },
  dayChipTextSelected: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.diet,
  },
  dayChipBadge: {
    backgroundColor: colors.diet,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dayChipBadgeText: {
    ...typography.bodyBold,
    fontSize: 11,
    color: 'white',
  },
  dayMealsSection: {
    gap: spacing.sm,
  },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.small,
  },
  mealCardImage: {
    width: 80,
    height: 80,
    backgroundColor: colors.backgroundGray,
  },
  mealCardInfo: {
    flex: 1,
    padding: spacing.sm,
  },
  mealCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  mealTypeTag: {
    backgroundColor: colors.diet + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mealTypeTagText: {
    ...typography.bodyBold,
    fontSize: 11,
    color: colors.diet,
  },
  mealCardTitle: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  mealCardMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  mealCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mealCardMetaText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyDayState: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  emptyDayStateText: {
    ...typography.h4,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyDayStateSubtext: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyStateTitle: {
    ...typography.h3,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyStateText: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  shoppingListHeader: {
    marginBottom: spacing.md,
  },
  shoppingListTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  shoppingListTitle: {
    ...typography.h3,
    color: colors.text,
  },
  shoppingListSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  shoppingListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    ...shadows.small,
  },
  shoppingListItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.diet + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shoppingListItemInfo: {
    flex: 1,
  },
  shoppingListItemName: {
    ...typography.bodyBold,
    fontSize: 15,
    color: colors.text,
    marginBottom: 2,
  },
  shoppingListItemAmount: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  modalContent: {
    flex: 1,
  },
  recipeModalImage: {
    width: '100%',
    height: 250,
    backgroundColor: colors.backgroundGray,
  },
  recipeModalInfo: {
    padding: spacing.md,
  },
  recipeModalTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  recipeModalMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  recipeModalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  recipeModalMetaText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  recipeModalSection: {
    marginBottom: spacing.lg,
  },
  recipeModalSectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  ingredientItemText: {
    ...typography.body,
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  instructionStep: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  instructionStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.diet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionStepNumberText: {
    ...typography.bodyBold,
    fontSize: 14,
    color: 'white',
  },
  instructionStepText: {
    ...typography.body,
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  modalFooter: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addToPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.diet,
    borderRadius: 12,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  addToPlanButtonText: {
    ...typography.bodyBold,
    fontSize: 16,
    color: 'white',
  },
  portionModalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  portionModalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  portionModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  portionModalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  portionModalLabel: {
    ...typography.h4,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  portionDaySelector: {
    marginBottom: spacing.md,
  },
  portionDayChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundGray,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  portionDayChipSelected: {
    backgroundColor: colors.diet + '20',
    borderColor: colors.diet,
  },
  portionDayChipText: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
  },
  portionDayChipTextSelected: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.diet,
  },
  mealTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mealTypeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundGray,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mealTypeChipSelected: {
    backgroundColor: colors.diet + '20',
    borderColor: colors.diet,
  },
  mealTypeChipText: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
  },
  mealTypeChipTextSelected: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.diet,
  },
  portionCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  portionCounterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.diet + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portionCounterValue: {
    ...typography.h2,
    fontSize: 32,
    color: colors.text,
    minWidth: 60,
    textAlign: 'center',
  },
  portionModalAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.diet,
    borderRadius: 12,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  portionModalAddButtonText: {
    ...typography.bodyBold,
    fontSize: 16,
    color: 'white',
  },
  // Weekly View Styles
  weekSummaryCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  weekSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  weekSummaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  weekSummaryTitle: {
    ...typography.h3,
    color: colors.text,
  },
  weekSummaryRefreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.diet + '20',
    borderRadius: 20,
  },
  weekSummaryRefreshText: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.diet,
  },
  weekSummaryStats: {
    flexDirection: 'row',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  weekSummaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  weekSummaryStatValue: {
    ...typography.h2,
    fontSize: 28,
    color: colors.diet,
  },
  weekSummaryStatLabel: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  weekSummaryStatDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  weekDaySelector: {
    marginBottom: spacing.md,
  },
  weekDaySelectorContent: {
    gap: spacing.sm,
  },
  weekDayChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    minWidth: 70,
    ...shadows.small,
  },
  weekDayChipSelected: {
    backgroundColor: colors.diet + '20',
    borderColor: colors.diet,
  },
  weekDayChipDate: {
    ...typography.h3,
    fontSize: 20,
    color: colors.text,
    marginBottom: 4,
  },
  weekDayChipDateSelected: {
    color: colors.diet,
  },
  weekDayChipDay: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
  },
  weekDayChipDaySelected: {
    ...typography.bodyBold,
    fontSize: 12,
    color: colors.diet,
  },
  weekDayChipBadge: {
    backgroundColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  weekDayChipBadgeSelected: {
    backgroundColor: colors.diet,
  },
  weekDayChipBadgeText: {
    ...typography.bodyBold,
    fontSize: 11,
    color: 'white',
  },
  weekDayMealsSection: {
    gap: spacing.md,
  },
  weekMealSlot: {
    marginBottom: spacing.sm,
  },
  weekMealSlotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  weekMealSlotTitle: {
    ...typography.h4,
    fontSize: 16,
    color: colors.text,
  },
  weekMealSlotAddButton: {
    padding: spacing.xs,
  },
  weekMealCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.small,
  },
  weekMealCardImage: {
    width: 100,
    height: 100,
    backgroundColor: colors.backgroundGray,
  },
  weekMealCardInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  weekMealCardTitle: {
    ...typography.bodyBold,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  weekMealCardMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  weekMealCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weekMealCardMetaText: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textSecondary,
  },
  weekMealCardDelete: {
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekMealCardEmpty: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  weekMealCardEmptyText: {
    ...typography.caption,
    fontSize: 14,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.diet,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  emptyStateButtonText: {
    ...typography.bodyBold,
    fontSize: 16,
    color: 'white',
  },
  // Auto Planner Modal Styles
  autoPlannerModalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  autoPlannerModalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  autoPlannerModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  autoPlannerModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  autoPlannerModalTitle: {
    ...typography.h2,
    color: colors.text,
  },
  autoPlannerModalSubtitle: {
    ...typography.body,
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  autoPlannerSection: {
    marginBottom: spacing.lg,
  },
  autoPlannerLabel: {
    ...typography.h4,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  autoPlannerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  autoPlannerLabelValue: {
    ...typography.bodyBold,
    fontSize: 15,
    color: colors.diet,
  },
  autoPlannerDaysSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  autoPlannerDaysChip: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  autoPlannerDaysChipSelected: {
    backgroundColor: colors.diet + '20',
    borderColor: colors.diet,
  },
  autoPlannerDaysChipText: {
    ...typography.body,
    fontSize: 15,
    color: colors.text,
  },
  autoPlannerDaysChipTextSelected: {
    ...typography.bodyBold,
    fontSize: 15,
    color: colors.diet,
  },
  autoPlannerMealTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  autoPlannerMealTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundGray,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  autoPlannerMealTypeChipSelected: {
    backgroundColor: colors.diet + '20',
    borderColor: colors.diet,
  },
  autoPlannerMealTypeChipText: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
  },
  autoPlannerMealTypeChipTextSelected: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.diet,
  },
  autoPlannerFiltersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  autoPlannerFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundGray,
    borderRadius: 20,
    gap: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  autoPlannerFilterChipSelected: {
    backgroundColor: colors.diet + '20',
    borderColor: colors.diet,
  },
  autoPlannerFilterChipIcon: {
    fontSize: 16,
  },
  autoPlannerFilterChipText: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
  },
  autoPlannerFilterChipTextSelected: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.diet,
  },
  autoPlannerCuisineScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  autoPlannerCuisineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundGray,
    borderRadius: 20,
    marginRight: spacing.sm,
    gap: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  autoPlannerCuisineChipSelected: {
    backgroundColor: colors.diet + '20',
    borderColor: colors.diet,
  },
  autoPlannerCuisineChipIcon: {
    fontSize: 16,
  },
  autoPlannerCuisineChipText: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
  },
  autoPlannerCuisineChipTextSelected: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.diet,
  },
  autoPlannerTimeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  autoPlannerTimeChip: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  autoPlannerTimeChipSelected: {
    backgroundColor: colors.diet + '20',
    borderColor: colors.diet,
  },
  autoPlannerTimeChipText: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
  },
  autoPlannerTimeChipTextSelected: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.diet,
  },
  autoPlannerGenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.diet,
    borderRadius: 12,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  autoPlannerGenerateButtonDisabled: {
    opacity: 0.5,
  },
  autoPlannerGenerateButtonText: {
    ...typography.bodyBold,
    fontSize: 16,
    color: 'white',
  },
  autoPlannerNote: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  // Meal Prep Styles
  mealPrepCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 2,
    borderColor: colors.diet + '30',
    ...shadows.small,
  },
  mealPrepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  mealPrepTitle: {
    ...typography.h3,
    fontSize: 18,
    color: colors.text,
  },
  mealPrepTips: {
    gap: spacing.md,
  },
  mealPrepTip: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  mealPrepTipText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
});
