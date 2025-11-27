import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { collection, addDoc, getDocs, query, limit, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const SPOONACULAR_API_KEY = '8b6cd47792ff4057ad699f9b0523d9df';
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

interface Recipe {
  id: number | string;
  spoonacularId?: number;
  title: string;
  titlePL?: string; // Polish translation
  image?: string;
  imageType?: string;
  readyInMinutes?: number;
  servings?: number;
  pricePerServing?: number;
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
  veryHealthy?: boolean;
  cheap?: boolean;
  veryPopular?: boolean;
  sustainable?: boolean;
  cuisines?: string[];
  dishTypes?: string[];
  diets?: string[];
  instructions?: string;
  summary?: string;
  sourceUrl?: string;
  extendedIngredients?: any[];
  nutrition?: any;
  translations?: any;
  createdAt?: string;
}

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
  { id: 'asian', label: 'Asian', icon: '🍜' },
  { id: 'american', label: 'American', icon: '🇺🇸' },
  { id: 'mediterranean', label: 'Mediterranean', icon: '🫒' },
  { id: 'indian', label: 'Indian', icon: '🇮🇳' },
];

// Predefined queries for bulk import
const BULK_IMPORT_PRESETS = [
  { id: 'healthy-breakfast', label: 'Healthy Breakfasts', query: 'breakfast', diet: 'vegetarian', type: 'breakfast', number: 30 },
  { id: 'quick-dinners', label: 'Quick Dinners (<30min)', query: 'dinner', maxReadyTime: 30, type: 'main course', number: 50 },
  { id: 'cheap-meals', label: 'Budget Meals', query: 'meal', sort: 'price', maxPrice: 2, number: 40 },
  { id: 'vegan-recipes', label: 'Vegan Collection', query: 'vegan', diet: 'vegan', number: 50 },
  { id: 'keto-favorites', label: 'Keto Favorites', query: 'keto', diet: 'ketogenic', number: 30 },
  { id: 'italian-classics', label: 'Italian Classics', query: 'italian', cuisine: 'italian', number: 40 },
  { id: 'healthy-salads', label: 'Healthy Salads', query: 'salad', type: 'salad', number: 25 },
  { id: 'desserts', label: 'Sweet Desserts', query: 'dessert', type: 'dessert', number: 30 },
];

