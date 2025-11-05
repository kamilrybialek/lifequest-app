import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { shadows } from '../../../theme/theme';
import { useAuthStore } from '../../../store/authStore';
import {
  logMeal,
  getMeals,
  deleteMeal,
  getDailyNutritionSummary,
  addFoodItem,
  searchFoodItems,
} from '../../../database/nutrition';

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: '🍳', color: '#FF9500' },
  { id: 'lunch', label: 'Lunch', icon: '🥗', color: '#58CC02' },
  { id: 'dinner', label: 'Dinner', icon: '🍽️', color: '#FF4B4B' },
  { id: 'snack', label: 'Snack', icon: '🍎', color: '#1CB0F6' },
];

export const MealLoggerScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [meals, setMeals] = useState<any[]>([]);
  const [dailySummary, setDailySummary] = useState<any>(null);
  const today = new Date().toISOString().split('T')[0];

  // Add Meal Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [notes, setNotes] = useState('');

  // Search food items
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    loadMealsData();
  }, []);

  const loadMealsData = async () => {
    if (!user?.id) return;

    try {
      const [todayMeals, summary] = await Promise.all([
        getMeals(user.id, today, today),
        getDailyNutritionSummary(user.id, today),
      ]);

      setMeals(todayMeals);
      setDailySummary(summary);
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  const handleSearchFood = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchFoodItems(searchQuery, 10);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching food:', error);
    }
  };

  const handleSelectFoodItem = (food: any) => {
    setMealName(food.name);
    setCalories(food.calories?.toString() || '');
    setProtein(food.protein?.toString() || '');
    setCarbs(food.carbs?.toString() || '');
    setFat(food.fat?.toString() || '');
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleAddMeal = async () => {
    if (!user?.id || !mealName.trim()) {
      Alert.alert('Missing Info', 'Please enter a meal name.');
      return;
    }

    const mealCalories = parseFloat(calories) || 0;
    const mealProtein = parseFloat(protein) || 0;
    const mealCarbs = parseFloat(carbs) || 0;
    const mealFat = parseFloat(fat) || 0;

    try {
      // First, add as food item if doesn't exist
      const foodItemId = await addFoodItem({
        name: mealName,
        calories: mealCalories,
        protein: mealProtein,
        carbs: mealCarbs,
        fat: mealFat,
        created_by: user.id,
      });

      // Then log the meal
      const now = new Date();
      await logMeal(
        user.id,
        {
          meal_type: selectedMealType,
          meal_date: today,
          meal_time: now.toTimeString().slice(0, 5),
          notes,
        },
        [
          {
            food_item_id: foodItemId,
            quantity: 1,
            servings: 1,
          },
        ]
      );

      // Reload data
      await loadMealsData();

      // Reset form
      setMealName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setNotes('');
      setShowAddModal(false);

      Alert.alert('Meal Logged! ✅', `${mealName} added to ${selectedMealType}`);
    } catch (error) {
      console.error('Error adding meal:', error);
      Alert.alert('Error', 'Failed to log meal. Please try again.');
    }
  };

  const handleDeleteMeal = async (mealId: number, mealName: string) => {
    Alert.alert(
      'Delete Meal',
      `Are you sure you want to delete "${mealName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMeal(mealId);
              await loadMealsData();
              Alert.alert('Deleted', 'Meal removed successfully');
            } catch (error) {
              console.error('Error deleting meal:', error);
              Alert.alert('Error', 'Failed to delete meal');
            }
          },
        },
      ]
    );
  };

  const getMealTypeIcon = (mealType: string) => {
    return MEAL_TYPES.find((t) => t.id === mealType)?.icon || '🍽️';
  };

  const getMealTypeColor = (mealType: string) => {
    return MEAL_TYPES.find((t) => t.id === mealType)?.color || colors.nutrition;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🍽️ Meal Logger</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={colors.nutrition} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Daily Summary Card */}
        {dailySummary && (
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Today's Nutrition</Text>
            <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>

            <View style={styles.macrosGrid}>
              <View style={styles.macroCard}>
                <Text style={styles.macroIcon}>🔥</Text>
                <Text style={styles.macroValue}>{dailySummary.total_calories || 0}</Text>
                <Text style={styles.macroLabel}>Calories</Text>
              </View>

              <View style={styles.macroCard}>
                <Text style={styles.macroIcon}>🥩</Text>
                <Text style={styles.macroValue}>{dailySummary.total_protein || 0}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
              </View>

              <View style={styles.macroCard}>
                <Text style={styles.macroIcon}>🍞</Text>
                <Text style={styles.macroValue}>{dailySummary.total_carbs || 0}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
              </View>

              <View style={styles.macroCard}>
                <Text style={styles.macroIcon}>🥑</Text>
                <Text style={styles.macroValue}>{dailySummary.total_fat || 0}g</Text>
                <Text style={styles.macroLabel}>Fat</Text>
              </View>
            </View>

            <View style={styles.mealsCount}>
              <Text style={styles.mealsCountText}>
                {dailySummary.meals_logged || 0} meals logged today
              </Text>
            </View>
          </View>
        )}

        {/* Today's Meals */}
        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>

          {meals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🍽️</Text>
              <Text style={styles.emptyStateText}>No meals logged yet</Text>
              <Text style={styles.emptyStateSubtext}>Tap the + button to add your first meal</Text>
            </View>
          ) : (
            <View style={styles.mealsList}>
              {meals.map((meal) => (
                <View key={meal.id} style={styles.mealCard}>
                  <View style={styles.mealHeader}>
                    <View style={styles.mealTypeRow}>
                      <View
                        style={[
                          styles.mealTypeIcon,
                          { backgroundColor: getMealTypeColor(meal.meal_type) + '20' },
                        ]}
                      >
                        <Text style={styles.mealTypeEmoji}>{getMealTypeIcon(meal.meal_type)}</Text>
                      </View>
                      <View style={styles.mealInfo}>
                        <Text style={styles.mealType}>
                          {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
                        </Text>
                        <Text style={styles.mealTime}>{meal.meal_time || 'Recently'}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteMeal(meal.id, meal.meal_type)}
                      style={styles.deleteButton}
                    >
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.mealNutrition}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{meal.total_calories || 0} cal</Text>
                    </View>
                    <View style={styles.nutritionDivider} />
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{meal.total_protein || 0}g protein</Text>
                    </View>
                    <View style={styles.nutritionDivider} />
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{meal.total_carbs || 0}g carbs</Text>
                    </View>
                    <View style={styles.nutritionDivider} />
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{meal.total_fat || 0}g fat</Text>
                    </View>
                  </View>

                  {meal.notes && (
                    <Text style={styles.mealNotes}>📝 {meal.notes}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Meal Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Meal</Text>
            <TouchableOpacity onPress={handleAddMeal}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Meal Type Selection */}
            <Text style={styles.inputLabel}>Meal Type</Text>
            <View style={styles.mealTypesRow}>
              {MEAL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.mealTypeButton,
                    selectedMealType === type.id && styles.mealTypeButtonActive,
                    { borderColor: type.color },
                    selectedMealType === type.id && { backgroundColor: type.color + '20' },
                  ]}
                  onPress={() => setSelectedMealType(type.id as any)}
                >
                  <Text style={styles.mealTypeButtonEmoji}>{type.icon}</Text>
                  <Text style={styles.mealTypeButtonText}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Search Food Database */}
            <Text style={styles.inputLabel}>Search Food Database</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a food item..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchFood}
              />
              <TouchableOpacity onPress={handleSearchFood} style={styles.searchButton}>
                <Ionicons name="search" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {searchResults.length > 0 && (
              <View style={styles.searchResults}>
                {searchResults.map((food) => (
                  <TouchableOpacity
                    key={food.id}
                    style={styles.searchResultItem}
                    onPress={() => handleSelectFoodItem(food)}
                  >
                    <Text style={styles.searchResultName}>{food.name}</Text>
                    <Text style={styles.searchResultInfo}>
                      {food.calories} cal | {food.protein}g protein
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Manual Entry */}
            <Text style={styles.inputLabel}>Meal Name</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., Chicken Salad"
              value={mealName}
              onChangeText={setMealName}
            />

            <Text style={styles.inputLabel}>Calories</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., 450"
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
            />

            <View style={styles.macrosRow}>
              <View style={styles.macroInput}>
                <Text style={styles.inputLabel}>Protein (g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="25"
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.macroInput}>
                <Text style={styles.inputLabel}>Carbs (g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="30"
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.macroInput}>
                <Text style={styles.inputLabel}>Fat (g)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="15"
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any notes about this meal..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    padding: 4,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...shadows.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  macroCard: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  macroIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  macroLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  mealsCount: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  mealsCountText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  mealsSection: {
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    ...shadows.small,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  mealsList: {
    gap: 12,
  },
  mealCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    ...shadows.small,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTypeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mealTypeEmoji: {
    fontSize: 24,
  },
  mealInfo: {
    justifyContent: 'center',
  },
  mealType: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  mealTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  deleteButton: {
    padding: 8,
  },
  mealNutrition: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nutritionItem: {
    flex: 1,
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  nutritionDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
  },
  mealNotes: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalCancel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.nutrition,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  mealTypesRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  mealTypeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  mealTypeButtonActive: {
    borderWidth: 2,
  },
  mealTypeButtonEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  mealTypeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
  },
  searchButton: {
    padding: 14,
  },
  searchResults: {
    backgroundColor: colors.background,
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    ...shadows.small,
  },
  searchResultItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  searchResultInfo: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroInput: {
    flex: 1,
  },
});
