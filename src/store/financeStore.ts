import { create } from 'zustand';

interface FinanceProgress {
  currentBabyStep: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  emergencyFundCurrent: number;
  emergencyFundGoal: number;
  totalDebt: number;
}

interface Debt {
  id: number;
  name: string;
  type: string;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  snowballOrder: number;
}

interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  expenseDate: string;
}

interface Budget {
  id: number;
  month: string;
  monthlyIncome: number;
  categories: BudgetCategory[];
}

interface BudgetCategory {
  id: number;
  name: string;
  emoji: string;
  allocatedAmount: number;
  spentAmount: number;
}

interface FinanceStore {
  // State
  progress: FinanceProgress | null;
  debts: Debt[];
  recentExpenses: Expense[];
  currentBudget: Budget | null;
  isLoading: boolean;

  // Actions
  setProgress: (progress: FinanceProgress) => void;
  setDebts: (debts: Debt[]) => void;
  setRecentExpenses: (expenses: Expense[]) => void;
  setCurrentBudget: (budget: Budget | null) => void;
  setLoading: (loading: boolean) => void;

  // Update helpers
  updateEmergencyFund: (amount: number) => void;
  updateBabyStep: (step: number) => void;
  addDebt: (debt: Debt) => void;
  removeDebt: (debtId: number) => void;
  addExpense: (expense: Expense) => void;

  // Reset
  reset: () => void;
}

const initialProgress: FinanceProgress = {
  currentBabyStep: 1,
  monthlyIncome: 0,
  monthlyExpenses: 0,
  emergencyFundCurrent: 0,
  emergencyFundGoal: 1000,
  totalDebt: 0,
};

export const useFinanceStore = create<FinanceStore>((set) => ({
  // Initial state
  progress: initialProgress,
  debts: [],
  recentExpenses: [],
  currentBudget: null,
  isLoading: false,

  // Actions
  setProgress: (progress) => set({ progress }),

  setDebts: (debts) => set({ debts }),

  setRecentExpenses: (expenses) => set({ recentExpenses: expenses }),

  setCurrentBudget: (budget) => set({ currentBudget: budget }),

  setLoading: (loading) => set({ isLoading: loading }),

  updateEmergencyFund: (amount) =>
    set((state) => ({
      progress: state.progress
        ? {
            ...state.progress,
            emergencyFundCurrent: state.progress.emergencyFundCurrent + amount,
          }
        : null,
    })),

  updateBabyStep: (step) =>
    set((state) => ({
      progress: state.progress
        ? { ...state.progress, currentBabyStep: step }
        : null,
    })),

  addDebt: (debt) =>
    set((state) => ({
      debts: [...state.debts, debt],
    })),

  removeDebt: (debtId) =>
    set((state) => ({
      debts: state.debts.filter((d) => d.id !== debtId),
    })),

  addExpense: (expense) =>
    set((state) => ({
      recentExpenses: [expense, ...state.recentExpenses].slice(0, 10),
    })),

  reset: () =>
    set({
      progress: initialProgress,
      debts: [],
      recentExpenses: [],
      currentBudget: null,
      isLoading: false,
    }),
}));
