/**
 * Mental Lesson Introduction - Duolingo Style
 * Modern gradient design with engaging visuals
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
import { getMentalLessonContent } from '../../data/mentalLessonContent';
import { MENTAL_FOUNDATIONS } from '../../types/mental';

const { width } = Dimensions.get('window');

export const MentalLessonIntro = ({ route, navigation }: any) => {
  const { lessonId, lessonTitle, foundationId } = route.params;
  const lessonContent = getMentalLessonContent(lessonId);

  if (!lessonContent) {
    navigation.goBack();
    return null;
  }

  // Find the foundation and lesson details
  const foundation = MENTAL_FOUNDATIONS.find((f) => f.id === foundationId);
  const lesson = foundation?.lessons.find((l) => l.id === lessonId);
  const timeEstimate = lesson?.estimatedTime || 7;
  const xpReward = lesson?.xp || 10;

  const handleStartLesson = () => {
    navigation.navigate('MentalLessonContent', {
      lessonId,
      lessonTitle,
      foundationId,
    });
  };

  // Create summary from first few sections
  const summary = lessonContent.sections
    .slice(0, 2)
    .map((s) => s.content)
    .join(' ')
    .substring(0, 180) + '...';

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#CE82FF', '#B366FF']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Mental' })} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Lesson Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="bulb" size={48} color="#CE82FF" />
            </View>
          </View>

          {/* Lesson Title */}
          <Text style={styles.headerTitle}>{lessonTitle}</Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBadge}>
              <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statText}>{timeEstimate} min</Text>
            </View>
            <View style={styles.statBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.statText}>+{xpReward} XP</Text>
            </View>
          </View>
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
            <View style={[styles.cardIconContainer, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="book" size={24} color={colors.mental} />
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
            {lessonContent.sections.map((section, index) => (
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

        {/* Motivational Quote */}
        <View style={styles.quoteCard}>
          <Ionicons name="sparkles" size={32} color="#CE82FF" />
          <Text style={styles.quoteText}>
            "Every lesson is a step towards better mental health"
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Start Button - Fixed at Bottom */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartLesson}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#CE82FF', '#B366FF']}
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
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    left: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
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
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    paddingVertical: 8,
  },
  topicNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3E5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.mental,
  },
  topicText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
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
  quoteCard: {
    backgroundColor: '#F3E5F5',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  quoteText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#CE82FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
