/**
 * LifeQuest V4 - Diet Planner Screen
 * Weekly meal calendar, recipe suggestions, nutrition breakdown,
 * shopping list generation, and dietary preferences
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme/theme.v4';

const { width } = Dimensions.get('window');

// ============================================================================
// TYPES & DATA
// ============================================================================

type DietPreference = 'balanced' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'mediterranean';

interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number; // minutes
  ingredients: string[];
  tags: string[];
}

interface DayPlan {
  day: string;
  dayShort: string;
  meals: Meal[];
}

const DIET_PREFERENCES: { key: DietPreference; label: string; description: string }[] = [
  { key: 'balanced', label: 'Balanced', description: 'Well-rounded nutrition' },
  { key: 'vegetarian', label: 'Vegetarian', description: 'No meat, includes dairy & eggs' },
  { key: 'vegan', label: 'Vegan', description: 'Fully plant-based' },
  { key: 'keto', label: 'Keto', description: 'High fat, low carb' },
  { key: 'paleo', label: 'Paleo', description: 'Whole foods, no grains' },
  { key: 'mediterranean', label: 'Mediterranean', description: 'Heart-healthy, olive oil' },
];

// Mock meal data - in production this would come from Edamam/Spoonacular APIs
const MOCK_MEALS: Record<string, Meal[]> = {
  balanced: [
    { id: 'b1', name: 'Greek Yogurt Parfait', type: 'breakfast', calories: 320, protein: 22, carbs: 38, fat: 10, prepTime: 5, ingredients: ['Greek yogurt', 'Granola', 'Mixed berries', 'Honey'], tags: ['quick', 'high-protein'] },
    { id: 'b2', name: 'Oatmeal with Banana', type: 'breakfast', calories: 290, protein: 8, carbs: 52, fat: 6, prepTime: 10, ingredients: ['Oats', 'Banana', 'Almond milk', 'Cinnamon'], tags: ['fiber', 'whole-grain'] },
    { id: 'b3', name: 'Avocado Toast with Eggs', type: 'breakfast', calories: 380, protein: 18, carbs: 30, fat: 22, prepTime: 10, ingredients: ['Whole wheat bread', 'Avocado', 'Eggs', 'Salt', 'Pepper'], tags: ['protein', 'healthy-fats'] },
    { id: 'l1', name: 'Grilled Chicken Salad', type: 'lunch', calories: 420, protein: 38, carbs: 22, fat: 20, prepTime: 15, ingredients: ['Chicken breast', 'Mixed greens', 'Cherry tomatoes', 'Cucumber', 'Olive oil'], tags: ['high-protein', 'low-carb'] },
    { id: 'l2', name: 'Quinoa Buddha Bowl', type: 'lunch', calories: 450, protein: 16, carbs: 58, fat: 18, prepTime: 20, ingredients: ['Quinoa', 'Roasted chickpeas', 'Sweet potato', 'Kale', 'Tahini'], tags: ['plant-based', 'fiber'] },
    { id: 'l3', name: 'Turkey Wrap', type: 'lunch', calories: 380, protein: 28, carbs: 35, fat: 14, prepTime: 10, ingredients: ['Whole wheat tortilla', 'Turkey', 'Spinach', 'Hummus', 'Tomato'], tags: ['quick', 'balanced'] },
    { id: 'd1', name: 'Salmon with Vegetables', type: 'dinner', calories: 480, protein: 35, carbs: 28, fat: 24, prepTime: 25, ingredients: ['Salmon fillet', 'Broccoli', 'Brown rice', 'Lemon', 'Garlic'], tags: ['omega-3', 'anti-inflammatory'] },
    { id: 'd2', name: 'Chicken Stir Fry', type: 'dinner', calories: 440, protein: 32, carbs: 40, fat: 16, prepTime: 20, ingredients: ['Chicken breast', 'Mixed vegetables', 'Soy sauce', 'Ginger', 'Rice'], tags: ['quick', 'high-protein'] },
    { id: 'd3', name: 'Lean Beef Tacos', type: 'dinner', calories: 460, protein: 30, carbs: 38, fat: 20, prepTime: 20, ingredients: ['Lean ground beef', 'Corn tortillas', 'Lettuce', 'Tomato', 'Cheese'], tags: ['protein', 'family-friendly'] },
    { id: 's1', name: 'Apple & Almond Butter', type: 'snack', calories: 200, protein: 5, carbs: 22, fat: 12, prepTime: 2, ingredients: ['Apple', 'Almond butter'], tags: ['quick', 'fiber'] },
    { id: 's2', name: 'Protein Smoothie', type: 'snack', calories: 250, protein: 20, carbs: 30, fat: 6, prepTime: 5, ingredients: ['Protein powder', 'Banana', 'Spinach', 'Almond milk'], tags: ['high-protein', 'quick'] },
    { id: 's3', name: 'Mixed Nuts', type: 'snack', calories: 180, protein: 6, carbs: 8, fat: 16, prepTime: 0, ingredients: ['Almonds', 'Walnuts', 'Cashews'], tags: ['healthy-fats', 'no-prep'] },
  ],
  keto: [
    { id: 'kb1', name: 'Bacon & Egg Cups', type: 'breakfast', calories: 380, protein: 24, carbs: 2, fat: 30, prepTime: 15, ingredients: ['Bacon', 'Eggs', 'Cheese', 'Chives'], tags: ['keto', 'high-fat'] },
    { id: 'kl1', name: 'Cobb Salad', type: 'lunch', calories: 500, protein: 35, carbs: 8, fat: 38, prepTime: 15, ingredients: ['Chicken', 'Bacon', 'Avocado', 'Egg', 'Blue cheese', 'Greens'], tags: ['keto', 'satisfying'] },
    { id: 'kd1', name: 'Butter Steak with Asparagus', type: 'dinner', calories: 550, protein: 42, carbs: 6, fat: 40, prepTime: 20, ingredients: ['Ribeye steak', 'Butter', 'Asparagus', 'Garlic'], tags: ['keto', 'high-protein'] },
    { id: 'ks1', name: 'Cheese & Olives', type: 'snack', calories: 200, protein: 8, carbs: 2, fat: 18, prepTime: 0, ingredients: ['Cheddar cheese', 'Green olives'], tags: ['keto', 'no-prep'] },
  ],
  vegan: [
    { id: 'vb1', name: 'Smoothie Bowl', type: 'breakfast', calories: 350, protein: 12, carbs: 55, fat: 10, prepTime: 10, ingredients: ['Frozen berries', 'Banana', 'Plant milk', 'Chia seeds', 'Granola'], tags: ['vegan', 'antioxidants'] },
    { id: 'vl1', name: 'Lentil Soup', type: 'lunch', calories: 380, protein: 20, carbs: 52, fat: 8, prepTime: 30, ingredients: ['Red lentils', 'Onion', 'Carrot', 'Cumin', 'Vegetable broth'], tags: ['vegan', 'fiber'] },
    { id: 'vd1', name: 'Tofu Stir Fry', type: 'dinner', calories: 420, protein: 22, carbs: 45, fat: 16, prepTime: 20, ingredients: ['Firm tofu', 'Broccoli', 'Bell pepper', 'Soy sauce', 'Brown rice'], tags: ['vegan', 'protein'] },
    { id: 'vs1', name: 'Hummus & Veggies', type: 'snack', calories: 180, protein: 6, carbs: 20, fat: 10, prepTime: 5, ingredients: ['Hummus', 'Carrot sticks', 'Celery', 'Bell pepper'], tags: ['vegan', 'fiber'] },
  ],
  vegetarian: [
    { id: 'vtb1', name: 'Veggie Omelette', type: 'breakfast', calories: 340, protein: 22, carbs: 12, fat: 24, prepTime: 10, ingredients: ['Eggs', 'Spinach', 'Mushrooms', 'Cheese', 'Tomato'], tags: ['vegetarian', 'protein'] },
    { id: 'vtl1', name: 'Caprese Sandwich', type: 'lunch', calories: 400, protein: 18, carbs: 40, fat: 20, prepTime: 10, ingredients: ['Ciabatta', 'Fresh mozzarella', 'Tomato', 'Basil', 'Balsamic'], tags: ['vegetarian', 'quick'] },
    { id: 'vtd1', name: 'Eggplant Parmesan', type: 'dinner', calories: 460, protein: 20, carbs: 38, fat: 26, prepTime: 35, ingredients: ['Eggplant', 'Marinara sauce', 'Mozzarella', 'Parmesan', 'Breadcrumbs'], tags: ['vegetarian', 'comfort'] },
    { id: 'vts1', name: 'Greek Yogurt & Honey', type: 'snack', calories: 160, protein: 14, carbs: 18, fat: 4, prepTime: 2, ingredients: ['Greek yogurt', 'Honey', 'Walnuts'], tags: ['vegetarian', 'protein'] },
  ],
  paleo: [
    { id: 'pb1', name: 'Sweet Potato Hash', type: 'breakfast', calories: 360, protein: 20, carbs: 32, fat: 18, prepTime: 15, ingredients: ['Sweet potato', 'Eggs', 'Onion', 'Bell pepper', 'Avocado oil'], tags: ['paleo', 'whole-food'] },
    { id: 'pl1', name: 'Grilled Chicken & Avocado', type: 'lunch', calories: 450, protein: 36, carbs: 14, fat: 28, prepTime: 15, ingredients: ['Chicken breast', 'Avocado', 'Mixed greens', 'Lemon', 'Olive oil'], tags: ['paleo', 'high-protein'] },
    { id: 'pd1', name: 'Herb Roasted Pork Chops', type: 'dinner', calories: 480, protein: 38, carbs: 18, fat: 28, prepTime: 25, ingredients: ['Pork chops', 'Rosemary', 'Sweet potato', 'Green beans', 'Olive oil'], tags: ['paleo', 'savory'] },
    { id: 'ps1', name: 'Trail Mix', type: 'snack', calories: 190, protein: 6, carbs: 14, fat: 14, prepTime: 0, ingredients: ['Almonds', 'Dried cranberries', 'Pumpkin seeds', 'Dark chocolate chips'], tags: ['paleo', 'no-prep'] },
  ],
  mediterranean: [
    { id: 'mb1', name: 'Shakshuka', type: 'breakfast', calories: 340, protein: 18, carbs: 24, fat: 20, prepTime: 20, ingredients: ['Eggs', 'Tomato sauce', 'Bell pepper', 'Onion', 'Feta', 'Cumin'], tags: ['mediterranean', 'savory'] },
    { id: 'ml1', name: 'Greek Salad with Falafel', type: 'lunch', calories: 420, protein: 16, carbs: 42, fat: 22, prepTime: 15, ingredients: ['Falafel', 'Cucumber', 'Tomato', 'Feta', 'Olives', 'Pita'], tags: ['mediterranean', 'fiber'] },
    { id: 'md1', name: 'Baked Sea Bass', type: 'dinner', calories: 460, protein: 36, carbs: 26, fat: 24, prepTime: 25, ingredients: ['Sea bass', 'Cherry tomatoes', 'Olives', 'Capers', 'Olive oil', 'Orzo'], tags: ['mediterranean', 'omega-3'] },
    { id: 'ms1', name: 'Dates & Almonds', type: 'snack', calories: 170, protein: 4, carbs: 26, fat: 8, prepTime: 0, ingredients: ['Medjool dates', 'Almonds'], tags: ['mediterranean', 'natural-sugar'] },
  ],
};

const DAYS_OF_WEEK = [
  { day: 'Monday', dayShort: 'Mon' },
  { day: 'Tuesday', dayShort: 'Tue' },
  { day: 'Wednesday', dayShort: 'Wed' },
  { day: 'Thursday', dayShort: 'Thu' },
  { day: 'Friday', dayShort: 'Fri' },
  { day: 'Saturday', dayShort: 'Sat' },
  { day: 'Sunday', dayShort: 'Sun' },
];

// ============================================================================
// HELPER: Generate weekly plan
// ============================================================================

const generateWeeklyPlan = (preference: DietPreference): DayPlan[] => {
  const meals = MOCK_MEALS[preference] || MOCK_MEALS.balanced;
  const breakfasts = meals.filter((m) => m.type === 'breakfast');
  const lunches = meals.filter((m) => m.type === 'lunch');
  const dinners = meals.filter((m) => m.type === 'dinner');
  const snacks = meals.filter((m) => m.type === 'snack');

  return DAYS_OF_WEEK.map((dayInfo, i) => ({
    ...dayInfo,
    meals: [
      breakfasts[i % breakfasts.length],
      lunches[i % lunches.length],
      dinners[i % dinners.length],
      snacks[i % snacks.length],
    ],
  }));
};

const generateGroceryList = (plan: DayPlan[]): Record<string, number> => {
  const ingredients: Record<string, number> = {};
  plan.forEach((day) => {
    day.meals.forEach((meal) => {
      meal.ingredients.forEach((ing) => {
        ingredients[ing] = (ingredients[ing] || 0) + 1;
      });
    });
  });
  return ingredients;
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const PreferenceSelector = ({
  selected,
  onSelect,
}: {
  selected: DietPreference;
  onSelect: (pref: DietPreference) => void;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Diet Preference</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.prefRow}>
      {DIET_PREFERENCES.map((pref) => (
        <TouchableOpacity
          key={pref.key}
          style={[styles.prefChip, selected === pref.key && styles.prefChipActive]}
          onPress={() => onSelect(pref.key)}
        >
          <Text style={[styles.prefChipLabel, selected === pref.key && styles.prefChipLabelActive]}>
            {pref.label}
          </Text>
          <Text style={[styles.prefChipDesc, selected === pref.key && styles.prefChipDescActive]}>
            {pref.description}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const WeeklyCalendar = ({
  plan,
  selectedDay,
  onSelectDay,
}: {
  plan: DayPlan[];
  selectedDay: number;
  onSelectDay: (index: number) => void;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Weekly Meal Plan</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarRow}>
      {plan.map((day, index) => {
        const totalCal = day.meals.reduce((s, m) => s + m.calories, 0);
        const isSelected = selectedDay === index;
        return (
          <TouchableOpacity
            key={day.day}
            style={[styles.dayCard, isSelected && styles.dayCardActive]}
            onPress={() => onSelectDay(index)}
          >
            <Text style={[styles.dayShort, isSelected && styles.dayShortActive]}>{day.dayShort}</Text>
            <Text style={[styles.dayCalories, isSelected && styles.dayCaloriesActive]}>{totalCal}</Text>
            <Text style={[styles.dayCalLabel, isSelected && styles.dayCalLabelActive]}>cal</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

const MealCard = ({ meal }: { meal: Meal }) => {
  const mealTypeLabels: Record<string, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
  };
  const mealTypeColors: Record<string, string> = {
    breakfast: '#FFC800',
    lunch: '#58CC02',
    dinner: '#1CB0F6',
    snack: '#CE82FF',
  };

  return (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View style={[styles.mealTypeBadge, { backgroundColor: mealTypeColors[meal.type] + '20' }]}>
          <Text style={[styles.mealTypeText, { color: mealTypeColors[meal.type] }]}>
            {mealTypeLabels[meal.type]}
          </Text>
        </View>
        <Text style={styles.mealPrepTime}>{meal.prepTime} min</Text>
      </View>
      <Text style={styles.mealName}>{meal.name}</Text>
      <View style={styles.macroRow}>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{meal.calories}</Text>
          <Text style={styles.macroLabel}>cal</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={[styles.macroValue, { color: '#FF4B4B' }]}>{meal.protein}g</Text>
          <Text style={styles.macroLabel}>protein</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={[styles.macroValue, { color: '#FFC800' }]}>{meal.carbs}g</Text>
          <Text style={styles.macroLabel}>carbs</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={[styles.macroValue, { color: '#1CB0F6' }]}>{meal.fat}g</Text>
          <Text style={styles.macroLabel}>fat</Text>
        </View>
      </View>
      <View style={styles.ingredientsList}>
        {meal.ingredients.map((ing, i) => (
          <View key={i} style={styles.ingredientChip}>
            <Text style={styles.ingredientText}>{ing}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const NutritionBreakdown = ({ meals }: { meals: Meal[] }) => {
  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const proteinPct = Math.round((totals.protein * 4 / totals.calories) * 100) || 0;
  const carbsPct = Math.round((totals.carbs * 4 / totals.calories) * 100) || 0;
  const fatPct = Math.round((totals.fat * 9 / totals.calories) * 100) || 0;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Daily Nutrition</Text>
      <View style={styles.nutritionCard}>
        <View style={styles.calorieCenter}>
          <Text style={styles.calorieNumber}>{totals.calories}</Text>
          <Text style={styles.calorieLabel}>calories</Text>
        </View>
        <View style={styles.macroBreakdown}>
          <View style={styles.macroBreakdownItem}>
            <View style={[styles.macroBar, { width: `${proteinPct}%`, backgroundColor: '#FF4B4B' }]} />
            <Text style={styles.macroBreakdownLabel}>Protein {totals.protein}g ({proteinPct}%)</Text>
          </View>
          <View style={styles.macroBreakdownItem}>
            <View style={[styles.macroBar, { width: `${carbsPct}%`, backgroundColor: '#FFC800' }]} />
            <Text style={styles.macroBreakdownLabel}>Carbs {totals.carbs}g ({carbsPct}%)</Text>
          </View>
          <View style={styles.macroBreakdownItem}>
            <View style={[styles.macroBar, { width: `${fatPct}%`, backgroundColor: '#1CB0F6' }]} />
            <Text style={styles.macroBreakdownLabel}>Fat {totals.fat}g ({fatPct}%)</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const GroceryListSection = ({ groceryList }: { groceryList: Record<string, number> }) => {
  const sorted = Object.entries(groceryList).sort((a, b) => b[1] - a[1]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Weekly Grocery List</Text>
      <View style={styles.groceryCard}>
        {sorted.map(([item, count]) => (
          <View key={item} style={styles.groceryRow}>
            <View style={styles.groceryCheck}>
              <Text style={styles.groceryCheckText}>O</Text>
            </View>
            <Text style={styles.groceryItem}>{item}</Text>
            {count > 1 && <Text style={styles.groceryCount}>x{count}</Text>}
          </View>
        ))}
      </View>
    </View>
  );
};

// ============================================================================
// TABS
// ============================================================================

type DietPlannerTab = 'plan' | 'nutrition' | 'grocery';

const TabSelector = ({
  active,
  onSelect,
}: {
  active: DietPlannerTab;
  onSelect: (tab: DietPlannerTab) => void;
}) => {
  const tabs: { key: DietPlannerTab; label: string }[] = [
    { key: 'plan', label: 'Meal Plan' },
    { key: 'nutrition', label: 'Nutrition' },
    { key: 'grocery', label: 'Grocery List' },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, active === tab.key && styles.tabActive]}
          onPress={() => onSelect(tab.key)}
        >
          <Text style={[styles.tabText, active === tab.key && styles.tabTextActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export const DietPlannerScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [preference, setPreference] = useState<DietPreference>('balanced');
  const [selectedDay, setSelectedDay] = useState(0);
  const [activeTab, setActiveTab] = useState<DietPlannerTab>('plan');

  const weeklyPlan = generateWeeklyPlan(preference);
  const groceryList = generateGroceryList(weeklyPlan);
  const todayMeals = weeklyPlan[selectedDay].meals;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{'<'}</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Diet Planner</Text>
          <Text style={styles.headerSubtitle}>Plan your meals, reach your goals</Text>
        </View>
      </View>

      {/* Preference Selector */}
      <PreferenceSelector selected={preference} onSelect={setPreference} />

      {/* Weekly Calendar */}
      <WeeklyCalendar plan={weeklyPlan} selectedDay={selectedDay} onSelectDay={setSelectedDay} />

      {/* Tab Selector */}
      <TabSelector active={activeTab} onSelect={setActiveTab} />

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'plan' && (
          <>
            <Text style={styles.dayTitle}>{weeklyPlan[selectedDay].day}</Text>
            {todayMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </>
        )}

        {activeTab === 'nutrition' && (
          <NutritionBreakdown meals={todayMeals} />
        )}

        {activeTab === 'grocery' && (
          <GroceryListSection groceryList={groceryList} />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  backText: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  headerContent: {},
  headerTitle: {
    ...theme.typography.h3,
  },
  headerSubtitle: {
    ...theme.typography.caption,
    marginTop: 2,
  },

  // Sections
  section: {
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h4,
    marginBottom: theme.spacing.sm,
  },

  // Preferences
  prefRow: {
    gap: theme.spacing.sm,
    paddingRight: theme.spacing.md,
  },
  prefChip: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 110,
  },
  prefChipActive: {
    backgroundColor: theme.colors.diet + '20',
    borderColor: theme.colors.diet,
  },
  prefChipLabel: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  prefChipLabelActive: {
    color: theme.colors.diet,
  },
  prefChipDesc: {
    fontSize: 10,
    color: theme.colors.textTertiary,
  },
  prefChipDescActive: {
    color: theme.colors.diet,
    opacity: 0.8,
  },

  // Calendar
  calendarRow: {
    gap: theme.spacing.xs,
    paddingRight: theme.spacing.md,
  },
  dayCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 56,
  },
  dayCardActive: {
    backgroundColor: theme.colors.diet + '20',
    borderColor: theme.colors.diet,
  },
  dayShort: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  dayShortActive: {
    color: theme.colors.diet,
  },
  dayCalories: {
    ...theme.typography.body,
    fontWeight: '800',
    color: theme.colors.text,
  },
  dayCaloriesActive: {
    color: theme.colors.diet,
  },
  dayCalLabel: {
    fontSize: 9,
    color: theme.colors.textTertiary,
  },
  dayCalLabelActive: {
    color: theme.colors.diet,
    opacity: 0.8,
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 4,
    marginBottom: theme.spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.radius.sm,
  },
  tabActive: {
    backgroundColor: theme.colors.card,
  },
  tabText: {
    ...theme.typography.bodySmall,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.diet,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },

  // Day title
  dayTitle: {
    ...theme.typography.h4,
    marginBottom: theme.spacing.md,
    color: theme.colors.diet,
  },

  // Meal Card
  mealCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  mealTypeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  mealTypeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mealPrepTime: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  mealName: {
    ...theme.typography.body,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  macroRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    ...theme.typography.body,
    fontWeight: '800',
    color: theme.colors.text,
    fontSize: 14,
  },
  macroLabel: {
    fontSize: 10,
    color: theme.colors.textTertiary,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  ingredientChip: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  ingredientText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },

  // Nutrition Breakdown
  nutritionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  calorieCenter: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  calorieNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: theme.colors.diet,
  },
  calorieLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: -4,
  },
  macroBreakdown: {
    gap: theme.spacing.md,
  },
  macroBreakdownItem: {
    gap: 4,
  },
  macroBar: {
    height: 8,
    borderRadius: 4,
    minWidth: 8,
  },
  macroBreakdownLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },

  // Grocery List
  groceryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  groceryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  groceryCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  groceryCheckText: {
    fontSize: 10,
    color: theme.colors.textTertiary,
  },
  groceryItem: {
    ...theme.typography.body,
    flex: 1,
    fontSize: 14,
  },
  groceryCount: {
    ...theme.typography.caption,
    color: theme.colors.diet,
    fontWeight: '700',
  },
});
