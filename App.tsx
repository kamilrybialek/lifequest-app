import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';

// TEST VERSION 3: Test stores
export default function App() {
  const [step, setStep] = useState('Starting...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        setStep('1/6: Basic modules ✅');
        await new Promise(resolve => setTimeout(resolve, 100));

        setStep('2/6: Loading authStore...');
        const { useAuthStore } = require('./src/store/authStore');
        setStep('2/6: authStore loaded ✅');
        await new Promise(resolve => setTimeout(resolve, 100));

        setStep('3/6: Loading appStore...');
        const { useAppStore } = require('./src/store/appStore');
        setStep('3/6: appStore loaded ✅');
        await new Promise(resolve => setTimeout(resolve, 100));

        setStep('4/6: Testing authStore.loadUser...');
        const loadUser = useAuthStore.getState().loadUser;
        await loadUser();
        setStep('4/6: authStore.loadUser works ✅');
        await new Promise(resolve => setTimeout(resolve, 100));

        setStep('5/6: Testing appStore.loadAppData...');
        const loadAppData = useAppStore.getState().loadAppData;
        await loadAppData();
        setStep('5/6: appStore.loadAppData works ✅');
        await new Promise(resolve => setTimeout(resolve, 100));

        setStep('6/6: Testing database init...');
        const { initDatabase } = require('./src/database/init');
        await initDatabase();
        setStep('6/6: Database init works ✅');

        setStep('ALL TESTS PASSED! 🎉 App should work now!');
      } catch (err) {
        console.error('❌ Test failed:', err);
        console.error('❌ Stack:', err instanceof Error ? err.stack : 'No stack');
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    initialize();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>❌ Error Found!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.debug}>Failed at: {step}</Text>
        <Text style={styles.hint}>Check console for full error (F12)</Text>
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
    paddingHorizontal: 20,
  },
});
