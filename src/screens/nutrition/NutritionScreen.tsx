import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Title, Button, Chip, TextInput, ProgressBar } from 'react-native-paper';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { calculateBMR, calculateTDEE, calculateCalorieGoal } from '../../utils/healthCalculations';

export const NutritionScreen = () => {
  const { nutritionData, updateNutritionData, physicalHealthData } = useAppStore();
  const { user } = useAuthStore();
  const [firstMealTime, setFirstMealTime] = useState('');
  const [mealQuality, setMealQuality] = useState(3);
  const [caloriesInput, setCaloriesInput] = useState('');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'>('moderate');

  const handleAddWater = () => {
    updateNutritionData({
      waterIntake: Math.min(nutritionData.waterIntake + 1, nutritionData.waterGoal),
    });
  };

  const handleResetWater = () => {
    updateNutritionData({
      waterIntake: 0,
    });
  };

  const handleLogMealTime = () => {
    if (firstMealTime) {
      updateNutritionData({
        firstMealTime,
      });
    }
  };

  const handleToggleProtein = () => {
    updateNutritionData({
      hadProtein: !nutritionData.hadProtein,
    });
  };

  const handleRateMeal = () => {
    updateNutritionData({
      mealQuality,
    });
  };

  const handleAddCalories = () => {
    const calories = parseInt(caloriesInput);
    if (!isNaN(calories) && calories > 0) {
      updateNutritionData({
        caloriesConsumed: (nutritionData.caloriesConsumed || 0) + calories,
      });
      setCaloriesInput('');
    }
  };

  const handleResetCalories = () => {
    updateNutritionData({
      caloriesConsumed: 0,
    });
  };

  // Calculate calorie requirements if we have user data
  let calorieGoal = nutritionData.calorieGoal || 2000; // Default
  let tdee = 0;
  let bmr = 0;

  if (physicalHealthData.weight && physicalHealthData.height && user?.age && user?.gender) {
    bmr = calculateBMR(physicalHealthData.weight, physicalHealthData.height, user.age, user.gender);
    tdee = calculateTDEE(bmr, activityLevel);
    // Assuming maintenance for now, can be adjusted based on user goals
    calorieGoal = calculateCalorieGoal(tdee, 'maintain');
  }

  const waterProgress = nutritionData.waterIntake / nutritionData.waterGoal;
  const caloriesConsumed = nutritionData.caloriesConsumed || 0;
  const caloriesProgress = caloriesConsumed / calorieGoal;
  const caloriesRemaining = calorieGoal - caloriesConsumed;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>🥗 Nutrition</Title>
        <Text style={styles.subtitle}>Fuel your body optimally</Text>
      </View>

      {/* Calorie Tracker */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>🔥 Calorie Tracker</Title>
          <Text style={styles.description}>
            Track your daily calorie intake
          </Text>

          <View style={styles.calorieStats}>
            <View style={styles.calorieStatItem}>
              <Text style={styles.calorieStatLabel}>Consumed</Text>
              <Text style={styles.calorieStatValue}>{caloriesConsumed}</Text>
            </View>
            <View style={styles.calorieStatDivider} />
            <View style={styles.calorieStatItem}>
              <Text style={styles.calorieStatLabel}>Goal</Text>
              <Text style={styles.calorieStatValue}>{calorieGoal}</Text>
            </View>
            <View style={styles.calorieStatDivider} />
            <View style={styles.calorieStatItem}>
              <Text style={styles.calorieStatLabel}>Remaining</Text>
              <Text style={[
                styles.calorieStatValue,
                { color: caloriesRemaining >= 0 ? '#4CAF50' : '#F44336' }
              ]}>
                {caloriesRemaining}
              </Text>
            </View>
          </View>

          <ProgressBar
            progress={Math.min(caloriesProgress, 1)}
            color={caloriesProgress > 1 ? '#F44336' : '#4CAF50'}
            style={styles.progressBar}
          />

          {bmr > 0 && (
            <View style={styles.metabolismInfo}>
              <Text style={styles.metabolismText}>
                💡 BMR: {bmr} cal/day • TDEE: {tdee} cal/day
              </Text>
              <Text style={styles.metabolismSubtext}>
                Based on your height, weight, age, and activity level
              </Text>
            </View>
          )}

          <TextInput
            label="Add Calories"
            value={caloriesInput}
            onChangeText={setCaloriesInput}
            keyboardType="numeric"
            mode="outlined"
            placeholder="e.g., 500"
            style={styles.input}
          />

          <View style={styles.waterButtons}>
            <Button mode="contained" onPress={handleAddCalories} style={styles.button}>
              + Add Calories
            </Button>
            <Button mode="outlined" onPress={handleResetCalories} style={styles.button}>
              Reset
            </Button>
          </View>

          {caloriesProgress >= 0.9 && caloriesProgress < 1.1 && (
            <View style={[styles.achievement, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.achievementText, { color: '#4CAF50' }]}>
                ✅ Perfect! You're within your calorie goal!
              </Text>
            </View>
          )}

          {caloriesProgress > 1.1 && (
            <View style={[styles.achievement, { backgroundColor: '#FFEBEE' }]}>
              <Text style={[styles.achievementText, { color: '#F44336' }]}>
                ⚠️ You've exceeded your calorie goal
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Hydration Tracker */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>💧 Hydration Tracker</Title>
          <View style={styles.waterProgress}>
            <Text style={styles.waterCount}>
              {nutritionData.waterIntake} / {nutritionData.waterGoal} glasses
            </Text>
            <ProgressBar
              progress={waterProgress}
              color="#2196F3"
              style={styles.progressBar}
            />
          </View>

          <View style={styles.waterGlasses}>
            {Array.from({ length: nutritionData.waterGoal }).map((_, index) => (
              <Text
                key={index}
                style={[
                  styles.waterGlass,
                  index < nutritionData.waterIntake && styles.waterGlassFilled,
                ]}
              >
                {index < nutritionData.waterIntake ? '💧' : '🥛'}
              </Text>
            ))}
          </View>

          <View style={styles.waterButtons}>
            <Button mode="contained" onPress={handleAddWater} style={styles.button}>
              + Add Glass
            </Button>
            <Button mode="outlined" onPress={handleResetWater} style={styles.button}>
              Reset
            </Button>
          </View>

          {waterProgress >= 1 && (
            <View style={styles.achievement}>
              <Text style={styles.achievementText}>🎉 Hydration goal reached!</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Meal Timing (Circadian Eating) */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>⏰ Meal Timing</Title>
          <Text style={styles.description}>
            Track your eating window for circadian optimization (Huberman)
          </Text>

          <TextInput
            label="First Meal Time"
            value={firstMealTime}
            onChangeText={setFirstMealTime}
            mode="outlined"
            placeholder="12:00"
            style={styles.input}
          />
          <Button mode="contained" onPress={handleLogMealTime} style={styles.button}>
            Log Meal Time
          </Button>

          {nutritionData.firstMealTime && (
            <View style={styles.mealInfo}>
              <Text style={styles.mealInfoText}>
                First meal today: {nutritionData.firstMealTime}
              </Text>
            </View>
          )}

          <View style={styles.fastingInfo}>
            <Title style={styles.fastingTitle}>Common IF Protocols:</Title>
            <Text style={styles.fastingOption}>• 16:8 (16h fast, 8h eating)</Text>
            <Text style={styles.fastingOption}>• 18:6 (18h fast, 6h eating)</Text>
            <Text style={styles.fastingOption}>• 20:4 (20h fast, 4h eating)</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Protein Awareness */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>🍖 Protein Intake</Title>
          <Text style={styles.description}>
            Did you have protein with each meal today?
          </Text>

          <Button
            mode={nutritionData.hadProtein ? 'contained' : 'outlined'}
            onPress={handleToggleProtein}
            style={styles.button}
            icon={nutritionData.hadProtein ? 'check' : 'close'}
          >
            {nutritionData.hadProtein ? 'Yes, I had protein!' : "Haven't tracked yet"}
          </Button>

          <View style={styles.proteinInfo}>
            <Text style={styles.proteinTitle}>Good Protein Sources:</Text>
            <Text style={styles.proteinSource}>• Chicken, Turkey, Beef</Text>
            <Text style={styles.proteinSource}>• Fish (Salmon, Tuna)</Text>
            <Text style={styles.proteinSource}>• Eggs</Text>
            <Text style={styles.proteinSource}>• Greek Yogurt</Text>
            <Text style={styles.proteinSource}>• Legumes, Tofu</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Meal Quality Check-in */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>⭐ Meal Quality Rating</Title>
          <Text style={styles.description}>
            How would you rate today's overall diet quality?
          </Text>

          <View style={styles.qualityButtons}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <Chip
                key={rating}
                selected={mealQuality === rating}
                onPress={() => setMealQuality(rating)}
                style={styles.qualityChip}
              >
                {rating === 1 && '🍔'}
                {rating === 2 && '😐'}
                {rating === 3 && '🙂'}
                {rating === 4 && '😊'}
                {rating === 5 && '🌟'}
              </Chip>
            ))}
          </View>

          <View style={styles.qualityLabels}>
            <Text style={styles.qualityLabel}>Junk</Text>
            <Text style={styles.qualityLabel}>Optimal</Text>
          </View>

          <Button mode="contained" onPress={handleRateMeal} style={styles.button}>
            Save Rating
          </Button>

          {nutritionData.mealQuality !== undefined && (
            <Text style={styles.currentRating}>
              Current rating: {nutritionData.mealQuality}/5
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Daily Nutrition Tips */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>📋 Daily Nutrition Checklist</Title>
          <View style={styles.checklistItem}>
            <Text style={styles.checklistText}>✓ Drink 8 glasses of water</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.checklistText}>✓ Eat protein with each meal</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.checklistText}>✓ Include vegetables in meals</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.checklistText}>✓ Limit processed foods</Text>
          </View>
          <View style={styles.checklistItem}>
            <Text style={styles.checklistText}>✓ Stay within eating window</Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  waterProgress: {
    marginVertical: 16,
  },
  waterCount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
  },
  waterGlasses: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 16,
  },
  waterGlass: {
    fontSize: 32,
    margin: 4,
  },
  waterGlassFilled: {
    opacity: 1,
  },
  waterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    marginTop: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  achievement: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  achievementText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  mealInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  mealInfoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fastingInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  fastingTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  fastingOption: {
    fontSize: 14,
    marginBottom: 6,
    color: '#666',
  },
  proteinInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  proteinTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  proteinSource: {
    fontSize: 14,
    marginBottom: 6,
    color: '#666',
  },
  qualityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  qualityChip: {
    marginHorizontal: 2,
  },
  qualityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  qualityLabel: {
    fontSize: 12,
    color: '#666',
  },
  currentRating: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#FF9800',
  },
  checklistItem: {
    padding: 8,
  },
  checklistText: {
    fontSize: 14,
    color: '#333',
  },
  calorieStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  calorieStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  calorieStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  calorieStatValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#333',
  },
  calorieStatDivider: {
    width: 1,
    backgroundColor: '#ddd',
  },
  metabolismInfo: {
    marginTop: 12,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  metabolismText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  metabolismSubtext: {
    fontSize: 11,
    color: '#1565C0',
  },
});