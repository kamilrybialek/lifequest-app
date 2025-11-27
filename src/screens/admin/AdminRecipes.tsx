import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const SPOONACULAR_API_KEY = '8b6cd47792ff4057ad699f9b0523d9df';
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

interface Recipe {
  id: number;
  title: string;
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
  extendedIngredients?: any[];
  nutrition?: any;
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
];

export const AdminRecipes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedRecipe, setEditedRecipe] = useState<Recipe | null>(null);
  const [translationPL, setTranslationPL] = useState({ title: '', instructions: '' });
  const [saving, setSaving] = useState(false);

  // Search recipes from Spoonacular API
  const searchRecipes = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Enter Search Query', 'Please enter a recipe name or ingredient');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Searching recipes:', searchQuery);

      // Build query parameters
      let url = `${SPOONACULAR_BASE_URL}/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(
        searchQuery
      )}&number=20&addRecipeInformation=true&fillIngredients=true&addRecipeNutrition=true`;

      // Add diet filters
      if (selectedFilters.length > 0) {
        url += `&diet=${selectedFilters.join(',')}`;
      }

      // Add type filter
      if (selectedType) {
        url += `&type=${selectedType}`;
      }

      // Add max price
      if (maxPrice) {
        url += `&maxPrice=${maxPrice}`;
      }

      console.log('📡 API URL:', url);

      const response = await fetch(url);
      const data = await response.json();

      if (data.results) {
        setRecipes(data.results);
        console.log(`✅ Found ${data.results.length} recipes`);
      } else {
        console.error('❌ No results in response:', data);
        Alert.alert('No Results', 'No recipes found. Try different filters.');
      }
    } catch (error) {
      console.error('❌ Error searching recipes:', error);
      Alert.alert('Error', 'Failed to search recipes. Check console for details.');
    } finally {
      setLoading(false);
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
      // Fetch full recipe details
      const fullRecipe = await getRecipeDetails(recipe.id);
      setEditedRecipe(fullRecipe);
      setTranslationPL({ title: '', instructions: '' });
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

      // Prepare recipe data
      const recipeData = {
        spoonacularId: editedRecipe.id,
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
        // Translation (Polish)
        translations: {
          pl: {
            title: translationPL.title || editedRecipe.title,
            instructions: translationPL.instructions || '',
          },
        },
        // Metadata
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        addedBy: 'admin',
        published: true,
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, 'recipes'), recipeData);
      console.log('✅ Recipe saved with ID:', docRef.id);

      Alert.alert(
        '✅ Success',
        `Recipe "${editedRecipe.title}" saved to database!\n\nFirebase ID: ${docRef.id}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowEditModal(false);
              setEditedRecipe(null);
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error saving recipe:', error);
      Alert.alert('Error', 'Failed to save recipe to Firebase. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle filter
  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recipe Management</Text>
        <Text style={styles.headerSubtitle}>
          Search, edit, and import recipes from Spoonacular API
        </Text>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        {/* Search Input */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes (e.g., pasta, chicken, salad)..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchRecipes}
          />
          <TouchableOpacity style={styles.searchButton} onPress={searchRecipes}>
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

        {/* Type Filters */}
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

        {/* Max Price Filter */}
        <View style={styles.priceSection}>
          <Text style={styles.filtersTitle}>Max Price per Serving ($)</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="e.g., 2.5"
            value={maxPrice}
            onChangeText={setMaxPrice}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {/* Results */}
      <ScrollView style={styles.results}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Searching recipes...</Text>
          </View>
        ) : recipes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No recipes yet</Text>
            <Text style={styles.emptySubtitle}>
              Search for recipes using filters above
            </Text>
          </View>
        ) : (
          <View style={styles.recipesGrid}>
            {recipes.map((recipe) => (
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
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit & Save Recipe</Text>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveRecipeToFirebase}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <ScrollView style={styles.modalContent}>
            {editedRecipe && (
              <>
                {/* Recipe Image */}
                {editedRecipe.image && (
                  <Image source={{ uri: editedRecipe.image }} style={styles.modalImage} />
                )}

                {/* Original Title */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Original Title (English)</Text>
                  <Text style={styles.originalText}>{editedRecipe.title}</Text>
                </View>

                {/* Polish Translation */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🇵🇱 Polish Translation</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Tytuł przepisu po polsku"
                    value={translationPL.title}
                    onChangeText={(text) => setTranslationPL({ ...translationPL, title: text })}
                  />
                </View>

                {/* Recipe Info */}
                <View style={styles.infoGrid}>
                  <View style={styles.infoCard}>
                    <Ionicons name="time-outline" size={24} color={colors.primary} />
                    <Text style={styles.infoValue}>{editedRecipe.readyInMinutes || '—'} min</Text>
                    <Text style={styles.infoLabel}>Cook Time</Text>
                  </View>
                  <View style={styles.infoCard}>
                    <Ionicons name="people-outline" size={24} color={colors.mental} />
                    <Text style={styles.infoValue}>{editedRecipe.servings || '—'}</Text>
                    <Text style={styles.infoLabel}>Servings</Text>
                  </View>
                  <View style={styles.infoCard}>
                    <Ionicons name="cash-outline" size={24} color={colors.finance} />
                    <Text style={styles.infoValue}>
                      ${((editedRecipe.pricePerServing || 0) / 100).toFixed(2)}
                    </Text>
                    <Text style={styles.infoLabel}>Per Serving</Text>
                  </View>
                </View>

                {/* Ingredients */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                  {editedRecipe.extendedIngredients?.map((ing: any, index: number) => (
                    <View key={index} style={styles.ingredientItem}>
                      <Text style={styles.ingredientText}>• {ing.original}</Text>
                    </View>
                  ))}
                </View>

                {/* Instructions */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Instructions (English)</Text>
                  <Text style={styles.instructionsText}>
                    {editedRecipe.instructions?.replace(/<[^>]*>/g, '') || 'No instructions available'}
                  </Text>
                </View>

                {/* Polish Instructions Translation */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🇵🇱 Instructions (Polish)</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Instrukcje przygotowania po polsku"
                    value={translationPL.instructions}
                    onChangeText={(text) =>
                      setTranslationPL({ ...translationPL, instructions: text })
                    }
                    multiline
                    numberOfLines={6}
                  />
                </View>
              </>
            )}
          </ScrollView>
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
  priceSection: {
    marginHorizontal: spacing.lg,
  },
  priceInput: {
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

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 250,
    backgroundColor: colors.backgroundGray,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  originalText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  textInput: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  infoGrid: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  ingredientItem: {
    paddingVertical: spacing.xs,
  },
  ingredientText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  instructionsText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
});
