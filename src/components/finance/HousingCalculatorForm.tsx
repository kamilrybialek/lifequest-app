/**
 * Housing Calculator Form
 * Used in Step 8: Smart home buying with 20/20/30 rule
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { saveHousingInfo, getHousingInfo, getFinanceProfile } from '../../database/financeIntegrated.web';
import { useAuthStore } from '../../store/authStore';

interface HousingCalculatorFormProps {
  onComplete: () => void;
}

export const HousingCalculatorForm: React.FC<HousingCalculatorFormProps> = ({ onComplete }) => {
  const { user } = useAuthStore();

  const [housingStatus, setHousingStatus] = useState<'rent' | 'own-mortgage' | 'own-free' | 'living-with-family'>('rent');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [homeValue, setHomeValue] = useState('');
  const [mortgageBalance, setMortgageBalance] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const [housing, profile] = await Promise.all([
        getHousingInfo(user.id),
        getFinanceProfile(user.id),
      ]);

      if (housing) {
        setHousingStatus(housing.housingStatus);
        setMonthlyPayment(housing.monthlyPayment.toString());
        setHomeValue(housing.homeValue?.toString() || '');
        setMortgageBalance(housing.mortgageBalance?.toString() || '');
      }

      setMonthlyIncome(profile?.monthlyIncome || 0);
    } catch (error) {
      console.error('Error loading housing data:', error);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    if (!monthlyPayment || parseFloat(monthlyPayment) < 0) {
      Alert.alert('Missing Info', 'Please enter your monthly housing payment');
      return;
    }

    const payment = parseFloat(monthlyPayment);
    const percentOfIncome = monthlyIncome > 0 ? ((payment / monthlyIncome) * 100).toFixed(1) : '0';
    const isWithin30Percent = monthlyIncome > 0 && (payment / monthlyIncome) <= 0.3;

    try {
      await saveHousingInfo(user.id, {
        housingStatus,
        monthlyPayment: payment,
        homeValue: homeValue ? parseFloat(homeValue) : undefined,
        mortgageBalance: mortgageBalance ? parseFloat(mortgageBalance) : undefined,
      });

      Alert.alert(
        'Housing Info Saved! 🏡',
        `Monthly Payment: $${payment.toLocaleString()}\nPercentage of Income: ${percentOfIncome}%\n\n${
          isWithin30Percent
            ? '✅ Great! You\'re within the 30% guideline.'
            : '⚠️ Your housing costs exceed 30% of income. Consider this when planning future moves.'
        }`,
        [{ text: 'Continue', onPress: onComplete }]
      );
    } catch (error) {
      console.error('Error saving housing info:', error);
      Alert.alert('Error', 'Failed to save housing information');
    }
  };

  const payment = parseFloat(monthlyPayment) || 0;
  const percentOfIncome = monthlyIncome > 0 ? (payment / monthlyIncome) * 100 : 0;
  const max30Percent = monthlyIncome * 0.3;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#00CD9C', '#00E5B3']}
          style={styles.headerCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="home" size={48} color="#FFF" />
          <Text style={styles.headerTitle}>Housing Calculator</Text>
          <Text style={styles.headerSubtitle}>Apply the 20/20/30 rule to housing decisions</Text>
        </LinearGradient>

        {/* Housing Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Housing Situation</Text>

          <View style={styles.statusGrid}>
            {[
              { value: 'rent' as const, label: 'Renting', icon: 'key' },
              { value: 'own-mortgage' as const, label: 'Own w/ Mortgage', icon: 'home' },
              { value: 'own-free' as const, label: 'Own Outright', icon: 'checkmark-circle' },
              { value: 'living-with-family' as const, label: 'Living w/ Family', icon: 'people' },
            ].map((status) => (
              <TouchableOpacity
                key={status.value}
                style={[styles.statusCard, housingStatus === status.value && styles.statusCardActive]}
                onPress={() => setHousingStatus(status.value)}
              >
                <Ionicons
                  name={status.icon as any}
                  size={28}
                  color={housingStatus === status.value ? '#00CD9C' : '#9CA3AF'}
                />
                <Text style={[styles.statusLabel, housingStatus === status.value && styles.statusLabelActive]}>
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Monthly Payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Housing Payment</Text>
          <View style={styles.amountCard}>
            <View style={styles.amountInput}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountTextInput}
                value={monthlyPayment}
                onChangeText={setMonthlyPayment}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#999"
              />
            </View>
          </View>
          <Text style={styles.fieldHint}>
            Include: mortgage/rent + property tax + insurance + HOA + utilities
          </Text>
        </View>

        {/* 30% Rule Check */}
        {payment > 0 && monthlyIncome > 0 && (
          <View style={[styles.ruleCard, percentOfIncome > 30 && styles.ruleCardWarning]}>
            <View style={styles.ruleHeader}>
              <Ionicons
                name={percentOfIncome <= 30 ? 'checkmark-circle' : 'alert-circle'}
                size={32}
                color={percentOfIncome <= 30 ? '#4CAF50' : '#FF6B6B'}
              />
              <View style={styles.ruleHeaderText}>
                <Text style={styles.ruleTitle}>{percentOfIncome.toFixed(1)}% of Income</Text>
                <Text style={styles.ruleSubtitle}>
                  {percentOfIncome <= 30 ? '✅ Within 30% guideline' : '⚠️ Exceeds 30% guideline'}
                </Text>
              </View>
            </View>
            <View style={styles.ruleDetails}>
              <View style={styles.ruleRow}>
                <Text style={styles.ruleLabel}>Your monthly income:</Text>
                <Text style={styles.ruleValue}>${monthlyIncome.toLocaleString()}</Text>
              </View>
              <View style={styles.ruleRow}>
                <Text style={styles.ruleLabel}>30% max (recommended):</Text>
                <Text style={styles.ruleValue}>${max30Percent.toLocaleString()}</Text>
              </View>
              <View style={styles.ruleRow}>
                <Text style={styles.ruleLabel}>Your payment:</Text>
                <Text style={[styles.ruleValue, percentOfIncome > 30 && styles.ruleValueWarning]}>
                  ${payment.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Optional: Home Value & Mortgage (if owning) */}
        {(housingStatus === 'own-mortgage' || housingStatus === 'own-free') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Home Value & Mortgage (Optional)</Text>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Estimated Home Value</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountTextInput}
                  value={homeValue}
                  onChangeText={setHomeValue}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {housingStatus === 'own-mortgage' && (
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Remaining Mortgage Balance</Text>
                <View style={styles.amountInput}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountTextInput}
                    value={mortgageBalance}
                    onChangeText={setMortgageBalance}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={24} color="#FFB800" />
            <Text style={styles.tipTitle}>The 20/20/30 Rule</Text>
          </View>
          <Text style={styles.tipText}>
            When buying: 20% down, 20-year mortgage (max), 30% of income or less. This keeps your home
            from owning you!
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <LinearGradient
          colors={['#00CD9C', '#00E5B3']}
          style={styles.saveButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="save" size={24} color="#FFF" />
          <Text style={styles.saveButtonText}>Save Housing Info</Text>
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
  headerCard: {
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  statusCardActive: {
    borderColor: '#00CD9C',
    backgroundColor: '#F0FFF9',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  statusLabelActive: {
    color: '#00CD9C',
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
    borderColor: '#00CD9C',
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
  fieldHint: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textLight,
    marginTop: 8,
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
  ruleCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  ruleCardWarning: {
    backgroundColor: '#FFEBEE',
    borderLeftColor: '#FF6B6B',
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  ruleHeaderText: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  ruleSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  ruleDetails: {
    gap: 8,
  },
  ruleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ruleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  ruleValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  ruleValueWarning: {
    color: '#FF6B6B',
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
