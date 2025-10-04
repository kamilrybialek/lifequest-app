import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import {
  getRecurringTransactions,
  createRecurringTransaction,
  getUpcomingBills,
  detectRecurringTransactions,
  RecurringTransaction,
} from '../../database/financeEnhanced';

const FREQUENCY_OPTIONS = [
  { value: 'monthly', label: 'Monthly', icon: '📅' },
  { value: 'weekly', label: 'Weekly', icon: '📆' },
  { value: 'biweekly', label: 'Bi-weekly', icon: '🗓️' },
  { value: 'quarterly', label: 'Quarterly', icon: '📊' },
  { value: 'annually', label: 'Annually', icon: '🎂' },
];

const SUBSCRIPTION_ICONS: { [key: string]: string } = {
  'Netflix': '🎬',
  'Spotify': '🎵',
  'Apple': '🍎',
  'Amazon': '📦',
  'Disney+': '🏰',
  'HBO': '📺',
  'Gym': '💪',
  'Internet': '🌐',
  'Phone': '📱',
  'Rent': '🏠',
  'Insurance': '🛡️',
  'Utilities': '💡',
};

export const SubscriptionsScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [potentialRecurring, setPotentialRecurring] = useState<any[]>([]);
  const [showDetectedModal, setShowDetectedModal] = useState(false);

  // Form state
  const [merchantName, setMerchantName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Subscriptions');
  const [frequency, setFrequency] = useState<any>('monthly');
  const [nextDueDate, setNextDueDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      const [subs, bills, detected] = await Promise.all([
        getRecurringTransactions(user.id),
        getUpcomingBills(user.id, 30),
        detectRecurringTransactions(user.id),
      ]);

      setSubscriptions(subs);
      setUpcomingBills(bills);

      if (detected.length > 0) {
        setPotentialRecurring(detected);
        setShowDetectedModal(true);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const handleAddSubscription = async () => {
    if (!user?.id) return;

    const amountNum = parseFloat(amount);
    if (!merchantName || !amountNum || amountNum <= 0) {
      Alert.alert('Invalid Input', 'Please fill in all required fields.');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];

      const data: RecurringTransaction = {
        user_id: user.id,
        type: 'expense',
        category,
        merchant_name: merchantName,
        amount: amountNum,
        frequency,
        start_date: today,
        next_due_date: nextDueDate || today,
        reminder_days_before: 3,
      };

      await createRecurringTransaction(data);
      await loadData();

      // Reset form
      setMerchantName('');
      setAmount('');
      setCategory('Subscriptions');
      setFrequency('monthly');
      setNextDueDate('');
      setShowAddModal(false);

      Alert.alert('Success!', `${merchantName} subscription added.`);
    } catch (error) {
      console.error('Error adding subscription:', error);
      Alert.alert('Error', 'Failed to add subscription.');
    }
  };

  const calculateMonthlyTotal = () => {
    return subscriptions.reduce((total, sub) => {
      const factor = sub.frequency === 'weekly' ? 4.33 :
        sub.frequency === 'biweekly' ? 2.17 :
          sub.frequency === 'quarterly' ? 0.33 :
            sub.frequency === 'annually' ? 0.083 : 1;

      return total + (sub.amount * factor);
    }, 0);
  };

  const getIcon = (merchantName: string) => {
    const found = Object.keys(SUBSCRIPTION_ICONS).find(key =>
      merchantName?.toLowerCase().includes(key.toLowerCase())
    );
    return found ? SUBSCRIPTION_ICONS[found] : '💳';
  };

  const formatNextDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Due Today';
    if (diffDays === 1) return 'Due Tomorrow';
    if (diffDays < 0) return 'Overdue';
    if (diffDays <= 7) return `Due in ${diffDays} days`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderAddModal = () => (
    <Modal visible={showAddModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Subscription</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              value={merchantName}
              onChangeText={setMerchantName}
              placeholder="Netflix, Spotify, Gym..."
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.inputLabel}>Amount</Text>
            <View style={styles.amountInput}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <Text style={styles.inputLabel}>Category</Text>
            <TextInput
              style={styles.textInput}
              value={category}
              onChangeText={setCategory}
              placeholder="Subscriptions"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.inputLabel}>Frequency</Text>
            <View style={styles.frequencyContainer}>
              {FREQUENCY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.frequencyButton,
                    frequency === option.value && styles.frequencyButtonActive,
                  ]}
                  onPress={() => setFrequency(option.value)}
                >
                  <Text style={styles.frequencyIcon}>{option.icon}</Text>
                  <Text
                    style={[
                      styles.frequencyText,
                      frequency === option.value && styles.frequencyTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleAddSubscription}>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Add Subscription</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderDetectedModal = () => (
    <Modal visible={showDetectedModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.detectedModal}>
          <Ionicons name="bulb" size={64} color={colors.finance} />
          <Text style={styles.detectedTitle}>Recurring Patterns Detected!</Text>
          <Text style={styles.detectedSubtitle}>
            We found {potentialRecurring.length} potential recurring expenses
          </Text>

          {potentialRecurring.slice(0, 3).map((pattern, index) => (
            <View key={index} style={styles.detectedItem}>
              <Text style={styles.detectedCategory}>{pattern.category}</Text>
              <Text style={styles.detectedAmount}>${pattern.amount}</Text>
              <Text style={styles.detectedCount}>{pattern.occurrence_count} times</Text>
            </View>
          ))}

          <TouchableOpacity
            style={styles.detectedButton}
            onPress={() => {
              setShowDetectedModal(false);
              setShowAddModal(true);
            }}
          >
            <Text style={styles.detectedButtonText}>Set Up Tracking</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detectedDismiss}
            onPress={() => setShowDetectedModal(false)}
          >
            <Text style={styles.detectedDismissText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscriptions & Bills</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color={colors.finance} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {/* Monthly Total Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Monthly Total</Text>
          <Text style={styles.totalAmount}>${calculateMonthlyTotal().toFixed(2)}</Text>
          <Text style={styles.totalSubtext}>{subscriptions.length} active subscriptions</Text>
        </View>

        {/* Upcoming Bills */}
        {upcomingBills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ Upcoming Bills (Next 30 Days)</Text>
            {upcomingBills.map((bill) => (
              <View key={bill.id} style={styles.billCard}>
                <View style={styles.billIcon}>
                  <Text style={styles.billEmoji}>{getIcon(bill.merchant_name)}</Text>
                </View>
                <View style={styles.billInfo}>
                  <Text style={styles.billName}>{bill.merchant_name || bill.category}</Text>
                  <Text style={styles.billDueDate}>{formatNextDueDate(bill.next_due_date)}</Text>
                </View>
                <Text style={styles.billAmount}>${bill.amount.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* All Subscriptions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 All Subscriptions</Text>

          {subscriptions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No subscriptions tracked yet</Text>
              <Text style={styles.emptySubtext}>Tap + to add your first subscription</Text>
            </View>
          ) : (
            subscriptions.map((sub) => (
              <View key={sub.id} style={styles.subscriptionCard}>
                <View style={styles.subIcon}>
                  <Text style={styles.subEmoji}>{getIcon(sub.merchant_name)}</Text>
                </View>
                <View style={styles.subInfo}>
                  <Text style={styles.subName}>{sub.merchant_name || sub.category}</Text>
                  <Text style={styles.subFrequency}>{sub.frequency}</Text>
                </View>
                <View style={styles.subPricing}>
                  <Text style={styles.subAmount}>${sub.amount.toFixed(2)}</Text>
                  <Text style={styles.subCycle}>/{sub.frequency === 'monthly' ? 'mo' : sub.frequency === 'annually' ? 'yr' : sub.frequency}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {renderAddModal()}
      {renderDetectedModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 12,
  },
  addButton: {
    padding: 4,
  },
  container: {
    flex: 1,
  },
  totalCard: {
    backgroundColor: colors.finance,
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  totalSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  billCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  billIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.finance + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  billEmoji: {
    fontSize: 24,
  },
  billInfo: {
    flex: 1,
  },
  billName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  billDueDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  billAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.finance,
  },
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  subIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  subEmoji: {
    fontSize: 24,
  },
  subInfo: {
    flex: 1,
  },
  subName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  subFrequency: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  subPricing: {
    alignItems: 'flex-end',
  },
  subAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  subCycle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  dollarSign: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    paddingVertical: 14,
  },
  frequencyContainer: {
    gap: 8,
  },
  frequencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  frequencyButtonActive: {
    backgroundColor: colors.finance + '15',
    borderColor: colors.finance,
  },
  frequencyIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  frequencyText: {
    fontSize: 16,
    color: colors.text,
  },
  frequencyTextActive: {
    fontWeight: '600',
    color: colors.finance,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.finance,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  detectedModal: {
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    margin: 20,
  },
  detectedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  detectedSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  detectedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 12,
    backgroundColor: colors.backgroundGray,
    borderRadius: 8,
    marginBottom: 8,
  },
  detectedCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  detectedAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.finance,
    marginRight: 12,
  },
  detectedCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  detectedButton: {
    backgroundColor: colors.finance,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  detectedButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  detectedDismiss: {
    marginTop: 12,
  },
  detectedDismissText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  bottomSpacer: {
    height: 40,
  },
});
