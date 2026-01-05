import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import {
  COMMON_INGREDIENTS,
  INGREDIENTS_BY_CATEGORY,
  CATEGORY_LABELS,
  Ingredient,
} from '../../data/ingredients';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@lifequest_selected_ingredients';

interface IngredientSelectorProps {
  onIngredientsSelected: (ingredients: string[]) => void;
  onSearchRecipes: (ingredients: string[]) => void;
}

export const IngredientSelector: React.FC<IngredientSelectorProps> = ({
  onIngredientsSelected,
  onSearchRecipes,
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['protein', 'vegetable']) // Start with these expanded
  );

  // Load saved ingredients on mount
  useEffect(() => {
    loadSavedIngredients();
  }, []);

  // Save ingredients whenever selection changes
  useEffect(() => {
    saveIngredients();
    onIngredientsSelected(Array.from(selectedIngredients));
  }, [selectedIngredients]);

  const loadSavedIngredients = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSelectedIngredients(new Set(parsed));
      }
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  };

  const saveIngredients = async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(Array.from(selectedIngredients))
      );
    } catch (error) {
      console.error('Error saving ingredients:', error);
    }
  };

  const toggleIngredient = (ingredientId: string) => {
    const newSelected = new Set(selectedIngredients);
    if (newSelected.has(ingredientId)) {
      newSelected.delete(ingredientId);
    } else {
      newSelected.add(ingredientId);
    }
    setSelectedIngredients(newSelected);
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const clearAll = () => {
    Alert.alert('Clear All', 'Remove all selected ingredients?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => setSelectedIngredients(new Set()),
      },
    ]);
  };

  const handleSearchRecipes = () => {
    if (selectedIngredients.size === 0) {
      Alert.alert('No Ingredients', 'Please select at least one ingredient first');
      return;
    }
    onSearchRecipes(Array.from(selectedIngredients));
  };

  const renderCategory = (categoryKey: keyof typeof INGREDIENTS_BY_CATEGORY) => {
    const category = INGREDIENTS_BY_CATEGORY[categoryKey];
    const label = CATEGORY_LABELS[categoryKey];
    const isExpanded = expandedCategories.has(categoryKey);
    const selectedCount = category.filter((i) => selectedIngredients.has(i.id)).length;

    return (
      <View key={categoryKey} style={styles.categoryContainer}>
        {/* Category Header */}
        <TouchableOpacity
          style={styles.categoryHeader}
          onPress={() => toggleCategory(categoryKey)}
        >
          <View style={styles.categoryHeaderLeft}>
            <Text style={styles.categoryIcon}>{label.icon}</Text>
            <View>
              <Text style={styles.categoryTitle}>{label.en}</Text>
              <Text style={styles.categorySubtitle}>
                {selectedCount > 0 ? `${selectedCount} selected` : 'None selected'}
              </Text>
            </View>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Ingredients Grid */}
        {isExpanded && (
          <View style={styles.ingredientsGrid}>
            {category.map((ingredient) => {
              const isSelected = selectedIngredients.has(ingredient.id);
              return (
                <TouchableOpacity
                  key={ingredient.id}
                  style={[
                    styles.ingredientChip,
                    isSelected && styles.ingredientChipSelected,
                  ]}
                  onPress={() => toggleIngredient(ingredient.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.ingredientIcon}>{ingredient.icon}</Text>
                  <Text
                    style={[
                      styles.ingredientName,
                      isSelected && styles.ingredientNameSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {ingredient.name}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>🥘</Text>
          <View>
            <Text style={styles.headerTitle}>My Ingredients</Text>
            <Text style={styles.headerSubtitle}>
              Select what you have in your fridge
            </Text>
          </View>
        </View>
        {selectedIngredients.size > 0 && (
          <TouchableOpacity onPress={clearAll} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Selected Count Badge */}
      {selectedIngredients.size > 0 && (
        <View style={styles.selectedBadge}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.selectedBadgeText}>
            {selectedIngredients.size} ingredient{selectedIngredients.size !== 1 ? 's' : ''} selected
          </Text>
        </View>
      )}

      {/* Categories List */}
      <ScrollView style={styles.categoriesList} showsVerticalScrollIndicator={false}>
        {(Object.keys(INGREDIENTS_BY_CATEGORY) as Array<keyof typeof INGREDIENTS_BY_CATEGORY>).map(
          renderCategory
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Search Button */}
      {selectedIngredients.size > 0 && (
        <View style={styles.searchButtonContainer}>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearchRecipes}>
            <Ionicons name="search" size={24} color="#FFF" />
            <Text style={styles.searchButtonText}>Find Recipes</Text>
            <View style={styles.searchBadge}>
              <Text style={styles.searchBadgeText}>{selectedIngredients.size}</Text>
            </View>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  headerIcon: {
    fontSize: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  clearButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success + '15',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  selectedBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  categoriesList: {
    flex: 1,
  },
  categoryContainer: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  categorySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.sm,
  },
  ingredientChip: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  ingredientChipSelected: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  ingredientIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  ingredientName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  ingredientNameSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  checkmark: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  searchButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  searchBadge: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
