import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Title, Button, TextInput, RadioButton, Chip } from 'react-native-paper';
import { useAuthStore } from '../../store/authStore';

export const OnboardingScreen = () => {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('');
  const [financialStatus, setFinancialStatus] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [sleepQuality, setSleepQuality] = useState(3);

  const { updateProfile } = useAuthStore();

  const handleComplete = async () => {
    await updateProfile({
      age: parseInt(age),
      weight: parseFloat(weight),
      height: parseFloat(height),
      gender: gender as any,
      financialStatus: financialStatus as any,
      activityLevel: activityLevel as any,
      sleepQuality,
      onboarded: true,
    });
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Title style={styles.stepTitle}>Welcome to LifeQuest!</Title>
            <Text style={styles.stepDescription}>
              Develop yourself holistically across 4 key pillars of life.
              Just 20 minutes a day (5 minutes per pillar).
            </Text>
            <Text style={styles.pillars}>💰 Finance • 🧠 Mental • 💪 Physical • 🥗 Nutrition</Text>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContainer}>
            <Title style={styles.stepTitle}>Basic Info</Title>
            <Text style={styles.label}>Age</Text>
            <TextInput
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Title style={styles.stepTitle}>Gender</Title>
            <Text style={styles.stepDescription}>
              This helps us calculate your calorie needs accurately
            </Text>
            <RadioButton.Group onValueChange={setGender} value={gender}>
              <View style={styles.radioItem}>
                <RadioButton value="male" />
                <Text>Male</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="female" />
                <Text>Female</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="other" />
                <Text>Other / Prefer not to say</Text>
              </View>
            </RadioButton.Group>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Title style={styles.stepTitle}>Financial Situation</Title>
            <Text style={styles.stepDescription}>
              This helps us tailor your financial tasks
            </Text>
            <RadioButton.Group onValueChange={setFinancialStatus} value={financialStatus}>
              <View style={styles.radioItem}>
                <RadioButton value="debt" />
                <Text>I have debts to pay off</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="paycheck" />
                <Text>Living paycheck to paycheck</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="stable" />
                <Text>Stable, but not saving</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="saving" />
                <Text>Saving regularly</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="investing" />
                <Text>Already investing</Text>
              </View>
            </RadioButton.Group>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContainer}>
            <Title style={styles.stepTitle}>Activity Level</Title>
            <Text style={styles.stepDescription}>
              How physically active are you currently?
            </Text>
            <RadioButton.Group onValueChange={setActivityLevel} value={activityLevel}>
              <View style={styles.radioItem}>
                <RadioButton value="sedentary" />
                <Text>Sedentary (desk job)</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="light" />
                <Text>Light activity (walks)</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="moderate" />
                <Text>Moderate (2-3x/week)</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="active" />
                <Text>Very active (4-5x/week)</Text>
              </View>
            </RadioButton.Group>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContainer}>
            <Title style={styles.stepTitle}>Sleep Quality</Title>
            <Text style={styles.stepDescription}>
              How would you rate your sleep quality?
            </Text>
            <View style={styles.sleepButtons}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <Chip
                  key={rating}
                  selected={sleepQuality === rating}
                  onPress={() => setSleepQuality(rating)}
                  style={styles.chip}
                >
                  {rating === 1 && '😴'}
                  {rating === 2 && '😐'}
                  {rating === 3 && '🙂'}
                  {rating === 4 && '😊'}
                  {rating === 5 && '🌟'}
                </Chip>
              ))}
            </View>
            <View style={styles.sleepLabels}>
              <Text style={styles.sleepLabel}>Poor</Text>
              <Text style={styles.sleepLabel}>Excellent</Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const canGoNext = () => {
    if (step === 0) return true;
    if (step === 1) return age && weight && height;
    if (step === 2) return gender;
    if (step === 3) return financialStatus;
    if (step === 4) return activityLevel;
    if (step === 5) return true;
    return false;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.progressContainer}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i <= step && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        {renderStep()}

        <View style={styles.buttonContainer}>
          {step > 0 && (
            <Button
              mode="outlined"
              onPress={() => setStep(step - 1)}
              style={styles.backButton}
            >
              Back
            </Button>
          )}
          <Button
            mode="contained"
            onPress={() => {
              if (step < 5) {
                setStep(step + 1);
              } else {
                handleComplete();
              }
            }}
            disabled={!canGoNext()}
            style={styles.nextButton}
          >
            {step === 5 ? "Let's Start!" : 'Next'}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  progressDotActive: {
    backgroundColor: '#6200ee',
  },
  stepContainer: {
    marginBottom: 40,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  pillars: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    marginBottom: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sleepButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  chip: {
    marginHorizontal: 4,
  },
  sleepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sleepLabel: {
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    marginRight: 8,
  },
  nextButton: {
    flex: 2,
    marginLeft: 8,
  },
});