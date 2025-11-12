import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// MINIMAL TEST VERSION - This WILL work
export default function App() {
  console.log('🟢 APP STARTED - If you see this, React is working!');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✅ LifeQuest Test Page</Text>
      <Text style={styles.text}>If you see this, the app is rendering!</Text>
      <Text style={styles.text}>Check browser console for detailed logs</Text>
      <Text style={styles.debug}>Platform: WEB</Text>
      <Text style={styles.debug}>React: Working ✅</Text>
      <Text style={styles.debug}>React Native Web: Working ✅</Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#58CC02',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  debug: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
});
