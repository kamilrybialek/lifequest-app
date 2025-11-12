import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Minimal test screen
const TestScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>✅ Navigation Works!</Text>
    <Text style={styles.text}>AppNavigator is rendering</Text>
  </View>
);

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Test" component={TestScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
  },
});
