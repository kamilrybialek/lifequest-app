/**
 * Currency Store
 * Manages selected currency and provides conversion utilities
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_CURRENCY, convertCurrency, formatCurrency, getCurrency } from '../constants/currencies';

interface CurrencyStore {
  currency: string;
  isLoading: boolean;
  setCurrency: (currency: string) => Promise<void>;
  loadCurrency: () => Promise<void>;
  convertToUSD: (amount: number) => number;
  convertFromUSD: (amount: number) => number;
  formatAmount: (amount: number) => string;
}

export const useCurrencyStore = create<CurrencyStore>((set, get) => ({
  currency: DEFAULT_CURRENCY,
  isLoading: true,

  /**
   * Set and persist currency
   */
  setCurrency: async (currency: string) => {
    try {
      await AsyncStorage.setItem('selectedCurrency', currency);
      set({ currency });
      console.log('💱 Currency set to:', currency);
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  },

  /**
   * Load saved currency from storage
   */
  loadCurrency: async () => {
    try {
      const saved = await AsyncStorage.getItem('selectedCurrency');
      if (saved) {
        set({ currency: saved, isLoading: false });
        console.log('💱 Currency loaded:', saved);
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading currency:', error);
      set({ isLoading: false });
    }
  },

  /**
   * Convert amount from selected currency to USD
   */
  convertToUSD: (amount: number): number => {
    const { currency } = get();
    return convertCurrency(amount, currency, 'USD');
  },

  /**
   * Convert amount from USD to selected currency
   */
  convertFromUSD: (amount: number): number => {
    const { currency } = get();
    return convertCurrency(amount, 'USD', currency);
  },

  /**
   * Format amount in selected currency
   */
  formatAmount: (amount: number): string => {
    const { currency } = get();
    return formatCurrency(amount, currency);
  },
}));
