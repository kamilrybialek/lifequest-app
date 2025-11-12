import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';

// TEST VERSION 2: Add initialization without database
export default function App() {
  const [step, setStep] = useState('Starting...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        setStep('1/4: Imports loaded ✅');
        await new Promise(resolve => setTimeout(resolve, 100));

        setStep('2/4: Testing AsyncStorage...');
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('test', 'works');
        const test = await AsyncStorage.getItem('test');
        if (test === 'works') {
          setStep('2/4: AsyncStorage works ✅');
        }
        await new Promise(resolve => setTimeout(resolve, 100));

        setStep('3/4: Testing Navigation...');
        // Don't actually load navigation yet, just check if module exists
        const nav = require('@react-navigation/native');
        setStep('3/4: Navigation module loaded ✅');
        await new Promise(resolve => setTimeout(resolve, 100));

        setStep('4/4: Testing PaperProvider...');
        const paper = require('react-native-paper');
        setStep('4/4: Paper module loaded ✅');
        await new Promise(resolve => setTimeout(resolve, 100));

        setStep('ALL TESTS PASSED! ✅');
      } catch (err) {
        console.error('❌ Initialization failed:', err);
        setError(err instanceof Error ? err.message : String(err));
        setStep('FAILED ❌');
      }
    };

    initialize();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>❌ Error Found!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.debug}>Step: {step}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#58CC02" />
      <Text style={styles.title}>Testing LifeQuest</Text>
      <Text style={styles.step}>{step}</Text>
      <Text style={styles.debug}>Platform: {Platform.OS}</Text>
      <Text style={styles.hint}>Check console for logs (F12)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#58CC02',
    marginTop: 20,
    marginBottom: 20,
  },
  step: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  debug: {
    fontSize: 14,
    color: '#666666',
    marginTop: 10,
  },
  hint: {
    fontSize: 12,
    color: '#999999',
    marginTop: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF0000',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 10,
  },
});
