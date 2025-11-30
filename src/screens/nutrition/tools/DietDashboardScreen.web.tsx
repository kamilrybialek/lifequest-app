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

// Enhanced Design System (matching app colors)
const ENHANCED_COLORS = {
  primary: '#4CAF50',        // App green (diet color)
  primaryLight: 'rgba(76, 175, 80, 0.1)',
  background: '#F5F5F5',     // Light gray background
  card: '#FFFFFF',           // White cards
  foreground: '#1A202C',     // Dark text
  mutedForeground: '#718096', // Muted text
  border: '#E0E0E0',         // Border color
};

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
  const [activeTab, setActiveTab] = useState<'planner' | 'shopping' | 'costs'>('planner');
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

  // Calculate total costs
  const totalWeeklyCost = mealPlan.reduce((sum, item) => {
    return sum + (item.recipe.pricePerServing * item.portions);
  }, 0);

  const shoppingListCost = shoppingList.reduce((sum, item) => sum + item.estimatedCost, 0);

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

  // Render meal planner tab
  const renderMealPlanner = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Quick Actions */}
        <View style={styles.quickActionsCard}>
          <View style={styles.quickActionsHeader}>
            <Ionicons name="flash" size={24} color={ENHANCED_COLORS.primary} />
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          </View>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setShowAutoPlanner(true)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: ENHANCED_COLORS.primary + '20' }]}>
                <Ionicons name="sparkles" size={24} color={ENHANCED_COLORS.primary} />
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
                      <Ionicons name="checkmark-circle" size={16} color={ENHANCED_COLORS.primary} />
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
                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.recipeMetaText}>{recipe.readyInMinutes}min</Text>
                      </View>
                      <View style={styles.recipeMeta}>
                        <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
                        <Text style={styles.recipeMetaText}>{recipe.servings}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Weekly Meal Plan */}
        {mealPlan.length > 0 && (
          <View style={styles.weeklyPlanSection}>
            <View style={styles.weeklyPlanHeader}>
              <View style={styles.weeklyPlanTitleRow}>
                <Ionicons name="calendar" size={24} color={ENHANCED_COLORS.primary} />
                <Text style={styles.weeklyPlanTitle}>This Week's Plan</Text>
              </View>
              <Text style={styles.weeklyPlanSubtitle}>
                {mealPlan.length} meal{mealPlan.length !== 1 ? 's' : ''} planned
              </Text>
            </View>

            {/* Day Selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.daySelector}
            >
              {DAYS.map((day) => {
                const dayMeals = mealPlan.filter(m => m.day === day);
                const isSelected = selectedDay === day;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayChip,
                      isSelected && styles.dayChipSelected,
                    ]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text style={[
                      styles.dayChipText,
                      isSelected && styles.dayChipTextSelected,
                    ]}>
                      {day}
                    </Text>
                    {dayMeals.length > 0 && (
                      <View style={styles.dayChipBadge}>
                        <Text style={styles.dayChipBadgeText}>{dayMeals.length}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Meals for Selected Day */}
            <View style={styles.dayMealsSection}>
              {mealPlan.filter(m => m.day === selectedDay).map((meal) => (
                <View key={meal.id} style={styles.mealCard}>
                  <Image source={{ uri: meal.recipe.image }} style={styles.mealCardImage} />
                  <View style={styles.mealCardInfo}>
                    <View style={styles.mealCardHeader}>
                      <View style={styles.mealTypeTag}>
                        <Text style={styles.mealTypeTagText}>
                          {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => removeMealFromPlan(meal.id)}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.mealCardTitle} numberOfLines={2}>
                      {meal.recipe.title}
                    </Text>
                    <View style={styles.mealCardMeta}>
                      <View style={styles.mealCardMetaItem}>
                        <Ionicons name="people" size={14} color={colors.textSecondary} />
                        <Text style={styles.mealCardMetaText}>{meal.portions} servings</Text>
                      </View>
                      <View style={styles.mealCardMetaItem}>
                        <Ionicons name="time" size={14} color={colors.textSecondary} />
                        <Text style={styles.mealCardMetaText}>{meal.recipe.readyInMinutes}min</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
              {mealPlan.filter(m => m.day === selectedDay).length === 0 && (
                <View style={styles.emptyDayState}>
                  <Ionicons name="restaurant-outline" size={48} color={colors.textLight} />
                  <Text style={styles.emptyDayStateText}>No meals planned for {selectedDay}</Text>
                  <Text style={styles.emptyDayStateSubtext}>Search recipes above to add meals</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Empty State */}
        {mealPlan.length === 0 && searchResults.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyStateTitle}>Start Planning Your Meals</Text>
            <Text style={styles.emptyStateText}>
              Use Auto Plan for a quick weekly plan, or search recipes to add meals manually
            </Text>
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
                <Ionicons name="cart" size={24} color={ENHANCED_COLORS.primary} />
                <Text style={styles.shoppingListTitle}>Shopping List</Text>
              </View>
              <Text style={styles.shoppingListSubtitle}>
                {shoppingList.length} item{shoppingList.length !== 1 ? 's' : ''} needed
              </Text>
            </View>

            {shoppingList.map((item) => (
              <View key={item.id} style={styles.shoppingListItem}>
                <View style={styles.shoppingListItemIcon}>
                  <Ionicons name="basket-outline" size={20} color={ENHANCED_COLORS.primary} />
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

  // Render cost estimates tab
  const renderCostEstimates = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {mealPlan.length > 0 ? (
          <>
            <View style={styles.costCard}>
              <View style={styles.costCardHeader}>
                <Ionicons name="cash" size={24} color={colors.finance} />
                <Text style={styles.costCardTitle}>Weekly Cost Estimate</Text>
              </View>
              <View style={styles.costCardBody}>
                <Text style={styles.costCardAmount}>${(totalWeeklyCost / 100).toFixed(2)}</Text>
                <Text style={styles.costCardLabel}>for {mealPlan.length} meals</Text>
              </View>
              <View style={styles.costCardFooter}>
                <View style={styles.costCardStat}>
                  <Text style={styles.costCardStatLabel}>Per Meal</Text>
                  <Text style={styles.costCardStatValue}>
                    ${(totalWeeklyCost / mealPlan.length / 100).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.costCardDivider} />
                <View style={styles.costCardStat}>
                  <Text style={styles.costCardStatLabel}>Per Day</Text>
                  <Text style={styles.costCardStatValue}>
                    ${(totalWeeklyCost / 7 / 100).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.costBreakdownSection}>
              <Text style={styles.costBreakdownTitle}>Cost by Meal</Text>
              {mealPlan.map((meal) => (
                <View key={meal.id} style={styles.costBreakdownItem}>
                  <View style={styles.costBreakdownItemLeft}>
                    <Text style={styles.costBreakdownItemDay}>{meal.day}</Text>
                    <Text style={styles.costBreakdownItemName} numberOfLines={1}>
                      {meal.recipe.title}
                    </Text>
                  </View>
                  <Text style={styles.costBreakdownItemCost}>
                    ${((meal.recipe.pricePerServing * meal.portions) / 100).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="cash-outline" size={64} color={colors.textLight} />
            <Text style={styles.emptyStateTitle}>No Cost Data Yet</Text>
            <Text style={styles.emptyStateText}>
              Add meals to your weekly plan to see cost estimates
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
                        <Ionicons name="checkmark-circle" size={16} color={ENHANCED_COLORS.primary} />
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
              <Ionicons name="remove" size={24} color={ENHANCED_COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.portionCounterValue}>{portionCount}</Text>
            <TouchableOpacity
              style={styles.portionCounterButton}
              onPress={() => setPortionCount(portionCount + 1)}
            >
              <Ionicons name="add" size={24} color={ENHANCED_COLORS.primary} />
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
          style={[styles.tab, activeTab === 'planner' && styles.tabActive]}
          onPress={() => setActiveTab('planner')}
        >
          <Ionicons
            name="calendar"
            size={20}
            color={activeTab === 'planner' ? ENHANCED_COLORS.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'planner' && styles.tabTextActive,
            ]}
          >
            Planner
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'shopping' && styles.tabActive]}
          onPress={() => setActiveTab('shopping')}
        >
          <Ionicons
            name="cart"
            size={20}
            color={activeTab === 'shopping' ? ENHANCED_COLORS.primary : colors.textSecondary}
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

        <TouchableOpacity
          style={[styles.tab, activeTab === 'costs' && styles.tabActive]}
          onPress={() => setActiveTab('costs')}
        >
          <Ionicons
            name="cash"
            size={20}
            color={activeTab === 'costs' ? ENHANCED_COLORS.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'costs' && styles.tabTextActive,
            ]}
          >
            Costs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'planner' && renderMealPlanner()}
      {activeTab === 'shopping' && renderShoppingList()}
      {activeTab === 'costs' && renderCostEstimates()}

      {/* Modals */}
      {renderRecipeModal()}
      {renderPortionModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ENHANCED_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: ENHANCED_COLORS.card,
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
    backgroundColor: ENHANCED_COLORS.card,
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
    borderBottomColor: ENHANCED_COLORS.primary,
  },
  tabText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabTextActive: {
    ...typography.bodyBold,
    fontSize: 14,
    color: ENHANCED_COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  quickActionsCard: {
    backgroundColor: ENHANCED_COLORS.card,
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
    backgroundColor: ENHANCED_COLORS.card,
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
    backgroundColor: ENHANCED_COLORS.background,
    borderRadius: 20,
    marginRight: spacing.sm,
    gap: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ingredientChipSelected: {
    backgroundColor: ENHANCED_COLORS.primary + '20',
    borderColor: ENHANCED_COLORS.primary,
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
    color: ENHANCED_COLORS.primary,
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
    backgroundColor: ENHANCED_COLORS.background,
    borderRadius: 20,
    gap: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: ENHANCED_COLORS.primary + '20',
    borderColor: ENHANCED_COLORS.primary,
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
    color: ENHANCED_COLORS.primary,
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
    backgroundColor: ENHANCED_COLORS.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
    ...shadows.small,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ENHANCED_COLORS.background,
    borderRadius: 12,
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
    backgroundColor: ENHANCED_COLORS.primary,
    borderRadius: 12,
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
    backgroundColor: ENHANCED_COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.small,
  },
  recipeImage: {
    width: '100%',
    height: 120,
    backgroundColor: ENHANCED_COLORS.background,
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
    backgroundColor: ENHANCED_COLORS.card,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dayChipSelected: {
    backgroundColor: ENHANCED_COLORS.primary + '20',
    borderColor: ENHANCED_COLORS.primary,
  },
  dayChipText: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
  },
  dayChipTextSelected: {
    ...typography.bodyBold,
    fontSize: 14,
    color: ENHANCED_COLORS.primary,
  },
  dayChipBadge: {
    backgroundColor: ENHANCED_COLORS.primary,
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
    backgroundColor: ENHANCED_COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.small,
  },
  mealCardImage: {
    width: 80,
    height: 80,
    backgroundColor: ENHANCED_COLORS.background,
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
    backgroundColor: ENHANCED_COLORS.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mealTypeTagText: {
    ...typography.bodyBold,
    fontSize: 11,
    color: ENHANCED_COLORS.primary,
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
    backgroundColor: ENHANCED_COLORS.card,
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
    backgroundColor: ENHANCED_COLORS.card,
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
    backgroundColor: ENHANCED_COLORS.primary + '20',
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
  costCard: {
    backgroundColor: ENHANCED_COLORS.card,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  costCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  costCardTitle: {
    ...typography.h4,
    color: colors.text,
  },
  costCardBody: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  costCardAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.finance,
  },
  costCardLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  costCardFooter: {
    flexDirection: 'row',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  costCardStat: {
    flex: 1,
    alignItems: 'center',
  },
  costCardStatLabel: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  costCardStatValue: {
    ...typography.bodyBold,
    fontSize: 18,
    color: colors.text,
  },
  costCardDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  costBreakdownSection: {
    marginBottom: spacing.md,
  },
  costBreakdownTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  costBreakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ENHANCED_COLORS.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  costBreakdownItemLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  costBreakdownItemDay: {
    ...typography.caption,
    fontSize: 12,
    color: ENHANCED_COLORS.primary,
    marginBottom: 2,
  },
  costBreakdownItemName: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
  },
  costBreakdownItemCost: {
    ...typography.bodyBold,
    fontSize: 16,
    color: colors.finance,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: ENHANCED_COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: ENHANCED_COLORS.card,
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
    backgroundColor: ENHANCED_COLORS.background,
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
    backgroundColor: ENHANCED_COLORS.primary,
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
    backgroundColor: ENHANCED_COLORS.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addToPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ENHANCED_COLORS.primary,
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
    backgroundColor: ENHANCED_COLORS.card,
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
    backgroundColor: ENHANCED_COLORS.background,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  portionDayChipSelected: {
    backgroundColor: ENHANCED_COLORS.primary + '20',
    borderColor: ENHANCED_COLORS.primary,
  },
  portionDayChipText: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
  },
  portionDayChipTextSelected: {
    ...typography.bodyBold,
    fontSize: 14,
    color: ENHANCED_COLORS.primary,
  },
  mealTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mealTypeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: ENHANCED_COLORS.background,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mealTypeChipSelected: {
    backgroundColor: ENHANCED_COLORS.primary + '20',
    borderColor: ENHANCED_COLORS.primary,
  },
  mealTypeChipText: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
  },
  mealTypeChipTextSelected: {
    ...typography.bodyBold,
    fontSize: 14,
    color: ENHANCED_COLORS.primary,
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
    backgroundColor: ENHANCED_COLORS.primary + '20',
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
    backgroundColor: ENHANCED_COLORS.primary,
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
});
