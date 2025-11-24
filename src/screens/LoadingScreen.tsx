/**
 * LoadingScreen - Shown while checking authentication state
 * Modern design with animations matching app's RPG theme
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

export const LoadingScreen = () => {
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Pulse animation for logo
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotation animation for loader
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    // Fade animation for text
    const fadeAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    rotateAnimation.start();
    fadeAnimation.start();

    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop();
      fadeAnimation.stop();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#1CB0F6', '#0E8AC5', '#0A7AAF']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Background decorative circles */}
      <View style={styles.backgroundDecor}>
        <View style={[styles.decorCircle, styles.decorCircle1]} />
        <View style={[styles.decorCircle, styles.decorCircle2]} />
        <View style={[styles.decorCircle, styles.decorCircle3]} />
      </View>

      <View style={styles.content}>
        {/* Animated Logo Container */}
        <Animated.View
          style={[
            styles.logoContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>🎯</Text>
          </View>
        </Animated.View>

        {/* App Name */}
        <Text style={styles.appName}>LifeQuest</Text>
        <Text style={styles.tagline}>Your Journey to Greatness</Text>

        {/* Custom Animated Loader */}
        <View style={styles.loaderContainer}>
          <Animated.View
            style={[
              styles.loaderRing,
              { transform: [{ rotate: spin }] },
            ]}
          >
            <View style={styles.loaderDot1} />
            <View style={styles.loaderDot2} />
            <View style={styles.loaderDot3} />
          </Animated.View>
        </View>

        {/* Loading Text with Fade */}
        <Animated.Text
          style={[
            styles.loadingText,
            { opacity: fadeAnim },
          ]}
        >
          Loading your adventure...
        </Animated.Text>
      </View>

      {/* Bottom decorative element */}
      <View style={styles.bottomDecor}>
        <View style={styles.wave} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundDecor: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  decorCircle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  decorCircle2: {
    width: 200,
    height: 200,
    bottom: -50,
    left: -50,
  },
  decorCircle3: {
    width: 150,
    height: 150,
    top: '40%',
    left: -75,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 60,
  },
  appName: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 50,
  },
  loaderContainer: {
    marginVertical: 30,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderRing: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  loaderDot1: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    top: 0,
    left: '50%',
    marginLeft: -8,
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  loaderDot2: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    top: '50%',
    right: 0,
    marginTop: -6,
  },
  loaderDot3: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    bottom: 0,
    left: '50%',
    marginLeft: -6,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bottomDecor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
});
