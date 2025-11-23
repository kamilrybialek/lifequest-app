/**
 * Partner Alignment Form
 * Used in Step 7: Align financially with your partner
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { savePartnerInfo, getPartnerInfo, type PartnerInfo } from '../../database/financeIntegrated.web';
import { useAuthStore } from '../../store/authStore';

interface PartnerAlignmentFormProps {
  onComplete: () => void;
}

export const PartnerAlignmentForm: React.FC<PartnerAlignmentFormProps> = ({ onComplete }) => {
  const { user } = useAuthStore();

  const [hasPartner, setHasPartner] = useState<boolean | null>(null);
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);

  // Form fields
  const [partnerName, setPartnerName] = useState('');
  const [partnerIncome, setPartnerIncome] = useState('');
  const [financiallyAligned, setFinanciallyAligned] = useState(false);
  const [jointGoalsSet, setJointGoalsSet] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadPartnerInfo();
  }, []);

  const loadPartnerInfo = async () => {
    if (!user?.id) return;
    try {
      const info = await getPartnerInfo(user.id);
      if (info) {
        setHasPartner(true);
        setPartnerInfo(info);
        setPartnerName(info.partnerName);
        setPartnerIncome(info.partnerIncome.toString());
        setFinanciallyAligned(info.financiallyAligned);
        setJointGoalsSet(info.jointGoalsSet);
        setNotes(info.notes || '');
      }
    } catch (error) {
      console.error('Error loading partner info:', error);
    }
  };

  const handleSavePartnerInfo = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    if (!partnerName.trim()) {
      Alert.alert('Missing Info', "Please enter your partner's name");
      return;
    }

    if (!partnerIncome || parseFloat(partnerIncome) < 0) {
      Alert.alert('Missing Info', "Please enter your partner's income (enter 0 if not working)");
      return;
    }

    try {
      await savePartnerInfo(user.id, {
        partnerName: partnerName.trim(),
        partnerIncome: parseFloat(partnerIncome),
        financiallyAligned,
        jointGoalsSet,
        notes: notes.trim() || undefined,
      });

      Alert.alert(
        'Success! 💑',
        `Partner information saved! ${financiallyAligned && jointGoalsSet ? "You're on the path to financial alignment!" : 'Keep working on alignment - schedule those monthly money dates!'}`,
        [{ text: 'Continue', onPress: onComplete }]
      );
    } catch (error) {
      console.error('Error saving partner info:', error);
      Alert.alert('Error', 'Failed to save partner information');
    }
  };

  const handleNoPartner = () => {
    Alert.alert(
      'Solo Financial Journey',
      "That's okay! You can still achieve financial success on your own. Many millionaires are single. Focus on your personal goals and keep moving forward!",
      [{ text: 'Continue', onPress: onComplete }]
    );
  };

  // Initial choice screen
  if (hasPartner === null) {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.choiceContainer}>
          <Ionicons name="people" size={80} color="#FF6B9D" style={styles.choiceIcon} />
          <Text style={styles.choiceTitle}>Do you have a partner/spouse?</Text>
          <Text style={styles.choiceSubtitle}>
            Financial alignment with your partner is crucial, but solo success is equally valid
          </Text>

          <TouchableOpacity style={styles.choiceButton} onPress={() => setHasPartner(true)}>
            <LinearGradient
              colors={['#FF6B9D', '#FF8BB5']}
              style={styles.choiceButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="heart" size={28} color="#FFF" />
              <Text style={styles.choiceButtonText}>Yes, I have a partner</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.choiceButtonSecondary} onPress={handleNoPartner}>
            <Ionicons name="person" size={24} color="#FF6B9D" />
            <Text style={styles.choiceButtonSecondaryText}>No, I'm doing this solo</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Partner info form
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#FF6B9D', '#FF8BB5']}
          style={styles.headerCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="heart-circle" size={48} color="#FFF" />
          <Text style={styles.headerTitle}>Financial Partner Alignment</Text>
          <Text style={styles.headerSubtitle}>
            Get on the same page financially and build wealth together
          </Text>
        </LinearGradient>

        {/* Partner Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partner Information</Text>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Partner's Name *</Text>
            <TextInput
              style={styles.textInput}
              value={partnerName}
              onChangeText={setPartnerName}
              placeholder="Enter partner's name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Partner's Monthly Income *</Text>
            <View style={styles.amountInput}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountTextInput}
                value={partnerIncome}
                onChangeText={setPartnerIncome}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#999"
              />
            </View>
            <Text style={styles.fieldHint}>Enter 0 if not currently working</Text>
          </View>
        </View>

        {/* Alignment Checklist */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alignment Status</Text>
          <Text style={styles.sectionSubtitle}>Check the boxes as you complete each step</Text>

          <TouchableOpacity
            style={styles.checkboxCard}
            onPress={() => setFinanciallyAligned(!financiallyAligned)}
          >
            <View style={[styles.checkbox, financiallyAligned && styles.checkboxChecked]}>
              {financiallyAligned && <Ionicons name="checkmark" size={24} color="#FFF" />}
            </View>
            <View style={styles.checkboxContent}>
              <Text style={styles.checkboxTitle}>We're financially aligned</Text>
              <Text style={styles.checkboxDescription}>
                We've discussed money values and agree on financial priorities
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxCard}
            onPress={() => setJointGoalsSet(!jointGoalsSet)}
          >
            <View style={[styles.checkbox, jointGoalsSet && styles.checkboxChecked]}>
              {jointGoalsSet && <Ionicons name="checkmark" size={24} color="#FFF" />}
            </View>
            <View style={styles.checkboxContent}>
              <Text style={styles.checkboxTitle}>We have joint financial goals</Text>
              <Text style={styles.checkboxDescription}>
                We've created shared goals and are working toward them together
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional notes about your financial partnership..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Tips */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={24} color="#FFB800" />
            <Text style={styles.tipTitle}>Monthly Money Dates</Text>
          </View>
          <Text style={styles.tipText}>
            Schedule a monthly "money date" with your partner. Review budget, celebrate wins, discuss
            goals. Make it fun - grab coffee or a meal. When you plan together, you win together!
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSavePartnerInfo}>
        <LinearGradient
          colors={['#FF6B9D', '#FF8BB5']}
          style={styles.saveButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="heart" size={24} color="#FFF" />
          <Text style={styles.saveButtonText}>Save Partner Alignment</Text>
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
  choiceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  choiceIcon: {
    marginBottom: 24,
  },
  choiceTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  choiceSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  choiceButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  choiceButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  choiceButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  choiceButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF6B9D',
    gap: 8,
    width: '100%',
  },
  choiceButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B9D',
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
    textAlign: 'center',
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 12,
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
  fieldHint: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textLight,
    marginTop: 4,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
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
  checkboxCard: {
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
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  checkboxContent: {
    flex: 1,
  },
  checkboxTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  checkboxDescription: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 18,
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
