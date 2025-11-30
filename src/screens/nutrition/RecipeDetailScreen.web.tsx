import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Card, Button, IconButton, Chip } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getRecipeById } from '../../database/nutrition.web';
import { colors } from '../../theme/colors';

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
    // Will be implemented with meal plan integration
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
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.errorButton}>
          Go Back
        </Button>
      </View>
    );
  }

  const instructions = recipe.instructions
    ? recipe.instructions.split('\n').filter((line) => line.trim())
    : [];

  const difficultyColors = {
    easy: '#4CAF50',
    medium: '#FF9800',
    hard: '#F44336',
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Hero Image */}
        {recipe.photo_url ? (
          <View style={styles.heroContainer}>
            <Image source={{ uri: recipe.photo_url }} style={styles.heroImage} />
            <View style={styles.heroOverlay} />

            {/* Back Button */}
            <IconButton
              icon="arrow-left"
              size={24}
              iconColor="#fff"
              containerColor="rgba(0, 0, 0, 0.5)"
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            />

            {/* Add Button */}
            <IconButton
              icon="plus"
              size={24}
              iconColor="#fff"
              containerColor={colors.nutrition}
              style={styles.addButton}
              onPress={handleAddToMealPlan}
            />
          </View>
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text style={styles.heroPlaceholderIcon}>🍽️</Text>
          </View>
        )}

        <View style={styles.content}>
          {/* Recipe Info Card */}
          <Card style={styles.infoCard}>
            <Card.Content>
              {recipe.category && (
                <Chip
                  style={styles.categoryChip}
                  textStyle={styles.categoryChipText}
                  mode="outlined"
                >
                  {recipe.category}
                </Chip>
              )}

              <Text style={styles.recipeName}>{recipe.name}</Text>
              {recipe.description && (
                <Text style={styles.recipeDescription}>{recipe.description}</Text>
              )}

              {/* Stats */}
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>🔥</Text>
                  <Text style={styles.statValue}>{Math.round(recipe.total_calories)}</Text>
                  <Text style={styles.statLabel}>Calories</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>⏱️</Text>
                  <Text style={styles.statValue}>{recipe.prep_time_minutes || 0}</Text>
                  <Text style={styles.statLabel}>Minutes</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>👥</Text>
                  <Text style={styles.statValue}>{recipe.servings || 1}</Text>
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

              {/* Additional Info */}
              {(recipe.difficulty || recipe.cuisine_type || recipe.cook_time_minutes) && (
                <View style={styles.additionalInfo}>
                  {recipe.difficulty && (
                    <Chip
                      style={[
                        styles.infoChip,
                        { backgroundColor: `${difficultyColors[recipe.difficulty]}15` },
                      ]}
                      textStyle={{ color: difficultyColors[recipe.difficulty] }}
                    >
                      {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                    </Chip>
                  )}
                  {recipe.cuisine_type && (
                    <Chip style={styles.infoChip}>{recipe.cuisine_type}</Chip>
                  )}
                  {recipe.cook_time_minutes && (
                    <Chip style={styles.infoChip}>Cook: {recipe.cook_time_minutes}min</Chip>
                  )}
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <Card style={styles.sectionCard}>
              <Card.Content>
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
              </Card.Content>
            </Card>
          )}

          {/* Instructions */}
          {instructions.length > 0 && (
            <Card style={styles.sectionCard}>
              <Card.Content>
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
              </Card.Content>
            </Card>
          )}

          {/* Bottom CTA */}
          <Button
            mode="contained"
            onPress={handleAddToMealPlan}
            style={styles.addToMealPlanButton}
            contentStyle={styles.addToMealPlanButtonContent}
            icon="plus"
            buttonColor={colors.nutrition}
          >
            Add to Meal Plan
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    maxWidth: 480,
    marginHorizontal: 'auto' as any,
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
  },
  errorButton: {
    minWidth: 120,
  },
  heroContainer: {
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  heroPlaceholder: {
    height: 320,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholderIcon: {
    fontSize: 80,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  addButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  content: {
    paddingHorizontal: 16,
    marginTop: -32,
    paddingBottom: 24,
  },
  infoCard: {
    backgroundColor: '#fff',
    elevation: 4,
    marginBottom: 16,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryChipText: {
    textTransform: 'capitalize',
  },
  recipeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 16,
    color: '#666',
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
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.nutrition,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 16,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.nutrition,
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  additionalInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoChip: {
    backgroundColor: '#f0f0f0',
  },
  sectionCard: {
    backgroundColor: '#fff',
    elevation: 2,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
    backgroundColor: colors.nutrition,
  },
  ingredientName: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  ingredientAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
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
    backgroundColor: colors.nutrition,
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
    color: '#333',
    lineHeight: 22,
    paddingTop: 6,
  },
  addToMealPlanButton: {
    marginVertical: 8,
  },
  addToMealPlanButtonContent: {
    paddingVertical: 8,
  },
});
