import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { getRecipes } from '../../database/nutrition.web';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Search, Clock, Users, Flame } from 'lucide-react-native';

const LOVABLE_COLORS = {
  primary: '#FA7D09',
  primaryLight: 'rgba(250, 125, 9, 0.05)',
  background: '#ECF2F7',
  card: '#F5F8FA',
  foreground: '#1A202C',
  mutedForeground: '#718096',
  border: '#CBD5E0',
};

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
  { id: 'all', label: 'All' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
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

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((recipe) => recipe.category === selectedCategory);
    }

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
        <View style={styles.recipeCard}>
          {/* Image */}
          <View style={styles.recipeImageContainer}>
            {recipe.photo_url ? (
              <View style={styles.recipeImage}>
                <Text style={styles.recipeImagePlaceholder}>🍽️</Text>
              </View>
            ) : (
              <View style={styles.recipeImagePlaceholder}>
                <Text style={styles.recipeImageEmoji}>🍽️</Text>
              </View>
            )}

            {/* Category Badge */}
            {recipe.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{recipe.category}</Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.recipeContent}>
            <Text style={styles.recipeName} numberOfLines={1}>
              {recipe.name}
            </Text>
            <Text style={styles.recipeDescription} numberOfLines={2}>
              {recipe.description || 'No description'}
            </Text>

            {/* Stats */}
            <View style={styles.recipeStats}>
              <View style={styles.recipeStat}>
                <Flame color={LOVABLE_COLORS.primary} size={14} />
                <Text style={styles.recipeStatValue}>{Math.round(recipe.total_calories)}</Text>
                <Text style={styles.recipeStatLabel}>kcal</Text>
              </View>

              <View style={styles.recipeStat}>
                <Clock color={LOVABLE_COLORS.mutedForeground} size={14} />
                <Text style={styles.recipeStatMuted}>{recipe.prep_time_minutes || 0} min</Text>
              </View>

              <View style={styles.recipeStat}>
                <Users color={LOVABLE_COLORS.mutedForeground} size={14} />
                <Text style={styles.recipeStatMuted}>{recipe.servings || 1}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Recipes</Text>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Search
              color={LOVABLE_COLORS.mutedForeground}
              size={20}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search for recipes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor={LOVABLE_COLORS.mutedForeground}
            />
          </View>
        </View>

        <View style={styles.content}>
          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;

              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextSelected,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Loading recipes...</Text>
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
    backgroundColor: LOVABLE_COLORS.background,
    maxWidth: 448,
    marginHorizontal: 'auto' as any,
    width: '100%',
  },
  header: {
    backgroundColor: LOVABLE_COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 16,
    color: LOVABLE_COLORS.foreground,
  },
  searchContainer: {
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: LOVABLE_COLORS.card,
    borderRadius: 8,
    paddingLeft: 44,
    paddingRight: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: LOVABLE_COLORS.foreground,
    outlineStyle: 'none' as any,
  },
  content: {
    paddingHorizontal: 16,
  },
  categoriesContainer: {
    marginVertical: 24,
  },
  categoriesContent: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: LOVABLE_COLORS.card,
    borderWidth: 1,
    borderColor: LOVABLE_COLORS.border,
  },
  categoryChipSelected: {
    backgroundColor: LOVABLE_COLORS.primary,
    borderColor: LOVABLE_COLORS.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: LOVABLE_COLORS.foreground,
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
    color: LOVABLE_COLORS.foreground,
  },
  resultsCount: {
    fontSize: 14,
    color: LOVABLE_COLORS.mutedForeground,
  },
  recipeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 80,
  },
  recipeCardWrapper: {
    width: '48%',
  },
  recipeCard: {
    backgroundColor: LOVABLE_COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  recipeImageContainer: {
    position: 'relative',
    width: '100%',
  },
  recipeImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeImagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeImageEmoji: {
    fontSize: 48,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(8px)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: LOVABLE_COLORS.foreground,
    textTransform: 'capitalize',
  },
  recipeContent: {
    padding: 16,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: LOVABLE_COLORS.foreground,
  },
  recipeDescription: {
    fontSize: 12,
    color: LOVABLE_COLORS.mutedForeground,
    marginBottom: 16,
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
    gap: 4,
  },
  recipeStatValue: {
    fontSize: 12,
    fontWeight: '600',
    color: LOVABLE_COLORS.primary,
  },
  recipeStatLabel: {
    fontSize: 11,
    color: LOVABLE_COLORS.mutedForeground,
  },
  recipeStatMuted: {
    fontSize: 12,
    color: LOVABLE_COLORS.mutedForeground,
  },
  emptyContainer: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: LOVABLE_COLORS.foreground,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: LOVABLE_COLORS.mutedForeground,
    textAlign: 'center',
  },
});
