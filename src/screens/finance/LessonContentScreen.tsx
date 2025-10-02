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
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { getLessonContent, LessonSection } from '../../data/lessonContent';
import { useAuthStore } from '../../store/authStore';
import { saveLessonProgress } from '../../database/lessons';
import { addEmergencyFundContribution } from '../../database/finance';

export const LessonContentScreen = ({ route, navigation }: any) => {
  const { lessonId, lessonTitle, stepId } = route.params;
  const content = getLessonContent(lessonId);
  const { user } = useAuthStore();

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
      Alert.alert('Answer Required', 'Please enter an answer to complete the lesson.');
      return;
    }
    if (content.actionQuestion.type === 'text' && !answerValue.trim()) {
      Alert.alert('Answer Required', 'Please enter an answer to complete the lesson.');
      return;
    }
    if (content.actionQuestion.type === 'choice' && !selectedChoice) {
      Alert.alert('Answer Required', 'Please select an answer to complete the lesson.');
      return;
    }

    if (!user?.id) return;

    // Save answer and progress to database
    try {
      const answer = content.actionQuestion.type === 'choice' ? selectedChoice : answerValue;

      await saveLessonProgress(user.id, {
        lessonId,
        stepId,
        completed: true,
        answer: answer || undefined,
        xpEarned: 50, // Fixed XP per lesson for now
        completedAt: new Date().toISOString(),
      });

      // If this is a Baby Step 1 lesson with a number answer, save to emergency fund
      if (stepId === 'step1' && content.actionQuestion.type === 'number' && answerValue) {
        const amount = parseFloat(answerValue);
        if (!isNaN(amount) && amount > 0) {
          await addEmergencyFundContribution(user.id, amount);
          console.log(`💰 Added $${amount} to emergency fund`);
        }
      }

      console.log('✅ Lesson completed and saved:', lessonId);
    } catch (error) {
      console.error('Error saving lesson progress:', error);
    }

    // Close answer modal and show success modal
    setShowAnswerModal(false);

    // Small delay for animation
    setTimeout(() => {
      setShowSuccessModal(true);
    }, 300);
  };

  const handleContinue = () => {
    setShowSuccessModal(false);

    // Check if this lesson requires navigation to a specific tool
    if (content.navigateToTool) {
      navigation.navigate(content.navigateToTool);
    } else {
      // Navigate back to Finance Path (it's in MainTabs)
      navigation.navigate('MainTabs', { screen: 'Finance' });
    }
  };

  const renderSection = (section: LessonSection, index: number) => {
    const iconMap = {
      text: 'document-text',
      list: 'list',
      tip: 'bulb',
      warning: 'warning',
      example: 'star',
    };

    const colorMap = {
      text: colors.primary,
      list: colors.finance,
      tip: '#58CC02',
      warning: '#FF9500',
      example: '#CE82FF',
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
                <View style={styles.bulletPoint} />
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
        transparent={true}
        animationType="fade"
        onRequestClose={handleContinue}
      >
        <View style={styles.successModalContainer}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color={colors.success} />
            </View>

            <Text style={styles.successTitle}>Lesson Complete!</Text>
            <Text style={styles.successMessage}>
              Great job! You've completed this lesson and earned XP.
            </Text>

            <View style={styles.successStatsContainer}>
              <View style={styles.successStat}>
                <Ionicons name="star" size={24} color="#FFD700" />
                <Text style={styles.successStatValue}>+50</Text>
                <Text style={styles.successStatLabel}>XP</Text>
              </View>
              <View style={styles.successStat}>
                <Ionicons name="trophy" size={24} color={colors.finance} />
                <Text style={styles.successStatValue}>1/4</Text>
                <Text style={styles.successStatLabel}>Lessons</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.successButton} onPress={handleContinue}>
              <Text style={styles.successButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderAnswerModal = () => {
    const { actionQuestion } = content;

    return (
      <Modal
        visible={showAnswerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAnswerModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowAnswerModal(false)}
          />

          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="checkbox-outline" size={32} color={colors.finance} />
              </View>
              <TouchableOpacity
                onPress={() => setShowAnswerModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>Complete the Lesson</Text>
            <Text style={styles.modalQuestion}>{actionQuestion.question}</Text>

            {actionQuestion.type === 'number' && (
              <View style={styles.modalInputContainer}>
                {actionQuestion.unit && (
                  <Text style={styles.modalUnitPrefix}>{actionQuestion.unit}</Text>
                )}
                <TextInput
                  style={styles.modalNumberInput}
                  value={answerValue}
                  onChangeText={setAnswerValue}
                  keyboardType="decimal-pad"
                  placeholder={actionQuestion.placeholder || '0'}
                  placeholderTextColor={colors.textSecondary}
                  autoFocus
                />
              </View>
            )}

            {actionQuestion.type === 'text' && (
              <TextInput
                style={styles.modalTextInput}
                value={answerValue}
                onChangeText={setAnswerValue}
                placeholder={actionQuestion.placeholder || 'Type your answer...'}
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                autoFocus
              />
            )}

            {actionQuestion.type === 'choice' && actionQuestion.choices && (
              <View style={styles.modalChoicesContainer}>
                {actionQuestion.choices.map((choice, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.modalChoiceButton,
                      selectedChoice === choice && styles.modalChoiceButtonSelected,
                    ]}
                    onPress={() => setSelectedChoice(choice)}
                  >
                    <View style={[
                      styles.modalRadio,
                      selectedChoice === choice && styles.modalRadioSelected,
                    ]}>
                      {selectedChoice === choice && (
                        <View style={styles.modalRadioDot} />
                      )}
                    </View>
                    <Text style={[
                      styles.modalChoiceText,
                      selectedChoice === choice && styles.modalChoiceTextSelected,
                    ]}>
                      {choice}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.modalCompleteButton} onPress={handleComplete}>
              <Text style={styles.modalCompleteButtonText}>Complete Lesson</Text>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
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
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{lessonTitle}</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Content Sections */}
        {content.sections.map((section, index) => renderSection(section, index))}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Complete Button */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity
          style={styles.fixedCompleteButton}
          onPress={() => setShowAnswerModal(true)}
        >
          <Text style={styles.fixedCompleteButtonText}>Complete Lesson</Text>
          <Ionicons name="arrow-forward-circle" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Answer Modal */}
      {renderAnswerModal()}

      {/* Success Modal */}
      {renderSuccessModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  listContainer: {
    marginTop: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.finance,
    marginTop: 9,
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
  },
  bottomSpacer: {
    height: 100,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  fixedCompleteButton: {
    backgroundColor: colors.finance,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  fixedCompleteButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.finance + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  modalQuestion: {
    fontSize: 17,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 24,
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.finance,
  },
  modalUnitPrefix: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  modalNumberInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    paddingVertical: 16,
  },
  modalTextInput: {
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.finance,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalChoicesContainer: {
    marginBottom: 24,
  },
  modalChoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modalChoiceButtonSelected: {
    borderColor: colors.finance,
    backgroundColor: colors.finance + '15',
  },
  modalRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalRadioSelected: {
    borderColor: colors.finance,
  },
  modalRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.finance,
  },
  modalChoiceText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  modalChoiceTextSelected: {
    fontWeight: '600',
    color: colors.finance,
  },
  modalCompleteButton: {
    backgroundColor: colors.finance,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  modalCompleteButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Success Modal styles
  successModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModalContent: {
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  successStatsContainer: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 32,
  },
  successStat: {
    alignItems: 'center',
    gap: 8,
  },
  successStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  successStatLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  successButton: {
    backgroundColor: colors.finance,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    width: '100%',
  },
  successButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
