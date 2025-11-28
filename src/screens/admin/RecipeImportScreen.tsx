import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const SPOONACULAR_API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

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
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  extendedIngredients: any[];
  instructions: string;
  analyzedInstructions: any[];
  sourceUrl?: string;
  aggregateLikes?: number;
}

const IMPORT_PRESETS = [
  { id: 'popular', label: '🔥 Most Popular', icon: 'flame', query: { sort: 'popularity', number: 20 } },
  { id: 'healthy', label: '💚 Healthy', icon: 'fitness', query: { sort: 'healthiness', number: 20 } },
  { id: 'quick', label: '⚡ Quick (< 30 min)', icon: 'time', query: { maxReadyTime: 30, number: 20 } },
  { id: 'vegetarian', label: '🥗 Vegetarian', icon: 'leaf', query: { diet: 'vegetarian', number: 20 } },
  { id: 'cheap', label: '💰 Budget-Friendly', icon: 'wallet', query: { sort: 'price', number: 20 } },
];

const CUISINE_PRESETS = [
  { id: 'italian', label: 'Italian 🇮🇹', cuisine: 'italian' },
  { id: 'mexican', label: 'Mexican 🇲🇽', cuisine: 'mexican' },
  { id: 'chinese', label: 'Chinese 🥢', cuisine: 'chinese' },
  { id: 'indian', label: 'Indian 🇮🇳', cuisine: 'indian' },
  { id: 'american', label: 'American 🇺🇸', cuisine: 'american' },
];

