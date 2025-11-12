import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/theme';

export const DashboardScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>🏠 Dashboard</Text>
          <Text style={styles.subtitle}>Welcome to LifeQuest PWA</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Coming Soon</Text>
          <Text style={styles.cardText}>
            Full dashboard with stats, progress, and insights
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📱 PWA Features</Text>
          <Text style={styles.cardText}>
            • Offline support{'\n'}
            • Local data storage{'\n'}
            • Fast performance{'\n'}
            • Cross-platform
          </Text>
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
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  card: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    color: colors.textLight,
    lineHeight: 24,
  },
});
