/**
 * Insurance Checklist Form
 * Used in Step 9: Essential insurance coverage checklist
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

interface InsuranceChecklistFormProps {
  onComplete: () => void;
}

const INSURANCE_TYPES = [
  {
    id: 'health',
    name: 'Health Insurance',
    icon: 'medkit',
    priority: 'ESSENTIAL',
    description: 'Medical bills = #1 cause of bankruptcy',
  },
  {
    id: 'life',
    name: 'Term Life Insurance',
    icon: 'heart',
    priority: 'ESSENTIAL',
    description: 'If anyone depends on your income (10-12x salary)',
  },
  {
    id: 'auto',
    name: 'Auto Insurance',
    icon: 'car',
    priority: 'REQUIRED',
    description: 'Required by law + protects your assets',
  },
  {
    id: 'home',
    name: 'Homeowners/Renters',
    icon: 'home',
    priority: 'ESSENTIAL',
    description: 'Protects home and belongings',
  },
  {
    id: 'disability',
    name: 'Disability Insurance',
    icon: 'shield-checkmark',
    priority: 'IMPORTANT',
    description: 'Covers 60% of income if you can\'t work',
  },
  {
    id: 'umbrella',
    name: 'Umbrella Policy',
    icon: 'umbrella',
    priority: 'OPTIONAL',
    description: 'Extra liability coverage ($1M+), cheap peace of mind',
  },
];

export const InsuranceChecklistForm: React.FC<InsuranceChecklistFormProps> = ({ onComplete }) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleCheck = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const handleComplete = () => {
    const essentialCount = INSURANCE_TYPES.filter(
      (type) => type.priority === 'ESSENTIAL' || type.priority === 'REQUIRED'
    ).length;
    const essentialChecked = INSURANCE_TYPES.filter(
      (type) => (type.priority === 'ESSENTIAL' || type.priority === 'REQUIRED') && checkedItems.has(type.id)
    ).length;

    if (essentialChecked < essentialCount) {
      Alert.alert(
        'Missing Essential Coverage',
        `You've checked ${essentialChecked} of ${essentialCount} essential insurance types. Make sure you have at least health, life (if dependents), auto, and home/renters insurance!`,
        [
          { text: 'Review', style: 'cancel' },
          { text: 'Continue Anyway', onPress: onComplete },
        ]
      );
    } else {
      Alert.alert(
        'Great Coverage! 🛡️',
        'You have the essential insurance coverage to protect your wealth. Review your policies annually!',
        [{ text: 'Complete', onPress: onComplete }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#7C3AED', '#9F7AEA']}
          style={styles.headerCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="shield-checkmark" size={48} color="#FFF" />
          <Text style={styles.headerTitle}>Insurance Checklist</Text>
          <Text style={styles.headerSubtitle}>Protect what you've built</Text>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Essential Coverage</Text>
          <Text style={styles.sectionSubtitle}>Check off the insurance you currently have</Text>

          {INSURANCE_TYPES.map((insurance) => (
            <TouchableOpacity
              key={insurance.id}
              style={[styles.insuranceCard, checkedItems.has(insurance.id) && styles.insuranceCardChecked]}
              onPress={() => toggleCheck(insurance.id)}
            >
              <View style={[styles.checkbox, checkedItems.has(insurance.id) && styles.checkboxChecked]}>
                {checkedItems.has(insurance.id) && <Ionicons name="checkmark" size={24} color="#FFF" />}
              </View>

              <View style={styles.insuranceIconContainer}>
                <Ionicons name={insurance.icon as any} size={28} color="#7C3AED" />
              </View>

              <View style={styles.insuranceInfo}>
                <View style={styles.insuranceHeader}>
                  <Text style={styles.insuranceName}>{insurance.name}</Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      insurance.priority === 'ESSENTIAL' && styles.priorityEssential,
                      insurance.priority === 'REQUIRED' && styles.priorityRequired,
                      insurance.priority === 'IMPORTANT' && styles.priorityImportant,
                      insurance.priority === 'OPTIONAL' && styles.priorityOptional,
                    ]}
                  >
                    <Text style={styles.priorityText}>{insurance.priority}</Text>
                  </View>
                </View>
                <Text style={styles.insuranceDescription}>{insurance.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="warning" size={24} color="#FF6B6B" />
            <Text style={styles.tipTitle}>Avoid These Traps</Text>
          </View>
          <Text style={styles.tipText}>
            Skip: Whole life insurance (buy term instead), credit card insurance, cancer-specific
            insurance. Focus on covering BIG risks that would destroy you financially.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Complete Button */}
      <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
        <LinearGradient
          colors={['#7C3AED', '#9F7AEA']}
          style={styles.completeButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.completeButtonText}>
            {checkedItems.size}/{INSURANCE_TYPES.length} Checked - Continue
          </Text>
          <Ionicons name="arrow-forward-circle" size={24} color="#FFF" />
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
    marginBottom: 16,
  },
  insuranceCard: {
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
  insuranceCardChecked: {
    borderColor: '#7C3AED',
    backgroundColor: '#F5F3FF',
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  insuranceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insuranceInfo: {
    flex: 1,
  },
  insuranceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  insuranceName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityEssential: {
    backgroundColor: '#FFE5E5',
  },
  priorityRequired: {
    backgroundColor: '#FFE5E5',
  },
  priorityImportant: {
    backgroundColor: '#FFF3E0',
  },
  priorityOptional: {
    backgroundColor: '#E8F5E9',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text,
  },
  insuranceDescription: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 18,
  },
  tipCard: {
    backgroundColor: '#FFEBEE',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
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