export default function RecipeImportScreen() {
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipes, setSelectedRecipes] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [customQuery, setCustomQuery] = useState('');

  // Fetch recipes from Spoonacular
  const fetchRecipes = async (preset: any, cuisine?: string) => {
    setLoading(true);
    setRecipes([]);
    setSelectedRecipes(new Set());

    try {
      let url = `${SPOONACULAR_BASE_URL}/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&addRecipeInformation=true&fillIngredients=true&addRecipeNutrition=true`;

      // Add preset query params
      Object.entries(preset.query).forEach(([key, value]) => {
        url += `&${key}=${value}`;
      });

      // Add cuisine if specified
      if (cuisine) {
        url += `&cuisine=${cuisine}`;
      }

      console.log('🔍 Fetching from Spoonacular:', preset.label);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Spoonacular API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const formattedRecipes = data.results.map((recipe: any) => {
          const calories = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount || 0;
          const protein = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount || 0;
          const carbs = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount || 0;
          const fat = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Fat')?.amount || 0;

          return {
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes || 0,
            servings: recipe.servings || 0,
            pricePerServing: recipe.pricePerServing || 0,
            cuisines: recipe.cuisines || [],
            diets: recipe.diets || [],
            summary: recipe.summary || '',
            calories: Math.round(calories),
            protein: Math.round(protein),
            carbs: Math.round(carbs),
            fat: Math.round(fat),
            extendedIngredients: recipe.extendedIngredients || [],
            instructions: recipe.instructions || '',
            analyzedInstructions: recipe.analyzedInstructions || [],
            sourceUrl: recipe.sourceUrl,
            aggregateLikes: recipe.aggregateLikes || 0,
          };
        });

        setRecipes(formattedRecipes);
        // Auto-select all recipes
        setSelectedRecipes(new Set(formattedRecipes.map(r => r.id)));

        Alert.alert(
          'Success!',
          `Found ${formattedRecipes.length} recipes. All are auto-selected for import.`
        );
      } else {
        Alert.alert('No Results', 'No recipes found with these criteria');
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      Alert.alert('Error', 'Failed to fetch recipes from Spoonacular. Check API key and quota.');
    } finally {
      setLoading(false);
    }
  };

  // Custom search
  const searchCustom = async () => {
    if (!customQuery.trim()) {
      Alert.alert('Enter Query', 'Please enter a search term');
      return;
    }

    setLoading(true);
    setRecipes([]);
    setSelectedRecipes(new Set());

    try {
      const url = `${SPOONACULAR_BASE_URL}/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${encodeURIComponent(customQuery)}&number=20&addRecipeInformation=true&fillIngredients=true&addRecipeNutrition=true`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const formattedRecipes = data.results.map((recipe: any) => {
          const calories = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount || 0;
          const protein = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount || 0;
          const carbs = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount || 0;
          const fat = recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Fat')?.amount || 0;

          return {
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes || 0,
            servings: recipe.servings || 0,
            pricePerServing: recipe.pricePerServing || 0,
            cuisines: recipe.cuisines || [],
            diets: recipe.diets || [],
            summary: recipe.summary || '',
            calories: Math.round(calories),
            protein: Math.round(protein),
            carbs: Math.round(carbs),
            fat: Math.round(fat),
            extendedIngredients: recipe.extendedIngredients || [],
            instructions: recipe.instructions || '',
            analyzedInstructions: recipe.analyzedInstructions || [],
            sourceUrl: recipe.sourceUrl,
            aggregateLikes: recipe.aggregateLikes || 0,
          };
        });

        setRecipes(formattedRecipes);
        setSelectedRecipes(new Set(formattedRecipes.map(r => r.id)));
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to search recipes');
    } finally {
      setLoading(false);
    }
  };

  // Toggle recipe selection
  const toggleRecipe = (id: number) => {
    const newSelected = new Set(selectedRecipes);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecipes(newSelected);
  };

  // Import selected recipes to Firebase
  const importRecipes = async () => {
    if (selectedRecipes.size === 0) {
      Alert.alert('No Selection', 'Please select at least one recipe to import');
      return;
    }

    setImporting(true);
    let successCount = 0;
    let skipCount = 0;

    try {
      const recipesRef = collection(db, 'recipes');

      for (const recipeId of selectedRecipes) {
        const recipe = recipes.find(r => r.id === recipeId);
        if (!recipe) continue;

        // Check if recipe already exists
        const q = query(recipesRef, where('spoonacularId', '==', recipe.id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          console.log(`⏭️ Skipping existing recipe: ${recipe.title}`);
          skipCount++;
          continue;
        }

        // Save to Firebase
        await addDoc(recipesRef, {
          spoonacularId: recipe.id,
          title: recipe.title,
          image: recipe.image,
          readyInMinutes: recipe.readyInMinutes,
          servings: recipe.servings,
          pricePerServing: recipe.pricePerServing,
          cuisines: recipe.cuisines,
          diets: recipe.diets,
          summary: recipe.summary,
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fat: recipe.fat,
          extendedIngredients: recipe.extendedIngredients,
          instructions: recipe.instructions,
          analyzedInstructions: recipe.analyzedInstructions,
          sourceUrl: recipe.sourceUrl || '',
          aggregateLikes: recipe.aggregateLikes || 0,
          createdAt: new Date().toISOString(),
          importedFrom: 'spoonacular',
        });

        successCount++;
        console.log(`✅ Imported: ${recipe.title}`);
      }

      setImportedCount(successCount);

      Alert.alert(
        'Import Complete!',
        `✅ Imported: ${successCount} recipes\n⏭️ Skipped (already exist): ${skipCount} recipes`,
        [
          {
            text: 'OK',
            onPress: () => {
              setRecipes([]);
              setSelectedRecipes(new Set());
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error importing recipes:', error);
      Alert.alert('Error', 'Failed to import some recipes. Check console for details.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📥 Recipe Import from Spoonacular</Text>
        <Text style={styles.subtitle}>
          Fetch popular recipes and save them to your internal database
        </Text>
      </View>

      {/* Quick Import Presets */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Quick Import Presets</Text>
        <View style={styles.presetsGrid}>
          {IMPORT_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.id}
              style={styles.presetCard}
              onPress={() => fetchRecipes(preset)}
              disabled={loading}
            >
              <Ionicons name={preset.icon as any} size={32} color={colors.diet} />
              <Text style={styles.presetLabel}>{preset.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Cuisine Presets */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌍 By Cuisine</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CUISINE_PRESETS.map((cuisine) => (
            <TouchableOpacity
              key={cuisine.id}
              style={styles.cuisineChip}
              onPress={() => fetchRecipes(IMPORT_PRESETS[0], cuisine.cuisine)}
              disabled={loading}
            >
              <Text style={styles.cuisineLabel}>{cuisine.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Custom Search */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔍 Custom Search</Text>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes (e.g., chicken pasta, vegan dessert...)"
            value={customQuery}
            onChangeText={setCustomQuery}
            onSubmitEditing={searchCustom}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={searchCustom}
            disabled={loading}
          >
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.diet} />
          <Text style={styles.loadingText}>Fetching recipes from Spoonacular...</Text>
        </View>
      )}

      {/* Results */}
      {recipes.length > 0 && (
        <View style={styles.section}>
          <View style={styles.resultsHeader}>
            <Text style={styles.sectionTitle}>
              📋 Found {recipes.length} Recipes
            </Text>
            <View style={styles.selectionInfo}>
              <Text style={styles.selectionText}>
                {selectedRecipes.size} selected
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (selectedRecipes.size === recipes.length) {
                    setSelectedRecipes(new Set());
                  } else {
                    setSelectedRecipes(new Set(recipes.map(r => r.id)));
                  }
                }}
              >
                <Text style={styles.selectAllButton}>
                  {selectedRecipes.size === recipes.length ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {recipes.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              style={[
                styles.recipeCard,
                selectedRecipes.has(recipe.id) && styles.recipeCardSelected,
              ]}
              onPress={() => toggleRecipe(recipe.id)}
            >
              <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeTitle} numberOfLines={2}>
                  {recipe.title}
                </Text>
                <View style={styles.recipeMeta}>
                  <Text style={styles.metaText}>🔥 {recipe.calories} kcal</Text>
                  <Text style={styles.metaText}>⏱ {recipe.readyInMinutes}m</Text>
                  <Text style={styles.metaText}>❤️ {recipe.aggregateLikes}</Text>
                </View>
                <View style={styles.macros}>
                  <Text style={styles.macroText}>P: {recipe.protein}g</Text>
                  <Text style={styles.macroText}>C: {recipe.carbs}g</Text>
                  <Text style={styles.macroText}>F: {recipe.fat}g</Text>
                </View>
              </View>
              {selectedRecipes.has(recipe.id) && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={28} color={colors.diet} />
                </View>
              )}
            </TouchableOpacity>
          ))}

          {/* Import Button */}
          <TouchableOpacity
            style={[
              styles.importButton,
              (importing || selectedRecipes.size === 0) && styles.importButtonDisabled,
            ]}
            onPress={importRecipes}
            disabled={importing || selectedRecipes.size === 0}
          >
            {importing ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="cloud-upload" size={24} color="white" />
                <Text style={styles.importButtonText}>
                  Import {selectedRecipes.size} Recipe{selectedRecipes.size !== 1 ? 's' : ''} to Database
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Stats */}
      {importedCount > 0 && (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Import Statistics</Text>
          <Text style={styles.statsText}>
            Total imported this session: {importedCount} recipes
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.diet,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  section: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  presetCard: {
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  presetLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  cuisineChip: {
    backgroundColor: 'white',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  cuisineLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  searchBar: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  searchButton: {
    backgroundColor: colors.diet,
    borderRadius: 12,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectAllButton: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.diet,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeCardSelected: {
    borderWidth: 3,
    borderColor: colors.diet,
  },
  recipeImage: {
    width: 120,
    height: 120,
  },
  recipeInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  recipeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  recipeMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  macros: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  macroText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.diet,
  },
  checkmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.diet,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    marginTop: spacing.md,
    shadowColor: colors.diet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  importButtonDisabled: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  statsCard: {
    backgroundColor: '#E8F5E9',
    padding: spacing.lg,
    margin: spacing.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.diet + '40',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
