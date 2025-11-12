import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';

export default function App() {
  const openGitHub = () => {
    Linking.openURL('https://github.com/kamilrybialek/lifequest-app');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>🎯 LifeQuest</Text>
        <Text style={styles.title}>Level Up Your Life</Text>
        <Text style={styles.subtitle}>
          A gamified life management app for Android & iOS
        </Text>

        <View style={styles.pillarsContainer}>
          <View style={styles.pillar}>
            <Text style={styles.pillarIcon}>💰</Text>
            <Text style={styles.pillarText}>Finance</Text>
          </View>
          <View style={styles.pillar}>
            <Text style={styles.pillarIcon}>🧠</Text>
            <Text style={styles.pillarText}>Mental</Text>
          </View>
          <View style={styles.pillar}>
            <Text style={styles.pillarIcon}>💪</Text>
            <Text style={styles.pillarText}>Physical</Text>
          </View>
          <View style={styles.pillar}>
            <Text style={styles.pillarIcon}>🥗</Text>
            <Text style={styles.pillarText}>Nutrition</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>📱</Text>
          <Text style={styles.infoText}>
            LifeQuest is a mobile-first application built with React Native and Expo.
          </Text>
          <Text style={styles.infoText}>
            Download the app on your Android or iOS device to start your journey!
          </Text>
        </View>

        <View style={styles.features}>
          <Text style={styles.featureTitle}>Features:</Text>
          <Text style={styles.feature}>✨ Gamified task management with XP and levels</Text>
          <Text style={styles.feature}>💰 Financial literacy learning path</Text>
          <Text style={styles.feature}>🧠 Mental health tools & dopamine detox</Text>
          <Text style={styles.feature}>💪 Physical fitness tracking</Text>
          <Text style={styles.feature}>🥗 Nutrition guidance & meal planning</Text>
          <Text style={styles.feature}>🏆 Achievements & streak tracking</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={openGitHub}>
          <Text style={styles.buttonText}>View on GitHub →</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Built with ❤️ using React Native, Expo & TypeScript
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    maxWidth: 600,
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  logo: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  pillarsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  pillar: {
    alignItems: 'center',
  },
  pillarIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  pillarText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  features: {
    marginBottom: 24,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  feature: {
    fontSize: 15,
    color: '#555',
    marginBottom: 8,
    paddingLeft: 8,
  },
  button: {
    backgroundColor: '#58CC02',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
