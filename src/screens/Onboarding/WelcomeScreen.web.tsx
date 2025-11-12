import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { useOnboardingStore } from '../../store/onboardingStore';

export const WelcomeScreen = ({ navigation }: any) => {
  const { setCurrentStep } = useOnboardingStore();

  const handleStart = () => {
    setCurrentStep('personal');
    navigation.navigate('OnboardingPersonal');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🎯</Text>
        <Text style={styles.title}>Welcome to LifeQuest!</Text>
        <Text style={styles.subtitle}>Your journey to a better life starts here</Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>
              <Text style={styles.featureBold}>2-minute assessment</Text>
              {'\n'}
              We'll understand your current state in 4 key life areas
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>
              <Text style={styles.featureBold}>Personalized path</Text>
              {'\n'}
              Get a custom learning journey tailored to your needs
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💪</Text>
            <Text style={styles.featureText}>
              <Text style={styles.featureBold}>Immediate actions</Text>
              {'\n'}
              Start with quick wins you can implement today
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📈</Text>
            <Text style={styles.featureText}>
              <Text style={styles.featureBold}>Track progress</Text>
              {'\n'}
              Monitor your growth across Finance, Mental, Physical & Nutrition
            </Text>
          </View>
        </View>

        <Text style={styles.note}>
          This assessment helps us understand where you are now, so we can guide you to where you want to be.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Let's Begin</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>Takes about 2-3 minutes</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  emoji: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 48,
  },
  features: {
    gap: 24,
    marginBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  featureBold: {
    fontWeight: '600',
    color: colors.text,
  },
  note: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
    paddingHorizontal: 16,
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
