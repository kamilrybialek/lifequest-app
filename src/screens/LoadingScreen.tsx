/**
 * LoadingScreen - Shown while checking authentication state
 * Light design matching app's main theme for smooth transitions
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme/colors';

export const LoadingScreen = () => {
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Pulse animation for logo
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Progress bar animation
    const progressAnimation = Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      })
    );

    // Fade animation for text
    const fadeAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.6,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    progressAnimation.start();
    fadeAnimation.start();

    return () => {
      pulseAnimation.stop();
      progressAnimation.stop();
      fadeAnimation.stop();
    };
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Background subtle pattern */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.patternCircle, styles.patternCircle1]} />
        <View style={[styles.patternCircle, styles.patternCircle2]} />
      </View>

      <View style={styles.content}>
        {/* Animated Logo Container - Card Style */}
        <Animated.View
          style={[
            styles.logoContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <View style={styles.logoCard}>
            <Text style={styles.logoText}>🎯</Text>
          </View>
        </Animated.View>

        {/* App Name */}
        <Text style={styles.appName}>LifeQuest</Text>
        <Text style={styles.tagline}>Your Journey to Greatness</Text>

        {/* Progress Bar - Blue style */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressBar,
                { width: progressWidth },
              ]}
            />
          </View>
        </View>

        {/* Loading Text with Fade */}
        <Animated.Text
          style={[
            styles.loadingText,
            { opacity: fadeAnim },
          ]}
        >
          Initializing...
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // White background
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  patternCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: colors.mental, // Blue circles
    opacity: 0.06, // Very subtle
  },
  patternCircle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  patternCircle2: {
    width: 220,
    height: 220,
    bottom: -80,
    left: -80,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoCard: {
    width: 120,
    height: 120,
    borderRadius: 20, // Card-style rounded corners
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.mental, // Blue border
    shadowColor: colors.mental,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    fontSize: 60,
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.text, // Dark text
    letterSpacing: 1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 50,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 300,
    marginVertical: 30,
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#E8F5FC', // Light blue background
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.mental, // Blue border
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.mental, // Blue progress bar
    borderRadius: 20,
  },
  loadingText: {
    fontSize: 15,
    color: colors.mental, // Blue text
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
