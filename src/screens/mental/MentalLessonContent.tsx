import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { getMentalLessonContent, MentalLessonSection } from '../../data/mentalLessonContent';
import { useAuthStore } from '../../store/authStore';
import { saveLessonProgress } from '../../database/lessons';
import { checkAndUnlockNextFoundation } from '../../database/mental';
import { addXP, updateStreak } from '../../database/user';
import { useAppStore } from '../../store/appStore';

export const MentalLessonContent = ({ route, navigation }: any) => {
  const { lessonId, lessonTitle, foundationId } = route.params;
  const content = getMentalLessonContent(lessonId);
  const { user } = useAuthStore();
  const { loadAppData } = useAppStore();

  const [answerValue, setAnswerValue] = useState('');
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (!content) {
    navigation.goBack();
    return null;
  }

  const handleComplete = async () => {
    // Validate answer
    if (content.actionQuestion.type === 'number' && !answerValue) {
      return;
    }
    if (content.actionQuestion.type === 'text' && !answerValue.trim()) {
      return;
    }
    if (content.actionQuestion.type === 'choice' && !selectedChoice) {
      return;
    }
    if (content.actionQuestion.type === 'time' && !answerValue) {
      return;
    }

    if (!user?.id) return;

    // Save answer and progress to database
    try {
      const answer = content.actionQuestion.type === 'choice' ? selectedChoice : answerValue;
      const xpEarned = 50;

      // Save lesson progress
      await saveLessonProgress(user.id, {
        lessonId,
        stepId: foundationId,
        pillar: 'mental',
        completed: true,
        actionAnswer: answer || undefined,
        xpEarned,
        completedAt: new Date().toISOString(),
      });

      // Add XP to user stats
      await addXP(user.id, xpEarned);

      // Update mental streak
      await updateStreak(user.id, 'mental');

      // Check if we should unlock next foundation
      await checkAndUnlockNextFoundation(user.id);

      // Reload app data to update dashboard
      await loadAppData();

      console.log('✅ Mental lesson completed:', lessonId, `+${xpEarned} XP`);
    } catch (error) {
      console.error('Error saving lesson progress:', error);
    }

    // Close answer modal and show success modal
    setShowAnswerModal(false);
    setTimeout(() => {
      setShowSuccessModal(true);
    }, 300);
  };

  const handleContinue = () => {
    setShowSuccessModal(false);
    navigation.navigate('MentalHealthPath');
  };

  const renderSection = (section: MentalLessonSection, index: number) => {
    const iconMap = {
      text: 'document-text',
      list: 'list',
      tip: 'bulb',
      warning: 'warning',
      example: 'star',
      science: 'flask',
    };

    const colorMap = {
      text: colors.primary,
      list: colors.mental,
      tip: '#58CC02',
      warning: '#FF9500',
      example: '#CE82FF',
      science: '#1CB0F6',
    };

    return (
      <View key={index} style={styles.section}>
        {section.title && (
          <View style={styles.sectionHeader}>
            <Ionicons
              name={iconMap[section.type] as any}
              size={24}
              color={colorMap[section.type]}
            />
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}

        <Text style={styles.sectionContent}>{section.content}</Text>

        {section.items && (
          <View style={styles.listContainer}>
            {section.items.map((item, idx) => (
              <View key={idx} style={styles.listItem}>
                <View style={[styles.bulletPoint, { backgroundColor: colorMap[section.type] }]} />
                <Text style={styles.listItemText}>{item}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderSuccessModal = () => {
    return (
      <Modal
        visible={showSuccessModal}
        animationType="fade"
        transparent={true}
        onRequestClose={handleContinue}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color={colors.success} />
            </View>

            <Text style={styles.successTitle}>Lesson Complete! 🎉</Text>
            <Text style={styles.successMessage}>
              You've earned 50 XP and taken another step towards better mental health.
            </Text>

            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>+50 XP</Text>
            </View>

            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderAnswerModal = () => {
    return (
      <Modal
        visible={showAnswerModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAnswerModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.answerModal}>
            <View style={styles.answerModalHeader}>
              <Text style={styles.answerModalTitle}>
                {content.actionQuestion.question}
              </Text>
              <TouchableOpacity onPress={() => setShowAnswerModal(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.answerModalContent}>
              {content.actionQuestion.type === 'text' && (
                <TextInput
                  style={styles.textInput}
                  value={answerValue}
                  onChangeText={setAnswerValue}
                  placeholder={content.actionQuestion.placeholder}
                  placeholderTextColor={colors.textLight}
                  multiline
                  autoFocus
                />
              )}

              {content.actionQuestion.type === 'number' && (
                <View style={styles.numberInputContainer}>
                  <TextInput
                    style={styles.numberInput}
                    value={answerValue}
                    onChangeText={setAnswerValue}
                    placeholder={content.actionQuestion.placeholder}
                    placeholderTextColor={colors.textLight}
                    keyboardType="numeric"
                    autoFocus
                  />
                  {content.actionQuestion.unit && (
                    <Text style={styles.unitText}>{content.actionQuestion.unit}</Text>
                  )}
                </View>
              )}

              {content.actionQuestion.type === 'time' && (
                <TextInput
                  style={styles.numberInput}
                  value={answerValue}
                  onChangeText={setAnswerValue}
                  placeholder={content.actionQuestion.placeholder || '07:00'}
                  placeholderTextColor={colors.textLight}
                  autoFocus
                />
              )}

              {content.actionQuestion.type === 'choice' &&
                content.actionQuestion.choices && (
                  <View style={styles.choicesContainer}>
                    {content.actionQuestion.choices.map((choice, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.choiceButton,
                          selectedChoice === choice && styles.choiceButtonSelected,
                        ]}
                        onPress={() => setSelectedChoice(choice)}
                      >
                        <Text
                          style={[
                            styles.choiceText,
                            selectedChoice === choice && styles.choiceTextSelected,
                          ]}
                        >
                          {choice}
                        </Text>
                        {selectedChoice === choice && (
                          <Ionicons name="checkmark-circle" size={24} color={colors.mental} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleComplete}>
              <Text style={styles.submitButtonText}>Complete Lesson</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {lessonTitle}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Render all sections */}
        {content.sections.map((section, index) => renderSection(section, index))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Complete Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={() => setShowAnswerModal(true)}
        >
          <Text style={styles.completeButtonText}>Complete Lesson</Text>
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {renderAnswerModal()}
      {renderSuccessModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 8,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  listContainer: {
    marginTop: 12,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 9,
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  bottomBar: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  completeButton: {
    flexDirection: 'row',
    backgroundColor: colors.mental,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerModal: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  answerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  answerModalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginRight: 12,
  },
  answerModalContent: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  unitText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginLeft: 12,
    fontWeight: '600',
  },
  choicesContainer: {
    gap: 12,
  },
  choiceButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
  },
  choiceButtonSelected: {
    borderColor: colors.mental,
    backgroundColor: colors.mental + '10',
  },
  choiceText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  choiceTextSelected: {
    fontWeight: '600',
    color: colors.mental,
  },
  submitButton: {
    backgroundColor: colors.mental,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  successModal: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 32,
    width: '85%',
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  xpBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 24,
  },
  xpText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.success,
  },
  continueButton: {
    backgroundColor: colors.mental,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
