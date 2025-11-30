import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { getMealPlans } from '../../database/nutrition.web';
import { useNavigation } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';

const LOVABLE_COLORS = {
  primary: '#FA7D09',
  primaryLight: 'rgba(250, 125, 9, 0.05)',
  background: '#ECF2F7',
  card: '#F5F8FA',
  foreground: '#1A202C',
  mutedForeground: '#718096',
  border: '#CBD5E0',
};

export const DietPlannerScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [mealPlan, setMealPlan] = useState<any>({
    breakfast: null,
    lunch: null,
    dinner: null,
  });

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    const dates = getWeekDates();
    setWeekDates(dates);
  }, []);

  const getWeekDates = () => {
    const curr = new Date();
    const first = curr.getDate() - curr.getDay();
    const dates = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(curr);
      date.setDate(first + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const calculateDailySummary = () => {
    const meals = [mealPlan?.breakfast, mealPlan?.lunch, mealPlan?.dinner].filter(Boolean);

    return {
      calories: meals.reduce((sum: number, meal: any) => sum + (meal?.calories || 0), 0),
      protein: meals.reduce((sum: number, meal: any) => sum + (meal?.protein || 0), 0),
      carbs: meals.reduce((sum: number, meal: any) => sum + (meal?.carbs || 0), 0),
    };
  };

  const summary = calculateDailySummary();

  const renderMealSection = (mealType: string, meal: any) => {
    return (
      <View key={mealType} style={styles.mealSection}>
        <View style={styles.mealHeader}>
          <Text style={styles.mealTitle}>{mealType}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('RecipeList' as never, { mealType } as never)}
          >
            <Text style={styles.editButton}>{meal ? 'Edit' : 'Add'}</Text>
          </TouchableOpacity>
        </View>

        {meal ? (
          <View style={styles.mealCard}>
            <View style={styles.mealContent}>
              <View style={styles.mealImageContainer}>
                {/* Placeholder image */}
                <View style={styles.mealImagePlaceholder}>
                  <Text style={styles.mealImageEmoji}>🍽️</Text>
                </View>
              </View>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName} numberOfLines={1}>
                  {meal.name}
                </Text>
                <Text style={styles.mealDescription} numberOfLines={2}>
                  {meal.description}
                </Text>
                <View style={styles.mealStats}>
                  <Text style={styles.mealStatPrimary}>{meal.calories} kcal</Text>
                  <Text style={styles.mealStatMuted}>{meal.prepTime} min</Text>
                  <Text style={styles.mealStatMuted}>{meal.protein}g protein</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.emptyMealCard}
            onPress={() => navigation.navigate('RecipeList' as never, { mealType } as never)}
          >
            <Plus color={LOVABLE_COLORS.mutedForeground} size={32} />
            <Text style={styles.emptyMealText}>Add {mealType}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with gradient */}
        <View style={styles.header}>
          <Text style={styles.title}>Meal Planner</Text>

          {/* Week Calendar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.weekCalendar}
            contentContainerStyle={styles.weekCalendarContent}
          >
            {weekDates.map((date, index) => {
              const selected = isSelected(date);
              const today = isToday(date);

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedDate(date)}
                  style={[
                    styles.dayButton,
                    selected && styles.dayButtonSelected,
                  ]}
                >
                  <Text style={[styles.dayLabel, selected && styles.dayLabelSelected]}>
                    {daysOfWeek[index]}
                  </Text>
                  <Text style={[styles.dayNumber, selected && styles.dayNumberSelected]}>
                    {date.getDate()}
                  </Text>
                  {today && !selected && <View style={styles.todayDot} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.content}>
          {/* Date Info */}
          <View style={styles.dateInfo}>
            <View>
              <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
              <Text style={styles.dateSubtext}>Plan your meals for the day</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('RecipeList' as never)}
            >
              <Plus color="#fff" size={20} />
            </TouchableOpacity>
          </View>

          {/* Meal Sections */}
          <View style={styles.mealsContainer}>
            {renderMealSection('Breakfast', mealPlan.breakfast)}
            {renderMealSection('Lunch', mealPlan.lunch)}
            {renderMealSection('Dinner', mealPlan.dinner)}

            {/* Daily Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Daily Summary</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{Math.round(summary.calories)}</Text>
                  <Text style={styles.summaryLabel}>Total Kcal</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValueNormal}>{Math.round(summary.protein)}g</Text>
                  <Text style={styles.summaryLabel}>Protein</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValueNormal}>{Math.round(summary.carbs)}g</Text>
                  <Text style={styles.summaryLabel}>Carbs</Text>
                </View>
              </View>
            </View>
          </View>
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
    marginBottom: 24,
    color: LOVABLE_COLORS.foreground,
  },
  weekCalendar: {
    marginBottom: 8,
  },
  weekCalendarContent: {
    gap: 8,
  },
  dayButton: {
    width: 64,
    height: 80,
    borderRadius: 16,
    backgroundColor: LOVABLE_COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  dayButtonSelected: {
    backgroundColor: LOVABLE_COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ scale: 1.05 }],
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: LOVABLE_COLORS.foreground,
    marginBottom: 4,
  },
  dayLabelSelected: {
    color: '#fff',
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: LOVABLE_COLORS.foreground,
  },
  dayNumberSelected: {
    color: '#fff',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: LOVABLE_COLORS.primary,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 16,
  },
  dateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LOVABLE_COLORS.foreground,
  },
  dateSubtext: {
    fontSize: 14,
    color: LOVABLE_COLORS.mutedForeground,
    marginTop: 2,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: LOVABLE_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mealsContainer: {
    gap: 16,
    paddingBottom: 80,
  },
  mealSection: {
    marginBottom: 8,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: LOVABLE_COLORS.foreground,
  },
  editButton: {
    fontSize: 14,
    color: LOVABLE_COLORS.primary,
    fontWeight: '500',
  },
  mealCard: {
    backgroundColor: LOVABLE_COLORS.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  mealContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  mealImageContainer: {
    width: 96,
    height: 96,
  },
  mealImagePlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealImageEmoji: {
    fontSize: 40,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: LOVABLE_COLORS.foreground,
    marginBottom: 4,
  },
  mealDescription: {
    fontSize: 12,
    color: LOVABLE_COLORS.mutedForeground,
    marginBottom: 8,
  },
  mealStats: {
    flexDirection: 'row',
    gap: 12,
  },
  mealStatPrimary: {
    fontSize: 12,
    fontWeight: '600',
    color: LOVABLE_COLORS.primary,
  },
  mealStatMuted: {
    fontSize: 12,
    color: LOVABLE_COLORS.mutedForeground,
  },
  emptyMealCard: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: LOVABLE_COLORS.border,
    borderStyle: 'dashed',
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMealText: {
    fontSize: 14,
    color: LOVABLE_COLORS.mutedForeground,
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: `${LOVABLE_COLORS.primary}10`,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: `${LOVABLE_COLORS.primary}30`,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: LOVABLE_COLORS.foreground,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LOVABLE_COLORS.primary,
  },
  summaryValueNormal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LOVABLE_COLORS.foreground,
  },
  summaryLabel: {
    fontSize: 12,
    color: LOVABLE_COLORS.mutedForeground,
    marginTop: 4,
  },
});
