import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { useOnboardingStore } from '../../store/onboardingStore';

export const WelcomeScreen = ({ navigation }: any) => {
  const { setCurrentStep } = useOnboardingStore();

  const handleStart = () => {
    setCurrentStep('personal');
    navigation.navigate('Name');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
        <Text style={styles.emoji}>🎯</Text>
        <Text style={styles.title}>Welcome to LifeQuest!</Text>
        <Text style={styles.subtitle}>Your journey to holistic self-improvement</Text>

        <View style={styles.pillarsContainer}>
          <Text style={styles.pillarsTitle}>Transform Your Life in 4 Key Areas:</Text>
          <View style={styles.pillars}>
            <View style={styles.pillar}>
              <Text style={styles.pillarIcon}>💰</Text>
              <Text style={styles.pillarName}>Finance</Text>
            </View>
            <View style={styles.pillar}>
              <Text style={styles.pillarIcon}>🧠</Text>
              <Text style={styles.pillarName}>Mental</Text>
            </View>
            <View style={styles.pillar}>
              <Text style={styles.pillarIcon}>💪</Text>
              <Text style={styles.pillarName}>Physical</Text>
            </View>
            <View style={styles.pillar}>
              <Text style={styles.pillarIcon}>🥗</Text>
              <Text style={styles.pillarName}>Nutrition</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Quick Assessment</Text>
          <Text style={styles.infoText}>
            Complete a 2-minute assessment to get your personalized learning path and immediate action steps.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Let's Begin</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>Takes about 2-3 minutes</Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  emoji: {
    fontSize: 72,
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 40,
  },
  pillarsContainer: {
    marginBottom: 32,
  },
  pillarsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  pillars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 16,
  },
  pillar: {
    alignItems: 'center',
    width: 70,
  },
  pillarIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  pillarName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#F0F9FF',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 12,
  },
});
