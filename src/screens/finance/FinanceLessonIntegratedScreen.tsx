/**
 * Finance Lesson Integrated Screen
 * Wraps lesson content with integrated forms based on integratedTool
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { FINANCE_STEPS } from '../../types/financeNew';
import { useAuthStore } from '../../store/authStore';
import { saveLessonProgress } from '../../database/lessons.web';
import { addXP } from '../../database/user.web';
import { NetWorthForm } from '../../components/finance/NetWorthForm';
import { IncomeSourceForm } from '../../components/finance/IncomeSourceForm';
import { FinancialGoalsForm } from '../../components/finance/FinancialGoalsForm';
import { saveLessonData, initializeFinanceData } from '../../database/financeIntegrated.web';

type LessonPhase = 'intro' | 'form' | 'complete';

export const FinanceLessonIntegratedScreen = ({ route, navigation }: any) => {
  const { lessonId, stepId, lessonTitle, toolOverride } = route.params;
  const { user } = useAuthStore();

  const [phase, setPhase] = useState<LessonPhase>('intro');
  const [completedData, setCompletedData] = useState<any>(null);

  // Find lesson details
  const step = FINANCE_STEPS.find(s => s.id === stepId);
  const lesson = step?.lessons.find(l => l.id === lessonId);

  // Use toolOverride if provided (for lessons coming from FinanceLessonContent), otherwise use lesson.integratedTool
  const toolToUse = toolOverride || lesson?.integratedTool;

  useEffect(() => {
    if (user?.id) {
      initializeFinanceData(user.id);
    }
  }, [user?.id]);

  if (!lesson) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF4B4B" />
          <Text style={styles.errorText}>Lesson not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleStartLesson = () => {
    setPhase('form');
  };

  const handleFormComplete = async (data?: any) => {
    if (!user?.id) return;

    try {
      // Save lesson data
      if (data) {
        await saveLessonData(user.id, lessonId, toolToUse || 'generic', data);
        setCompletedData(data);
      }

      // Mark lesson as completed
      await saveLessonProgress(user.id, lessonId);

      // Award XP
      await addXP(parseInt(user.id, 10), lesson.xp);

      setPhase('complete');
    } catch (error) {
      console.error('Error completing lesson:', error);
      Alert.alert('Error', 'Failed to save lesson progress. Please try again.');
    }
  };

  const handleContinue = () => {
    navigation.navigate('FinancePathNew');
  };

  // Render appropriate form based on integratedTool
  const renderForm = () => {
    switch (toolToUse) {
      case 'NetWorthCalculator':
        return <NetWorthForm onComplete={(netWorth) => handleFormComplete({ netWorth })} />;

      case 'ExpenseLogger':
      case 'FinancialSnapshot':
        return <IncomeSourceForm onComplete={() => handleFormComplete()} />;

      case 'GoalTracker':
        return <FinancialGoalsForm onComplete={() => handleFormComplete()} />;

      case 'EmergencyFund':
        return (
          <View style={styles.comingSoonContainer}>
            <Ionicons name="construct" size={64} color="#4A90E2" />
            <Text style={styles.comingSoonText}>Emergency Fund Tracker</Text>
            <Text style={styles.comingSoonSubtext}>Coming soon! For now, complete the lesson.</Text>
            <TouchableOpacity style={styles.continueButton} onPress={() => handleFormComplete()}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        );

      case 'DebtTracker':
        return (
          <View style={styles.comingSoonContainer}>
            <Ionicons name="construct" size={64} color="#FF4B4B" />
            <Text style={styles.comingSoonText}>Debt Snowball Tracker</Text>
            <Text style={styles.comingSoonSubtext}>Coming soon! Use the Debt Tracker from Finance Tools.</Text>
            <TouchableOpacity style={styles.continueButton} onPress={() => handleFormComplete()}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        // No integrated tool - show generic completion
        return (
          <View style={styles.genericContainer}>
            <View style={styles.lessonCard}>
              <Ionicons name={lesson.type === 'education' ? 'book' : 'flash'} size={64} color="#4A90E2" />
              <Text style={styles.lessonCardTitle}>{lesson.title}</Text>
              <Text style={styles.lessonCardDescription}>{lesson.description}</Text>

              <View style={styles.lessonStats}>
                <View style={styles.statBadge}>
                  <Ionicons name="time-outline" size={16} color="#4A90E2" />
                  <Text style={styles.statText}>{lesson.estimatedTime} min</Text>
                </View>
                <View style={styles.statBadge}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.statText}>{lesson.xp} XP</Text>
                </View>
              </View>

              <Text style={styles.genericMessage}>
                This lesson includes educational content. Complete it by reading through the materials in your workbook
                or finance guide.
              </Text>

              <TouchableOpacity style={styles.completeGenericButton} onPress={() => handleFormComplete()}>
                <LinearGradient
                  colors={['#4A90E2', '#5FA3E8']}
                  style={styles.completeButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.completeGenericButtonText}>Mark as Complete</Text>
                  <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  // Intro Phase
  if (phase === 'intro') {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#4A90E2', '#5FA3E8']}
          style={styles.introGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.introContent}>
            <View style={styles.iconCircle}>
              <Ionicons
                name={lesson.type === 'education' ? 'book' : lesson.type === 'action' ? 'flash' : 'trophy'}
                size={48}
                color="#4A90E2"
              />
            </View>

            <Text style={styles.stepLabel}>Step {step?.number}</Text>
            <Text style={styles.introTitle}>{lesson.title}</Text>
            <Text style={styles.introDescription}>{lesson.description}</Text>

            <View style={styles.introStats}>
              <View style={styles.introStatBadge}>
                <Ionicons name="time-outline" size={20} color="rgba(255,255,255,0.9)" />
                <Text style={styles.introStatText}>{lesson.estimatedTime} min</Text>
              </View>
              <View style={styles.introStatBadge}>
                <Ionicons name="star" size={20} color="#FFD700" />
                <Text style={styles.introStatText}>+{lesson.xp} XP</Text>
              </View>
            </View>

            {toolToUse && (
              <View style={styles.toolBadge}>
                <Ionicons name="construct" size={18} color="#4A90E2" />
                <Text style={styles.toolBadgeText}>Interactive Tool Included</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.startButton} onPress={handleStartLesson}>
            <LinearGradient
              colors={['#4CAF50', '#66BB6A']}
              style={styles.startButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.startButtonText}>Start Lesson</Text>
              <Ionicons name="arrow-forward-circle" size={24} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  // Form Phase
  if (phase === 'form') {
    return (
      <View style={styles.container}>
        <View style={styles.formHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{lesson.title}</Text>
            <Text style={styles.headerSubtitle}>Step {step?.number}</Text>
          </View>
          <View style={{ width: 28 }} />
        </View>

        {renderForm()}
      </View>
    );
  }

  // Complete Phase
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#66BB6A']}
        style={styles.completeGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.completeContent}>
          <Ionicons name="checkmark-circle" size={96} color="#FFF" />
          <Text style={styles.completeTitle}>Lesson Complete! 🎉</Text>
          <Text style={styles.completeMessage}>You earned {lesson.xp} XP</Text>

          {completedData?.netWorth !== undefined && (
            <View style={styles.completeSummary}>
              <Text style={styles.completeSummaryText}>
                Net Worth: ${completedData.netWorth.toLocaleString()}
              </Text>
            </View>
          )}

          <Text style={styles.completeSubtext}>
            {lesson.type === 'action'
              ? "Great job taking action! You're building momentum."
              : "Knowledge gained! Keep pushing forward."}
          </Text>
        </View>

        <TouchableOpacity style={styles.finishButton} onPress={handleContinue}>
          <View style={styles.finishButtonContent}>
            <Text style={styles.finishButtonText}>Continue to Journey</Text>
            <Ionicons name="arrow-forward" size={24} color="#FFF" />
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  introGradient: {
    flex: 1,
    paddingTop: 60,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  introContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  introDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 24,
  },
  introStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  introStatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  introStatText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  toolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  toolBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4A90E2',
  },
  startButton: {
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textLight,
  },
  comingSoonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  comingSoonText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  comingSoonSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  continueButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  genericContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  lessonCard: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  lessonCardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  lessonCardDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  lessonStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  genericMessage: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  completeGenericButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  completeGenericButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  completeGradient: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 24,
    marginBottom: 12,
  },
  completeMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  completeSummary: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  completeSummaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  completeSubtext: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  finishButton: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  finishButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  finishButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
});
