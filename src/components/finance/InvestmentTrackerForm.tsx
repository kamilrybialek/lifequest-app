/**
 * Investment Tracker Form
 * Used in Step 10: Track retirement and investment accounts
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { addInvestment, getInvestments, type Investment } from '../../database/financeIntegrated.web';
import { useAuthStore } from '../../store/authStore';

interface InvestmentTrackerFormProps {
  onComplete: () => void;
}

const INVESTMENT_TYPES = [
  { value: 'retirement-401k', label: '401(k)', icon: 'business', priority: 1 },
  { value: 'retirement-ira', label: 'IRA/Roth IRA', icon: 'wallet', priority: 2 },
  { value: 'brokerage', label: 'Brokerage Account', icon: 'trending-up', priority: 3 },
  { value: 'real-estate', label: 'Real Estate', icon: 'home', priority: 4 },
  { value: 'crypto', label: 'Cryptocurrency', icon: 'logo-bitcoin', priority: 5 },
  { value: 'other', label: 'Other', icon: 'apps', priority: 6 },
] as const;

export const InvestmentTrackerForm: React.FC<InvestmentTrackerFormProps> = ({ onComplete }) => {
  const { user } = useAuthStore();

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form fields
  const [investmentName, setInvestmentName] = useState('');
  const [investmentType, setInvestmentType] = useState<'retirement-401k' | 'retirement-ira' | 'brokerage' | 'real-estate' | 'crypto' | 'other'>('retirement-401k');
  const [currentValue, setCurrentValue] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    if (!user?.id) return;
    try {
      const data = await getInvestments(user.id);
      setInvestments(data);
      if (data.length === 0) {
        setShowAddForm(true);
      }
    } catch (error) {
      console.error('Error loading investments:', error);
    }
  };

  const handleAddInvestment = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    if (!investmentName.trim()) {
      Alert.alert('Missing Info', 'Please enter an investment name');
      return;
    }

    if (!currentValue || parseFloat(currentValue) < 0) {
      Alert.alert('Missing Info', 'Please enter the current value (enter 0 if just starting)');
      return;
    }

    try {
      await addInvestment(user.id, {
        investmentName: investmentName.trim(),
        investmentType,
        currentValue: parseFloat(currentValue),
        monthlyContribution: parseFloat(monthlyContribution) || 0,
        startDate: new Date().toISOString().split('T')[0],
      });

      // Reset form
      setInvestmentName('');
      setCurrentValue('');
      setMonthlyContribution('');
      setShowAddForm(false);

      // Reload investments
      await loadInvestments();

      Alert.alert('Success! 📈', 'Investment account added. Keep contributing consistently!');
    } catch (error) {
      console.error('Error adding investment:', error);
      Alert.alert('Error', 'Failed to add investment');
    }
  };

  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalMonthly = investments.reduce((sum, inv) => sum + inv.monthlyContribution, 0);

  const renderInvestmentCard = (investment: Investment) => {
    const typeInfo = INVESTMENT_TYPES.find(t => t.value === investment.investmentType) || INVESTMENT_TYPES[0];

    return (
      <View key={investment.id} style={styles.investmentCard}>
        <View style={styles.investmentIconContainer}>
          <Ionicons name={typeInfo.icon as any} size={28} color="#4A90E2" />
        </View>
        <View style={styles.investmentInfo}>
          <Text style={styles.investmentName}>{investment.investmentName}</Text>
          <Text style={styles.investmentType}>{typeInfo.label}</Text>
          {investment.monthlyContribution > 0 && (
            <Text style={styles.investmentContribution}>
              +${investment.monthlyContribution.toLocaleString()}/month
            </Text>
          )}
        </View>
        <View style={styles.investmentValue}>
          <Text style={styles.investmentValueText}>${investment.currentValue.toLocaleString()}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Total Investment Card */}
        {investments.length > 0 && (
          <LinearGradient
            colors={['#4A90E2', '#5FA3E8']}
            style={styles.totalCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.totalLabel}>Total Investments</Text>
            <Text style={styles.totalValue}>${totalValue.toLocaleString()}</Text>
            <Text style={styles.totalSubtext}>
              ${totalMonthly.toLocaleString()}/month contributions
            </Text>
          </LinearGradient>
        )}

        {/* Existing Investments */}
        {investments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Investment Accounts</Text>
            {investments.map(renderInvestmentCard)}
          </View>
        )}

        {/* Add Investment Form */}
        {showAddForm ? (
          <View style={styles.formSection}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Add Investment Account</Text>
              {investments.length > 0 && (
                <TouchableOpacity onPress={() => setShowAddForm(false)}>
                  <Ionicons name="close-circle" size={28} color={colors.textLight} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Account Name *</Text>
              <TextInput
                style={styles.textInput}
                value={investmentName}
                onChangeText={setInvestmentName}
                placeholder="e.g., Fidelity 401(k), Vanguard IRA, etc."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                {INVESTMENT_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeButton,
                      investmentType === type.value && styles.typeButtonActive
                    ]}
                    onPress={() => setInvestmentType(type.value)}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={20}
                      color={investmentType === type.value ? '#FFF' : '#4A90E2'}
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        investmentType === type.value && styles.typeButtonTextActive
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Current Value *</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountTextInput}
                  value={currentValue}
                  onChangeText={setCurrentValue}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Monthly Contribution</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountTextInput}
                  value={monthlyContribution}
                  onChangeText={setMonthlyContribution}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddInvestment}>
              <LinearGradient
                colors={['#4A90E2', '#5FA3E8']}
                style={styles.addButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add-circle" size={24} color="#FFF" />
                <Text style={styles.addButtonText}>Add Investment</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addInvestmentButton}
            onPress={() => setShowAddForm(true)}
          >
            <Ionicons name="add-circle-outline" size={28} color="#4A90E2" />
            <Text style={styles.addInvestmentText}>Add Another Investment</Text>
          </TouchableOpacity>
        )}

        {/* Tips */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={24} color="#FFB800" />
            <Text style={styles.tipTitle}>Investment Priority</Text>
          </View>
          <Text style={styles.tipText}>
            1. Get full 401(k) match (free money!){'\n'}
            2. Max Roth IRA ($7,000/year){'\n'}
            3. Max 401(k) ($23,000/year){'\n'}
            4. Brokerage account{'\n\n'}
            Low-cost index funds beat 95% of professionals. Keep it simple!
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Complete Button */}
      {investments.length > 0 && (
        <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
          <LinearGradient
            colors={['#4A90E2', '#5FA3E8']}
            style={styles.completeButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.completeButtonText}>Continue</Text>
            <Ionicons name="arrow-forward-circle" size={24} color="#FFF" />
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
  totalCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  totalSubtext: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
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
  investmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  investmentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  investmentInfo: {
    flex: 1,
  },
  investmentName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  investmentType: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  investmentContribution: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 2,
  },
  investmentValue: {
    alignItems: 'flex-end',
  },
  investmentValueText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4A90E2',
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
  textInput: {
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  typeSelector: {
    marginTop: 4,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  typeButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A90E2',
  },
  typeButtonTextActive: {
    color: '#FFF',
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
  addInvestmentButton: {
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
  addInvestmentText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A90E2',
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
