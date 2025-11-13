import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingData, OnboardingStep, AssessmentResult } from '../types/onboarding';
import { performAssessment } from '../utils/onboardingAssessment';
import { useAuthStore } from './authStore';

interface OnboardingState {
  currentStep: OnboardingStep;
  data: Partial<OnboardingData>;
  assessmentResult: AssessmentResult | null;

  // Actions
  setCurrentStep: (step: OnboardingStep) => void;
  updateData: (partialData: Partial<OnboardingData>) => void;
  calculateAssessment: () => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => void;
}

const initialData: Partial<OnboardingData> = {
  selectedGoals: [],
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  currentStep: 'welcome',
  data: initialData,
  assessmentResult: null,

  setCurrentStep: (step: OnboardingStep) => {
    set({ currentStep: step });
  },

  updateData: (partialData: Partial<OnboardingData>) => {
    set((state) => ({
      data: { ...state.data, ...partialData },
    }));
  },

  calculateAssessment: () => {
    const data = get().data as OnboardingData;

    // Validate that all required data is present
    if (
      !data.firstName ||
      !data.age ||
      !data.heightCm ||
      !data.weightKg ||
      data.exerciseFrequency === undefined ||
      data.fitnessLevel === undefined ||
      data.sleepHours === undefined ||
      data.healthIssues === undefined ||
      data.stressLevel === undefined ||
      data.overwhelmedFrequency === undefined ||
      data.meditationPractice === undefined ||
      data.lifeQuality === undefined ||
      data.incomeLevel === undefined ||
      data.debtLevel === undefined ||
      data.savingsLevel === undefined ||
      data.budgeting === undefined ||
      data.mealsPerDay === undefined ||
      data.fastFoodFrequency === undefined ||
      data.waterIntake === undefined ||
      data.dietQuality === undefined
    ) {
      console.error('Missing required onboarding data');
      return;
    }

    const result = performAssessment(data);
    set({ assessmentResult: result });
  },

  completeOnboarding: async () => {
    const { data, assessmentResult } = get();

    if (!assessmentResult) {
      console.error('Cannot complete onboarding without assessment');
      return;
    }

    try {
      // Save onboarding data to AsyncStorage
      await AsyncStorage.setItem('onboarding_data', JSON.stringify(data));
      await AsyncStorage.setItem('onboarding_result', JSON.stringify(assessmentResult));
      await AsyncStorage.setItem('onboarding_completed', 'true');

      console.log('✅ Onboarding data saved successfully');

      // Mark user as onboarded in auth store
      const { updateProfile } = useAuthStore.getState();
      await updateProfile({ onboarded: true });

      console.log('✅ User marked as onboarded, navigating to main app...');

      // TODO: Save to database when backend is ready
      // const userId = useAuthStore.getState().user?.id;
      // if (userId) {
      //   await saveOnboardingToDatabase(userId, data, assessmentResult);
      // }
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      throw error;
    }
  },

  resetOnboarding: () => {
    set({
      currentStep: 'welcome',
      data: initialData,
      assessmentResult: null,
    });
  },
}));