export const AdminRecipes = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'api' | 'database'>('api');

  // API Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [apiRecipes, setApiRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [maxReadyTime, setMaxReadyTime] = useState<string>('');

  // Database state
  const [dbRecipes, setDbRecipes] = useState<Recipe[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);

  // Modal state
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState<Recipe | null>(null);
  const [translationPL, setTranslationPL] = useState({ title: '', instructions: '' });
  const [saving, setSaving] = useState(false);

  // Bulk import state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

  // Load database recipes on mount
  useEffect(() => {
    if (activeTab === 'database') {
      loadDatabaseRecipes();
    }
  }, [activeTab]);

  // Load recipes from Firebase
  const loadDatabaseRecipes = async () => {
    setLoadingDb(true);
    try {
      console.log('📚 Loading recipes from Firebase...');
      const recipesQuery = query(collection(db, 'recipes'), limit(100));
      const snapshot = await getDocs(recipesQuery);

      const loadedRecipes: Recipe[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedRecipes.push({
          id: doc.id,
          ...data,
        } as Recipe);
      });

      setDbRecipes(loadedRecipes);
      console.log(`✅ Loaded ${loadedRecipes.length} recipes from database`);
    } catch (error) {
      console.error('❌ Error loading database recipes:', error);
      Alert.alert('Error', 'Failed to load recipes from database');
    } finally {
      setLoadingDb(false);
    }
  };

  // Search recipes from Spoonacular API
  const searchRecipes = async (customQuery?: string, customFilters?: any) => {
    const query = customQuery || searchQuery;
    if (!query.trim()) {
      Alert.alert('Enter Search Query', 'Please enter a recipe name or ingredient');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Searching recipes:', query);

      // Build query parameters
      let url = `${SPOONACULAR_BASE_URL}/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(
        query
      )}&number=${customFilters?.number || 20}&addRecipeInformation=true&fillIngredients=true&addRecipeNutrition=true`;

      // Add filters
      const filters = customFilters || {
        diet: selectedFilters,
        type: selectedType,
        cuisine: selectedCuisine,
        maxPrice,
        maxReadyTime,
      };

      if (filters.diet && filters.diet.length > 0) {
        const dietStr = Array.isArray(filters.diet) ? filters.diet.join(',') : filters.diet;
        url += `&diet=${dietStr}`;
      }
      if (filters.type) url += `&type=${filters.type}`;
      if (filters.cuisine) url += `&cuisine=${filters.cuisine}`;
      if (filters.maxPrice) url += `&maxPrice=${filters.maxPrice}`;
      if (filters.maxReadyTime) url += `&maxReadyTime=${filters.maxReadyTime}`;
      if (filters.sort) url += `&sort=${filters.sort}`;

      console.log('📡 API URL:', url);

      const response = await fetch(url);
      const data = await response.json();

      if (data.results) {
        setApiRecipes(data.results);
        console.log(`✅ Found ${data.results.length} recipes`);
        return data.results;
      } else {
        console.error('❌ No results in response:', data);
        Alert.alert('No Results', 'No recipes found. Try different filters.');
        return [];
      }
    } catch (error) {
      console.error('❌ Error searching recipes:', error);
      Alert.alert('Error', 'Failed to search recipes. Check console for details.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Bulk import recipes
  const bulkImportRecipes = async (preset: any) => {
    setBulkImporting(true);
    setBulkProgress({ current: 0, total: preset.number });

    try {
      console.log(`🚀 Starting bulk import: ${preset.label}`);

      // Search recipes with preset
      const recipes = await searchRecipes(preset.query, {
        diet: preset.diet,
        type: preset.type,
        cuisine: preset.cuisine,
        maxPrice: preset.maxPrice,
        maxReadyTime: preset.maxReadyTime,
        sort: preset.sort,
        number: preset.number,
      });

      if (!recipes || recipes.length === 0) {
        Alert.alert('No Recipes', 'No recipes found with these filters');
        return;
      }

      let savedCount = 0;
      for (let i = 0; i < recipes.length; i++) {
        try {
          const recipe = recipes[i];

          // Get full recipe details
          const response = await fetch(
            `${SPOONACULAR_BASE_URL}/recipes/${recipe.id}/information?apiKey=${SPOONACULAR_API_KEY}&includeNutrition=true`
          );
          const fullRecipe = await response.json();

          // Prepare recipe data
          const recipeData = {
            spoonacularId: fullRecipe.id,
            title: fullRecipe.title,
            image: fullRecipe.image,
            readyInMinutes: fullRecipe.readyInMinutes,
            servings: fullRecipe.servings,
            pricePerServing: fullRecipe.pricePerServing,
            vegetarian: fullRecipe.vegetarian || false,
            vegan: fullRecipe.vegan || false,
            glutenFree: fullRecipe.glutenFree || false,
            dairyFree: fullRecipe.dairyFree || false,
            cheap: fullRecipe.cheap || false,
            veryHealthy: fullRecipe.veryHealthy || false,
            cuisines: fullRecipe.cuisines || [],
            dishTypes: fullRecipe.dishTypes || [],
            diets: fullRecipe.diets || [],
            instructions: fullRecipe.instructions || '',
            extendedIngredients: fullRecipe.extendedIngredients || [],
            nutrition: fullRecipe.nutrition || {},
            translations: {
              pl: {
                title: fullRecipe.title, // Will need translation later
                instructions: '',
              },
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            addedBy: 'admin',
            published: true,
            bulkImportSource: preset.id,
          };

          await addDoc(collection(db, 'recipes'), recipeData);
          savedCount++;
          setBulkProgress({ current: i + 1, total: recipes.length });

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error saving recipe ${i}:`, error);
        }
      }

      Alert.alert(
        '✅ Bulk Import Complete!',
        `Successfully imported ${savedCount} recipes out of ${recipes.length} found.\n\nPreset: ${preset.label}`,
        [{ text: 'OK', onPress: () => setShowBulkModal(false) }]
      );

      // Reload database recipes
      await loadDatabaseRecipes();
    } catch (error) {
      console.error('❌ Bulk import error:', error);
      Alert.alert('Error', 'Bulk import failed. Check console for details.');
    } finally {
      setBulkImporting(false);
      setBulkProgress({ current: 0, total: 0 });
    }
  };

  // Get detailed recipe information
  const getRecipeDetails = async (recipeId: number) => {
    try {
      console.log('📋 Fetching recipe details for ID:', recipeId);
      const response = await fetch(
        `${SPOONACULAR_BASE_URL}/recipes/${recipeId}/information?apiKey=${SPOONACULAR_API_KEY}&includeNutrition=true`
      );
      const data = await response.json();
      console.log('✅ Recipe details loaded');
      return data;
    } catch (error) {
      console.error('❌ Error fetching recipe details:', error);
      throw error;
    }
  };

  // Open edit modal
  const handleEditRecipe = async (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setLoading(true);
    try {
      if (recipe.spoonacularId && activeTab === 'api') {
        // Fetch full recipe details from API
        const fullRecipe = await getRecipeDetails(recipe.spoonacularId as number);
        setEditedRecipe(fullRecipe);
        setTranslationPL({ title: '', instructions: '' });
      } else {
        // Use existing data from database
        setEditedRecipe(recipe);
        setTranslationPL({
          title: recipe.translations?.pl?.title || '',
          instructions: recipe.translations?.pl?.instructions || '',
        });
      }
      setShowEditModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to load recipe details');
    } finally {
      setLoading(false);
    }
  };

  // Save recipe to Firebase
  const saveRecipeToFirebase = async () => {
    if (!editedRecipe) return;

    setSaving(true);
    try {
      console.log('💾 Saving recipe to Firebase:', editedRecipe.title);

      const recipeData = {
        spoonacularId: (editedRecipe as any).id || editedRecipe.spoonacularId,
        title: editedRecipe.title,
        image: editedRecipe.image,
        readyInMinutes: editedRecipe.readyInMinutes,
        servings: editedRecipe.servings,
        pricePerServing: editedRecipe.pricePerServing,
        vegetarian: editedRecipe.vegetarian || false,
        vegan: editedRecipe.vegan || false,
        glutenFree: editedRecipe.glutenFree || false,
        dairyFree: editedRecipe.dairyFree || false,
        cheap: editedRecipe.cheap || false,
        veryHealthy: editedRecipe.veryHealthy || false,
        cuisines: editedRecipe.cuisines || [],
        dishTypes: editedRecipe.dishTypes || [],
        diets: editedRecipe.diets || [],
        instructions: editedRecipe.instructions || '',
        extendedIngredients: editedRecipe.extendedIngredients || [],
        nutrition: editedRecipe.nutrition || {},
        translations: {
          pl: {
            title: translationPL.title || editedRecipe.title,
            instructions: translationPL.instructions || '',
          },
        },
        createdAt: editedRecipe.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        addedBy: 'admin',
        published: true,
      };

      const docRef = await addDoc(collection(db, 'recipes'), recipeData);
      console.log('✅ Recipe saved with ID:', docRef.id);

      Alert.alert(
        '✅ Success',
        `Recipe "${editedRecipe.title}" saved to database!`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowEditModal(false);
              setEditedRecipe(null);
              if (activeTab === 'database') {
                loadDatabaseRecipes();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error saving recipe:', error);
      Alert.alert('Error', 'Failed to save recipe to Firebase.');
    } finally {
      setSaving(false);
    }
  };

  // Save currently selected recipe to Firebase (simpler version for new modal)
  const handleSaveRecipe = async () => {
    if (!selectedRecipe) return;

    setSaving(true);
    try {
      console.log('💾 Saving recipe to Firebase:', selectedRecipe.title);

      const recipeData = {
        spoonacularId: (selectedRecipe as any).id || selectedRecipe.spoonacularId,
        title: selectedRecipe.title,
        image: selectedRecipe.image,
        readyInMinutes: selectedRecipe.readyInMinutes,
        servings: selectedRecipe.servings,
        pricePerServing: selectedRecipe.pricePerServing,
        vegetarian: selectedRecipe.vegetarian || false,
        vegan: selectedRecipe.vegan || false,
        glutenFree: selectedRecipe.glutenFree || false,
        dairyFree: selectedRecipe.dairyFree || false,
        cheap: selectedRecipe.cheap || false,
        veryHealthy: selectedRecipe.veryHealthy || false,
        cuisines: selectedRecipe.cuisines || [],
        dishTypes: selectedRecipe.dishTypes || [],
        diets: selectedRecipe.diets || [],
        instructions: selectedRecipe.instructions || '',
        summary: selectedRecipe.summary || '',
        sourceUrl: selectedRecipe.sourceUrl || '',
        extendedIngredients: selectedRecipe.extendedIngredients || [],
        nutrition: selectedRecipe.nutrition || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        addedBy: 'admin',
        published: true,
      };

      const docRef = await addDoc(collection(db, 'recipes'), recipeData);
      console.log('✅ Recipe saved with ID:', docRef.id);

      Alert.alert(
        '✅ Success',
        `Recipe "${selectedRecipe.title}" saved to database!`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedRecipe(null);
              if (activeTab === 'database') {
                loadDatabaseRecipes();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error saving recipe:', error);
      Alert.alert('Error', 'Failed to save recipe to Firebase.');
    } finally {
      setSaving(false);
    }
  };

  // Delete recipe from database
  const deleteRecipe = async (recipeId: string) => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'recipes', recipeId));
              Alert.alert('✅ Deleted', 'Recipe removed from database');
              await loadDatabaseRecipes();
            } catch (error) {
              console.error('❌ Error deleting recipe:', error);
              Alert.alert('Error', 'Failed to delete recipe');
            }
          },
        },
      ]
    );
  };

  // Toggle filter
  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]
    );
  };

  // Render recipe card
  const renderRecipeCard = (recipe: Recipe, isFromDb: boolean = false) => (
    <TouchableOpacity
      key={recipe.id}
      style={styles.recipeCard}
      onPress={() => handleEditRecipe(recipe)}
    >
      {recipe.image && (
        <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
      )}
      <View style={styles.recipeContent}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {recipe.title}
        </Text>
        <View style={styles.recipeMeta}>
          {recipe.readyInMinutes && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{recipe.readyInMinutes} min</Text>
            </View>
          )}
          {recipe.pricePerServing && (
            <View style={styles.metaItem}>
              <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>
                ${(recipe.pricePerServing / 100).toFixed(2)}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.recipeTags}>
          {recipe.vegetarian && (
            <View style={[styles.tag, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.tagText, { color: colors.success }]}>🥬 Veg</Text>
            </View>
          )}
          {recipe.cheap && (
            <View style={[styles.tag, { backgroundColor: colors.warning + '20' }]}>
              <Text style={[styles.tagText, { color: colors.warning }]}>💰 Cheap</Text>
            </View>
          )}
          {recipe.veryHealthy && (
            <View style={[styles.tag, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>💚 Healthy</Text>
            </View>
          )}
        </View>
        {isFromDb && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteRecipe(recipe.id as string)}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Recipe Management</Text>
          <Text style={styles.headerSubtitle}>
            {activeTab === 'api' ? 'Search & import from Spoonacular' : `${dbRecipes.length} recipes in database`}
          </Text>
        </View>
        {activeTab === 'api' && (
          <TouchableOpacity
            style={styles.bulkImportButton}
            onPress={() => setShowBulkModal(true)}
          >
            <Ionicons name="download" size={20} color="#FFF" />
            <Text style={styles.bulkImportButtonText}>Bulk Import</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'api' && styles.tabActive]}
          onPress={() => setActiveTab('api')}
        >
          <Ionicons
            name="search"
            size={20}
            color={activeTab === 'api' ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'api' && styles.tabTextActive]}>
            Search API
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'database' && styles.tabActive]}
          onPress={() => setActiveTab('database')}
        >
          <Ionicons
            name="server"
            size={20}
            color={activeTab === 'database' ? colors.primary : colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'database' && styles.tabTextActive]}>
            Database ({dbRecipes.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* API Search Tab */}
      {activeTab === 'api' && (
        <>
          {/* Search Section */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search recipes (e.g., pasta, chicken, salad)..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => searchRecipes()}
              />
              <TouchableOpacity style={styles.searchButton} onPress={() => searchRecipes()}>
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
            </View>

            {/* Diet Filters */}
            <View style={styles.filtersSection}>
              <Text style={styles.filtersTitle}>Diet Filters</Text>
              <View style={styles.filtersContainer}>
                {DIET_FILTERS.map((filter) => (
                  <TouchableOpacity
                    key={filter.id}
                    style={[
                      styles.filterChip,
                      selectedFilters.includes(filter.id) && {
                        backgroundColor: filter.color,
                        borderColor: filter.color,
                      },
                    ]}
                    onPress={() => toggleFilter(filter.id)}
                  >
                    <Text style={styles.filterEmoji}>{filter.icon}</Text>
                    <Text
                      style={[
                        styles.filterText,
                        selectedFilters.includes(filter.id) && { color: '#FFF', fontWeight: '700' },
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Meal Type Filters */}
            <View style={styles.filtersSection}>
              <Text style={styles.filtersTitle}>Meal Type</Text>
              <View style={styles.filtersContainer}>
                {TYPE_FILTERS.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.filterChip,
                      selectedType === type.id && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => setSelectedType(selectedType === type.id ? '' : type.id)}
                  >
                    <Text style={styles.filterEmoji}>{type.icon}</Text>
                    <Text
                      style={[
                        styles.filterText,
                        selectedType === type.id && { color: '#FFF', fontWeight: '700' },
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Cuisine Filters */}
            <View style={styles.filtersSection}>
              <Text style={styles.filtersTitle}>Cuisine</Text>
              <View style={styles.filtersContainer}>
                {CUISINE_FILTERS.map((cuisine) => (
                  <TouchableOpacity
                    key={cuisine.id}
                    style={[
                      styles.filterChip,
                      selectedCuisine === cuisine.id && {
                        backgroundColor: colors.mental,
                        borderColor: colors.mental,
                      },
                    ]}
                    onPress={() => setSelectedCuisine(selectedCuisine === cuisine.id ? '' : cuisine.id)}
                  >
                    <Text style={styles.filterEmoji}>{cuisine.icon}</Text>
                    <Text
                      style={[
                        styles.filterText,
                        selectedCuisine === cuisine.id && { color: '#FFF', fontWeight: '700' },
                      ]}
                    >
                      {cuisine.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Additional Filters */}
            <View style={styles.additionalFilters}>
              <View style={styles.filterInput}>
                <Text style={styles.filterInputLabel}>Max Price ($)</Text>
                <TextInput
                  style={styles.smallInput}
                  placeholder="e.g., 2.5"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.filterInput}>
                <Text style={styles.filterInputLabel}>Max Time (min)</Text>
                <TextInput
                  style={styles.smallInput}
                  placeholder="e.g., 30"
                  value={maxReadyTime}
                  onChangeText={setMaxReadyTime}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          {/* API Results */}
          <ScrollView style={styles.results}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Searching recipes...</Text>
              </View>
            ) : apiRecipes.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyTitle}>No recipes yet</Text>
                <Text style={styles.emptySubtitle}>
                  Search for recipes using filters above
                </Text>
              </View>
            ) : (
              <View style={styles.recipesGrid}>
                {apiRecipes.map((recipe) => renderRecipeCard(recipe, false))}
              </View>
            )}
          </ScrollView>
        </>
      )}

      {/* Database Tab */}
      {activeTab === 'database' && (
        <ScrollView style={styles.results}>
          {loadingDb ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading database recipes...</Text>
            </View>
          ) : dbRecipes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📚</Text>
              <Text style={styles.emptyTitle}>No recipes in database</Text>
              <Text style={styles.emptySubtitle}>
                Use 'Search API' tab or 'Bulk Import' to add recipes
              </Text>
            </View>
          ) : (
            <View style={styles.recipesGrid}>
              {dbRecipes.map((recipe) => renderRecipeCard(recipe, true))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Bulk Import Modal */}
      <Modal visible={showBulkModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bulkModalContent}>
            <View style={styles.bulkModalHeader}>
              <Text style={styles.bulkModalTitle}>Bulk Import Presets</Text>
              <TouchableOpacity onPress={() => setShowBulkModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            {bulkImporting ? (
              <View style={styles.bulkProgressContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.bulkProgressText}>
                  Importing recipes... {bulkProgress.current}/{bulkProgress.total}
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(bulkProgress.current / bulkProgress.total) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            ) : (
              <ScrollView style={styles.bulkModalContent}>
                {BULK_IMPORT_PRESETS.map((preset) => (
                  <TouchableOpacity
                    key={preset.id}
                    style={styles.presetCard}
                    onPress={() => bulkImportRecipes(preset)}
                  >
                    <View style={styles.presetInfo}>
                      <Text style={styles.presetLabel}>{preset.label}</Text>
                      <Text style={styles.presetMeta}>
                        ~{preset.number} recipes • Query: "{preset.query}"
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={24} color={colors.primary} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Recipe Details/Edit Modal */}
      <Modal
        visible={!!selectedRecipe}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedRecipe(null)}
      >
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalContent}>
            {/* Header */}
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Recipe Details</Text>
              <TouchableOpacity onPress={() => setSelectedRecipe(null)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedRecipe && (
              <ScrollView style={styles.editModalBody}>
                {/* Recipe Image */}
                {selectedRecipe.image && (
                  <Image source={{ uri: selectedRecipe.image }} style={styles.editRecipeImage} />
                )}

                {/* Title */}
                <View style={styles.editSection}>
                  <Text style={styles.editLabel}>Recipe Title</Text>
                  <Text style={styles.editRecipeTitle}>{selectedRecipe.title}</Text>
                </View>

                {/* Polish Translation (if available) */}
                {selectedRecipe.titlePL && (
                  <View style={styles.editSection}>
                    <Text style={styles.editLabel}>Polish Translation</Text>
                    <Text style={styles.editValue}>{selectedRecipe.titlePL}</Text>
                  </View>
                )}

                {/* Recipe Meta Info */}
                <View style={styles.editInfoCards}>
                  {selectedRecipe.readyInMinutes && (
                    <View style={styles.infoCard}>
                      <Ionicons name="time" size={24} color={colors.primary} />
                      <Text style={styles.infoCardValue}>{selectedRecipe.readyInMinutes}</Text>
                      <Text style={styles.infoCardLabel}>minutes</Text>
                    </View>
                  )}
                  {selectedRecipe.servings && (
                    <View style={styles.infoCard}>
                      <Ionicons name="people" size={24} color={colors.mental} />
                      <Text style={styles.infoCardValue}>{selectedRecipe.servings}</Text>
                      <Text style={styles.infoCardLabel}>servings</Text>
                    </View>
                  )}
                  {selectedRecipe.pricePerServing && (
                    <View style={styles.infoCard}>
                      <Ionicons name="cash" size={24} color={colors.finance} />
                      <Text style={styles.infoCardValue}>
                        ${(selectedRecipe.pricePerServing / 100).toFixed(2)}
                      </Text>
                      <Text style={styles.infoCardLabel}>per serving</Text>
                    </View>
                  )}
                </View>

                {/* Diets */}
                {selectedRecipe.diets && selectedRecipe.diets.length > 0 && (
                  <View style={styles.editSection}>
                    <Text style={styles.editLabel}>Diets</Text>
                    <View style={styles.tagsContainer}>
                      {selectedRecipe.diets.map((diet, idx) => (
                        <View key={idx} style={[styles.tag, { backgroundColor: colors.success + '20' }]}>
                          <Text style={[styles.tagText, { color: colors.success }]}>
                            {diet.toUpperCase()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Dish Types */}
                {selectedRecipe.dishTypes && selectedRecipe.dishTypes.length > 0 && (
                  <View style={styles.editSection}>
                    <Text style={styles.editLabel}>Dish Types</Text>
                    <View style={styles.tagsContainer}>
                      {selectedRecipe.dishTypes.map((type, idx) => (
                        <View key={idx} style={[styles.tag, { backgroundColor: colors.mental + '20' }]}>
                          <Text style={[styles.tagText, { color: colors.mental }]}>
                            {type.toUpperCase()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Cuisines */}
                {selectedRecipe.cuisines && selectedRecipe.cuisines.length > 0 && (
                  <View style={styles.editSection}>
                    <Text style={styles.editLabel}>Cuisines</Text>
                    <View style={styles.tagsContainer}>
                      {selectedRecipe.cuisines.map((cuisine, idx) => (
                        <View key={idx} style={[styles.tag, { backgroundColor: colors.finance + '20' }]}>
                          <Text style={[styles.tagText, { color: colors.finance }]}>
                            {cuisine.toUpperCase()}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Ingredients */}
                {selectedRecipe.extendedIngredients && selectedRecipe.extendedIngredients.length > 0 && (
                  <View style={styles.editSection}>
                    <Text style={styles.editLabel}>Ingredients ({selectedRecipe.extendedIngredients.length})</Text>
                    {selectedRecipe.extendedIngredients.map((ingredient, idx) => (
                      <View key={idx} style={styles.ingredientItem}>
                        <Text style={styles.ingredientBullet}>•</Text>
                        <Text style={styles.ingredientText}>{ingredient.original}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Instructions */}
                {selectedRecipe.instructions && (
                  <View style={styles.editSection}>
                    <Text style={styles.editLabel}>Instructions</Text>
                    <Text style={styles.instructionsText}>{selectedRecipe.instructions}</Text>
                  </View>
                )}

                {/* Summary */}
                {selectedRecipe.summary && (
                  <View style={styles.editSection}>
                    <Text style={styles.editLabel}>Summary</Text>
                    <Text style={styles.summaryText}>
                      {selectedRecipe.summary.replace(/<[^>]*>/g, '')}
                    </Text>
                  </View>
                )}

                {/* Source Info */}
                {selectedRecipe.sourceUrl && (
                  <View style={styles.editSection}>
                    <Text style={styles.editLabel}>Source</Text>
                    <Text style={styles.sourceText} numberOfLines={2}>
                      {selectedRecipe.sourceUrl}
                    </Text>
                  </View>
                )}

                {/* Save Button (only for API recipes not yet in DB) */}
                {!selectedRecipe.id && (
                  <TouchableOpacity
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSaveRecipe}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <>
                        <Ionicons name="cloud-upload" size={20} color="#FFF" />
                        <Text style={styles.saveButtonText}>Save to Database</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  bulkImportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  bulkImportButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    margin: spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  filtersSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: '#FFF',
  },
  filterEmoji: {
    fontSize: 16,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  additionalFilters: {
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  filterInput: {
    flex: 1,
  },
  filterInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  smallInput: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
  },
  results: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  recipesGrid: {
    padding: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  recipeCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recipeImage: {
    width: '100%',
    height: 120,
    backgroundColor: colors.backgroundGray,
  },
  recipeContent: {
    padding: spacing.md,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    minHeight: 40,
  },
  recipeMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  recipeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.error + '20',
    padding: spacing.xs,
    borderRadius: 6,
  },

  // Bulk Import Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bulkModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  bulkModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bulkModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  presetCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  presetInfo: {
    flex: 1,
  },
  presetLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  presetMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  bulkProgressContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  bulkProgressText: {
    marginTop: spacing.lg,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.backgroundGray,
    borderRadius: 4,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },

  // Edit/Detail Modal
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: '92%',
    maxWidth: 800,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  editModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  editModalBody: {
    flex: 1,
  },
  editRecipeImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.backgroundGray,
  },
  editSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  editLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  editRecipeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 28,
  },
  editValue: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  editInfoCards: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoCardValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  infoCardLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  ingredientBullet: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 22,
  },
  ingredientText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  instructionsText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  summaryText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  sourceText: {
    fontSize: 12,
    color: colors.mental,
    fontStyle: 'italic',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    margin: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
