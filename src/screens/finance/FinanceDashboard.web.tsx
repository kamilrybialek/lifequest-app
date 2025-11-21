/**
 * Finance Dashboard - Web Version
 * Simplified for web compatibility
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FinancialTool {
  id: string;
  title: string;
  icon: string;
  color: string;
  screen: string;
  description: string;
}

const FINANCIAL_TOOLS: FinancialTool[] = [
  { id: 'expense-manager', title: 'Expense Manager', icon: 'receipt-outline', color: '#4A90E2', screen: 'ExpenseLoggerScreen', description: 'Track daily expenses' },
  { id: 'budget', title: 'Budget', icon: 'pie-chart-outline', color: '#FFB800', screen: 'BudgetManagerScreen', description: 'Manage monthly budget' },
  { id: 'debt-snowball', title: 'Debt Snowball', icon: 'snow-outline', color: '#FF4B4B', screen: 'DebtTrackerScreen', description: 'Pay off debts faster' },
  { id: 'emergency-fund', title: 'Emergency Fund', icon: 'shield-checkmark-outline', color: '#58CC02', screen: 'EmergencyFundScreen', description: '$1,000 starter fund' },
  { id: 'savings-goals', title: 'Savings Goals', icon: 'wallet-outline', color: '#00CD9C', screen: 'SavingsGoalsScreen', description: 'Track your goals' },
  { id: 'net-worth', title: 'Net Worth', icon: 'trending-up-outline', color: '#7C4DFF', screen: 'NetWorthCalculatorScreen', description: 'Track wealth over time' },
  { id: 'subscriptions', title: 'Subscriptions', icon: 'repeat-outline', color: '#FF6B9D', screen: 'SubscriptionsScreen', description: 'Manage subscriptions' },
  { id: 'income-tracker', title: 'Income Tracker', icon: 'cash-outline', color: '#1CB0F6', screen: 'IncomeTrackerScreen', description: 'Log all income sources' },
];

export const FinanceDashboard = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [netWorth, setNetWorth] = useState(5000);
  const [monthlyIncome, setMonthlyIncome] = useState(3500);
  const [monthlyExpenses, setMonthlyExpenses] = useState(2800);
  const [savingsRate, setSavingsRate] = useState(20);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      const financeData = await AsyncStorage.getItem('financeData');
      if (financeData) {
        const data = JSON.parse(financeData);
        setMonthlyIncome(data.monthlyIncome || 3500);
        setMonthlyExpenses(data.monthlyExpenses || 2800);
        setNetWorth(data.netWorth || 5000);
        const rate = data.monthlyIncome > 0
          ? ((data.monthlyIncome - data.monthlyExpenses) / data.monthlyIncome) * 100
          : 20;
        setSavingsRate(rate);
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
    }
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFinancialData();
  };

  const netCashFlow = monthlyIncome - monthlyExpenses;

  const formatCurrency = (amount: number) => {
    return `$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Financial Hub</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Net Worth Card */}
        <View style={styles.netWorthCard}>
          <Text style={styles.netWorthLabel}>Net Worth</Text>
          <Text style={styles.netWorthAmount}>{formatCurrency(netWorth)}</Text>
          <View style={styles.netWorthDetails}>
            <View style={styles.netWorthItem}>
              <Ionicons name="trending-up" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.netWorthItemText}>Assets: {formatCurrency(netWorth + 8000)}</Text>
            </View>
            <View style={styles.netWorthItem}>
              <Ionicons name="trending-down" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.netWorthItemText}>Debt: {formatCurrency(8000)}</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#58CC0220' }]}>
              <Ionicons name="arrow-down" size={20} color="#58CC02" />
            </View>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statValue}>{formatCurrency(monthlyIncome)}</Text>
            <Text style={styles.statPeriod}>This month</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FF4B4B20' }]}>
              <Ionicons name="arrow-up" size={20} color="#FF4B4B" />
            </View>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statValue}>{formatCurrency(monthlyExpenses)}</Text>
            <Text style={styles.statPeriod}>This month</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: netCashFlow >= 0 ? '#58CC0220' : '#FF4B4B20' }]}>
              <Ionicons name={netCashFlow >= 0 ? 'checkmark-circle' : 'close-circle'} size={20} color={netCashFlow >= 0 ? '#58CC02' : '#FF4B4B'} />
            </View>
            <Text style={styles.statLabel}>Cash Flow</Text>
            <Text style={[styles.statValue, { color: netCashFlow >= 0 ? '#58CC02' : '#FF4B4B' }]}>
              {netCashFlow >= 0 ? '+' : '-'}{formatCurrency(netCashFlow)}
            </Text>
            <Text style={styles.statPeriod}>Net this month</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#00CD9C20' }]}>
              <Ionicons name="wallet" size={20} color="#00CD9C" />
            </View>
            <Text style={styles.statLabel}>Savings Rate</Text>
            <Text style={styles.statValue}>{savingsRate.toFixed(0)}%</Text>
            <Text style={styles.statPeriod}>Of income</Text>
          </View>
        </View>

        {/* Financial Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Tools</Text>
          <Text style={styles.sectionSubtitle}>Manage every aspect of your finances</Text>

          <View style={styles.toolsGrid}>
            {FINANCIAL_TOOLS.map(tool => (
              <TouchableOpacity
                key={tool.id}
                style={styles.toolCard}
                onPress={() => navigation.navigate(tool.screen)}
              >
                <View style={[styles.toolIconContainer, { backgroundColor: tool.color + '15' }]}>
                  <Ionicons name={tool.icon as any} size={28} color={tool.color} />
                </View>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolDescription}>{tool.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#4A90E2' }]}
            onPress={() => navigation.navigate('ExpenseLoggerScreen')}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.quickActionText}>Add Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: '#58CC02' }]}
            onPress={() => navigation.navigate('IncomeTrackerScreen')}
          >
            <Ionicons name="cash" size={24} color="#fff" />
            <Text style={styles.quickActionText}>Log Income</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  netWorthCard: {
    backgroundColor: '#4A90E2',
    marginHorizontal: 20,
    marginTop: -1,
    padding: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
  netWorthLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  netWorthAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  netWorthDetails: {
    flexDirection: 'row',
    gap: 24,
  },
  netWorthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  netWorthItemText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  statPeriod: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 16,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  toolCard: {
    width: '47%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toolIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 12,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
