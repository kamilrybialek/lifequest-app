/**
 * Finance Lesson Introduction - Duolingo Style
 * Modern blue gradient design with engaging visuals
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { getLessonContent } from '../../data/lessonContent';
import { FINANCE_STEPS } from '../../types/financeNew';

const { width } = Dimensions.get('window');

export const FinanceLessonIntro = ({ route, navigation }: any) => {
  const { lessonId, lessonTitle, stepId } = route.params;
  const lessonContent = getLessonContent(lessonId);

  if (!lessonContent) {
    navigation.goBack();
    return null;
  }

  // Find the step and lesson details
  const step = FINANCE_STEPS.find((s) => s.id === stepId);
  const lesson = step?.lessons.find((l) => l.id === lessonId);
  const timeEstimate = lesson?.estimatedTime || 8;
  const xpReward = lesson?.xp || 15;

  const handleStartLesson = () => {
    navigation.navigate('FinanceLessonContent', {
      lessonId,
      lessonTitle,
      stepId,
    });
  };

  // Create summary from first few sections
  const isNewStructure = 'content' in lessonContent;
  const sections = isNewStructure
    ? lessonContent.content.filter((block: any) => block.blockType === 'section').map((block: any) => block.section)
    : lessonContent.sections;

  const summary = sections
    .slice(0, 2)
    .map((s: any) => s.content)
    .join(' ')
    .substring(0, 180) + '...';

  return (
    <View style={styles.container}>
      {/* Compact Header */}
      <LinearGradient
        colors={['#4A90E2', '#5FA3E8']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.iconCircle}>
            <Ionicons name="trending-up" size={32} color="#4A90E2" />
          </View>
          <Text style={styles.headerTitle}>{lessonTitle}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* What You'll Learn Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="book" size={24} color={colors.finance} />
            </View>
            <Text style={styles.cardTitle}>What You'll Learn</Text>
          </View>
          <Text style={styles.cardText}>{summary}</Text>
        </View>

        {/* Topics Covered Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="list" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.cardTitle}>Topics Covered</Text>
          </View>
          <View style={styles.topicsList}>
            {sections.slice(0, 5).map((section: any, index: number) => (
              <View key={index} style={styles.topicItem}>
                <View style={styles.topicNumber}>
                  <Text style={styles.topicNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.topicText}>
                  {section.title || `Section ${index + 1}`}
                </Text>
                <Ionicons name="checkmark-circle" size={20} color="#E0E0E0" />
              </View>
            ))}
          </View>
        </View>

        {/* Action Question Card */}
        {lessonContent.actionQuestion && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="create" size={24} color="#FF9800" />
              </View>
              <Text style={styles.cardTitle}>You'll Be Asked</Text>
            </View>
            <View style={styles.questionPreview}>
              <Text style={styles.questionText}>{lessonContent.actionQuestion.question}</Text>
              <Text style={styles.questionHint}>
                You'll answer this at the end of the lesson
              </Text>
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Start Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartLesson}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#4CAF50', '#66BB6A']}
            style={styles.startButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.startButtonText}>START LESSON</Text>
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  topicsList: {
    gap: 12,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topicNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A90E2',
  },
  topicText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  questionPreview: {
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  questionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  questionHint: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#F5F8FA',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  startButton: {
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
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
