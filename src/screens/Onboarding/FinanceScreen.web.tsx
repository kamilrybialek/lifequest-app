import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { useOnboardingStore } from '../../store/onboardingStore';

export const FinanceScreen = ({ navigation }: any) => {
  const { data, updateData, setCurrentStep } = useOnboardingStore();

  const [incomeLevel, setIncomeLevel] = useState(data.incomeLevel ?? -1);
  const [debtLevel, setDebtLevel] = useState(data.debtLevel ?? -1);
  const [savingsLevel, setSavingsLevel] = useState(data.savingsLevel ?? -1);
  const [budgeting, setBudgeting] = useState(data.budgeting ?? -1);

  const handleNext = () => {
    updateData({
      incomeLevel,
      debtLevel,
      savingsLevel,
      budgeting,
    });
    setCurrentStep('nutrition');
    navigation.navigate('Nutrition');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const isValid = incomeLevel >= 0 && debtLevel >= 0 && savingsLevel >= 0 && budgeting >= 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '57%' }]} />
        </View>
        <Text style={styles.stepText}>Step 4 of 7</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Finance</Text>
        <Text style={styles.subtitle}>Let's understand your financial situation</Text>

        {/* Income Level */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>What is your monthly net income? *</Text>
          <View style={styles.radioGroup}>
            {[
              { label: 'Below $1,000', value: 0 },
              { label: '$1,000 - $2,500', value: 1 },
              { label: '$2,500 - $5,000', value: 2 },
              { label: '$5,000 - $10,000', value: 3 },
              { label: 'Above $10,000', value: 4 },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.radioButton, incomeLevel === option.value && styles.radioButtonSelected]}
                onPress={() => setIncomeLevel(option.value)}
              >
                <Text style={[styles.radioText, incomeLevel === option.value && styles.radioTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Debt Level */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Do you have debt (loans, credit)? *</Text>
          <View style={styles.radioGroup}>
            {[
              { label: 'No', value: 0 },
              { label: 'Yes, small (up to $5,000)', value: 1 },
              { label: 'Yes, medium ($5,000-$25,000)', value: 2 },
              { label: 'Yes, large (above $25,000)', value: 3 },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.radioButton, debtLevel === option.value && styles.radioButtonSelected]}
                onPress={() => setDebtLevel(option.value)}
              >
                <Text style={[styles.radioText, debtLevel === option.value && styles.radioTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Savings Level */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>How much do you have in savings? *</Text>
          <View style={styles.radioGroup}>
            {[
              { label: 'None or below $500', value: 0 },
              { label: '$500 - $2,500', value: 1 },
              { label: '$2,500 - $10,000', value: 2 },
              { label: '$10,000 - $25,000', value: 3 },
              { label: 'Above $25,000', value: 4 },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.radioButton, savingsLevel === option.value && styles.radioButtonSelected]}
                onPress={() => setSavingsLevel(option.value)}
              >
                <Text style={[styles.radioText, savingsLevel === option.value && styles.radioTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Budgeting */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Do you plan your budget? *</Text>
          <View style={styles.radioGroup}>
            {[
              { label: "No, I don't know how much I spend", value: 0 },
              { label: 'Rough plan in my head', value: 1 },
              { label: 'Yes, I track in Excel/app', value: 2 },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.radioButton, budgeting === option.value && styles.radioButtonSelected]}
                onPress={() => setBudgeting(option.value)}
              >
                <Text style={[styles.radioText, budgeting === option.value && styles.radioTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 200 }} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, !isValid && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!isValid}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  stepText: {
    fontSize: 12,
    color: colors.textLight,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 32,
  },
  fieldContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  radioGroup: {
    gap: 8,
  },
  radioButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  radioButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  radioText: {
    fontSize: 14,
    color: colors.text,
  },
  radioTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.textLight,
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
