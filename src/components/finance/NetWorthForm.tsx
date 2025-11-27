/**
 * Net Worth Calculator Form
 * Used in Step 1, Lesson 1: Calculate Your Net Worth
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { addNetWorthEntry, getLatestNetWorth } from '../../database/financeIntegrated.web';
import { useAuthStore } from '../../store/authStore';
import { useCurrencyStore } from '../../store/currencyStore';
import { getCurrency } from '../../constants/currencies';

interface NetWorthFormProps {
  onComplete: (netWorth: number) => void;
}

export const NetWorthForm: React.FC<NetWorthFormProps> = ({ onComplete }) => {
  const { user } = useAuthStore();
  const { currency, convertFromUSD, convertToUSD, formatAmount } = useCurrencyStore();
  const currencyData = getCurrency(currency);

  // Assets
  const [cashSavings, setCashSavings] = useState('0');
  const [checkingBalance, setCheckingBalance] = useState('0');
  const [investments, setInvestments] = useState('0');
  const [retirement, setRetirement] = useState('0');
  const [homeValue, setHomeValue] = useState('0');
  const [vehicleValue, setVehicleValue] = useState('0');
  const [otherAssets, setOtherAssets] = useState('0');

  // Liabilities
  const [mortgage, setMortgage] = useState('0');
  const [autoLoans, setAutoLoans] = useState('0');
  const [studentLoans, setStudentLoans] = useState('0');
  const [creditCards, setCreditCards] = useState('0');
  const [personalLoans, setPersonalLoans] = useState('0');
  const [otherDebts, setOtherDebts] = useState('0');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExistingData();
  }, [currency]); // Reload when currency changes

  const loadExistingData = async () => {
    if (!user?.id) return;
    try {
      const existing = await getLatestNetWorth(user.id);
      if (existing) {
        // Convert from USD (stored) to display currency
        setCashSavings(existing.cashSavings ? String(Math.round(convertFromUSD(existing.cashSavings))) : '');
        setCheckingBalance(existing.checkingBalance ? String(Math.round(convertFromUSD(existing.checkingBalance))) : '');
        setInvestments(existing.investments ? String(Math.round(convertFromUSD(existing.investments))) : '');
        setRetirement(existing.retirement ? String(Math.round(convertFromUSD(existing.retirement))) : '');
        setHomeValue(existing.homeValue ? String(Math.round(convertFromUSD(existing.homeValue))) : '');
        setVehicleValue(existing.vehicleValue ? String(Math.round(convertFromUSD(existing.vehicleValue))) : '');
        setOtherAssets(existing.otherAssets ? String(Math.round(convertFromUSD(existing.otherAssets))) : '');
        setMortgage(existing.mortgage ? String(Math.round(convertFromUSD(existing.mortgage))) : '');
        setAutoLoans(existing.autoLoans ? String(Math.round(convertFromUSD(existing.autoLoans))) : '');
        setStudentLoans(existing.studentLoans ? String(Math.round(convertFromUSD(existing.studentLoans))) : '');
        setCreditCards(existing.creditCards ? String(Math.round(convertFromUSD(existing.creditCards))) : '');
        setPersonalLoans(existing.personalLoans ? String(Math.round(convertFromUSD(existing.personalLoans))) : '');
        setOtherDebts(existing.otherDebts ? String(Math.round(convertFromUSD(existing.otherDebts))) : '');
      }
    } catch (error) {
      console.error('Error loading net worth:', error);
    }
  };

  const parseValue = (val: string): number => {
    const parsed = parseFloat(val) || 0;
    return Math.max(0, parsed);
  };

  const calculateTotals = () => {
    const totalAssets =
      parseValue(cashSavings) +
      parseValue(checkingBalance) +
      parseValue(investments) +
      parseValue(retirement) +
      parseValue(homeValue) +
      parseValue(vehicleValue) +
      parseValue(otherAssets);

    const totalLiabilities =
      parseValue(mortgage) +
      parseValue(autoLoans) +
      parseValue(studentLoans) +
      parseValue(creditCards) +
      parseValue(personalLoans) +
      parseValue(otherDebts);

    const netWorth = totalAssets - totalLiabilities;

    return { totalAssets, totalLiabilities, netWorth };
  };

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    setLoading(true);

    try {
      // Convert from display currency to USD before saving
      const netWorth = await addNetWorthEntry(user.id, {
        cashSavings: convertToUSD(parseValue(cashSavings)),
        checkingBalance: convertToUSD(parseValue(checkingBalance)),
        investments: convertToUSD(parseValue(investments)),
        retirement: convertToUSD(parseValue(retirement)),
        homeValue: convertToUSD(parseValue(homeValue)),
        vehicleValue: convertToUSD(parseValue(vehicleValue)),
        otherAssets: convertToUSD(parseValue(otherAssets)),
        mortgage: convertToUSD(parseValue(mortgage)),
        autoLoans: convertToUSD(parseValue(autoLoans)),
        studentLoans: convertToUSD(parseValue(studentLoans)),
        creditCards: convertToUSD(parseValue(creditCards)),
        personalLoans: convertToUSD(parseValue(personalLoans)),
        otherDebts: convertToUSD(parseValue(otherDebts)),
      });

      // Format net worth in selected currency for display
      const netWorthInCurrency = convertFromUSD(netWorth);
      Alert.alert(
        'Net Worth Calculated! 📊',
        `Your net worth is ${formatAmount(netWorthInCurrency)}. ${
          netWorth >= 0
            ? "Great job! You're in positive territory."
            : "Don't worry - this is your starting point. You'll improve from here!"
        }`,
        [{ text: 'Continue', onPress: () => onComplete(netWorth) }]
      );
    } catch (error) {
      console.error('Error saving net worth:', error);
      Alert.alert('Error', 'Failed to save net worth. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { totalAssets, totalLiabilities, netWorth } = calculateTotals();

  const renderInput = (label: string, value: string, setValue: (val: string) => void, icon: string) => (
    <View style={styles.inputRow}>
      <View style={styles.inputLabel}>
        <Ionicons name={icon as any} size={20} color={colors.primary} />
        <Text style={styles.inputLabelText}>{label}</Text>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.currencySymbol}>{currencyData?.symbol || '$'}</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#999"
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Assets Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={24} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Assets (What You Own)</Text>
          </View>

          {renderInput('Cash Savings', cashSavings, setCashSavings, 'cash')}
          {renderInput('Checking Account', checkingBalance, setCheckingBalance, 'card')}
          {renderInput('Investments', investments, setInvestments, 'stats-chart')}
          {renderInput('Retirement Accounts', retirement, setRetirement, 'time')}
          {renderInput('Home Value', homeValue, setHomeValue, 'home')}
          {renderInput('Vehicle Value', vehicleValue, setVehicleValue, 'car')}
          {renderInput('Other Assets', otherAssets, setOtherAssets, 'ellipsis-horizontal')}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Assets:</Text>
            <Text style={[styles.totalValue, { color: '#4CAF50' }]}>{formatAmount(totalAssets)}</Text>
          </View>
        </View>

        {/* Liabilities Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-down" size={24} color="#FF4B4B" />
            <Text style={styles.sectionTitle}>Liabilities (What You Owe)</Text>
          </View>

          {renderInput('Mortgage', mortgage, setMortgage, 'home-outline')}
          {renderInput('Auto Loans', autoLoans, setAutoLoans, 'car-outline')}
          {renderInput('Student Loans', studentLoans, setStudentLoans, 'school-outline')}
          {renderInput('Credit Cards', creditCards, setCreditCards, 'card-outline')}
          {renderInput('Personal Loans', personalLoans, setPersonalLoans, 'people-outline')}
          {renderInput('Other Debts', otherDebts, setOtherDebts, 'ellipsis-horizontal-outline')}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Liabilities:</Text>
            <Text style={[styles.totalValue, { color: '#FF4B4B' }]}>{formatAmount(totalLiabilities)}</Text>
          </View>
        </View>

        {/* Net Worth Summary */}
        <LinearGradient
          colors={netWorth >= 0 ? ['#4CAF50', '#66BB6A'] : ['#FF4B4B', '#FF6B6B']}
          style={styles.summaryCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.summaryLabel}>Your Net Worth</Text>
          <Text style={styles.summaryValue}>{formatAmount(netWorth)}</Text>
          <Text style={styles.summarySubtext}>
            {netWorth >= 0 ? '✅ Positive Net Worth' : '⚠️ Negative Net Worth - Let\'s fix this!'}
          </Text>
        </LinearGradient>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            Net worth is your financial scoreboard. Track it monthly to see your progress. Remember: negative is just
            your starting point!
          </Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        <LinearGradient colors={['#4A90E2', '#5FA3E8']} style={styles.saveButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Calculate & Save Net Worth'}</Text>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  inputRow: {
    marginBottom: 12,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  inputLabelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginRight: 4,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  summarySubtext: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 100,
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
