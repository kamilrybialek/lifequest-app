/**
 * Income Source Form
 * Used in Step 1, Lesson 2: Track Your Money Flow
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { addIncomeSource, getIncomeSources, type IncomeSource } from '../../database/financeIntegrated.web';
import { useAuthStore } from '../../store/authStore';

interface IncomeSourceFormProps {
  onComplete: () => void;
}

const INCOME_TYPES = [
  { value: 'salary', label: 'Salary/Wages', icon: 'briefcase' },
  { value: 'business', label: 'Business', icon: 'business' },
  { value: 'freelance', label: 'Freelance', icon: 'laptop' },
  { value: 'rental', label: 'Rental Income', icon: 'home' },
  { value: 'investment', label: 'Investments', icon: 'trending-up' },
  { value: 'other', label: 'Other', icon: 'cash' },
] as const;

export const IncomeSourceForm: React.FC<IncomeSourceFormProps> = ({ onComplete }) => {
  const { user } = useAuthStore();

  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form fields
  const [sourceName, setSourceName] = useState('');
  const [sourceType, setSourceType] = useState<'salary' | 'business' | 'freelance' | 'rental' | 'investment' | 'other'>('salary');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadIncomeSources();
  }, []);

  const loadIncomeSources = async () => {
    if (!user?.id) return;
    try {
      const data = await getIncomeSources(user.id);
      setSources(data);
      if (data.length === 0) {
        setShowAddForm(true);
      }
    } catch (error) {
      console.error('Error loading income sources:', error);
    }
  };

  const handleAddSource = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    if (!sourceName.trim()) {
      Alert.alert('Missing Info', 'Please enter a source name');
      return;
    }

    if (!monthlyAmount || parseFloat(monthlyAmount) <= 0) {
      Alert.alert('Missing Info', 'Please enter a valid monthly amount');
      return;
    }

    try {
      await addIncomeSource(user.id, {
        sourceName: sourceName.trim(),
        sourceType,
        monthlyAmount: parseFloat(monthlyAmount),
        startDate: new Date().toISOString().split('T')[0],
        notes: notes.trim() || undefined,
      });

      // Reset form
      setSourceName('');
      setMonthlyAmount('');
      setNotes('');
      setShowAddForm(false);

      // Reload sources
      await loadIncomeSources();

      Alert.alert('Success! 💰', 'Income source added successfully');
    } catch (error) {
      console.error('Error adding income source:', error);
      Alert.alert('Error', 'Failed to add income source');
    }
  };

  const totalMonthlyIncome = sources.reduce((sum, source) => sum + source.monthlyAmount, 0);

  const renderSourceCard = (source: IncomeSource) => {
    const typeInfo = INCOME_TYPES.find(t => t.value === source.sourceType) || INCOME_TYPES[0];

    return (
      <View key={source.id} style={styles.sourceCard}>
        <View style={styles.sourceIconContainer}>
          <Ionicons name={typeInfo.icon as any} size={24} color="#4A90E2" />
        </View>
        <View style={styles.sourceInfo}>
          <Text style={styles.sourceName}>{source.sourceName}</Text>
          <Text style={styles.sourceType}>{typeInfo.label}</Text>
        </View>
        <View style={styles.sourceAmount}>
          <Text style={styles.sourceAmountText}>${source.monthlyAmount.toLocaleString()}</Text>
          <Text style={styles.sourceAmountLabel}>/month</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Total Income Card */}
        {sources.length > 0 && (
          <LinearGradient
            colors={['#4CAF50', '#66BB6A']}
            style={styles.totalCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.totalLabel}>Total Monthly Income</Text>
            <Text style={styles.totalValue}>${totalMonthlyIncome.toLocaleString()}</Text>
            <Text style={styles.totalSubtext}>{sources.length} income source{sources.length !== 1 ? 's' : ''}</Text>
          </LinearGradient>
        )}

        {/* Existing Sources */}
        {sources.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Income Sources</Text>
            {sources.map(renderSourceCard)}
          </View>
        )}

        {/* Add Source Form */}
        {showAddForm ? (
          <View style={styles.formSection}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Add Income Source</Text>
              {sources.length > 0 && (
                <TouchableOpacity onPress={() => setShowAddForm(false)}>
                  <Ionicons name="close-circle" size={28} color={colors.textLight} />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Source Name *</Text>
              <TextInput
                style={styles.textInput}
                value={sourceName}
                onChangeText={setSourceName}
                placeholder="e.g., Main Job, Side Hustle, etc."
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                {INCOME_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeButton,
                      sourceType === type.value && styles.typeButtonActive
                    ]}
                    onPress={() => setSourceType(type.value)}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={20}
                      color={sourceType === type.value ? '#FFF' : '#4A90E2'}
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        sourceType === type.value && styles.typeButtonTextActive
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Monthly Amount *</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountTextInput}
                  value={monthlyAmount}
                  onChangeText={setMonthlyAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Notes (optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any additional details..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddSource}>
              <LinearGradient
                colors={['#4A90E2', '#5FA3E8']}
                style={styles.addButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add-circle" size={24} color="#FFF" />
                <Text style={styles.addButtonText}>Add Income Source</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addSourceButton}
            onPress={() => setShowAddForm(true)}
          >
            <Ionicons name="add-circle-outline" size={28} color="#4A90E2" />
            <Text style={styles.addSourceText}>Add Another Income Source</Text>
          </TouchableOpacity>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="bulb" size={24} color="#FFB800" />
          <Text style={styles.infoText}>
            Track all income sources to get a complete picture of your money flow. Include side hustles, freelance work,
            and passive income!
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Complete Button */}
      {sources.length > 0 && (
        <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
          <LinearGradient
            colors={['#4CAF50', '#66BB6A']}
            style={styles.completeButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.completeButtonText}>Continue to Next Lesson</Text>
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
  sourceCard: {
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
  sourceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  sourceType: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  sourceAmount: {
    alignItems: 'flex-end',
  },
  sourceAmountText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4CAF50',
  },
  sourceAmountLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textLight,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    marginTop: 4,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
    paddingHorizontal: 16,
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
    fontSize: 14,
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
  addSourceButton: {
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
  addSourceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A90E2',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
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
