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
  const hasInteractiveTool = !!lessonContent.navigateToTool;

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
              name={lesson?.type === 'education' ? 'book' : lesson?.type === 'action' ? 'flash' : 'trophy'}
              size={48}
              color="#4A90E2"
            />
          </View>

          <Text style={styles.stepLabel}>Step {step?.number}</Text>
          <Text style={styles.introTitle}>{lessonTitle}</Text>
          <Text style={styles.introDescription}>{lesson?.description}</Text>

          <View style={styles.introStats}>
            <View style={styles.introStatBadge}>
              <Ionicons name="time-outline" size={20} color="rgba(255,255,255,0.9)" />
              <Text style={styles.introStatText}>{timeEstimate} min</Text>
            </View>
            <View style={styles.introStatBadge}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.introStatText}>+{xpReward} XP</Text>
            </View>
          </View>

          {hasInteractiveTool && (
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
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
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
});
