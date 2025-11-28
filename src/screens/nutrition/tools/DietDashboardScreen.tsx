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
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useAuthStore } from '../../../store/authStore';
import { COMMON_INGREDIENTS } from '../../../data/ingredients';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';

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

// API configuration - Priority: Firebase → TheMealDB → Spoonacular
const SPOONACULAR_API_KEY = '8b6cd47792ff4057ad699f9b0523d9df';
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';
const THEMEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Filter configurations (same as admin panel)
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
  { id: 'spanish', label: 'Spanish', icon: '🇪🇸' },
  { id: 'korean', label: 'Korean', icon: '🇰🇷' },
  { id: 'turkish', label: 'Turkish', icon: '🇹🇷' },
  { id: 'german', label: 'German', icon: '🇩🇪' },
  { id: 'british', label: 'British', icon: '🇬🇧' },
  { id: 'mediterranean', label: 'Mediterranean', icon: '🫒' },
  { id: 'middle eastern', label: 'Middle Eastern', icon: '🧆' },
  { id: 'vietnamese', label: 'Vietnamese', icon: '🍜' },
  { id: 'brazilian', label: 'Brazilian', icon: '🇧🇷' },
  { id: 'caribbean', label: 'Caribbean', icon: '🏝️' },
];

export const DietDashboardScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();

  // State
  const [activeTab, setActiveTab] = useState<'planner' | 'shopping' | 'costs'>('planner');
  const [searchMode, setSearchMode] = useState<'ingredients' | 'ai'>('ingredients'); // New: search mode tabs
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
  const [showFilters, setShowFilters] = useState(false);

  // Ingredient search state
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [showTextSearch, setShowTextSearch] = useState(false);

  // Auto meal planner state
  const [showAutoPlanner, setShowAutoPlanner] = useState(false);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [plannerStep, setPlannerStep] = useState(1); // 1: preferences intro, 2: configuration
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [daysToGenerate, setDaysToGenerate] = useState(7);
  const [preferredCuisines, setPreferredCuisines] = useState<string[]>([]);
  const [aiPlannerIngredients, setAiPlannerIngredients] = useState<string[]>([]); // New: AI planner ingredients

  // Promo modal state
  const [showPromoModal, setShowPromoModal] = useState(false);

  // Check if first time visiting and show promo
  useEffect(() => {
    const checkFirstVisit = async () => {
      try {
        const hasSeenPromo = await AsyncStorage.getItem('hasSeenAIPlannerPromo');
        if (!hasSeenPromo) {
          // Show promo after a short delay
          setTimeout(() => {
            setShowPromoModal(true);
          }, 1000);
        }
      } catch (error) {
        console.error('Error checking first visit:', error);
      }
    };
    checkFirstVisit();
  }, []);

  // Calculate total costs
  const totalWeeklyCost = mealPlan.reduce((sum, item) => {
    return sum + (item.recipe.pricePerServing * item.portions);
  }, 0);

  const shoppingListCost = shoppingList.reduce((sum, item) => sum + item.estimatedCost, 0);

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
  };

  // Helper: Transform TheMealDB meal to Recipe format
  const transformMealDBToRecipe = (meal: any): Recipe => {
    // Extract ingredients from TheMealDB format (strIngredient1-20, strMeasure1-20)
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

    // Parse instructions into steps
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
      readyInMinutes: 30, // TheMealDB doesn't provide this, using default
      servings: 4, // TheMealDB doesn't provide this, using default
      pricePerServing: 300, // Estimated default ($3.00)
      cuisines: meal.strArea ? [meal.strArea] : [],
      diets: meal.strCategory ? [meal.strCategory] : [],
      summary: `${meal.strMeal} is a ${meal.strCategory || ''} ${meal.strArea || ''} dish.`,
      calories: 0, // TheMealDB doesn't provide nutrition
      protein: 0,
      carbs: 0,
      fat: 0,
      extendedIngredients: ingredients,
      instructions: instructions,
      analyzedInstructions: steps.length > 0 ? [{ steps }] : [],
    };
  };

  // Helper: Lightweight client-side filtering for edge cases
  // Note: Most filtering is done by TheMealDB API natively, this is just backup
  const filterRecipes = (recipes: Recipe[]): Recipe[] => {
    return recipes.filter((recipe) => {
      // Only apply strict filtering for diets not supported by TheMealDB natively
      if (selectedDietFilters.length > 0) {
        const title = recipe.title.toLowerCase();

        for (const dietFilter of selectedDietFilters) {
          // TheMealDB handles Vegetarian and Vegan natively, so skip strict filtering for those
          if (dietFilter === 'vegetarian' || dietFilter === 'vegan') {
            continue;
          }

          // Only filter for diets NOT supported by TheMealDB (gluten free, keto, etc.)
          if (dietFilter === 'gluten free') {
            const glutenKeywords = ['wheat', 'bread', 'pasta'];
            const hasGluten = glutenKeywords.some(keyword => title.includes(keyword));
            if (hasGluten) {
              console.log(`🚫 Filtered out gluten-containing: ${recipe.title}`);
              return false;
            }
          }
        }
      }

      return true; // Recipe passes lightweight filters
    });
  };

  // Search Firebase database for recipes
  const searchFirebaseRecipes = async (searchTerm: string): Promise<Recipe[]> => {
    try {
      const recipesRef = collection(db, 'recipes');
      const querySnapshot = await getDocs(recipesRef);

      const recipes: Recipe[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const title = data.title?.toLowerCase() || '';
        if (title.includes(searchTerm.toLowerCase())) {
          recipes.push({
            id: data.spoonacularId || parseInt(doc.id),
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
          });
        }
      });

      return recipes;
    } catch (error) {
      console.error('Error searching Firebase:', error);
      return [];
    }
  };

  // Search TheMealDB by name
  const searchTheMealDB = async (searchTerm: string): Promise<Recipe[]> => {
    try {
      const response = await fetch(`${THEMEALDB_BASE_URL}/search.php?s=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();

      if (data.meals && data.meals.length > 0) {
        return data.meals.map(transformMealDBToRecipe);
      }
      return [];
    } catch (error) {
      console.error('Error searching TheMealDB:', error);
      return [];
    }
  };

  // Search TheMealDB using NATIVE filters (area, category)
  const searchTheMealDBWithFilters = async (): Promise<Recipe[]> => {
    try {
      let allRecipes: Recipe[] = [];

      // Map our filter IDs to TheMealDB format
      const dietToCategoryMap: { [key: string]: string } = {
        'vegetarian': 'Vegetarian',
        'vegan': 'Vegan',
      };

      const cuisineToAreaMap: { [key: string]: string } = {
        'american': 'American',
        'british': 'British',
        'canadian': 'Canadian',
        'chinese': 'Chinese',
        'croatian': 'Croatian',
        'dutch': 'Dutch',
        'egyptian': 'Egyptian',
        'french': 'French',
        'greek': 'Greek',
        'indian': 'Indian',
        'irish': 'Irish',
        'italian': 'Italian',
        'jamaican': 'Jamaican',
        'japanese': 'Japanese',
        'kenyan': 'Kenyan',
        'malaysian': 'Malaysian',
        'mexican': 'Mexican',
        'moroccan': 'Moroccan',
        'polish': 'Polish',
        'portuguese': 'Portuguese',
        'russian': 'Russian',
        'spanish': 'Spanish',
        'thai': 'Thai',
        'tunisian': 'Tunisian',
        'turkish': 'Turkish',
        'vietnamese': 'Vietnamese',
      };

      // Priority 1: Filter by cuisine (area) if selected
      if (selectedCuisine && cuisineToAreaMap[selectedCuisine]) {
        const area = cuisineToAreaMap[selectedCuisine];
        console.log(`🔍 TheMealDB: Filtering by area=${area}`);
        const response = await fetch(`${THEMEALDB_BASE_URL}/filter.php?a=${area}`);
        const data = await response.json();

        if (data.meals && data.meals.length > 0) {
          // Fetch full details for each meal
          const detailedMeals = await Promise.all(
            data.meals.slice(0, 20).map(async (meal: any) => {
              const detailResponse = await fetch(`${THEMEALDB_BASE_URL}/lookup.php?i=${meal.idMeal}`);
              const detailData = await detailResponse.json();
              return detailData.meals?.[0] ? transformMealDBToRecipe(detailData.meals[0]) : null;
            })
          );
          allRecipes = detailedMeals.filter((meal): meal is Recipe => meal !== null);
          console.log(`✅ Found ${allRecipes.length} ${area} recipes`);
        }
      }

      // Priority 2: Filter by diet category if selected
      if (selectedDietFilters.length > 0) {
        for (const dietFilter of selectedDietFilters) {
          if (dietToCategoryMap[dietFilter]) {
            const category = dietToCategoryMap[dietFilter];
            console.log(`🔍 TheMealDB: Filtering by category=${category}`);
            const response = await fetch(`${THEMEALDB_BASE_URL}/filter.php?c=${category}`);
            const data = await response.json();

            if (data.meals && data.meals.length > 0) {
              // Fetch full details for each meal
              const detailedMeals = await Promise.all(
                data.meals.slice(0, 20).map(async (meal: any) => {
                  const detailResponse = await fetch(`${THEMEALDB_BASE_URL}/lookup.php?i=${meal.idMeal}`);
                  const detailData = await detailResponse.json();
                  return detailData.meals?.[0] ? transformMealDBToRecipe(detailData.meals[0]) : null;
                })
              );
              const categoryRecipes = detailedMeals.filter((meal): meal is Recipe => meal !== null);

              // If we already have recipes from cuisine filter, find intersection
              if (allRecipes.length > 0) {
                const recipeIds = new Set(allRecipes.map(r => r.id));
                const intersectionRecipes = categoryRecipes.filter(r => recipeIds.has(r.id));
                console.log(`✅ Found ${intersectionRecipes.length} recipes matching both ${selectedCuisine} and ${category}`);
                allRecipes = intersectionRecipes;
              } else {
                allRecipes = categoryRecipes;
                console.log(`✅ Found ${allRecipes.length} ${category} recipes`);
              }
            }
          }
        }
      }

      // If no filters, or no results yet, get random meals
      if (allRecipes.length === 0 && !selectedCuisine && selectedDietFilters.length === 0) {
        console.log('🔍 TheMealDB: No filters, getting random meals');
        // Get multiple random meals
        for (let i = 0; i < 10; i++) {
          const response = await fetch(`${THEMEALDB_BASE_URL}/random.php`);
          const data = await response.json();
          if (data.meals && data.meals[0]) {
            allRecipes.push(transformMealDBToRecipe(data.meals[0]));
          }
        }
      }

      return allRecipes;
    } catch (error) {
      console.error('Error searching TheMealDB with filters:', error);
      return [];
    }
  };

  // Search TheMealDB by ingredient
  const searchTheMealDBByIngredient = async (ingredient: string): Promise<Recipe[]> => {
    try {
      const response = await fetch(`${THEMEALDB_BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`);
      const data = await response.json();

      if (data.meals && data.meals.length > 0) {
        // Note: filter endpoint returns limited data, need to fetch full details
        const detailedMeals = await Promise.all(
          data.meals.slice(0, 10).map(async (meal: any) => {
            const detailResponse = await fetch(`${THEMEALDB_BASE_URL}/lookup.php?i=${meal.idMeal}`);
            const detailData = await detailResponse.json();
            return detailData.meals?.[0] ? transformMealDBToRecipe(detailData.meals[0]) : null;
          })
        );
        return detailedMeals.filter((meal): meal is Recipe => meal !== null);
      }
      return [];
    } catch (error) {
      console.error('Error searching TheMealDB by ingredient:', error);
      return [];
    }
  };

  // Toggle ingredient selection
  const toggleIngredient = (ingredientId: string) => {
    if (selectedIngredients.includes(ingredientId)) {
      setSelectedIngredients(selectedIngredients.filter(id => id !== ingredientId));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredientId]);
    }
  };

  // Search by ingredients - Priority: Firebase → TheMealDB → Spoonacular
  const searchByIngredients = async () => {
    if (selectedIngredients.length === 0) {
      Alert.alert('No Ingredients', 'Please select at least one ingredient');
      return;
    }

    setLoading(true);
    try {
      const ingredientNames = selectedIngredients
        .map((id) => COMMON_INGREDIENTS.find((i) => i.id === id)?.name)
        .filter(Boolean);

      let allRecipes: Recipe[] = [];

      // Priority 1: Search Firebase database first
      console.log('🔍 Searching Firebase database...');
      for (const ingredient of ingredientNames) {
        const firebaseRecipes = await searchFirebaseRecipes(ingredient);
        allRecipes = [...allRecipes, ...firebaseRecipes];
      }

      // Priority 2: TheMealDB (FREE API)
      console.log('🔍 Searching TheMealDB (FREE)...');

      // If filters are selected, use native TheMealDB filtering
      if (selectedCuisine || selectedDietFilters.length > 0) {
        const filteredMeals = await searchTheMealDBWithFilters();
        allRecipes = [...allRecipes, ...filteredMeals];
      }

      // Also search by ingredients
      for (const ingredient of ingredientNames.slice(0, 3)) {
        const mealDBRecipes = await searchTheMealDBByIngredient(ingredient);
        allRecipes = [...allRecipes, ...mealDBRecipes];
        if (allRecipes.length >= 30) break;
      }

      // SPOONACULAR DISABLED TEMPORARILY
      /*
      // Priority 3: If still not enough, fallback to Spoonacular (PAID - use sparingly)
      if (allRecipes.length < 5) {
        console.log('⚠️ Using Spoonacular API (PAID) as fallback...');
        const ingredientNamesStr = ingredientNames.join(',');
        let url = `${SPOONACULAR_BASE_URL}/recipes/findByIngredients?apiKey=${SPOONACULAR_API_KEY}&ingredients=${encodeURIComponent(
          ingredientNamesStr
        )}&number=20&ranking=1&ignorePantry=true`;

        if (selectedDietFilters.length > 0) {
          url += `&diet=${selectedDietFilters.join(',')}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const spoonacularRecipes = data.map((recipe: any) => ({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            readyInMinutes: 0,
            servings: 0,
            pricePerServing: 0,
            cuisines: [],
            diets: [],
            summary: '',
          }));
          allRecipes = [...allRecipes, ...spoonacularRecipes];
        }
      }
      */

      // Remove duplicates based on title
      const uniqueRecipes = Array.from(
        new Map(allRecipes.map(recipe => [recipe.title.toLowerCase(), recipe])).values()
      );

      // Apply filters (diet, cuisine)
      const filteredRecipes = filterRecipes(uniqueRecipes);
      console.log(`🔍 Filtered from ${uniqueRecipes.length} to ${filteredRecipes.length} recipes`);

      // Randomize results to show different recipes each time
      const shuffledRecipes = filteredRecipes.sort(() => Math.random() - 0.5);

      console.log(`✅ Found ${shuffledRecipes.length} unique recipes matching filters`);
      setSearchResults(shuffledRecipes);

      if (shuffledRecipes.length === 0) {
        Alert.alert('No Results', 'No recipes found matching your filters. Try adjusting your filters or ingredients!');
      }
    } catch (error) {
      console.error('Error searching recipes by ingredients:', error);
      Alert.alert('Error', 'Failed to search recipes');
    } finally {
      setLoading(false);
    }
  };

  // Search recipes by text - Priority: Firebase → TheMealDB → Spoonacular
  const searchRecipes = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      let allRecipes: Recipe[] = [];

      // Priority 1: Search Firebase database first
      console.log('🔍 Searching Firebase database...');
      const firebaseRecipes = await searchFirebaseRecipes(query);
      allRecipes = [...firebaseRecipes];

      // Priority 2: TheMealDB (FREE API)
      console.log('🔍 Searching TheMealDB (FREE)...');

      // If filters are selected, use native TheMealDB filtering first
      if (selectedCuisine || selectedDietFilters.length > 0) {
        const filteredMeals = await searchTheMealDBWithFilters();
        allRecipes = [...allRecipes, ...filteredMeals];
      }

      // Also search by text query
      const mealDBRecipes = await searchTheMealDB(query);
      allRecipes = [...allRecipes, ...mealDBRecipes];

      // SPOONACULAR DISABLED TEMPORARILY
      /*
      // Priority 3: If still not enough, fallback to Spoonacular (PAID - use sparingly)
      if (allRecipes.length < 5) {
        console.log('⚠️ Using Spoonacular API (PAID) as fallback...');
        let url = `${SPOONACULAR_BASE_URL}/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(
          query
        )}&number=20&addRecipeInformation=true&fillIngredients=true&addRecipeNutrition=true`;

        // Add diet filters
        if (selectedDietFilters.length > 0) {
          url += `&diet=${selectedDietFilters.join(',')}`;
        }

        // Add type filter
        if (selectedType) {
          url += `&type=${encodeURIComponent(selectedType)}`;
        }

        // Add cuisine filter
        if (selectedCuisine) {
          url += `&cuisine=${encodeURIComponent(selectedCuisine)}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const recipesWithNutrition = (data.results || []).map((recipe: any) => {
            const calories = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount || 0;
            const protein = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount || 0;
            const carbs = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount || 0;
            const fat = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Fat')?.amount || 0;

            return {
              ...recipe,
              calories: Math.round(calories),
              protein: Math.round(protein),
              carbs: Math.round(carbs),
              fat: Math.round(fat),
            };
          });
          allRecipes = [...allRecipes, ...recipesWithNutrition];
        }
      }
      */

      // Remove duplicates based on title
      const uniqueRecipes = Array.from(
        new Map(allRecipes.map(recipe => [recipe.title.toLowerCase(), recipe])).values()
      );

      // Apply filters (diet, cuisine)
      const filteredRecipes = filterRecipes(uniqueRecipes);
      console.log(`🔍 Filtered from ${uniqueRecipes.length} to ${filteredRecipes.length} recipes`);

      // Randomize results to show different recipes each time
      const shuffledRecipes = filteredRecipes.sort(() => Math.random() - 0.5);

      console.log(`✅ Found ${shuffledRecipes.length} unique recipes matching filters`);
      setSearchResults(shuffledRecipes);

      if (shuffledRecipes.length === 0) {
        Alert.alert('No Results', `No recipes found for "${query}" matching your filters. Try adjusting your filters or search term!`);
      }
    } catch (error) {
      console.error('Error searching recipes:', error);
      Alert.alert('Error', 'Failed to search recipes');
    } finally {
      setLoading(false);
    }
  };

  // Save recipe to Firebase database
  const saveRecipeToDatabase = async (recipe: Recipe) => {
    try {
      // Check if recipe already exists in database
      const recipesRef = collection(db, 'recipes');
      const q = query(recipesRef, where('spoonacularId', '==', recipe.id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Recipe doesn't exist, save it
        const calories = recipe.calories || recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount || 0;
        const protein = recipe.protein || recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount || 0;
        const carbs = recipe.carbs || recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount || 0;
        const fat = recipe.fat || recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Fat')?.amount || 0;

        await addDoc(recipesRef, {
          spoonacularId: recipe.id,
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes,
          servings: recipe.servings,
          pricePerServing: recipe.pricePerServing,
          cuisines: recipe.cuisines || [],
          diets: recipe.diets || [],
          summary: recipe.summary,
          calories: Math.round(calories),
          protein: Math.round(protein),
          carbs: Math.round(carbs),
          fat: Math.round(fat),
          extendedIngredients: recipe.extendedIngredients || [],
          instructions: recipe.instructions || '',
          analyzedInstructions: recipe.analyzedInstructions || [],
          createdAt: new Date().toISOString(),
        });
        console.log('✅ Recipe saved to database:', recipe.title);
      }
    } catch (error) {
      console.error('Error saving recipe to database:', error);
      // Don't show error to user - this is background operation
    }
  };

  // Get recipe details - Priority: Firebase → TheMealDB → Spoonacular
  const getRecipeDetails = async (recipeId: number) => {
    setLoading(true);
    try {
      let recipe: any = null;

      // Priority 1: Check Firebase database first
      console.log('🔍 Checking Firebase for recipe details...');
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
        console.log('✅ Found in Firebase database');
      }

      // Priority 2: Try TheMealDB if not in Firebase
      if (!recipe) {
        console.log('🔍 Trying TheMealDB (FREE)...');
        try {
          const response = await fetch(`${THEMEALDB_BASE_URL}/lookup.php?i=${recipeId}`);
          const data = await response.json();
          if (data.meals && data.meals.length > 0) {
            recipe = transformMealDBToRecipe(data.meals[0]);
            console.log('✅ Found in TheMealDB');
          }
        } catch (error) {
          console.log('TheMealDB lookup failed');
        }
      }

      // SPOONACULAR DISABLED TEMPORARILY
      /*
      // Priority 3: Fallback to Spoonacular (PAID)
      if (!recipe) {
        console.log('⚠️ Using Spoonacular API (PAID) as fallback...');
        const response = await fetch(
          `${SPOONACULAR_BASE_URL}/recipes/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}&includeNutrition=true`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch recipe details from all sources');
        }

        const spoonacularRecipe = await response.json();

        // Extract nutrition data
        const calories = spoonacularRecipe.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount || 0;
        const protein = spoonacularRecipe.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount || 0;
        const carbs = spoonacularRecipe.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount || 0;
        const fat = spoonacularRecipe.nutrition?.nutrients?.find((n: any) => n.name === 'Fat')?.amount || 0;

        recipe = {
          ...spoonacularRecipe,
          calories: Math.round(calories),
          protein: Math.round(protein),
          carbs: Math.round(carbs),
          fat: Math.round(fat),
        };
        console.log('✅ Found in Spoonacular');
      }
      */

      setSelectedRecipe(recipe);
      setShowRecipeModal(true);

      // Auto-save recipe to database (background operation)
      saveRecipeToDatabase(recipe);
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      Alert.alert('Error', 'Failed to load recipe details from all sources');
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

    // Regenerate shopping list
    generateShoppingList([...mealPlan, newMeal]);
  };

  // Generate shopping list from meal plan
  const generateShoppingList = async (meals: MealPlanItem[]) => {
    // Common pantry items to exclude from shopping list
    const PANTRY_ITEMS = [
      'salt', 'pepper', 'black pepper', 'white pepper',
      'water', 'ice', 'ice cubes',
      'oil', 'olive oil', 'vegetable oil', 'canola oil', 'cooking oil',
      'sugar', 'white sugar', 'brown sugar',
      'flour', 'all-purpose flour',
      'baking powder', 'baking soda',
      'vanilla', 'vanilla extract',
      'oregano', 'basil', 'thyme', 'rosemary', 'parsley',
      'cumin', 'paprika', 'chili powder', 'cayenne pepper',
      'garlic powder', 'onion powder',
      'cinnamon', 'nutmeg', 'ginger',
      'bay leaf', 'bay leaves',
      'red pepper flakes', 'crushed red pepper',
      'italian seasoning', 'herbs de provence',
      'seasoning', 'spices', 'spice',
    ];

    // Group ingredients by name
    const ingredientMap = new Map<string, ShoppingListItem>();

    for (const meal of meals) {
      // Use extendedIngredients from recipe data instead of Spoonacular API
      const ingredients = meal.recipe.extendedIngredients || [];

      ingredients.forEach((ingredient: any) => {
        const ingredientName = ingredient.name || ingredient.original || '';
        const key = ingredientName.toLowerCase();

        // Skip pantry items
        const isPantryItem = PANTRY_ITEMS.some(item =>
          key.includes(item) || item.includes(key)
        );
        if (isPantryItem) {
          console.log(`🚫 Skipping pantry item: ${ingredientName}`);
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
            estimatedCost: 0, // Cost calculation not available without Spoonacular
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

  // Generate automatic meal plan - Priority: Firebase → TheMealDB → Spoonacular
  const generateAutomaticMealPlan = async () => {
    if (selectedIngredients.length === 0 && preferredCuisines.length === 0) {
      Alert.alert(
        'Select Preferences',
        'Please select at least some ingredients or cuisines to generate a meal plan'
      );
      return;
    }

    setPlannerLoading(true);
    setShowAutoPlanner(false);

    try {
      const newMealPlan: MealPlanItem[] = [];
      const mealTypes: Array<'breakfast' | 'lunch' | 'dinner'> = ['breakfast', 'lunch', 'dinner'];

      // Generate meals for each day
      for (let dayIndex = 0; dayIndex < daysToGenerate; dayIndex++) {
        const day = DAYS[dayIndex];

        // Generate specified number of meals per day
        for (let mealIndex = 0; mealIndex < mealsPerDay; mealIndex++) {
          const mealType = mealTypes[mealIndex];
          let recipe: any = null;

          // Priority 1: Try Firebase first (search by ingredients)
          if (selectedIngredients.length > 0 && newMealPlan.length < 5) {
            const ingredientNames = selectedIngredients
              .map((id) => COMMON_INGREDIENTS.find((i) => i.id === id)?.name)
              .filter(Boolean);

            for (const ingredient of ingredientNames.slice(0, 2)) {
              const firebaseRecipes = await searchFirebaseRecipes(ingredient);
              if (firebaseRecipes.length > 0) {
                recipe = firebaseRecipes[Math.floor(Math.random() * firebaseRecipes.length)];
                console.log('✅ Using Firebase recipe for meal plan');
                break;
              }
            }
          }

          // Priority 2: Try TheMealDB (FREE API)
          if (!recipe) {
            console.log('🔍 Trying TheMealDB (FREE) for meal plan...');
            try {
              // Use random meal or filter by area (cuisine)
              let mealDBUrl = `${THEMEALDB_BASE_URL}/random.php`;

              // If cuisine selected, try to get meal by area
              if (preferredCuisines.length > 0) {
                const cuisine = preferredCuisines[Math.floor(Math.random() * preferredCuisines.length)];
                // Map our cuisine names to TheMealDB areas
                const areaMap: { [key: string]: string } = {
                  'italian': 'Italian',
                  'mexican': 'Mexican',
                  'chinese': 'Chinese',
                  'japanese': 'Japanese',
                  'thai': 'Thai',
                  'indian': 'Indian',
                  'american': 'American',
                  'french': 'French',
                  'greek': 'Greek',
                };
                const area = areaMap[cuisine];
                if (area) {
                  mealDBUrl = `${THEMEALDB_BASE_URL}/filter.php?a=${area}`;
                }
              }

              const response = await fetch(mealDBUrl);
              const data = await response.json();

              if (data.meals && data.meals.length > 0) {
                // If we got filtered results, pick random and fetch details
                const meal = data.meals[Math.floor(Math.random() * Math.min(data.meals.length, 10))];
                const detailResponse = await fetch(`${THEMEALDB_BASE_URL}/lookup.php?i=${meal.idMeal}`);
                const detailData = await detailResponse.json();

                if (detailData.meals && detailData.meals[0]) {
                  recipe = transformMealDBToRecipe(detailData.meals[0]);
                  console.log('✅ Using TheMealDB recipe for meal plan');
                }
              }
            } catch (error) {
              console.log('TheMealDB failed');
            }
          }

          // SPOONACULAR DISABLED TEMPORARILY
          /*
          // Priority 3: Fallback to Spoonacular (PAID - use sparingly)
          if (!recipe) {
            console.log('⚠️ Using Spoonacular API (PAID) for meal plan...');
            let url = `${SPOONACULAR_BASE_URL}/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&number=1&addRecipeInformation=true&addRecipeNutrition=true`;

            // Add ingredients if selected
            if (selectedIngredients.length > 0) {
              const ingredientNames = selectedIngredients
                .map((id) => COMMON_INGREDIENTS.find((i) => i.id === id)?.name)
                .filter(Boolean)
                .join(',');
              url += `&includeIngredients=${encodeURIComponent(ingredientNames)}`;
            }

            // Add meal type
            url += `&type=${mealType}`;

            // Add cuisine if selected
            if (preferredCuisines.length > 0) {
              const cuisine = preferredCuisines[Math.floor(Math.random() * preferredCuisines.length)];
              url += `&cuisine=${encodeURIComponent(cuisine)}`;
            }

            // Add diet filters if any
            if (selectedDietFilters.length > 0) {
              url += `&diet=${selectedDietFilters.join(',')}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
              const spoonacularRecipe = data.results[0];

              // Extract nutrition data
              const calories = spoonacularRecipe.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount || 0;
              const protein = spoonacularRecipe.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount || 0;
              const carbs = spoonacularRecipe.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount || 0;
              const fat = spoonacularRecipe.nutrition?.nutrients?.find((n: any) => n.name === 'Fat')?.amount || 0;

              recipe = {
                ...spoonacularRecipe,
                calories: Math.round(calories),
                protein: Math.round(protein),
                carbs: Math.round(carbs),
                fat: Math.round(fat),
              };
              console.log('✅ Using Spoonacular recipe for meal plan');
            }
          }
          */

          // Add recipe to meal plan if found
          if (recipe) {
            const meal: MealPlanItem = {
              id: `${day}-${mealType}-${Date.now()}-${mealIndex}`,
              recipeId: recipe.id,
              recipe: recipe,
              day,
              mealType,
              portions: 2,
              date: new Date().toISOString(),
            };

            newMealPlan.push(meal);
          }

          // Small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      setMealPlan(newMealPlan);
      generateShoppingList(newMealPlan);

      Alert.alert(
        '✅ Meal Plan Generated!',
        `Created ${newMealPlan.length} meals for ${daysToGenerate} days`
      );
    } catch (error) {
      console.error('Error generating meal plan:', error);
      Alert.alert('Error', 'Failed to generate meal plan. Please try again.');
    } finally {
      setPlannerLoading(false);
    }
  };

  // Render Recipe Search - REDESIGNED
  const renderRecipeSearch = () => (
    <View style={styles.searchSection}>
      {/* Mode Tabs - Clean & Modern */}
      <View style={styles.modeTabsContainer}>
        <TouchableOpacity
          style={[
            styles.modeTab,
            searchMode === 'ingredients' && styles.modeTabActive,
          ]}
          onPress={() => setSearchMode('ingredients')}
        >
          <Ionicons
            name="basket"
            size={20}
            color={searchMode === 'ingredients' ? colors.diet : colors.textSecondary}
          />
          <Text
            style={[
              styles.modeTabText,
              searchMode === 'ingredients' && styles.modeTabTextActive,
            ]}
          >
            Ingredient Search
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeTab,
            searchMode === 'ai' && styles.modeTabActive,
          ]}
          onPress={() => setSearchMode('ai')}
        >
          <Ionicons
            name="sparkles"
            size={20}
            color={searchMode === 'ai' ? colors.diet : colors.textSecondary}
          />
          <Text
            style={[
              styles.modeTabText,
              searchMode === 'ai' && styles.modeTabTextActive,
            ]}
          >
            AI Meal Planner
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {searchMode === 'ingredients' ? (
        <View style={styles.tabContent}>
          {/* Simplified Filters - Always Visible */}
          <View style={styles.simpleFiltersContainer}>
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>🍽️ Meal Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
                {TYPE_FILTERS.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.simpleFilterChip,
                      selectedRecipeType === filter.id && styles.simpleFilterChipActive,
                    ]}
                    onPress={() => setSelectedRecipeType(selectedRecipeType === filter.id ? '' : filter.id)}
                  >
                    <Text style={styles.simpleFilterIcon}>{filter.icon}</Text>
                    <Text style={[
                      styles.simpleFilterText,
                      selectedRecipeType === filter.id && styles.simpleFilterTextActive,
                    ]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>🌍 Cuisine</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
                {CUISINE_FILTERS.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.simpleFilterChip,
                      selectedCuisine === filter.id && styles.simpleFilterChipActive,
                    ]}
                    onPress={() => setSelectedCuisine(selectedCuisine === filter.id ? '' : filter.id)}
                  >
                    <Text style={styles.simpleFilterIcon}>{filter.icon}</Text>
                    <Text style={[
                      styles.simpleFilterText,
                      selectedCuisine === filter.id && styles.simpleFilterTextActive,
                    ]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>🥗 Diet</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
                {DIET_FILTERS.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.simpleFilterChip,
                      selectedDietFilters.includes(filter.id) && styles.simpleFilterChipActive,
                    ]}
                    onPress={() => toggleDietFilter(filter.id)}
                  >
                    <Text style={styles.simpleFilterIcon}>{filter.icon}</Text>
                    <Text style={[
                      styles.simpleFilterText,
                      selectedDietFilters.includes(filter.id) && styles.simpleFilterTextActive,
                    ]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {(selectedDietFilters.length > 0 || selectedCuisine || selectedRecipeType) && (
              <TouchableOpacity style={styles.clearAllButton} onPress={clearFilters}>
                <Ionicons name="close-circle" size={18} color={colors.error} />
                <Text style={styles.clearAllText}>Clear all filters</Text>
              </TouchableOpacity>
            )}
          </View>

      {/* Ingredient Selection */}
      <View style={styles.ingredientSection}>
        <Text style={styles.ingredientSectionTitle}>🛒 Select Your Ingredients</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.ingredientScroll}
        >
          <View style={styles.ingredientsRow}>
            {COMMON_INGREDIENTS.map((ingredient) => {
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
                  <Text
                    style={[
                      styles.ingredientLabel,
                      isSelected && styles.ingredientLabelSelected,
                    ]}
                  >
                    {ingredient.name}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={16} color={colors.diet} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Search Button */}
      {selectedIngredients.length > 0 && (
        <TouchableOpacity
          style={styles.searchByIngredientsButton}
          onPress={searchByIngredients}
        >
          <Ionicons name="search" size={20} color="white" />
          <Text style={styles.searchByIngredientsText}>
            Find Recipes ({selectedIngredients.length} ingredients)
          </Text>
        </TouchableOpacity>
      )}

      {/* Text Search - OPTIONAL/SECONDARY */}
      <TouchableOpacity
        style={styles.textSearchToggle}
        onPress={() => setShowTextSearch(!showTextSearch)}
      >
        <Ionicons
          name={showTextSearch ? "chevron-up" : "text"}
          size={18}
          color={colors.textSecondary}
        />
        <Text style={styles.textSearchToggleText}>
          {showTextSearch ? 'Hide text search' : 'Or search by recipe name'}
        </Text>
      </TouchableOpacity>

          {showTextSearch && (
            <View style={styles.searchBar}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search recipes (e.g., chicken, pasta, vegan...)"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => searchRecipes(searchQuery)}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => searchRecipes(searchQuery)}
              >
                <Ionicons name="search" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        /* AI Meal Planner Tab */
        <View style={styles.tabContent}>
          <View style={styles.aiPlannerCard}>
            <View style={styles.aiPlannerHeader}>
              <View style={styles.aiPlannerIconContainer}>
                <Ionicons name="sparkles" size={32} color="white" />
              </View>
              <View style={styles.aiPlannerTextContainer}>
                <Text style={styles.aiPlannerCardTitle}>Auto Generate Meal Plan</Text>
                <Text style={styles.aiPlannerCardDescription}>
                  Let AI create a personalized weekly plan based on your preferences
                </Text>
              </View>
            </View>

            {/* Ingredient Selection for AI */}
            <View style={styles.aiIngredientSection}>
              <Text style={styles.aiIngredientTitle}>
                🥘 Select 5-10 base ingredients:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.aiIngredientScroll}
              >
                {COMMON_INGREDIENTS.slice(0, 15).map((ingredient) => {
                  const isSelected = aiPlannerIngredients.includes(ingredient.id);
                  const canSelect = aiPlannerIngredients.length < 10;
                  return (
                    <TouchableOpacity
                      key={ingredient.id}
                      style={[
                        styles.aiIngredientChip,
                        isSelected && styles.aiIngredientChipSelected,
                        !canSelect && !isSelected && styles.aiIngredientChipDisabled,
                      ]}
                      onPress={() => {
                        if (isSelected) {
                          setAiPlannerIngredients(aiPlannerIngredients.filter((id) => id !== ingredient.id));
                        } else if (canSelect) {
                          setAiPlannerIngredients([...aiPlannerIngredients, ingredient.id]);
                        }
                      }}
                      disabled={!canSelect && !isSelected}
                    >
                      <Text style={styles.aiIngredientIcon}>{ingredient.icon}</Text>
                      <Text
                        style={[
                          styles.aiIngredientLabel,
                          isSelected && styles.aiIngredientLabelSelected,
                        ]}
                      >
                        {ingredient.name}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={16} color={colors.diet} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <Text style={styles.aiIngredientCount}>
                {aiPlannerIngredients.length}/10 selected
              </Text>
            </View>

            {/* Quick Stats */}
            <View style={styles.aiPlannerStats}>
              <View style={styles.aiPlannerStat}>
                <Ionicons name="calendar" size={18} color={colors.diet} />
                <Text style={styles.aiPlannerStatText}>3-7 days</Text>
              </View>
              <View style={styles.aiPlannerStat}>
                <Ionicons name="nutrition" size={18} color={colors.diet} />
                <Text style={styles.aiPlannerStatText}>Your diet type</Text>
              </View>
              <View style={styles.aiPlannerStat}>
                <Ionicons name="leaf" size={18} color={colors.diet} />
                <Text style={styles.aiPlannerStatText}>{aiPlannerIngredients.length} ingredients</Text>
              </View>
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              style={[
                styles.aiGenerateButton,
                aiPlannerIngredients.length < 5 && styles.aiGenerateButtonDisabled,
              ]}
              onPress={() => {
                if (aiPlannerIngredients.length >= 5) {
                  setPlannerStep(1);
                  setShowAutoPlanner(true);
                }
              }}
              disabled={plannerLoading || aiPlannerIngredients.length < 5}
            >
              <Ionicons name="flash" size={20} color="white" />
              <Text style={styles.aiGenerateButtonText}>
                {aiPlannerIngredients.length < 5
                  ? `Select ${5 - aiPlannerIngredients.length} more ingredients`
                  : 'Create Meal Plan'}
              </Text>
              {aiPlannerIngredients.length >= 5 && (
                <Ionicons name="arrow-forward" size={18} color="white" />
              )}
            </TouchableOpacity>

            {/* Info */}
            <Text style={styles.aiPlannerInfo}>
              ✨ AI will suggest recipes based on your selected ingredients, dietary preferences, and favorite cuisines
            </Text>
          </View>
        </View>
      )}

      {loading && <ActivityIndicator size="large" color={colors.diet} style={styles.loader} />}

      {/* Recipe Results */}
      {searchResults.length > 0 && (
        <>
          <Text style={styles.resultsTitle}>
            Found {searchResults.length} recipes
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recipeScroll}>
            {searchResults.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() => getRecipeDetails(recipe.id)}
              >
                <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
                <Text style={styles.recipeTitle} numberOfLines={2}>{recipe.title}</Text>
                <View style={styles.recipeInfo}>
                  {recipe.calories && recipe.calories > 0 && (
                    <View style={styles.caloriesBadge}>
                      <Text style={styles.caloriesText}>🔥 {recipe.calories} kcal</Text>
                    </View>
                  )}
                  {recipe.readyInMinutes > 0 && (
                    <Text style={styles.recipeInfoText}>⏱ {recipe.readyInMinutes}m</Text>
                  )}
                </View>
                {recipe.protein && recipe.protein > 0 && (
                  <View style={styles.macrosRow}>
                    <Text style={styles.macroText}>P: {recipe.protein}g</Text>
                    <Text style={styles.macroText}>C: {recipe.carbs}g</Text>
                    <Text style={styles.macroText}>F: {recipe.fat}g</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );

  // Render Auto Meal Planner Button
  const renderAutoMealPlannerButton = () => (
    <View style={styles.autoPlannerSection}>
      <TouchableOpacity
        style={styles.autoPlannerButton}
        onPress={() => {
          setPlannerStep(1); // Reset to first step
          setShowAutoPlanner(true);
        }}
        disabled={plannerLoading}
      >
        <View style={styles.autoPlannerContent}>
          <View style={styles.autoPlannerIcon}>
            <Ionicons name="sparkles" size={24} color="white" />
          </View>
          <View style={styles.autoPlannerTextContainer}>
            <Text style={styles.autoPlannerTitle}>✨ Auto Generate Meal Plan</Text>
            <Text style={styles.autoPlannerSubtitle}>
              Let AI create a personalized weekly plan for you
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.diet} />
        </View>
      </TouchableOpacity>
    </View>
  );

  // Render Promo Modal (First Time Only)
  const renderPromoModal = () => {
    const handleDismiss = async () => {
      try {
        await AsyncStorage.setItem('hasSeenAIPlannerPromo', 'true');
        setShowPromoModal(false);
      } catch (error) {
        console.error('Error saving promo state:', error);
      }
    };

    const handleTryIt = async () => {
      try {
        await AsyncStorage.setItem('hasSeenAIPlannerPromo', 'true');
        setShowPromoModal(false);
        setSearchMode('ai'); // Switch to AI tab
      } catch (error) {
        console.error('Error saving promo state:', error);
      }
    };

    return (
      <Modal
        visible={showPromoModal}
        transparent
        animationType="fade"
        onRequestClose={handleDismiss}
      >
        <View style={styles.promoOverlay}>
          <View style={styles.promoModal}>
            {/* Header with gradient background */}
            <View style={styles.promoHeader}>
              <View style={styles.promoIconBig}>
                <Ionicons name="sparkles" size={48} color="white" />
              </View>
            </View>

            {/* Content */}
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>✨ Introducing AI Meal Planner</Text>
              <Text style={styles.promoDescription}>
                Let AI create your perfect weekly meal plan in seconds!
              </Text>

              {/* Features */}
              <View style={styles.promoFeatures}>
                <View style={styles.promoFeature}>
                  <View style={styles.promoFeatureIcon}>
                    <Ionicons name="restaurant" size={20} color={colors.diet} />
                  </View>
                  <Text style={styles.promoFeatureText}>
                    Personalized recipes based on your ingredients
                  </Text>
                </View>
                <View style={styles.promoFeature}>
                  <View style={styles.promoFeatureIcon}>
                    <Ionicons name="nutrition" size={20} color={colors.diet} />
                  </View>
                  <Text style={styles.promoFeatureText}>
                    Matches your dietary preferences
                  </Text>
                </View>
                <View style={styles.promoFeature}>
                  <View style={styles.promoFeatureIcon}>
                    <Ionicons name="calendar" size={20} color={colors.diet} />
                  </View>
                  <Text style={styles.promoFeatureText}>
                    Complete 3-7 day meal plans
                  </Text>
                </View>
              </View>

              {/* Buttons */}
              <TouchableOpacity style={styles.promoButtonPrimary} onPress={handleTryIt}>
                <Ionicons name="flash" size={20} color="white" />
                <Text style={styles.promoButtonPrimaryText}>Try It Now</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.promoButtonSecondary} onPress={handleDismiss}>
                <Text style={styles.promoButtonSecondaryText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Render Auto Meal Planner Modal
  const renderAutoMealPlannerModal = () => {
    const handleCloseModal = () => {
      setShowAutoPlanner(false);
      setPlannerStep(1);
    };

    return (
      <Modal
        visible={showAutoPlanner}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.autoPlannerModal}>
            <ScrollView>
              {/* Header */}
              <View style={styles.autoPlannerHeader}>
                <Text style={styles.autoPlannerModalTitle}>
                  {plannerStep === 1 ? '✨ Create Your Meal Plan' : '⚙️ Configure Your Plan'}
                </Text>
                <TouchableOpacity onPress={handleCloseModal}>
                  <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Step 1: Preferences Introduction */}
              {plannerStep === 1 && (
                <>
                  <View style={styles.plannerIntroSection}>
                    <View style={styles.plannerIntroIcon}>
                      <Ionicons name="restaurant" size={48} color={colors.diet} />
                    </View>
                    <Text style={styles.plannerIntroTitle}>
                      Let's create your personalized meal plan!
                    </Text>
                    <Text style={styles.plannerIntroDescription}>
                      I'll help you build a custom diet plan based on your preferences, dietary requirements, and available ingredients.
                    </Text>
                  </View>

                  {/* Preference Options */}
                  <View style={styles.preferenceCard}>
                    <View style={styles.preferenceItem}>
                      <Ionicons name="calendar" size={24} color={colors.diet} />
                      <View style={styles.preferenceTextContainer}>
                        <Text style={styles.preferenceTitle}>Flexible Duration</Text>
                        <Text style={styles.preferenceDescription}>
                          Choose 3, 5, or 7 days based on your needs
                        </Text>
                      </View>
                    </View>
                    <View style={styles.preferenceItem}>
                      <Ionicons name="nutrition" size={24} color={colors.diet} />
                      <View style={styles.preferenceTextContainer}>
                        <Text style={styles.preferenceTitle}>Smart Nutrition</Text>
                        <Text style={styles.preferenceDescription}>
                          Tailored to your diet type (Vegan, Keto, etc.)
                        </Text>
                      </View>
                    </View>
                    <View style={styles.preferenceItem}>
                      <Ionicons name="globe" size={24} color={colors.diet} />
                      <View style={styles.preferenceTextContainer}>
                        <Text style={styles.preferenceTitle}>Cuisine Variety</Text>
                        <Text style={styles.preferenceDescription}>
                          Mix and match from Italian, Asian, American & more
                        </Text>
                      </View>
                    </View>
                    <View style={styles.preferenceItem}>
                      <Ionicons name="leaf" size={24} color={colors.diet} />
                      <View style={styles.preferenceTextContainer}>
                        <Text style={styles.preferenceTitle}>Your Ingredients</Text>
                        <Text style={styles.preferenceDescription}>
                          Uses the ingredients you've selected
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Continue Button */}
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() => setPlannerStep(2)}
                  >
                    <Text style={styles.continueButtonText}>Continue to Setup</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </TouchableOpacity>
                </>
              )}

              {/* Step 2: Configuration Details */}
              {plannerStep === 2 && (
                <>
                  <Text style={styles.autoPlannerDescription}>
                    Configure your meal plan preferences below
                  </Text>

                  {/* Days Selector */}
                  <View style={styles.autoPlannerOption}>
                    <Text style={styles.autoPlannerOptionLabel}>Number of days:</Text>
                    <View style={styles.daysSelector}>
                      {[3, 5, 7].map((days) => (
                        <TouchableOpacity
                          key={days}
                          style={[
                            styles.daysSelectorButton,
                            daysToGenerate === days && styles.daysSelectorButtonActive,
                          ]}
                          onPress={() => setDaysToGenerate(days)}
                        >
                          <Text
                            style={[
                              styles.daysSelectorText,
                              daysToGenerate === days && styles.daysSelectorTextActive,
                            ]}
                          >
                            {days} days
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Meals Per Day Selector */}
                  <View style={styles.autoPlannerOption}>
                    <Text style={styles.autoPlannerOptionLabel}>Meals per day:</Text>
                    <View style={styles.daysSelector}>
                      {[2, 3, 4].map((meals) => (
                        <TouchableOpacity
                          key={meals}
                          style={[
                            styles.daysSelectorButton,
                            mealsPerDay === meals && styles.daysSelectorButtonActive,
                          ]}
                          onPress={() => setMealsPerDay(meals)}
                        >
                          <Text
                            style={[
                              styles.daysSelectorText,
                              mealsPerDay === meals && styles.daysSelectorTextActive,
                            ]}
                          >
                            {meals} meals
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Cuisine Preferences */}
                  <View style={styles.autoPlannerOption}>
                    <Text style={styles.autoPlannerOptionLabel}>Preferred cuisines (optional):</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.filterChipsRow}>
                        {CUISINE_FILTERS.slice(0, 8).map((cuisine) => (
                          <TouchableOpacity
                            key={cuisine.id}
                            style={[
                              styles.filterChip,
                              preferredCuisines.includes(cuisine.id) && styles.filterChipSelected,
                            ]}
                            onPress={() => {
                              if (preferredCuisines.includes(cuisine.id)) {
                                setPreferredCuisines(preferredCuisines.filter((c) => c !== cuisine.id));
                              } else {
                                setPreferredCuisines([...preferredCuisines, cuisine.id]);
                              }
                            }}
                          >
                            <Text style={styles.filterChipIcon}>{cuisine.icon}</Text>
                            <Text
                              style={[
                                styles.filterChipText,
                                preferredCuisines.includes(cuisine.id) && styles.filterChipTextSelected,
                              ]}
                            >
                              {cuisine.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>

                  {/* Info Box */}
                  <View style={styles.autoPlannerInfoBox}>
                    <Ionicons name="information-circle" size={20} color={colors.diet} />
                    <Text style={styles.autoPlannerInfoText}>
                      The plan will use your selected ingredients and diet preferences (Vegan, Keto, etc.)
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.plannerActionButtons}>
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={() => setPlannerStep(1)}
                    >
                      <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
                      <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.generatePlanButton}
                      onPress={generateAutomaticMealPlan}
                    >
                      <Ionicons name="sparkles" size={20} color="white" />
                      <Text style={styles.generatePlanButtonText}>
                        Generate Plan
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Render Meal Planner Tab
  const renderMealPlanner = () => (
    <ScrollView style={styles.tabContent}>
      {renderRecipeSearch()}

      <View style={styles.plannerSection}>
        <Text style={styles.sectionTitle}>📅 Weekly Meal Plan</Text>

        {/* Day selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
          {DAYS.map((day) => (
            <TouchableOpacity
              key={day}
              style={[styles.dayChip, selectedDay === day && styles.dayChipActive]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.dayChipText, selectedDay === day && styles.dayChipTextActive]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Meals for selected day */}
        <View style={styles.mealsContainer}>
          {MEAL_TYPES.map((mealType) => {
            const mealsForType = mealPlan.filter(
              (m) => m.day === selectedDay && m.mealType === mealType
            );

            return (
              <View key={mealType} style={styles.mealTypeSection}>
                <View style={styles.mealTypeHeader}>
                  <Text style={styles.mealTypeTitle}>
                    {mealType === 'breakfast' && '🍳'}
                    {mealType === 'lunch' && '🍱'}
                    {mealType === 'dinner' && '🍽️'}
                    {mealType === 'snack' && '🍎'}
                    {' '}
                    {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                  </Text>
                  <TouchableOpacity
                    style={styles.addMealButton}
                    onPress={() => {
                      setSelectedMealType(mealType);
                      // Show recipe search prompt or last search results
                      if (searchResults.length === 0) {
                        Alert.alert('Search Recipes', 'Please search for recipes first');
                      }
                    }}
                  >
                    <Ionicons name="add" size={20} color={colors.diet} />
                  </TouchableOpacity>
                </View>

                {mealsForType.length === 0 ? (
                  <Text style={styles.emptyMealText}>No meal planned</Text>
                ) : (
                  mealsForType.map((meal) => {
                    const caloriesPerPortion = meal.recipe.calories
                      ? Math.round(meal.recipe.calories / (meal.recipe.servings || 1))
                      : 0;

                    return (
                      <TouchableOpacity
                        key={meal.id}
                        style={styles.mealCard}
                        onPress={() => getRecipeDetails(meal.recipeId)}
                        activeOpacity={0.7}
                      >
                        <Image source={{ uri: meal.recipe.image }} style={styles.mealImage} />
                        <View style={styles.mealInfo}>
                          <Text style={styles.mealTitle} numberOfLines={1}>
                            {meal.recipe.title}
                          </Text>
                          <Text style={styles.mealMeta}>
                            {meal.portions} portions • {caloriesPerPortion > 0 ? `${caloriesPerPortion} kcal/portion` : 'N/A'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.removeMealButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            removeMealFromPlan(meal.id);
                          }}
                        >
                          <Ionicons name="trash-outline" size={20} color={colors.error} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );

  // Render Shopping List Tab
  const renderShoppingList = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.shoppingSection}>
        <Text style={styles.sectionTitle}>🛒 Shopping List</Text>
        <Text style={styles.sectionSubtitle}>
          Generated from {mealPlan.length} planned meals
        </Text>

        {shoppingList.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>No items yet</Text>
            <Text style={styles.emptyStateSubtext}>Add meals to your plan to generate a shopping list</Text>
          </View>
        ) : (
          <>
            {/* Group by aisle */}
            {Array.from(new Set(shoppingList.map(item => item.aisle))).map((aisle) => (
              <View key={aisle} style={styles.aisleSection}>
                <Text style={styles.aisleTitle}>{aisle}</Text>
                {shoppingList
                  .filter(item => item.aisle === aisle)
                  .map((item) => (
                    <View key={item.id} style={styles.shoppingItem}>
                      <View style={styles.shoppingItemInfo}>
                        <Text style={styles.shoppingItemName}>{item.name}</Text>
                        <Text style={styles.shoppingItemAmount}>
                          {item.amount.toFixed(1)} {item.unit}
                        </Text>
                      </View>
                      <Text style={styles.shoppingItemCost}>
                        ${(item.estimatedCost / 100).toFixed(2)}
                      </Text>
                    </View>
                  ))}
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );

  // Render Cost Estimates Tab
  const renderCostEstimates = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.costsSection}>
        <Text style={styles.sectionTitle}>💰 Cost Estimates</Text>

        {/* Weekly Summary */}
        <View style={styles.costSummaryCard}>
          <View style={styles.costSummaryRow}>
            <Text style={styles.costSummaryLabel}>Weekly Meal Cost</Text>
            <Text style={styles.costSummaryValue}>${(totalWeeklyCost / 100).toFixed(2)}</Text>
          </View>
          <View style={styles.costSummaryRow}>
            <Text style={styles.costSummaryLabel}>Shopping List Total</Text>
            <Text style={styles.costSummaryValue}>${(shoppingListCost / 100).toFixed(2)}</Text>
          </View>
          <View style={[styles.costSummaryRow, styles.costSummaryRowTotal]}>
            <Text style={styles.costSummaryLabelTotal}>Daily Average</Text>
            <Text style={styles.costSummaryValueTotal}>
              ${(totalWeeklyCost / 100 / 7).toFixed(2)}/day
            </Text>
          </View>
        </View>

        {/* Monthly Projection */}
        <View style={styles.projectionCard}>
          <Text style={styles.projectionTitle}>📊 Monthly Projection</Text>
          <Text style={styles.projectionAmount}>
            ${((totalWeeklyCost / 100) * 4.33).toFixed(2)}/month
          </Text>
          <Text style={styles.projectionNote}>
            Based on your current meal plan
          </Text>
        </View>

        {/* Savings Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Money-Saving Tips</Text>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.tipText}>Batch cook on weekends to save time and money</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.tipText}>Buy ingredients in bulk when on sale</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.tipText}>Plan meals using seasonal produce</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  // Recipe Modal
  const renderRecipeModal = () => {
    if (!selectedRecipe) return null;

    const instructions = selectedRecipe.analyzedInstructions?.[0]?.steps || [];
    const ingredients = selectedRecipe.extendedIngredients || [];

    return (
      <Modal
        visible={showRecipeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRecipeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header Image */}
              <Image source={{ uri: selectedRecipe.image }} style={styles.modalRecipeImage} />

              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setShowRecipeModal(false)}
              >
                <Ionicons name="close-circle" size={32} color="white" />
              </TouchableOpacity>

              <View style={styles.modalContentPadding}>
                {/* Title */}
                <Text style={styles.modalRecipeTitle}>{selectedRecipe.title}</Text>

                {/* Quick Info Row */}
                <View style={styles.modalRecipeInfo}>
                  <View style={styles.modalRecipeInfoItem}>
                    <Ionicons name="time-outline" size={20} color={colors.diet} />
                    <Text style={styles.modalRecipeInfoText}>{selectedRecipe.readyInMinutes} min</Text>
                  </View>
                  <View style={styles.modalRecipeInfoItem}>
                    <Ionicons name="people-outline" size={20} color={colors.diet} />
                    <Text style={styles.modalRecipeInfoText}>{selectedRecipe.servings} servings</Text>
                  </View>
                  {selectedRecipe.calories && selectedRecipe.calories > 0 && (
                    <View style={styles.modalRecipeInfoItem}>
                      <Ionicons name="flame-outline" size={20} color={colors.diet} />
                      <Text style={styles.modalRecipeInfoText}>{selectedRecipe.calories} kcal</Text>
                    </View>
                  )}
                </View>

                {/* Nutrition Info */}
                {selectedRecipe.protein && selectedRecipe.protein > 0 && (
                  <View style={styles.nutritionCard}>
                    <Text style={styles.nutritionCardTitle}>📊 Nutrition (per serving)</Text>
                    <View style={styles.nutritionRow}>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{selectedRecipe.protein}g</Text>
                        <Text style={styles.nutritionLabel}>Protein</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{selectedRecipe.carbs}g</Text>
                        <Text style={styles.nutritionLabel}>Carbs</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{selectedRecipe.fat}g</Text>
                        <Text style={styles.nutritionLabel}>Fat</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{selectedRecipe.calories}</Text>
                        <Text style={styles.nutritionLabel}>Calories</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Ingredients Section */}
                {ingredients.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🥘 Ingredients</Text>
                    {ingredients.map((ingredient, index) => (
                      <View key={index} style={styles.ingredientItem}>
                        <Ionicons name="checkmark-circle-outline" size={20} color={colors.diet} />
                        <Text style={styles.ingredientText}>{ingredient.original}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Instructions Section */}
                {instructions.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>👨‍🍳 Instructions</Text>
                    {instructions.map((step) => (
                      <View key={step.number} style={styles.instructionStep}>
                        <View style={styles.stepNumber}>
                          <Text style={styles.stepNumberText}>{step.number}</Text>
                        </View>
                        <Text style={styles.stepText}>{step.step}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Summary */}
                {selectedRecipe.summary && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ℹ️ About This Recipe</Text>
                    <Text style={styles.summaryText}>
                      {selectedRecipe.summary?.replace(/<[^>]*>/g, '')}
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => setShowRecipeModal(false)}
                  >
                    <Text style={styles.modalButtonTextCancel}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonConfirm]}
                    onPress={() => {
                      setShowRecipeModal(false);
                      setShowPortionModal(true);
                    }}
                  >
                    <Ionicons name="add-circle" size={20} color="white" />
                    <Text style={styles.modalButtonText}>Add to Plan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Portion Selection Modal
  const renderPortionModal = () => (
    <Modal
      visible={showPortionModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowPortionModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.portionModalContent}>
          <Text style={styles.portionModalTitle}>How many portions?</Text>
          <Text style={styles.portionModalSubtitle}>
            Perfect for batch cooking on weekends
          </Text>

          <View style={styles.portionSelector}>
            <TouchableOpacity
              style={styles.portionButton}
              onPress={() => setPortionCount(Math.max(1, portionCount - 1))}
            >
              <Ionicons name="remove" size={24} color={colors.primary} />
            </TouchableOpacity>

            <Text style={styles.portionCount}>{portionCount}</Text>

            <TouchableOpacity
              style={styles.portionButton}
              onPress={() => setPortionCount(Math.min(20, portionCount + 1))}
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.portionCost}>
            Total cost: ${selectedRecipe ? ((selectedRecipe.pricePerServing * portionCount) / 100).toFixed(2) : '0.00'}
          </Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => setShowPortionModal(false)}
            >
              <Text style={styles.modalButtonTextCancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonConfirm]}
              onPress={addMealToPlan}
            >
              <Text style={styles.modalButtonText}>Add Meal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🍽️ Diet Dashboard</Text>
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
            color={activeTab === 'planner' ? colors.diet : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'planner' && styles.tabTextActive,
            ]}
          >
            Meal Planner
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
            Shopping List
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'costs' && styles.tabActive]}
          onPress={() => setActiveTab('costs')}
        >
          <Ionicons
            name="cash"
            size={20}
            color={activeTab === 'costs' ? colors.diet : colors.textSecondary}
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
      {renderAutoMealPlannerModal()}
      {renderPromoModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerRight: {
    width: 40,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingHorizontal: spacing.md,
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
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.diet,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  searchSection: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  // New tabbed interface styles
  modeTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 4,
    margin: spacing.lg,
    marginBottom: spacing.md,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  modeTabTextActive: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.diet,
  },
  tabContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  compactFilterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tabContentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  compactFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.diet + '10',
    borderRadius: 8,
  },
  compactFilterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.diet,
  },
  compactFilterBadge: {
    backgroundColor: colors.diet,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  compactFilterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
  // AI Planner Card Styles
  aiPlannerCard: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  aiPlannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  aiPlannerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.diet,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.diet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  aiPlannerTextContainer: {
    flex: 1,
  },
  aiPlannerCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  aiPlannerCardDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  aiPlannerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: spacing.md,
  },
  aiPlannerStat: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  aiPlannerStatText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  aiGenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.diet,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    shadowColor: colors.diet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  aiGenerateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  aiPlannerInfo: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  aiGenerateButtonDisabled: {
    opacity: 0.5,
  },
  // AI Ingredient Selection Styles
  aiIngredientSection: {
    marginBottom: spacing.lg,
  },
  aiIngredientTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  aiIngredientScroll: {
    paddingRight: spacing.lg,
    gap: spacing.sm,
  },
  aiIngredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    marginRight: spacing.sm,
  },
  aiIngredientChipSelected: {
    backgroundColor: colors.diet + '15',
    borderColor: colors.diet,
  },
  aiIngredientChipDisabled: {
    opacity: 0.4,
  },
  aiIngredientIcon: {
    fontSize: 18,
  },
  aiIngredientLabel: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  aiIngredientLabelSelected: {
    color: colors.diet,
    fontWeight: '700',
  },
  aiIngredientCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
    fontWeight: '600',
  },
  // Promo Modal Styles
  promoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  promoModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  promoHeader: {
    backgroundColor: colors.diet,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoIconBig: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoContent: {
    padding: spacing.xl,
  },
  promoTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  promoDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  promoFeatures: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  promoFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  promoFeatureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.diet + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoFeatureText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  promoButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.diet,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    shadowColor: colors.diet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  promoButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  promoButtonSecondary: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  promoButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: colors.diet,
    borderRadius: 12,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginVertical: spacing.xl,
  },
  recipeScroll: {
    marginTop: spacing.sm,
  },
  recipeCard: {
    width: 220,
    marginRight: spacing.md,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  recipeImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#E5E5E5',
  },
  recipeTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    padding: spacing.sm,
    minHeight: 40,
  },
  recipeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  recipeInfoText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  plannerSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  daySelector: {
    marginBottom: spacing.lg,
  },
  dayChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: spacing.sm,
  },
  dayChipActive: {
    backgroundColor: colors.diet,
  },
  dayChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  dayChipTextActive: {
    color: 'white',
  },
  mealsContainer: {
    gap: spacing.lg,
  },
  mealTypeSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mealTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  mealTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  addMealButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.diet + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyMealText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  mealImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#E5E5E5',
    marginRight: spacing.sm,
  },
  mealInfo: {
    flex: 1,
  },
  mealTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  mealMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  removeMealButton: {
    padding: spacing.sm,
  },
  shoppingSection: {
    padding: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    maxWidth: 250,
  },
  aisleSection: {
    marginBottom: spacing.lg,
  },
  aisleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  shoppingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  shoppingItemInfo: {
    flex: 1,
  },
  shoppingItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  shoppingItemAmount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  shoppingItemCost: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.diet,
  },
  costsSection: {
    padding: spacing.lg,
  },
  costSummaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  costSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  costSummaryRowTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  costSummaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  costSummaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  costSummaryLabelTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  costSummaryValueTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.diet,
  },
  projectionCard: {
    backgroundColor: colors.diet,
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  projectionTitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: spacing.sm,
  },
  projectionAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
    marginBottom: spacing.xs,
  },
  projectionNote: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  tipsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: spacing.lg,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalRecipeImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E5E5',
  },
  modalRecipeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  modalRecipeInfo: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.lg,
  },
  modalRecipeInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  modalRecipeInfoText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  modalRecipeSummary: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  modalButtonCancel: {
    backgroundColor: '#F5F5F5',
  },
  modalButtonConfirm: {
    backgroundColor: colors.diet,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  modalButtonTextCancel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  closeModalButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
  },
  modalContentPadding: {
    padding: spacing.lg,
  },
  nutritionCard: {
    backgroundColor: colors.diet + '10',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  nutritionCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.diet,
  },
  nutritionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: spacing.lg,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  ingredientText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  instructionStep: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.diet,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  summaryText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  portionModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '85%',
    padding: spacing.xl,
  },
  portionModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  portionModalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  portionSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  portionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.diet + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portionCount: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.diet,
    minWidth: 80,
    textAlign: 'center',
  },
  portionCost: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  // Filter styles
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  filterToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.diet + '10',
    borderRadius: 8,
  },
  filterToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.diet,
  },
  filterBadge: {
    backgroundColor: colors.diet,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
  filtersContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  filterGroup: {
    gap: spacing.xs,
  },
  filterGroupTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  filterChipSelected: {
    backgroundColor: colors.diet + '20',
    borderColor: colors.diet,
  },
  filterChipIcon: {
    fontSize: 14,
  },
  filterChipText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: colors.diet,
    fontWeight: '600',
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  clearFiltersText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.error,
  },
  // New filter styles - Redesigned
  activeFiltersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  activeFiltersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.diet + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  activeFiltersCount: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.diet,
  },
  filterGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterCountBadge: {
    backgroundColor: colors.diet,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChipNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    minWidth: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipIconLarge: {
    fontSize: 16,
  },
  filterChipTextNew: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  checkIcon: {
    marginLeft: spacing.xs,
  },
  cuisineScrollContent: {
    paddingRight: spacing.lg,
    gap: spacing.sm,
  },
  cuisineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginRight: spacing.sm,
  },
  cuisineChipSelected: {
    backgroundColor: colors.diet + '15',
    borderColor: colors.diet,
    borderWidth: 2,
  },
  cuisineIcon: {
    fontSize: 18,
  },
  cuisineLabel: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  cuisineLabelSelected: {
    color: colors.diet,
    fontWeight: '700',
  },
  // Ingredient selection styles
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ingredientSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  ingredientScroll: {
    marginBottom: spacing.md,
  },
  ingredientsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  ingredientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  ingredientChipSelected: {
    backgroundColor: colors.diet + '15',
    borderColor: colors.diet,
  },
  ingredientIcon: {
    fontSize: 18,
  },
  ingredientLabel: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  ingredientLabelSelected: {
    color: colors.diet,
    fontWeight: '600',
  },
  searchByIngredientsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.diet,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  searchByIngredientsText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  textSearchToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  textSearchToggleText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  resultsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  caloriesBadge: {
    backgroundColor: colors.diet + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  caloriesText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.diet,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  macroText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  // Auto Meal Planner styles
  autoPlannerSection: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  autoPlannerButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: colors.diet + '30',
  },
  autoPlannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  autoPlannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.diet,
    justifyContent: 'center',
    alignItems: 'center',
  },
  autoPlannerTextContainer: {
    flex: 1,
  },
  autoPlannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  autoPlannerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  autoPlannerModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '85%',
    padding: spacing.xl,
  },
  autoPlannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  autoPlannerModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  autoPlannerDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  autoPlannerOption: {
    marginBottom: spacing.lg,
  },
  autoPlannerOptionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  daysSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  daysSelectorButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  daysSelectorButtonActive: {
    backgroundColor: colors.diet + '15',
    borderColor: colors.diet,
  },
  daysSelectorText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  daysSelectorTextActive: {
    color: colors.diet,
  },
  autoPlannerInfoBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.diet + '10',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  autoPlannerInfoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  generatePlanButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.diet,
    paddingVertical: spacing.md,
    borderRadius: 12,
    shadowColor: colors.diet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  generatePlanButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  // Multi-step planner styles
  plannerIntroSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  plannerIntroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.diet + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  plannerIntroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  plannerIntroDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  preferenceCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  preferenceTextContainer: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.diet,
    paddingVertical: spacing.md,
    borderRadius: 12,
    shadowColor: colors.diet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  plannerActionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  // Simplified Filters Styles
  simpleFiltersContainer: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  filterRow: {
    gap: spacing.sm,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  filterOptions: {
    flexGrow: 0,
  },
  simpleFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
  },
  simpleFilterChipActive: {
    backgroundColor: colors.diet + '15',
    borderColor: colors.diet,
    borderWidth: 2,
  },
  simpleFilterIcon: {
    fontSize: 16,
  },
  simpleFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  simpleFilterTextActive: {
    color: colors.diet,
    fontWeight: '700',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.error + '30',
    alignSelf: 'center',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  ingredientSection: {
    marginBottom: spacing.md,
  },
});
