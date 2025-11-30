import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button, IconButton } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';
import { getMealPlans, getMealPlanById } from '../../database/nutrition.web';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';

export const DietPlannerScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    const dates = getWeekDates();
    setWeekDates(dates);
    loadMealPlan();
  }, []);

  useEffect(() => {
    loadMealPlan();
  }, [selectedDate]);

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

  const loadMealPlan = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load meal plans for selected date
      const plans = await getMealPlans(user.id);
      // For now, using sample data - will be populated from database
      setMealPlan({
        breakfast: null,
        lunch: null,
        dinner: null,
        snack: null,
      });
    } catch (error) {
      console.error('Error loading meal plan:', error);
    } finally {
      setLoading(false);
    }
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
    const meals = [mealPlan?.breakfast, mealPlan?.lunch, mealPlan?.dinner, mealPlan?.snack].filter(Boolean);

    return {
      calories: meals.reduce((sum, meal) => sum + (meal?.estimated_calories || 0), 0),
      protein: meals.reduce((sum, meal) => sum + (meal?.estimated_protein || 0), 0),
      carbs: meals.reduce((sum, meal) => sum + (meal?.estimated_carbs || 0), 0),
      fat: meals.reduce((sum, meal) => sum + (meal?.estimated_fat || 0), 0),
    };
  };

  const summary = calculateDailySummary();

  const renderMealCard = (mealType: string, meal: any) => {
    const mealIcons: { [key: string]: string } = {
      breakfast: '🍳',
      lunch: '🥗',
      dinner: '🍽️',
      snack: '🍎',
    };

    return (
      <View key={mealType} style={styles.mealSection}>
        <View style={styles.mealHeader}>
          <Text style={styles.mealTitle}>
            {mealIcons[mealType]} {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
          </Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('RecipeList' as never, { mealType, date: selectedDate.toISOString() } as never)}
            labelStyle={styles.editButtonText}
          >
            {meal ? 'Edit' : 'Add'}
          </Button>
        </View>

        {meal ? (
          <Card style={styles.mealCard}>
            <View style={styles.mealContent}>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{meal.meal_name}</Text>
                <Text style={styles.mealDescription} numberOfLines={2}>
                  {meal.description || 'No description'}
                </Text>
                <View style={styles.mealStats}>
                  <Text style={styles.mealStat}>
                    <Text style={styles.mealStatValue}>{meal.estimated_calories || 0}</Text> kcal
                  </Text>
                  <Text style={styles.mealStat}>
                    <Text style={styles.mealStatValue}>{meal.prep_time_minutes || 0}</Text> min
                  </Text>
                  <Text style={styles.mealStat}>
                    <Text style={styles.mealStatValue}>{meal.estimated_protein || 0}g</Text> protein
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        ) : (
          <Card style={[styles.mealCard, styles.emptyMealCard]}>
            <TouchableOpacity
              style={styles.emptyMealContent}
              onPress={() => navigation.navigate('RecipeList' as never, { mealType, date: selectedDate.toISOString() } as never)}
            >
              <IconButton icon="plus" size={32} iconColor={colors.nutrition} />
              <Text style={styles.emptyMealText}>Add {mealType}</Text>
            </TouchableOpacity>
          </Card>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header with Gradient Effect */}
        <View style={styles.header}>
          <Text style={styles.title}>🍽️ Meal Planner</Text>

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
            <IconButton
              icon="plus"
              size={28}
              mode="contained"
              containerColor={colors.nutrition}
              iconColor="#fff"
              onPress={() => navigation.navigate('RecipeList' as never)}
            />
          </View>

          {/* Meal Sections */}
          <View style={styles.mealsContainer}>
            {renderMealCard('breakfast', mealPlan?.breakfast)}
            {renderMealCard('lunch', mealPlan?.lunch)}
            {renderMealCard('dinner', mealPlan?.dinner)}

            {/* Daily Summary */}
            <Card style={styles.summaryCard}>
              <Card.Content>
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
              </Card.Content>
            </Card>
          </View>
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
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
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
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dayButtonSelected: {
    backgroundColor: colors.nutrition,
    borderColor: colors.nutrition,
    transform: [{ scale: 1.05 }],
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  dayLabelSelected: {
    color: '#fff',
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  dayNumberSelected: {
    color: '#fff',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.nutrition,
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
    color: '#333',
  },
  dateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  mealsContainer: {
    gap: 16,
    paddingBottom: 24,
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
    color: '#333',
  },
  editButtonText: {
    color: colors.nutrition,
    fontSize: 14,
  },
  mealCard: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  mealContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  mealDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  mealStats: {
    flexDirection: 'row',
    gap: 16,
  },
  mealStat: {
    fontSize: 12,
    color: '#666',
  },
  mealStatValue: {
    fontWeight: '600',
    color: colors.nutrition,
  },
  emptyMealCard: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: 'transparent',
  },
  emptyMealContent: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMealText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: `${colors.nutrition}15`,
    borderColor: `${colors.nutrition}30`,
    borderWidth: 1,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
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
    color: colors.nutrition,
  },
  summaryValueNormal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
