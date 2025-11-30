import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getRecipeById } from '../../database/nutrition.web';
import { ArrowLeft, Plus, Clock, Users, Flame } from 'lucide-react-native';

const LOVABLE_COLORS = {
  primary: '#FA7D09',
  primaryLight: 'rgba(250, 125, 9, 0.05)',
  background: '#ECF2F7',
  card: '#F5F8FA',
  foreground: '#1A202C',
  mutedForeground: '#718096',
  border: '#CBD5E0',
};

interface RecipeIngredient {
  id: number;
  ingredient_name?: string;
  quantity?: number;
  unit?: string;
  notes?: string;
  food_name?: string;
}

interface Recipe {
  id: number;
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
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  ingredients?: RecipeIngredient[];
}

export const RecipeDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { recipeId } = (route.params as any) || {};
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipe();
  }, [recipeId]);

  const loadRecipe = async () => {
    if (!recipeId) {
      navigation.goBack();
      return;
    }

    setLoading(true);
    try {
      const recipeData = await getRecipeById(recipeId);
      setRecipe(recipeData as Recipe);
    } catch (error) {
      console.error('Error loading recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToMealPlan = () => {
    console.log('Add to meal plan:', recipe?.name);
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading recipe...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>🍳</Text>
        <Text style={styles.errorText}>Recipe not found</Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => navigation.goBack()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const instructions = recipe.instructions
    ? recipe.instructions.split('\n').filter((line) => line.trim())
    : [];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {recipe.photo_url ? (
            <View style={styles.heroImageContainer}>
              <Text style={styles.heroPlaceholderIcon}>🍽️</Text>
              <View style={styles.heroOverlay} />
            </View>
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroPlaceholderIcon}>🍽️</Text>
              <View style={styles.heroOverlay} />
            </View>
          )}

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft color="#fff" size={20} />
          </TouchableOpacity>

          {/* Add Button */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddToMealPlan}>
            <Plus color="#fff" size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Recipe Info Card */}
          <View style={styles.infoCard}>
            {recipe.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{recipe.category}</Text>
              </View>
            )}

            <Text style={styles.recipeName}>{recipe.name}</Text>
            {recipe.description && (
              <Text style={styles.recipeDescription}>{recipe.description}</Text>
            )}

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={styles.statIconRow}>
                  <Flame color={LOVABLE_COLORS.primary} size={20} />
                  <Text style={styles.statValue}>{Math.round(recipe.total_calories)}</Text>
                </View>
                <Text style={styles.statLabel}>Calories</Text>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statIconRow}>
                  <Clock color={LOVABLE_COLORS.foreground} size={20} />
                  <Text style={styles.statValueNormal}>{recipe.prep_time_minutes || 0}</Text>
                </View>
                <Text style={styles.statLabel}>Minutes</Text>
              </View>

              <View style={styles.statItem}>
                <View style={styles.statIconRow}>
                  <Users color={LOVABLE_COLORS.foreground} size={20} />
                  <Text style={styles.statValueNormal}>{recipe.servings || 1}</Text>
                </View>
                <Text style={styles.statLabel}>Servings</Text>
              </View>
            </View>

            {/* Macros */}
            <View style={styles.macrosContainer}>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{Math.round(recipe.total_protein)}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{Math.round(recipe.total_carbs)}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{Math.round(recipe.total_fat)}g</Text>
                <Text style={styles.macroLabel}>Fat</Text>
              </View>
            </View>
          </View>

          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <View style={styles.ingredientsList}>
                {recipe.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <View style={styles.ingredientBullet} />
                    <Text style={styles.ingredientName}>
                      {ingredient.food_name || ingredient.ingredient_name || 'Unknown ingredient'}
                    </Text>
                    {(ingredient.quantity || ingredient.unit) && (
                      <Text style={styles.ingredientAmount}>
                        {ingredient.quantity || ''} {ingredient.unit || ''}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Instructions */}
          {instructions.length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Instructions</Text>
              <View style={styles.instructionsList}>
                {instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Bottom CTA */}
          <TouchableOpacity style={styles.addToMealPlanButton} onPress={handleAddToMealPlan}>
            <Plus color="#fff" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.addToMealPlanButtonText}>Add to Meal Plan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOVABLE_COLORS.background,
    maxWidth: 448,
    marginHorizontal: 'auto' as any,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: LOVABLE_COLORS.background,
  },
  loadingText: {
    fontSize: 16,
    color: LOVABLE_COLORS.mutedForeground,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: LOVABLE_COLORS.background,
    padding: 24,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: LOVABLE_COLORS.foreground,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: LOVABLE_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  heroContainer: {
    height: 320,
    position: 'relative',
  },
  heroImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholderIcon: {
    fontSize: 80,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent)' as any,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(8px)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LOVABLE_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    paddingHorizontal: 16,
    marginTop: -32,
    paddingBottom: 80,
  },
  infoCard: {
    backgroundColor: LOVABLE_COLORS.card,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: LOVABLE_COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: LOVABLE_COLORS.foreground,
    textTransform: 'capitalize',
  },
  recipeName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: LOVABLE_COLORS.foreground,
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 16,
    color: LOVABLE_COLORS.mutedForeground,
    marginBottom: 24,
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LOVABLE_COLORS.primary,
  },
  statValueNormal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LOVABLE_COLORS.foreground,
  },
  statLabel: {
    fontSize: 12,
    color: LOVABLE_COLORS.mutedForeground,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: `${LOVABLE_COLORS.primary}10`,
    borderRadius: 12,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: LOVABLE_COLORS.primary,
  },
  macroLabel: {
    fontSize: 12,
    color: LOVABLE_COLORS.mutedForeground,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: LOVABLE_COLORS.card,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: LOVABLE_COLORS.foreground,
    marginBottom: 16,
  },
  ingredientsList: {
    gap: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ingredientBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: LOVABLE_COLORS.primary,
  },
  ingredientName: {
    flex: 1,
    fontSize: 15,
    color: LOVABLE_COLORS.foreground,
  },
  ingredientAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: LOVABLE_COLORS.mutedForeground,
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    gap: 16,
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: LOVABLE_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    color: LOVABLE_COLORS.foreground,
    lineHeight: 22,
    paddingTop: 6,
  },
  addToMealPlanButton: {
    backgroundColor: LOVABLE_COLORS.primary,
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  addToMealPlanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
