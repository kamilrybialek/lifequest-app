/**
 * Financial Goals Form
 * Used in Step 1, Lesson 4: Set Your 1-Year & 5-Year Goals
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { addFinancialGoal, getFinancialGoals, type FinancialGoal } from '../../database/financeIntegrated.web';
import { useAuthStore } from '../../store/authStore';

interface FinancialGoalsFormProps {
  onComplete: () => void;
}

export const FinancialGoalsForm: React.FC<FinancialGoalsFormProps> = ({ onComplete }) => {
  const { user } = useAuthStore();

  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const [goalName, setGoalName] = useState('');
  const [goalType, setGoalType] = useState<'1-year' | '5-year' | 'long-term'>('1-year');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState(3);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    if (!user?.id) return;
    try {
      const data = await getFinancialGoals(user.id);
      setGoals(data);
      if (data.length === 0) {
        setShowAddForm(true);
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const handleAddGoal = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    if (!goalName.trim()) {
      Alert.alert('Missing Info', 'Please enter a goal name');
      return;
    }

    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      Alert.alert('Missing Info', 'Please enter a target amount');
      return;
    }

    if (!targetDate) {
      Alert.alert('Missing Info', 'Please enter a target date');
      return;
    }

    try {
      await addFinancialGoal(user.id, {
        goalName: goalName.trim(),
        goalType,
        targetAmount: parseFloat(targetAmount),
        targetDate,
        priority,
        notes: notes.trim() || undefined,
      });

      setGoalName('');
      setTargetAmount('');
      setTargetDate('');
      setNotes('');
      setPriority(3);
      setShowAddForm(false);

      await loadGoals();

      Alert.alert('Goal Set! 🎯', 'Your financial goal has been saved');
    } catch (error) {
      console.error('Error adding goal:', error);
      Alert.alert('Error', 'Failed to add goal');
    }
  };

  const renderGoalCard = (goal: FinancialGoal) => {
    const typeColor = goal.goalType === '1-year' ? '#4CAF50' : goal.goalType === '5-year' ? '#4A90E2' : '#CE82FF';
    const typeLabel = goal.goalType === '1-year' ? '1 Year' : goal.goalType === '5-year' ? '5 Years' : 'Long Term';

    return (
      <View key={goal.id} style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
            <Text style={styles.typeBadgeText}>{typeLabel}</Text>
          </View>
          <View style={styles.priorityBadge}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.priorityText}>P{goal.priority}</Text>
          </View>
        </View>

        <Text style={styles.goalName}>{goal.goalName}</Text>

        <View style={styles.goalTarget}>
          <Text style={styles.targetLabel}>Target:</Text>
          <Text style={styles.targetAmount}>${goal.targetAmount.toLocaleString()}</Text>
        </View>

        <Text style={styles.targetDate}>By {new Date(goal.targetDate).toLocaleDateString()}</Text>

        {goal.notes && <Text style={styles.goalNotes}>{goal.notes}</Text>}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#4A90E2', '#5FA3E8']} style={styles.headerCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="flag" size={48} color="#FFF" />
          <Text style={styles.headerTitle}>Your Financial Goals</Text>
          <Text style={styles.headerSubtitle}>
            "Goals not written down are just wishes"
          </Text>
        </LinearGradient>

        {/* Goal Stats */}
        {goals.length > 0 && (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{goals.filter(g => g.goalType === '1-year').length}</Text>
              <Text style={styles.statLabel}>1-Year Goals</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{goals.filter(g => g.goalType === '5-year').length}</Text>
              <Text style={styles.statLabel}>5-Year Goals</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{goals.filter(g => g.goalType === 'long-term').length}</Text>
              <Text style={styles.statLabel}>Long-Term</Text>
            </View>
          </View>
        )}

        {/* Goals List */}
        {goals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Goals</Text>
            {goals.map(renderGoalCard)}
          </View>
        )}

        {/* Add Goal Form */}
        {showAddForm ? (
          <View style={styles.formSection}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Add New Goal</Text>
              {goals.length > 0 && (
                <TouchableOpacity onPress={() => setShowAddForm(false)}>
                  <Ionicons name="close-circle" size={28} color={colors.textLight} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Goal Type *</Text>
              <View style={styles.goalTypeButtons}>
                <TouchableOpacity
                  style={[styles.goalTypeButton, goalType === '1-year' && styles.goalTypeButtonActive]}
                  onPress={() => setGoalType('1-year')}
                >
                  <Text style={[styles.goalTypeText, goalType === '1-year' && styles.goalTypeTextActive]}>
                    1 Year
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.goalTypeButton, goalType === '5-year' && styles.goalTypeButtonActive]}
                  onPress={() => setGoalType('5-year')}
                >
                  <Text style={[styles.goalTypeText, goalType === '5-year' && styles.goalTypeTextActive]}>
                    5 Years
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.goalTypeButton, goalType === 'long-term' && styles.goalTypeButtonActive]}
                  onPress={() => setGoalType('long-term')}
                >
                  <Text style={[styles.goalTypeText, goalType === 'long-term' && styles.goalTypeTextActive]}>
                    Long-Term
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Goal Name *</Text>
              <TextInput
                style={styles.textInput}
                value={goalName}
                onChangeText={setGoalName}
                placeholder="e.g., Emergency Fund, Down Payment, Retirement..."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Target Amount *</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountTextInput}
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Target Date * (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                value={targetDate}
                onChangeText={setTargetDate}
                placeholder="2026-12-31"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Priority (1=Highest, 5=Lowest)</Text>
              <View style={styles.priorityButtons}>
                {[1, 2, 3, 4, 5].map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.priorityButton, priority === p && styles.priorityButtonActive]}
                    onPress={() => setPriority(p)}
                  >
                    <Text style={[styles.priorityButtonText, priority === p && styles.priorityButtonTextActive]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Notes (optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Why is this goal important to you?"
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddGoal}>
              <LinearGradient
                colors={['#4CAF50', '#66BB6A']}
                style={styles.addButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add-circle" size={24} color="#FFF" />
                <Text style={styles.addButtonText}>Add Goal</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addGoalButton} onPress={() => setShowAddForm(true)}>
            <Ionicons name="add-circle-outline" size={28} color="#4A90E2" />
            <Text style={styles.addGoalText}>Add Another Goal</Text>
          </TouchableOpacity>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            Write down specific, measurable goals with deadlines. Review and update them monthly!
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Complete Button */}
      {goals.length > 0 && (
        <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
          <LinearGradient
            colors={['#4A90E2', '#5FA3E8']}
            style={styles.completeButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.completeButtonText}>Continue to Next Lesson</Text>
            <Ionicons name="checkmark-circle" size={24} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}
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
  headerCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 12,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    fontStyle: 'italic',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4A90E2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  goalCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  goalTarget: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  targetLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  targetAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4CAF50',
  },
  targetDate: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textLight,
    marginBottom: 8,
  },
  goalNotes: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  formSection: {
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
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  formField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  goalTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  goalTypeButton: {
    flex: 1,
    backgroundColor: '#F5F8FA',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  goalTypeButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  goalTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  goalTypeTextActive: {
    color: '#FFF',
  },
  textInput: {
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginRight: 4,
  },
  amountTextInput: {
    flex: 1,
    height: 44,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    backgroundColor: '#F5F8FA',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  priorityButtonActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  priorityButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  priorityButtonTextActive: {
    color: '#FFF',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
  },
  addGoalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A90E2',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  completeButton: {
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
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
