/**
 * Level Up Modal
 * Celebrates when user levels up
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

interface LevelUpModalProps {
  visible: boolean;
  newLevel: number;
  previousLevel: number;
  totalXP: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  visible,
  newLevel,
  previousLevel,
  totalXP,
  onClose,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

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

      // Continuous rotation
      const rotate = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      );
      rotate.start();

      return () => rotate.stop();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Confetti */}
        <ConfettiCelebration active={visible} />

        {/* Level Up Card */}
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient colors={['#4CAF50', '#66BB6A']} style={styles.card}>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>

            {/* Rotating Star */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ rotate: rotation }],
                },
              ]}
            >
              <Ionicons name="star" size={96} color="#FFD700" />
            </Animated.View>

            {/* Title */}
            <Text style={styles.title}>Level Up!</Text>

            {/* Level Display */}
            <View style={styles.levelContainer}>
              <View style={styles.levelBox}>
                <Text style={styles.levelNumber}>{previousLevel}</Text>
              </View>
              <Ionicons name="arrow-forward" size={32} color="#FFF" style={styles.arrow} />
              <View style={[styles.levelBox, styles.levelBoxHighlight]}>
                <Text style={styles.levelNumberHighlight}>{newLevel}</Text>
              </View>
            </View>

            {/* Subtitle */}
            <Text style={styles.subtitle}>You're getting stronger!</Text>

            {/* XP Display */}
            <View style={styles.xpContainer}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.xpText}>{totalXP.toLocaleString()} Total XP</Text>
            </View>

            {/* Continue Button */}
            <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Continue</Text>
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
  title: {
    ...typography.h1,
    color: '#FFFFFF',
    marginBottom: spacing.xl,
    textAlign: 'center',
    fontWeight: '800',
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.lg,
  },
  levelBox: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.large,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBoxHighlight: {
    backgroundColor: '#FFFFFF',
  },
  levelNumber: {
    ...typography.h1,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  levelNumberHighlight: {
    ...typography.h1,
    color: '#4CAF50',
    fontWeight: '800',
  },
  arrow: {
    marginHorizontal: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.large,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  xpText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
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
    color: '#4CAF50',
  },
});
