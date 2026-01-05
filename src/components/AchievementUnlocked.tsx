/**
 * Achievement Unlocked Animation
 * Celebratory modal when user unlocks an achievement
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../theme';
import { ConfettiCelebration } from './animations/ConfettiCelebration';

const { width } = Dimensions.get('window');

interface AchievementUnlockedProps {
  visible: boolean;
  achievement: {
    name: string;
    description: string;
    icon: string;
    xpReward?: number;
  };
  onClose: () => void;
}

export const AchievementUnlocked: React.FC<AchievementUnlockedProps> = ({
  visible,
  achievement,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous bounce animation
      const bounce = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      bounce.start();

      return () => bounce.stop();
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      bounceAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Confetti */}
        <ConfettiCelebration active={visible} />

        {/* Achievement Card */}
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient colors={['#FFD700', '#FFA000']} style={styles.card}>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>

            {/* Achievement Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ translateY: bounceAnim }],
                },
              ]}
            >
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            </Animated.View>

            {/* Title */}
            <Text style={styles.title}>Achievement Unlocked!</Text>

            {/* Achievement Name */}
            <Text style={styles.achievementName}>{achievement.name}</Text>

            {/* Description */}
            <Text style={styles.description}>{achievement.description}</Text>

            {/* XP Reward */}
            {achievement.xpReward && (
              <View style={styles.xpBadge}>
                <Ionicons name="star" size={20} color="#FFD700" />
                <Text style={styles.xpText}>+{achievement.xpReward} XP</Text>
              </View>
            )}

            {/* Continue Button */}
            <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Awesome!</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: Math.min(width - 40, 400),
  },
  card: {
    borderRadius: borderRadius.xlarge,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  achievementIcon: {
    fontSize: 96,
  },
  title: {
    ...typography.h2,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontWeight: '800',
  },
  achievementName: {
    ...typography.h3,
    color: '#FFFFFF',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.large,
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  xpText: {
    ...typography.bodyBold,
    color: '#FFA000',
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.large,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    ...typography.bodyBold,
    color: '#FFA000',
  },
});
