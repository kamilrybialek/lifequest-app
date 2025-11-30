import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';
import { useAuthStore } from '../../../store/authStore';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

// API configuration
const THEMEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
const SPOONACULAR_API_KEY = '8b6cd47792ff4057ad699f9b0523d9df';
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

interface Recipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes?: number;
  servings?: number;
}

interface MealSlot {
  day: string;
  meal: string;
  recipe: Recipe | null;
}

export const DietDashboardScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [mealPlan, setMealPlan] = useState<MealSlot[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string; meal: string } | null>(null);

  // Initialize empty meal plan
  useEffect(() => {
    loadMealPlan();
  }, []);

  const loadMealPlan = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'meal_plans'),
        where('user_id', '==', user.id)
      );
      const snapshot = await getDocs(q);
      const meals: MealSlot[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        meals.push({
          day: data.day,
          meal: data.meal_type,
          recipe: data.recipe,
        });
      });

      setMealPlan(meals);
    } catch (error) {
      console.error('Error loading meal plan:', error);
    }
  };

  const searchRecipes = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      // Try Spoonacular first
      const response = await fetch(
        `${SPOONACULAR_BASE_URL}/recipes/complexSearch?query=${encodeURIComponent(query)}&number=12&apiKey=${SPOONACULAR_API_KEY}`
      );
      const data = await response.json();

      if (data.results) {
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to TheMealDB
      try {
        const response = await fetch(`${THEMEALDB_BASE_URL}/search.php?s=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.meals) {
          const recipes = data.meals.map((meal: any) => ({
            id: parseInt(meal.idMeal),
            title: meal.strMeal,
            image: meal.strMealThumb,
            readyInMinutes: 30,
            servings: 4,
          }));
          setSearchResults(recipes);
        }
      } catch (fallbackError) {
        console.error('Fallback search error:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const addRecipeToSlot = async (recipe: Recipe) => {
    if (!selectedSlot || !user) return;

    try {
      await addDoc(collection(db, 'meal_plans'), {
        user_id: user.id,
        day: selectedSlot.day,
        meal_type: selectedSlot.meal,
        recipe: recipe,
        created_at: new Date().toISOString(),
      });

      setMealPlan([
        ...mealPlan.filter(m => !(m.day === selectedSlot.day && m.meal === selectedSlot.meal)),
        { day: selectedSlot.day, meal: selectedSlot.meal, recipe },
      ]);

      setShowSearchModal(false);
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Error adding recipe:', error);
    }
  };

  const openSearch = (day: string, meal: string) => {
    setSelectedSlot({ day, meal });
    setShowSearchModal(true);
  };

  const getMealForSlot = (day: string, meal: string) => {
    return mealPlan.find(m => m.day === day && m.meal === meal);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weekly Meal Plan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        {/* Week Grid */}
        <View style={styles.weekGrid}>
          {DAYS.map((day) => (
            <View key={day} style={styles.dayColumn}>
              <Text style={styles.dayHeader}>{day}</Text>

              {MEALS.map((meal) => {
                const mealData = getMealForSlot(day, meal);

                return (
                  <TouchableOpacity
                    key={`${day}-${meal}`}
                    style={styles.mealSlot}
                    onPress={() => openSearch(day, meal)}
                  >
                    {mealData?.recipe ? (
                      <>
                        <Image
                          source={{ uri: mealData.recipe.image }}
                          style={styles.mealImage}
                        />
                        <Text style={styles.mealTitle} numberOfLines={2}>
                          {mealData.recipe.title}
                        </Text>
                        <Text style={styles.mealType}>{meal}</Text>
                      </>
                    ) : (
                      <>
                        <View style={styles.emptySlot}>
                          <Ionicons name="add-circle-outline" size={32} color={colors.textLight} />
                        </View>
                        <Text style={styles.emptyText}>{meal}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSearchModal(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Search Recipes for {selectedSlot?.meal}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search recipes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => searchRecipes(searchQuery)}
            />
            <TouchableOpacity onPress={() => searchRecipes(searchQuery)}>
              <Text style={styles.searchButton}>Search</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.resultsContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.diet} style={{ marginTop: 40 }} />
            ) : (
              <View style={styles.resultsGrid}>
                {searchResults.map((recipe) => (
                  <TouchableOpacity
                    key={recipe.id}
                    style={styles.recipeCard}
                    onPress={() => addRecipeToSlot(recipe)}
                  >
                    <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
                    <Text style={styles.recipeTitle} numberOfLines={2}>
                      {recipe.title}
                    </Text>
                    {recipe.readyInMinutes && (
                      <Text style={styles.recipeTime}>⏱️ {recipe.readyInMinutes} min</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  weekGrid: {
    flexDirection: 'row',
    padding: 8,
  },
  dayColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  dayHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  mealSlot: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  mealImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  mealTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  mealType: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  emptySlot: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  searchButton: {
    color: colors.diet,
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  recipeCard: {
    width: '48%',
    margin: '1%',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  recipeImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  recipeTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
