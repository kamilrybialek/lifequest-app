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

// Spoonacular API configuration
const SPOONACULAR_API_KEY = '8b6cd47792ff4057ad699f9b0523d9df';
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

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
  { id: 'mediterranean', label: 'Mediterranean', icon: '🫒' },
  { id: 'middle eastern', label: 'Middle Eastern', icon: '🧆' },
  { id: 'vietnamese', label: 'Vietnamese', icon: '🍜' },
  { id: 'caribbean', label: 'Caribbean', icon: '🏝️' },
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
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Ingredient search state
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [showTextSearch, setShowTextSearch] = useState(false);

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
    setSelectedType('');
    setSelectedCuisine('');
  };

  // Toggle ingredient selection
  const toggleIngredient = (ingredientId: string) => {
    if (selectedIngredients.includes(ingredientId)) {
      setSelectedIngredients(selectedIngredients.filter(id => id !== ingredientId));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredientId]);
    }
  };

  // Search by ingredients
  const searchByIngredients = async () => {
    if (selectedIngredients.length === 0) {
      Alert.alert('No Ingredients', 'Please select at least one ingredient');
      return;
    }

    setLoading(true);
    try {
      const ingredientNames = selectedIngredients
        .map((id) => COMMON_INGREDIENTS.find((i) => i.id === id)?.name)
        .filter(Boolean)
        .join(',');

      let url = `${SPOONACULAR_BASE_URL}/recipes/findByIngredients?apiKey=${SPOONACULAR_API_KEY}&ingredients=${encodeURIComponent(
        ingredientNames
      )}&number=20&ranking=1&ignorePantry=true`;

      // Add diet filters if selected
      if (selectedDietFilters.length > 0) {
        url += `&diet=${selectedDietFilters.join(',')}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }

      const data = await response.json();

      // Transform the response to match our Recipe interface
      const recipes = data.map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: 0, // Not provided by findByIngredients endpoint
        servings: 0, // Not provided by findByIngredients endpoint
        pricePerServing: 0, // Not provided by findByIngredients endpoint
        cuisines: [],
        diets: [],
        summary: '',
      }));

      setSearchResults(recipes);
    } catch (error) {
      console.error('Error searching recipes by ingredients:', error);
      Alert.alert('Error', 'Failed to search recipes');
    } finally {
      setLoading(false);
    }
  };

  // Search recipes via Spoonacular API with filters (text search)
  const searchRecipes = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Build query parameters
      let url = `${SPOONACULAR_BASE_URL}/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(
        query
      )}&number=20&addRecipeInformation=true&fillIngredients=true`;

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

      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error searching recipes:', error);
      Alert.alert('Error', 'Failed to search recipes. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  // Get recipe details
  const getRecipeDetails = async (recipeId: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${SPOONACULAR_BASE_URL}/recipes/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recipe details');
      }

      const recipe = await response.json();
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

    // Regenerate shopping list
    generateShoppingList([...mealPlan, newMeal]);
  };

  // Generate shopping list from meal plan
  const generateShoppingList = async (meals: MealPlanItem[]) => {
    // Group ingredients by name
    const ingredientMap = new Map<string, ShoppingListItem>();

    for (const meal of meals) {
      try {
        const response = await fetch(
          `${SPOONACULAR_BASE_URL}/recipes/${meal.recipeId}/ingredientWidget.json?apiKey=${SPOONACULAR_API_KEY}`
        );

        if (response.ok) {
          const data = await response.json();

          data.ingredients?.forEach((ingredient: any) => {
            const key = ingredient.name.toLowerCase();
            const amountForPortions = (ingredient.amount.metric.value / meal.recipe.servings) * meal.portions;

            if (ingredientMap.has(key)) {
              const existing = ingredientMap.get(key)!;
              existing.amount += amountForPortions;
              existing.estimatedCost += (ingredient.estimatedCost?.value || 0) * meal.portions;
            } else {
              ingredientMap.set(key, {
                id: `ingredient-${key}`,
                name: ingredient.name,
                amount: amountForPortions,
                unit: ingredient.amount.metric.unit,
                aisle: ingredient.aisle || 'Other',
                estimatedCost: (ingredient.estimatedCost?.value || 0) * meal.portions,
              });
            }
          });
        }
      } catch (error) {
        console.error('Error fetching ingredients:', error);
      }
    }

    setShoppingList(Array.from(ingredientMap.values()));
  };

  // Remove meal from plan
  const removeMealFromPlan = (mealId: string) => {
    const updatedPlan = mealPlan.filter(meal => meal.id !== mealId);
    setMealPlan(updatedPlan);
    generateShoppingList(updatedPlan);
  };

  // Render Recipe Search
  const renderRecipeSearch = () => (
    <View style={styles.searchSection}>
      <View style={styles.searchHeader}>
        <Text style={styles.searchTitle}>🥘 What's in your fridge?</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.filterToggleButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons
              name={showFilters ? "chevron-up" : "filter"}
              size={20}
              color={colors.diet}
            />
            <Text style={styles.filterToggleText}>
              {showFilters ? 'Hide' : 'Filters'}
            </Text>
            {(selectedDietFilters.length > 0 || selectedType || selectedCuisine) && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {selectedDietFilters.length + (selectedType ? 1 : 0) + (selectedCuisine ? 1 : 0)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters Section */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {/* Diet Filters */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupTitle}>Diet Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChipsRow}>
                {DIET_FILTERS.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterChip,
                      selectedDietFilters.includes(filter.id) && {
                        backgroundColor: filter.color + '20',
                        borderColor: filter.color,
                      },
                    ]}
                    onPress={() => toggleDietFilter(filter.id)}
                  >
                    <Text style={styles.filterChipIcon}>{filter.icon}</Text>
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedDietFilters.includes(filter.id) && { color: filter.color, fontWeight: '600' },
                      ]}
                    >
                      {filter.label}
                    </Text>
                    {selectedDietFilters.includes(filter.id) && (
                      <Ionicons name="checkmark-circle" size={16} color={filter.color} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Clear Filters Button */}
          {selectedDietFilters.length > 0 && (
            <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
              <Ionicons name="close-circle" size={18} color={colors.error} />
              <Text style={styles.clearFiltersText}>Clear Diet Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Ingredient Selection - PRIMARY METHOD */}
      <Text style={styles.ingredientSectionTitle}>Select ingredients you have:</Text>
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
                {recipe.readyInMinutes > 0 && (
                  <View style={styles.recipeInfo}>
                    <Text style={styles.recipeInfoText}>⏱ {recipe.readyInMinutes}m</Text>
                    <Text style={styles.recipeInfoText}>
                      💰 ${((recipe.pricePerServing || 0) / 100).toFixed(2)}/serving
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );

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
                  mealsForType.map((meal) => (
                    <View key={meal.id} style={styles.mealCard}>
                      <Image source={{ uri: meal.recipe.image }} style={styles.mealImage} />
                      <View style={styles.mealInfo}>
                        <Text style={styles.mealTitle} numberOfLines={1}>
                          {meal.recipe.title}
                        </Text>
                        <Text style={styles.mealMeta}>
                          {meal.portions} portions • ${((meal.recipe.pricePerServing * meal.portions) / 100).toFixed(2)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeMealButton}
                        onPress={() => removeMealFromPlan(meal.id)}
                      >
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))
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
  const renderRecipeModal = () => (
    <Modal
      visible={showRecipeModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowRecipeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            {selectedRecipe && (
              <>
                <Image source={{ uri: selectedRecipe.image }} style={styles.modalRecipeImage} />
                <Text style={styles.modalRecipeTitle}>{selectedRecipe.title}</Text>

                <View style={styles.modalRecipeInfo}>
                  <View style={styles.modalRecipeInfoItem}>
                    <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                    <Text style={styles.modalRecipeInfoText}>{selectedRecipe.readyInMinutes} min</Text>
                  </View>
                  <View style={styles.modalRecipeInfoItem}>
                    <Ionicons name="people-outline" size={20} color={colors.textSecondary} />
                    <Text style={styles.modalRecipeInfoText}>{selectedRecipe.servings} servings</Text>
                  </View>
                  <View style={styles.modalRecipeInfoItem}>
                    <Ionicons name="cash-outline" size={20} color={colors.textSecondary} />
                    <Text style={styles.modalRecipeInfoText}>
                      ${((selectedRecipe.pricePerServing || 0) / 100).toFixed(2)}/serving
                    </Text>
                  </View>
                </View>

                <Text style={styles.modalRecipeSummary}>
                  {selectedRecipe.summary?.replace(/<[^>]*>/g, '')}
                </Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonCancel]}
                    onPress={() => setShowRecipeModal(false)}
                  >
                    <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonConfirm]}
                    onPress={() => {
                      setShowRecipeModal(false);
                      setShowPortionModal(true);
                    }}
                  >
                    <Text style={styles.modalButtonText}>Add to Plan</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

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
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
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
    width: 160,
    marginRight: spacing.md,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeImage: {
    width: '100%',
    height: 120,
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
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
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
});
