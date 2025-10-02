import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Title, Button, Chip, TextInput, ProgressBar } from 'react-native-paper';
import { useAppStore } from '../../store/appStore';

export const NutritionScreen = () => {
  const { nutritionData, updateNutritionData } = useAppStore();
  const [firstMealTime, setFirstMealTime] = useState('');
  const [mealQuality, setMealQuality] = useState(3);

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

  const waterProgress = nutritionData.waterIntake / nutritionData.waterGoal;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>🥗 Nutrition</Title>
        <Text style={styles.subtitle}>Fuel your body optimally</Text>
      </View>

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
});