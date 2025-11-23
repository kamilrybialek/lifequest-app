/**
 * Emergency Fund Form
 * Used in Step 2: Save Your First $1,000
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { updateFinanceProfile, getFinanceProfile } from '../../database/financeIntegrated.web';

interface EmergencyFundFormProps {
  onComplete: (amount: number) => void;
}

export const EmergencyFundForm: React.FC<EmergencyFundFormProps> = ({ onComplete }) => {
  const { user } = useAuthStore();

  const [currentAmount, setCurrentAmount] = useState('');
  const [goalAmount, setGoalAmount] = useState('1000');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    if (!user?.id) return;
    try {
      const profile = await getFinanceProfile(user.id);
      if (profile) {
        setCurrentAmount(String(profile.emergencyFundCurrent || 0));
        setGoalAmount(String(profile.emergencyFundGoal || 1000));
      }
    } catch (error) {
      console.error('Error loading emergency fund:', error);
    }
  };

  const parseValue = (val: string): number => {
    const parsed = parseFloat(val) || 0;
    return Math.max(0, parsed);
  };

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    const current = parseValue(currentAmount);
    const goal = parseValue(goalAmount);

    if (goal < 100) {
      Alert.alert('Invalid Goal', 'Your emergency fund goal should be at least $100');
      return;
    }

    setLoading(true);

    try {
      await updateFinanceProfile(user.id, {
        emergencyFundCurrent: current,
        emergencyFundGoal: goal,
      });

      const percentage = (current / goal) * 100;

      Alert.alert(
        current >= goal ? 'Goal Reached! 🎉' : 'Progress Saved! 💰',
        current >= goal
          ? `Amazing! You've reached your $${goal.toLocaleString()} emergency fund goal!`
          : `You're ${percentage.toFixed(0)}% of the way to your $${goal.toLocaleString()} goal. Keep going!`,
        [{ text: 'Continue', onPress: () => onComplete(current) }]
      );
    } catch (error) {
      console.error('Error saving emergency fund:', error);
      Alert.alert('Error', 'Failed to save emergency fund. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const percentage = parseValue(currentAmount) / parseValue(goalAmount) * 100;
  const isGoalReached = parseValue(currentAmount) >= parseValue(goalAmount);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Progress Card */}
        <LinearGradient
          colors={isGoalReached ? ['#4CAF50', '#66BB6A'] : ['#58CC02', '#7FD633']}
          style={styles.progressCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={isGoalReached ? 'checkmark-circle' : 'shield-checkmark'} size={64} color="#FFF" />
          <Text style={styles.progressLabel}>Emergency Fund Progress</Text>
          <Text style={styles.progressPercentage}>{Math.min(100, percentage).toFixed(0)}%</Text>
          <Text style={styles.progressSubtext}>
            ${parseValue(currentAmount).toLocaleString()} of ${parseValue(goalAmount).toLocaleString()}
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${Math.min(100, percentage)}%` }]} />
          </View>
        </LinearGradient>

        {/* Current Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How Much Do You Have Saved?</Text>
          <Text style={styles.sectionDescription}>
            Enter the current amount in your emergency fund (separate savings account recommended)
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.input}
              value={currentAmount}
              onChangeText={setCurrentAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Goal Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Your Goal?</Text>
          <Text style={styles.sectionDescription}>
            For Step 2, aim for $1,000. You'll build this to 3-6 months of expenses in Step 4.
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.input}
              value={goalAmount}
              onChangeText={setGoalAmount}
              keyboardType="numeric"
              placeholder="1000"
              placeholderTextColor="#999"
            />
          </View>

          {/* Quick Goal Buttons */}
          <View style={styles.quickGoalsRow}>
            <TouchableOpacity style={styles.quickGoalButton} onPress={() => setGoalAmount('500')}>
              <Text style={styles.quickGoalText}>$500</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickGoalButton, styles.quickGoalButtonPrimary]}
              onPress={() => setGoalAmount('1000')}
            >
              <Text style={[styles.quickGoalText, styles.quickGoalTextPrimary]}>$1,000</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickGoalButton} onPress={() => setGoalAmount('2000')}>
              <Text style={styles.quickGoalText}>$2,000</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Motivation Card */}
        {!isGoalReached && parseValue(currentAmount) > 0 && (
          <View style={styles.motivationCard}>
            <Ionicons name="rocket" size={32} color="#4CAF50" />
            <View style={styles.motivationContent}>
              <Text style={styles.motivationTitle}>Keep Going!</Text>
              <Text style={styles.motivationText}>
                ${(parseValue(goalAmount) - parseValue(currentAmount)).toLocaleString()} left to reach your goal
              </Text>
            </View>
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={24} color="#FFB800" />
            <Text style={styles.tipHeaderText}>Quick Tips</Text>
          </View>

          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.tipText}>Keep it in a separate savings account - out of sight, out of temptation</Text>
          </View>

          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.tipText}>Automate transfers - even $50/week = $2,600/year</Text>
          </View>

          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.tipText}>Only use for TRUE emergencies (car repair, medical, job loss)</Text>
          </View>

          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            <Text style={styles.tipText}>Refill it immediately after using it</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        <LinearGradient
          colors={['#58CC02', '#7FD633']}
          style={styles.saveButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Progress'}</Text>
          <Ionicons name="checkmark-circle" size={24} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  scrollView: {
    flex: 1,
  },
  progressCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 12,
    marginBottom: 8,
  },
  progressPercentage: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  progressSubtext: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 6,
  },
  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginRight: 4,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  quickGoalsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  quickGoalButton: {
    flex: 1,
    backgroundColor: '#F5F8FA',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickGoalButtonPrimary: {
    backgroundColor: '#58CC02',
    borderColor: '#58CC02',
  },
  quickGoalText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  quickGoalTextPrimary: {
    color: '#FFF',
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  motivationContent: {
    flex: 1,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  motivationText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tipsCard: {
    backgroundColor: '#FFF9E6',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tipHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 20,
  },
  saveButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
