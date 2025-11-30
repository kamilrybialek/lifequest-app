import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Chip, Searchbar } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { getRecipes } from '../../database/nutrition.web';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../theme/colors';

interface Recipe {
  id: number;
  name: string;
  description?: string;
  category?: string;
  prep_time_minutes?: number;
  servings?: number;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  photo_url?: string;
  difficulty?: string;
}

const categories = [
  { id: 'all', label: 'All', icon: '🍽️' },
  { id: 'breakfast', label: 'Breakfast', icon: '🍳' },
  { id: 'lunch', label: 'Lunch', icon: '🥗' },
  { id: 'dinner', label: 'Dinner', icon: '🍲' },
  { id: 'snack', label: 'Snack', icon: '🍎' },
];

export const RecipeListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuthStore();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [selectedCategory, searchQuery, recipes]);

  const loadRecipes = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const allRecipes = await getRecipes(user.id);
      setRecipes(allRecipes as Recipe[]);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    let filtered = recipes;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((recipe) => recipe.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((recipe) =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRecipes(filtered);
  };

  const handleRecipePress = (recipe: Recipe) => {
    navigation.navigate('RecipeDetail' as never, { recipeId: recipe.id } as never);
  };

  const renderRecipeCard = (recipe: Recipe) => {
    return (
      <TouchableOpacity
        key={recipe.id}
        onPress={() => handleRecipePress(recipe)}
        style={styles.recipeCardWrapper}
      >
        <Card style={styles.recipeCard}>
          {recipe.photo_url && (
            <Card.Cover source={{ uri: recipe.photo_url }} style={styles.recipeImage} />
          )}
          {!recipe.photo_url && (
            <View style={styles.recipePlaceholder}>
              <Text style={styles.recipePlaceholderIcon}>🍽️</Text>
            </View>
          )}

          {recipe.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{recipe.category}</Text>
            </View>
          )}

          <Card.Content style={styles.recipeContent}>
            <Text style={styles.recipeName} numberOfLines={1}>
              {recipe.name}
            </Text>
            <Text style={styles.recipeDescription} numberOfLines={2}>
              {recipe.description || 'No description'}
            </Text>

            <View style={styles.recipeStats}>
              <View style={styles.recipeStat}>
                <Text style={styles.recipeStatIcon}>🔥</Text>
                <Text style={styles.recipeStatValue}>{Math.round(recipe.total_calories)}</Text>
                <Text style={styles.recipeStatLabel}>kcal</Text>
              </View>

              <View style={styles.recipeStat}>
                <Text style={styles.recipeStatIcon}>⏱️</Text>
                <Text style={styles.recipeStatValue}>{recipe.prep_time_minutes || 0}</Text>
                <Text style={styles.recipeStatLabel}>min</Text>
              </View>

              <View style={styles.recipeStat}>
                <Text style={styles.recipeStatIcon}>👥</Text>
                <Text style={styles.recipeStatValue}>{recipe.servings || 1}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Recipes</Text>

          {/* Search */}
          <Searchbar
            placeholder="Search for recipes..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={colors.nutrition}
          />
        </View>

        <View style={styles.content}>
          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <Chip
                key={category.id}
                selected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipSelected,
                ]}
                textStyle={[
                  styles.categoryChipText,
                  selectedCategory === category.id && styles.categoryChipTextSelected,
                ]}
                mode={selectedCategory === category.id ? 'flat' : 'outlined'}
                selectedColor={selectedCategory === category.id ? '#fff' : colors.nutrition}
              >
                {category.icon} {category.label}
              </Chip>
            ))}
          </ScrollView>

          {/* Results Header */}
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {searchQuery
                ? 'Search Results'
                : selectedCategory === 'all'
                ? 'All Recipes'
                : categories.find((c) => c.id === selectedCategory)?.label || 'Recipes'}
            </Text>
            <Text style={styles.resultsCount}>{filteredRecipes.length} recipes</Text>
          </View>

          {/* Recipe Grid */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading recipes...</Text>
            </View>
          ) : filteredRecipes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🍳</Text>
              <Text style={styles.emptyText}>No recipes found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery
                  ? 'Try a different search term'
                  : 'Add recipes from the Admin panel'}
              </Text>
            </View>
          ) : (
            <View style={styles.recipeGrid}>
              {filteredRecipes.map((recipe) => renderRecipeCard(recipe))}
            </View>
          )}
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
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  searchBar: {
    backgroundColor: '#f9f9f9',
    elevation: 0,
  },
  content: {
    paddingHorizontal: 16,
  },
  categoriesContainer: {
    marginVertical: 16,
  },
  categoriesContent: {
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#f9f9f9',
    borderColor: '#e0e0e0',
  },
  categoryChipSelected: {
    backgroundColor: colors.nutrition,
  },
  categoryChipText: {
    color: '#666',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
  },
  recipeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 24,
  },
  recipeCardWrapper: {
    width: '48%',
  },
  recipeCard: {
    backgroundColor: '#fff',
    elevation: 2,
    overflow: 'hidden',
  },
  recipeImage: {
    height: 140,
  },
  recipePlaceholder: {
    height: 140,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipePlaceholderIcon: {
    fontSize: 48,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  recipeContent: {
    paddingTop: 12,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  recipeDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    minHeight: 32,
  },
  recipeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  recipeStatIcon: {
    fontSize: 12,
  },
  recipeStatValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.nutrition,
  },
  recipeStatLabel: {
    fontSize: 11,
    color: '#666',
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
