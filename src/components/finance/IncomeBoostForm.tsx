/**
 * Income Boost Form
 * Used in Step 6: Track salary increases and new income streams
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { getIncomeSources, getFinanceProfile, type IncomeSource } from '../../database/financeIntegrated.web';
import { useAuthStore } from '../../store/authStore';

interface IncomeBoostFormProps {
  onComplete: () => void;
}

const BOOST_TYPES = [
  { value: 'raise', label: 'Salary Raise', icon: 'trending-up', description: 'Got a raise at current job' },
  { value: 'promotion', label: 'Promotion', icon: 'arrow-up-circle', description: 'New role, higher pay' },
  { value: 'side-hustle', label: 'Side Hustle', icon: 'briefcase', description: 'Started earning extra income' },
  { value: 'new-job', label: 'New Job', icon: 'rocket', description: 'Switched to better-paying job' },
  { value: 'bonus', label: 'Bonus/Commission', icon: 'gift', description: 'One-time or recurring bonus' },
] as const;

export const IncomeBoostForm: React.FC<IncomeBoostFormProps> = ({ onComplete }) => {
  const { user } = useAuthStore();

  const [currentIncome, setCurrentIncome] = useState(0);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [selectedBoostType, setSelectedBoostType] = useState<string>('raise');
  const [increaseAmount, setIncreaseAmount] = useState('');
  const [increaseNotes, setIncreaseNotes] = useState('');

  useEffect(() => {
    loadIncomeData();
  }, []);

  const loadIncomeData = async () => {
    if (!user?.id) return;
    try {
      const [profile, sources] = await Promise.all([
        getFinanceProfile(user.id),
        getIncomeSources(user.id),
      ]);
      setCurrentIncome(profile?.monthlyIncome || 0);
      setIncomeSources(sources);
    } catch (error) {
      console.error('Error loading income data:', error);
    }
  };

  const handleLogIncrease = () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    if (!increaseAmount || parseFloat(increaseAmount) <= 0) {
      Alert.alert('Missing Info', 'Please enter the amount of your income increase');
      return;
    }

    const amount = parseFloat(increaseAmount);
    const newMonthlyIncome = currentIncome + amount;
    const percentIncrease = currentIncome > 0 ? ((amount / currentIncome) * 100).toFixed(1) : '100';

    Alert.alert(
      'Congratulations! 🎉',
      `You increased your income by $${amount.toLocaleString()}/month (${percentIncrease}% increase)!\n\nNew monthly income: $${newMonthlyIncome.toLocaleString()}\n\nNow go add this as a new income source (or update existing one) in Step 1, Lesson 2!`,
      [
        {
          text: 'Got It!',
          onPress: () => {
            onComplete();
          },
        },
      ]
    );
  };

  const totalMonthlyIncome = incomeSources.reduce((sum, source) => sum + source.monthlyAmount, 0);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Income Card */}
        <LinearGradient
          colors={['#CE82FF', '#E0A4FF']}
          style={styles.incomeCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.incomeRow}>
            <View>
              <Text style={styles.incomeLabel}>Current Monthly Income</Text>
              <Text style={styles.incomeValue}>${totalMonthlyIncome.toLocaleString()}</Text>
            </View>
            <View style={styles.incomeIconContainer}>
              <Ionicons name="cash" size={32} color="#FFF" />
            </View>
          </View>
          {incomeSources.length > 0 && (
            <Text style={styles.incomeSubtext}>
              {incomeSources.length} income source{incomeSources.length !== 1 ? 's' : ''}
            </Text>
          )}
        </LinearGradient>

        {/* Income Boost Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Type of Income Boost?</Text>
          <Text style={styles.sectionSubtitle}>Select the type that applies to your situation</Text>

          {BOOST_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.boostTypeCard,
                selectedBoostType === type.value && styles.boostTypeCardActive
              ]}
              onPress={() => setSelectedBoostType(type.value)}
            >
              <View style={[
                styles.boostTypeIcon,
                selectedBoostType === type.value && styles.boostTypeIconActive
              ]}>
                <Ionicons
                  name={type.icon as any}
                  size={28}
                  color={selectedBoostType === type.value ? '#FFF' : '#CE82FF'}
                />
              </View>
              <View style={styles.boostTypeInfo}>
                <Text style={[
                  styles.boostTypeLabel,
                  selectedBoostType === type.value && styles.boostTypeLabelActive
                ]}>
                  {type.label}
                </Text>
                <Text style={styles.boostTypeDescription}>{type.description}</Text>
              </View>
              {selectedBoostType === type.value && (
                <Ionicons name="checkmark-circle" size={24} color="#CE82FF" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Income Increase Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How Much is the Increase?</Text>
          <View style={styles.amountCard}>
            <View style={styles.amountInput}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountTextInput}
                value={increaseAmount}
                onChangeText={setIncreaseAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#999"
              />
              <Text style={styles.perMonth}>/month</Text>
            </View>

            {parseFloat(increaseAmount) > 0 && (
              <View style={styles.calculationCard}>
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>Yearly increase:</Text>
                  <Text style={styles.calculationValue}>
                    ${(parseFloat(increaseAmount) * 12).toLocaleString()}/year
                  </Text>
                </View>
                <View style={styles.calculationRow}>
                  <Text style={styles.calculationLabel}>New monthly total:</Text>
                  <Text style={styles.calculationValue}>
                    ${(totalMonthlyIncome + parseFloat(increaseAmount)).toLocaleString()}
                  </Text>
                </View>
                {totalMonthlyIncome > 0 && (
                  <View style={styles.calculationRow}>
                    <Text style={styles.calculationLabel}>Percentage increase:</Text>
                    <Text style={[styles.calculationValue, styles.percentageValue]}>
                      +{((parseFloat(increaseAmount) / totalMonthlyIncome) * 100).toFixed(1)}%
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={increaseNotes}
            onChangeText={setIncreaseNotes}
            placeholder="E.g., Negotiated raise, started freelance web design, etc."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Tips Card */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={24} color="#FFB800" />
            <Text style={styles.tipTitle}>The 50% Rule</Text>
          </View>
          <Text style={styles.tipText}>
            Save or invest 50% of every income increase. Let your lifestyle improve a little, but
            accelerate your wealth building dramatically!
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Log Income Increase Button */}
      {parseFloat(increaseAmount) > 0 && (
        <TouchableOpacity style={styles.logButton} onPress={handleLogIncrease}>
          <LinearGradient
            colors={['#CE82FF', '#E0A4FF']}
            style={styles.logButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="rocket" size={24} color="#FFF" />
            <Text style={styles.logButtonText}>
              Log ${parseFloat(increaseAmount).toLocaleString()} Increase
            </Text>
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
  incomeCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  incomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  incomeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  incomeValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
  },
  incomeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomeSubtext: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  boostTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  boostTypeCardActive: {
    borderColor: '#CE82FF',
    backgroundColor: '#F9F4FF',
  },
  boostTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F9F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  boostTypeIconActive: {
    backgroundColor: '#CE82FF',
  },
  boostTypeInfo: {
    flex: 1,
  },
  boostTypeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  boostTypeLabelActive: {
    color: '#CE82FF',
  },
  boostTypeDescription: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  amountCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#CE82FF',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginRight: 4,
  },
  amountTextInput: {
    flex: 1,
    height: 56,
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  perMonth: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  calculationCard: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F9F4FF',
    borderRadius: 8,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calculationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  calculationValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  percentageValue: {
    color: '#4CAF50',
  },
  notesInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 80,
    textAlignVertical: 'top',
  },
  tipCard: {
    backgroundColor: '#FFF9E6',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  logButton: {
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
  logButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
