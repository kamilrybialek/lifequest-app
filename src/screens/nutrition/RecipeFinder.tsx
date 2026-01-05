import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { IngredientSelector } from './IngredientSelector';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db, auth } from '../../config/firebase';
import { COMMON_INGREDIENTS } from '../../data/ingredients';

const SPOONACULAR_API_KEY = '8b6cd47792ff4057ad699f9b0523d9df';
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

interface Recipe {
  id: number | string;
  spoonacularId?: number;
  title: string;
  image?: string;
  readyInMinutes?: number;
  servings?: number;
  pricePerServing?: number;
  missedIngredientCount?: number;
  usedIngredientCount?: number;
  cuisines?: string[];
  diets?: string[];
  sourceUrl?: string;
  instructions?: string;
  summary?: string;
  extendedIngredients?: any[];
  nutrition?: any;
  source: 'database' | 'api'; // Track where recipe came from
}

export const RecipeFinder = () => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [dbCount, setDbCount] = useState(0);
  const [apiCount, setApiCount] = useState(0);

  // Search recipes: First internal DB, then API if needed
  const searchRecipes = async (ingredientIds: string[]) => {
    setLoading(true);
    setSearchPerformed(true);
    setRecipes([]);
    setDbCount(0);
    setApiCount(0);

    try {
      console.log('🔍 Searching for recipes with ingredients:', ingredientIds);

      // Step 1: Search internal Firebase database
      const dbRecipes = await searchDatabaseRecipes(ingredientIds);
      console.log(`✅ Found ${dbRecipes.length} recipes in database`);
      setDbCount(dbRecipes.length);

      // Step 2: If we have few results, supplement with API
      let apiRecipes: Recipe[] = [];
      if (dbRecipes.length < 10) {
        console.log('📡 Searching API for more recipes...');
        apiRecipes = await searchAPIRecipes(ingredientIds);
        console.log(`✅ Found ${apiRecipes.length} recipes from API`);
        setApiCount(apiRecipes.length);
      }

      // Combine results (DB first, then API)
      const allRecipes = [...dbRecipes, ...apiRecipes];
      setRecipes(allRecipes);

      if (allRecipes.length === 0) {
        Alert.alert(
          'No Recipes Found',
          'Try selecting different ingredients or fewer ingredients.'
        );
      }
    } catch (error) {
      console.error('❌ Error searching recipes:', error);
      Alert.alert('Error', 'Failed to search recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Search internal Firebase database
  const searchDatabaseRecipes = async (ingredientIds: string[]): Promise<Recipe[]> => {
    try {
      // Get ingredient names for matching
      const ingredientNames = ingredientIds
        .map((id) => {
          const ingredient = COMMON_INGREDIENTS.find((i) => i.id === id);
          return ingredient?.searchTerms || [];
        })
        .flat();

      console.log('🔍 Searching DB with ingredient names:', ingredientNames);

      // Query all recipes from database
      const recipesQuery = query(collection(db, 'recipes'));
      const snapshot = await getDocs(recipesQuery);

      const matchedRecipes: Recipe[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();

        // Check if recipe contains any of the selected ingredients
        const recipeIngredients = (data.extendedIngredients || [])
          .map((ing: any) => ing.original?.toLowerCase() || '')
          .join(' ');

        const matchCount = ingredientNames.filter((name) =>
          recipeIngredients.includes(name.toLowerCase())
        ).length;

        // If recipe uses at least 1 of the selected ingredients, include it
        if (matchCount > 0) {
          matchedRecipes.push({
            id: doc.id,
            ...data,
            source: 'database',
            usedIngredientCount: matchCount,
            missedIngredientCount: ingredientIds.length - matchCount,
          } as Recipe);
        }
      });

      // Sort by number of matching ingredients (descending)
      matchedRecipes.sort(
        (a, b) => (b.usedIngredientCount || 0) - (a.usedIngredientCount || 0)
      );

      return matchedRecipes.slice(0, 20); // Return top 20 matches
    } catch (error) {
      console.error('❌ Error searching database:', error);
      return [];
    }
  };

  // Search Spoonacular API
  const searchAPIRecipes = async (ingredientIds: string[]): Promise<Recipe[]> => {
    try {
      // Convert ingredient IDs to names
      const ingredientNames = ingredientIds
        .map((id) => {
          const ingredient = COMMON_INGREDIENTS.find((i) => i.id === id);
          return ingredient?.name;
        })
        .filter(Boolean);

      const ingredientsParam = ingredientNames.join(',');

      // Use Spoonacular's "Find by Ingredients" endpoint
      const url = `${SPOONACULAR_BASE_URL}/recipes/findByIngredients?apiKey=${SPOONACULAR_API_KEY}&ingredients=${ingredientsParam}&number=20&ranking=1&ignorePantry=true`;

      console.log('📡 API Request:', url);

      const response = await fetch(url);
      const data = await response.json();

      if (!Array.isArray(data)) {
        console.error('❌ Unexpected API response:', data);
        return [];
      }

      // Map API results to our Recipe interface
      const apiRecipes: Recipe[] = data.map((recipe: any) => ({
        id: recipe.id,
        spoonacularId: recipe.id,
        title: recipe.title,
        image: recipe.image,
        missedIngredientCount: recipe.missedIngredientCount,
        usedIngredientCount: recipe.usedIngredientCount,
        source: 'api',
      }));

      return apiRecipes;
    } catch (error) {
      console.error('❌ Error searching API:', error);
      return [];
    }
  };

  // Auto-save API recipe to database when user selects it
  const handleRecipePress = async (recipe: Recipe) => {
    // If it's from API, fetch full details and save to DB
    if (recipe.source === 'api' && recipe.spoonacularId) {
      try {
        console.log('💾 Fetching full recipe details to save to database...');

        // Fetch full recipe details
        const response = await fetch(
          `${SPOONACULAR_BASE_URL}/recipes/${recipe.spoonacularId}/information?apiKey=${SPOONACULAR_API_KEY}&includeNutrition=true`
        );
        const fullRecipe = await response.json();

        // Save to Firebase
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
          summary: fullRecipe.summary || '',
          sourceUrl: fullRecipe.sourceUrl || '',
          extendedIngredients: fullRecipe.extendedIngredients || [],
          nutrition: fullRecipe.nutrition || {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          addedBy: 'user_selection',
          addedByUserId: auth.currentUser?.uid,
          published: true,
        };

        await addDoc(collection(db, 'recipes'), recipeData);
        console.log('✅ Recipe auto-saved to database!');

        Alert.alert(
          '✅ Recipe Saved',
          `"${fullRecipe.title}" has been added to your recipe collection!`
        );
      } catch (error) {
        console.error('❌ Error auto-saving recipe:', error);
        // Don't block user - just log the error
      }
    } else {
      // Recipe already in database
      Alert.alert('Recipe Details', `You selected: ${recipe.title}`);
    }
  };

  return (
    <View style={styles.container}>
      {!searchPerformed ? (
        // Step 1: Ingredient Selection
        <IngredientSelector
          onIngredientsSelected={setSelectedIngredients}
          onSearchRecipes={searchRecipes}
        />
      ) : (
        // Step 2: Recipe Results
        <View style={styles.resultsContainer}>
          {/* Header with Back Button */}
          <View style={styles.resultsHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSearchPerformed(false)}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
              <Text style={styles.backButtonText}>Change Ingredients</Text>
            </TouchableOpacity>
          </View>

          {/* Search Summary */}
          <View style={styles.searchSummary}>
            <Text style={styles.searchSummaryTitle}>
              Found {recipes.length} Recipe{recipes.length !== 1 ? 's' : ''}
            </Text>
            <View style={styles.sourceBadges}>
              {dbCount > 0 && (
                <View style={[styles.sourceBadge, { backgroundColor: colors.success + '20' }]}>
                  <Ionicons name="home" size={16} color={colors.success} />
                  <Text style={[styles.sourceBadgeText, { color: colors.success }]}>
                    {dbCount} from database
                  </Text>
                </View>
              )}
              {apiCount > 0 && (
                <View style={[styles.sourceBadge, { backgroundColor: colors.mental + '20' }]}>
                  <Ionicons name="cloud" size={16} color={colors.mental} />
                  <Text style={[styles.sourceBadgeText, { color: colors.mental }]}>
                    {apiCount} from API
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Searching recipes...</Text>
            </View>
          )}

          {/* Recipe Results */}
          {!loading && recipes.length > 0 && (
            <ScrollView style={styles.recipesList} showsVerticalScrollIndicator={false}>
              <View style={styles.recipesGrid}>
                {recipes.map((recipe) => (
                  <TouchableOpacity
                    key={`${recipe.source}-${recipe.id}`}
                    style={styles.recipeCard}
                    onPress={() => handleRecipePress(recipe)}
                  >
                    {/* Recipe Image */}
                    {recipe.image && (
                      <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
                    )}

                    {/* Source Badge */}
                    <View
                      style={[
                        styles.recipeBadge,
                        {
                          backgroundColor:
                            recipe.source === 'database'
                              ? colors.success + 'E0'
                              : colors.mental + 'E0',
                        },
                      ]}
                    >
                      <Ionicons
                        name={recipe.source === 'database' ? 'home' : 'cloud'}
                        size={12}
                        color="#FFF"
                      />
                    </View>

                    {/* Recipe Info */}
                    <View style={styles.recipeCardContent}>
                      <Text style={styles.recipeTitle} numberOfLines={2}>
                        {recipe.title}
                      </Text>

                      {/* Match Info */}
                      <View style={styles.matchInfo}>
                        <View style={styles.matchBadge}>
                          <Ionicons name="checkmark" size={14} color={colors.success} />
                          <Text style={styles.matchText}>
                            {recipe.usedIngredientCount || 0} match
                          </Text>
                        </View>
                        {(recipe.missedIngredientCount || 0) > 0 && (
                          <View style={styles.matchBadge}>
                            <Ionicons name="add" size={14} color={colors.warning} />
                            <Text style={styles.matchText}>
                              {recipe.missedIngredientCount} more
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Meta Info */}
                      {recipe.readyInMinutes && (
                        <View style={styles.metaInfo}>
                          <Ionicons name="time" size={14} color={colors.textSecondary} />
                          <Text style={styles.metaText}>{recipe.readyInMinutes} min</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          )}

          {/* Empty State */}
          {!loading && recipes.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>No Recipes Found</Text>
              <Text style={styles.emptySubtitle}>
                Try selecting different ingredients or fewer ingredients
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  searchSummary: {
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchSummaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sourceBadges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  sourceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },
  recipesList: {
    flex: 1,
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
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: 120,
    backgroundColor: colors.backgroundGray,
  },
  recipeBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    padding: 6,
    borderRadius: 8,
  },
  recipeCardContent: {
    padding: spacing.md,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    minHeight: 40,
  },
  matchInfo: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  matchText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
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
});
