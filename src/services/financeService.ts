/**
 * Finance Service
 * Handles financial data operations
 */

import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';

export interface FinancialData {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  currency: string;
  updatedAt: string;
}

/**
 * Get user's financial data from Firestore or AsyncStorage
 */
export const getFinancialData = async (userId: string): Promise<FinancialData | null> => {
  try {
    // Try Firestore first
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.financialData) {
        return data.financialData as FinancialData;
      }
    }

    // Fallback to AsyncStorage
    const stored = await AsyncStorage.getItem(`financial_data_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }

    return null;
  } catch (error) {
    console.error('❌ Error getting financial data:', error);
    return null;
  }
};

/**
 * Save user's financial data
 */
export const saveFinancialData = async (
  userId: string,
  data: Partial<FinancialData>
): Promise<void> => {
  try {
    const financialData: FinancialData = {
      monthlyIncome: data.monthlyIncome || 0,
      monthlyExpenses: data.monthlyExpenses || 0,
      monthlySavings: data.monthlySavings || 0,
      currency: data.currency || 'USD',
      updatedAt: new Date().toISOString(),
    };

    // Save to Firestore
    const userRef = doc(db, 'users', userId);
    await getDoc(userRef).then(async (docSnap) => {
      if (docSnap.exists()) {
        const { updateDoc } = await import('firebase/firestore');
        await updateDoc(userRef, {
          financialData,
        });
      }
    });

    // Also save to AsyncStorage as backup
    await AsyncStorage.setItem(
      `financial_data_${userId}`,
      JSON.stringify(financialData)
    );

    console.log('✅ Financial data saved');
  } catch (error) {
    console.error('❌ Error saving financial data:', error);
    throw error;
  }
};
