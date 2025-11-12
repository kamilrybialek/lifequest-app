import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { colors } from '../../theme/colors';

export const JourneyScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>🧭 Journey</Text>
          <Text style={styles.subtitle}>Your learning paths</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Finance</Text>
          <Text style={styles.cardText}>Master your money with proven strategies</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧠 Mental Health</Text>
          <Text style={styles.cardText}>Build mental resilience and clarity</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>💪 Physical Health</Text>
          <Text style={styles.cardText}>Optimize your body and energy</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🥗 Nutrition</Text>
          <Text style={styles.cardText}>Fuel your body with the right foods</Text>
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
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: colors.textLight,
  },
});
