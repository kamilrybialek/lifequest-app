/**
 * Finance Dashboard - Duolingo Style (Web Version)
 * Matching Journey, Tasks, and Profile screen design language
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

  const firstName = user?.firstName || user?.email?.split('@')[0] || 'Champion';

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
        {/* Header - Duolingo Style */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerEmoji}>💰</Text>
            <Text style={styles.headerTitle}>Financial Hub</Text>
            <Text style={styles.headerSubtitle}>Grow your wealth, {firstName}!</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Stats Bar - overlapping header */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Ionicons name="arrow-down" size={20} color="#58CC02" />
            <Text style={styles.statValue}>{formatCurrency(monthlyIncome)}</Text>
            <Text style={styles.statLabel}>Income</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="arrow-up" size={20} color="#FF4B4B" />
            <Text style={styles.statValue}>{formatCurrency(monthlyExpenses)}</Text>
            <Text style={styles.statLabel}>Expenses</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name={netCashFlow >= 0 ? 'checkmark-circle' : 'close-circle'} size={20} color={netCashFlow >= 0 ? '#58CC02' : '#FF4B4B'} />
            <Text style={[styles.statValue, { color: netCashFlow >= 0 ? '#58CC02' : '#FF4B4B' }]}>
              {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
            </Text>
            <Text style={styles.statLabel}>Cash Flow</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="wallet" size={20} color="#00CD9C" />
            <Text style={styles.statValue}>{savingsRate.toFixed(0)}%</Text>
            <Text style={styles.statLabel}>Savings Rate</Text>
          </View>
        </View>

        {/* Net Worth Card - Colorful Duolingo Style */}
        <View style={styles.netWorthSection}>
          <TouchableOpacity style={styles.netWorthCard} activeOpacity={0.8}>
            <View style={styles.netWorthCardContent}>
              <View style={styles.netWorthIconContainer}>
                <Ionicons name="trending-up" size={32} color="white" />
              </View>
              <View style={styles.netWorthInfo}>
                <Text style={styles.netWorthLabel}>Net Worth</Text>
                <Text style={styles.netWorthAmount}>{formatCurrency(netWorth)}</Text>
                {/* Progress details */}
                <View style={styles.netWorthDetails}>
                  <View style={styles.netWorthDetailItem}>
                    <Text style={styles.netWorthDetailLabel}>Assets</Text>
                    <Text style={styles.netWorthDetailValue}>{formatCurrency(netWorth + 8000)}</Text>
                  </View>
                  <View style={styles.netWorthDetailDivider} />
                  <View style={styles.netWorthDetailItem}>
                    <Text style={styles.netWorthDetailLabel}>Debt</Text>
                    <Text style={styles.netWorthDetailValue}>{formatCurrency(8000)}</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Financial Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💼 Financial Tools</Text>
          <Text style={styles.sectionSubtitle}>Manage every aspect of your finances</Text>

          <View style={styles.toolsGrid}>
            {FINANCIAL_TOOLS.map(tool => (
              <TouchableOpacity
                key={tool.id}
                style={[styles.toolCard, { backgroundColor: tool.color }]}
                onPress={() => navigation.navigate(tool.screen)}
                activeOpacity={0.8}
              >
                <View style={styles.toolCardContent}>
                  <View style={styles.toolIconContainer}>
                    <Ionicons name={tool.icon as any} size={32} color="white" />
                  </View>
                  <View style={styles.toolInfo}>
                    <Text style={styles.toolTitle}>{tool.title}</Text>
                    <Text style={styles.toolDescription}>{tool.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: '#FF4B4B' }]}
              onPress={() => navigation.navigate('ExpenseLoggerScreen')}
              activeOpacity={0.8}
            >
              <Ionicons name="remove-circle" size={28} color="#fff" />
              <Text style={styles.quickActionText}>Add Expense</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionButton, { backgroundColor: '#58CC02' }]}
              onPress={() => navigation.navigate('IncomeTrackerScreen')}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={28} color="#fff" />
              <Text style={styles.quickActionText}>Log Income</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Motivation Card */}
        <View style={styles.motivationSection}>
          <View style={styles.motivationCard}>
            <Text style={styles.motivationEmoji}>🎯</Text>
            <Text style={styles.motivationTitle}>Build your financial future!</Text>
            <Text style={styles.motivationText}>
              Track your finances, reach your goals, and achieve financial freedom.{'\n'}
              Every dollar counts!
            </Text>
          </View>
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
  // Header - Duolingo Style
  header: {
    backgroundColor: '#4A90E2',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    marginTop: 8,
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  placeholder: {
    width: 40,
  },
  // Stats Bar - overlapping header
  statsBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5E5',
  },
  // Net Worth Card
  netWorthSection: {
    padding: 20,
  },
  netWorthCard: {
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  netWorthCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  netWorthIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  netWorthInfo: {
    flex: 1,
  },
  netWorthLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  netWorthAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  netWorthDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
  },
  netWorthDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  netWorthDetailLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  netWorthDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  netWorthDetailDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 12,
  },
  // Sections
  section: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  // Financial Tools - Colorful Cards
  toolsGrid: {
    gap: 12,
  },
  toolCard: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 12,
  },
  toolCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  toolIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  // Quick Actions
  quickActionsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Motivation Card
  motivationSection: {
    padding: 20,
    paddingTop: 20,
  },
  motivationCard: {
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  motivationEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  motivationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  motivationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
