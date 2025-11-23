/**
 * Finance Integrated Database - Web Version
 * Comprehensive financial tracking integrated with 10 Steps lessons
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// =====================
// STORAGE KEYS
// =====================

const FINANCE_PROFILE_KEY = 'lifequest.db:finance_profile';
const NET_WORTH_KEY = 'lifequest.db:net_worth';
const INCOME_SOURCES_KEY = 'lifequest.db:income_sources';
const FINANCIAL_GOALS_KEY = 'lifequest.db:financial_goals';
const PARTNER_INFO_KEY = 'lifequest.db:partner_info';
const HOUSING_INFO_KEY = 'lifequest.db:housing_info';
const INVESTMENTS_KEY = 'lifequest.db:investments';
const BUDGET_CATEGORIES_KEY = 'lifequest.db:budget_categories';
const LESSON_DATA_KEY = 'lifequest.db:lesson_data'; // Data entered during lessons

// Next ID keys
const NET_WORTH_NEXT_ID = 'lifequest.db:net_worth:next_id';
const INCOME_NEXT_ID = 'lifequest.db:income_sources:next_id';
const GOALS_NEXT_ID = 'lifequest.db:financial_goals:next_id';
const INVESTMENTS_NEXT_ID = 'lifequest.db:investments:next_id';
const BUDGET_NEXT_ID = 'lifequest.db:budget_categories:next_id';

// =====================
// TYPES
// =====================

export interface FinanceProfile {
  userId: string;
  currentStep: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  emergencyFundCurrent: number;
  emergencyFundGoal: number;
  totalDebt: number;
  netWorth: number;
  hasPartner: boolean;
  hasHome: boolean;
  hasInvestments: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NetWorthEntry {
  id: number;
  userId: string;
  // Assets
  cashSavings: number;
  checkingBalance: number;
  investments: number;
  retirement: number;
  homeValue: number;
  vehicleValue: number;
  otherAssets: number;
  // Liabilities
  mortgage: number;
  autoLoans: number;
  studentLoans: number;
  creditCards: number;
  personalLoans: number;
  otherDebts: number;
  // Calculated
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  entryDate: string;
  createdAt: string;
}

export interface IncomeSource {
  id: number;
  userId: string;
  sourceName: string;
  sourceType: 'salary' | 'business' | 'freelance' | 'rental' | 'investment' | 'other';
  monthlyAmount: number;
  isActive: boolean;
  startDate: string;
  notes?: string;
  createdAt: string;
}

export interface FinancialGoal {
  id: number;
  userId: string;
  goalName: string;
  goalType: '1-year' | '5-year' | 'long-term';
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: number; // 1-5
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerInfo {
  userId: string;
  partnerName: string;
  partnerIncome: number;
  financiallyAligned: boolean;
  jointGoalsSet: boolean;
  lastBudgetMeeting?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HousingInfo {
  userId: string;
  housingStatus: 'rent' | 'own-mortgage' | 'own-free' | 'living-with-family';
  monthlyPayment: number;
  homeValue?: number;
  mortgageBalance?: number;
  interestRate?: number;
  downPaymentSaved?: number;
  targetPurchaseDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Investment {
  id: number;
  userId: string;
  investmentName: string;
  investmentType: 'retirement-401k' | 'retirement-ira' | 'brokerage' | 'real-estate' | 'crypto' | 'other';
  currentValue: number;
  monthlyContribution: number;
  startDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  id: number;
  userId: string;
  categoryName: string;
  categoryType: 'housing' | 'transportation' | 'food' | 'debt' | 'savings' | 'insurance' | 'personal' | 'other';
  plannedAmount: number;
  spentAmount: number;
  icon: string;
  monthYear: string; // Format: 'YYYY-MM'
  createdAt: string;
  updatedAt: string;
}

export interface LessonData {
  userId: string;
  lessonId: string;
  dataType: string; // 'net-worth', 'income', 'goal', etc.
  dataValue: any; // JSON data entered during lesson
  completedAt: string;
}

// =====================
// FINANCE PROFILE
// =====================

export const getFinanceProfile = async (userId: string): Promise<FinanceProfile | null> => {
  const data = await AsyncStorage.getItem(FINANCE_PROFILE_KEY);
  const profiles = data ? JSON.parse(data) : [];
  return profiles.find((p: FinanceProfile) => p.userId === userId) || null;
};

export const createFinanceProfile = async (userId: string): Promise<void> => {
  const data = await AsyncStorage.getItem(FINANCE_PROFILE_KEY);
  const profiles = data ? JSON.parse(data) : [];

  const newProfile: FinanceProfile = {
    userId,
    currentStep: 1,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    emergencyFundCurrent: 0,
    emergencyFundGoal: 1000,
    totalDebt: 0,
    netWorth: 0,
    hasPartner: false,
    hasHome: false,
    hasInvestments: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  profiles.push(newProfile);
  await AsyncStorage.setItem(FINANCE_PROFILE_KEY, JSON.stringify(profiles));
};

export const updateFinanceProfile = async (userId: string, updates: Partial<FinanceProfile>): Promise<void> => {
  const data = await AsyncStorage.getItem(FINANCE_PROFILE_KEY);
  const profiles = data ? JSON.parse(data) : [];
  const index = profiles.findIndex((p: FinanceProfile) => p.userId === userId);

  if (index !== -1) {
    profiles[index] = {
      ...profiles[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(FINANCE_PROFILE_KEY, JSON.stringify(profiles));
  }
};

// =====================
// NET WORTH TRACKING
// =====================

export const addNetWorthEntry = async (
  userId: string,
  data: {
    cashSavings: number;
    checkingBalance: number;
    investments: number;
    retirement: number;
    homeValue: number;
    vehicleValue: number;
    otherAssets: number;
    mortgage: number;
    autoLoans: number;
    studentLoans: number;
    creditCards: number;
    personalLoans: number;
    otherDebts: number;
  }
): Promise<number> => {
  const entriesData = await AsyncStorage.getItem(NET_WORTH_KEY);
  const entries = entriesData ? JSON.parse(entriesData) : [];
  const nextIdData = await AsyncStorage.getItem(NET_WORTH_NEXT_ID);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  const totalAssets =
    data.cashSavings +
    data.checkingBalance +
    data.investments +
    data.retirement +
    data.homeValue +
    data.vehicleValue +
    data.otherAssets;

  const totalLiabilities =
    data.mortgage + data.autoLoans + data.studentLoans + data.creditCards + data.personalLoans + data.otherDebts;

  const netWorth = totalAssets - totalLiabilities;

  const newEntry: NetWorthEntry = {
    id: nextId,
    userId,
    ...data,
    totalAssets,
    totalLiabilities,
    netWorth,
    entryDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };

  entries.push(newEntry);
  await AsyncStorage.setItem(NET_WORTH_KEY, JSON.stringify(entries));
  await AsyncStorage.setItem(NET_WORTH_NEXT_ID, String(nextId + 1));

  // Update profile
  await updateFinanceProfile(userId, { netWorth });

  return netWorth;
};

export const getNetWorthHistory = async (userId: string): Promise<NetWorthEntry[]> => {
  const data = await AsyncStorage.getItem(NET_WORTH_KEY);
  const entries = data ? JSON.parse(data) : [];
  return entries
    .filter((e: NetWorthEntry) => e.userId === userId)
    .sort((a: NetWorthEntry, b: NetWorthEntry) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
};

export const getLatestNetWorth = async (userId: string): Promise<NetWorthEntry | null> => {
  const history = await getNetWorthHistory(userId);
  return history.length > 0 ? history[0] : null;
};

// =====================
// INCOME SOURCES
// =====================

export const addIncomeSource = async (
  userId: string,
  data: {
    sourceName: string;
    sourceType: 'salary' | 'business' | 'freelance' | 'rental' | 'investment' | 'other';
    monthlyAmount: number;
    startDate: string;
    notes?: string;
  }
): Promise<void> => {
  const sourcesData = await AsyncStorage.getItem(INCOME_SOURCES_KEY);
  const sources = sourcesData ? JSON.parse(sourcesData) : [];
  const nextIdData = await AsyncStorage.getItem(INCOME_NEXT_ID);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  const newSource: IncomeSource = {
    id: nextId,
    userId,
    ...data,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  sources.push(newSource);
  await AsyncStorage.setItem(INCOME_SOURCES_KEY, JSON.stringify(sources));
  await AsyncStorage.setItem(INCOME_NEXT_ID, String(nextId + 1));

  // Update total monthly income
  await updateTotalIncome(userId);
};

export const getIncomeSources = async (userId: string): Promise<IncomeSource[]> => {
  const data = await AsyncStorage.getItem(INCOME_SOURCES_KEY);
  const sources = data ? JSON.parse(data) : [];
  return sources.filter((s: IncomeSource) => s.userId === userId && s.isActive);
};

export const updateIncomeSource = async (id: number, updates: Partial<IncomeSource>): Promise<void> => {
  const data = await AsyncStorage.getItem(INCOME_SOURCES_KEY);
  const sources = data ? JSON.parse(data) : [];
  const index = sources.findIndex((s: IncomeSource) => s.id === id);

  if (index !== -1) {
    sources[index] = { ...sources[index], ...updates };
    await AsyncStorage.setItem(INCOME_SOURCES_KEY, JSON.stringify(sources));

    // Update total income
    await updateTotalIncome(sources[index].userId);
  }
};

const updateTotalIncome = async (userId: string): Promise<void> => {
  const sources = await getIncomeSources(userId);
  const totalIncome = sources.reduce((sum, s) => sum + s.monthlyAmount, 0);
  await updateFinanceProfile(userId, { monthlyIncome: totalIncome });
};

// =====================
// FINANCIAL GOALS
// =====================

export const addFinancialGoal = async (
  userId: string,
  data: {
    goalName: string;
    goalType: '1-year' | '5-year' | 'long-term';
    targetAmount: number;
    targetDate: string;
    priority: number;
    notes?: string;
  }
): Promise<void> => {
  const goalsData = await AsyncStorage.getItem(FINANCIAL_GOALS_KEY);
  const goals = goalsData ? JSON.parse(goalsData) : [];
  const nextIdData = await AsyncStorage.getItem(GOALS_NEXT_ID);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  const newGoal: FinancialGoal = {
    id: nextId,
    userId,
    ...data,
    currentAmount: 0,
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  goals.push(newGoal);
  await AsyncStorage.setItem(FINANCIAL_GOALS_KEY, JSON.stringify(goals));
  await AsyncStorage.setItem(GOALS_NEXT_ID, String(nextId + 1));
};

export const getFinancialGoals = async (userId: string): Promise<FinancialGoal[]> => {
  const data = await AsyncStorage.getItem(FINANCIAL_GOALS_KEY);
  const goals = data ? JSON.parse(data) : [];
  return goals
    .filter((g: FinancialGoal) => g.userId === userId && !g.isCompleted)
    .sort((a: FinancialGoal, b: FinancialGoal) => a.priority - b.priority);
};

export const updateGoalProgress = async (goalId: number, currentAmount: number): Promise<void> => {
  const data = await AsyncStorage.getItem(FINANCIAL_GOALS_KEY);
  const goals = data ? JSON.parse(data) : [];
  const index = goals.findIndex((g: FinancialGoal) => g.id === goalId);

  if (index !== -1) {
    const isCompleted = currentAmount >= goals[index].targetAmount;
    goals[index] = {
      ...goals[index],
      currentAmount,
      isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(FINANCIAL_GOALS_KEY, JSON.stringify(goals));
  }
};

// =====================
// PARTNER INFO
// =====================

export const savePartnerInfo = async (
  userId: string,
  data: {
    partnerName: string;
    partnerIncome: number;
    financiallyAligned: boolean;
    jointGoalsSet: boolean;
    notes?: string;
  }
): Promise<void> => {
  const partnersData = await AsyncStorage.getItem(PARTNER_INFO_KEY);
  const partners = partnersData ? JSON.parse(partnersData) : [];
  const index = partners.findIndex((p: PartnerInfo) => p.userId === userId);

  const partnerInfo: PartnerInfo = {
    userId,
    ...data,
    createdAt: index === -1 ? new Date().toISOString() : partners[index].createdAt,
    updatedAt: new Date().toISOString(),
  };

  if (index === -1) {
    partners.push(partnerInfo);
  } else {
    partners[index] = partnerInfo;
  }

  await AsyncStorage.setItem(PARTNER_INFO_KEY, JSON.stringify(partners));
  await updateFinanceProfile(userId, { hasPartner: true });
};

export const getPartnerInfo = async (userId: string): Promise<PartnerInfo | null> => {
  const data = await AsyncStorage.getItem(PARTNER_INFO_KEY);
  const partners = data ? JSON.parse(data) : [];
  return partners.find((p: PartnerInfo) => p.userId === userId) || null;
};

// =====================
// HOUSING INFO
// =====================

export const saveHousingInfo = async (
  userId: string,
  data: {
    housingStatus: 'rent' | 'own-mortgage' | 'own-free' | 'living-with-family';
    monthlyPayment: number;
    homeValue?: number;
    mortgageBalance?: number;
    interestRate?: number;
    downPaymentSaved?: number;
    targetPurchaseDate?: string;
  }
): Promise<void> => {
  const housingData = await AsyncStorage.getItem(HOUSING_INFO_KEY);
  const housing = housingData ? JSON.parse(housingData) : [];
  const index = housing.findIndex((h: HousingInfo) => h.userId === userId);

  const housingInfo: HousingInfo = {
    userId,
    ...data,
    createdAt: index === -1 ? new Date().toISOString() : housing[index].createdAt,
    updatedAt: new Date().toISOString(),
  };

  if (index === -1) {
    housing.push(housingInfo);
  } else {
    housing[index] = housingInfo;
  }

  await AsyncStorage.setItem(HOUSING_INFO_KEY, JSON.stringify(housing));
  await updateFinanceProfile(userId, { hasHome: data.housingStatus.startsWith('own') });
};

export const getHousingInfo = async (userId: string): Promise<HousingInfo | null> => {
  const data = await AsyncStorage.getItem(HOUSING_INFO_KEY);
  const housing = data ? JSON.parse(data) : [];
  return housing.find((h: HousingInfo) => h.userId === userId) || null;
};

// =====================
// INVESTMENTS
// =====================

export const addInvestment = async (
  userId: string,
  data: {
    investmentName: string;
    investmentType: 'retirement-401k' | 'retirement-ira' | 'brokerage' | 'real-estate' | 'crypto' | 'other';
    currentValue: number;
    monthlyContribution: number;
    startDate: string;
    notes?: string;
  }
): Promise<void> => {
  const investmentsData = await AsyncStorage.getItem(INVESTMENTS_KEY);
  const investments = investmentsData ? JSON.parse(investmentsData) : [];
  const nextIdData = await AsyncStorage.getItem(INVESTMENTS_NEXT_ID);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  const newInvestment: Investment = {
    id: nextId,
    userId,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  investments.push(newInvestment);
  await AsyncStorage.setItem(INVESTMENTS_KEY, JSON.stringify(investments));
  await AsyncStorage.setItem(INVESTMENTS_NEXT_ID, String(nextId + 1));
  await updateFinanceProfile(userId, { hasInvestments: true });
};

export const getInvestments = async (userId: string): Promise<Investment[]> => {
  const data = await AsyncStorage.getItem(INVESTMENTS_KEY);
  const investments = data ? JSON.parse(data) : [];
  return investments.filter((i: Investment) => i.userId === userId);
};

export const updateInvestment = async (id: number, updates: Partial<Investment>): Promise<void> => {
  const data = await AsyncStorage.getItem(INVESTMENTS_KEY);
  const investments = data ? JSON.parse(data) : [];
  const index = investments.findIndex((i: Investment) => i.id === id);

  if (index !== -1) {
    investments[index] = {
      ...investments[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(INVESTMENTS_KEY, JSON.stringify(investments));
  }
};

// =====================
// BUDGET CATEGORIES
// =====================

export const addBudgetCategory = async (
  userId: string,
  data: {
    categoryName: string;
    categoryType: 'housing' | 'transportation' | 'food' | 'debt' | 'savings' | 'insurance' | 'personal' | 'other';
    plannedAmount: number;
    icon: string;
  }
): Promise<void> => {
  const categoriesData = await AsyncStorage.getItem(BUDGET_CATEGORIES_KEY);
  const categories = categoriesData ? JSON.parse(categoriesData) : [];
  const nextIdData = await AsyncStorage.getItem(BUDGET_NEXT_ID);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  const now = new Date();
  const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const newCategory: BudgetCategory = {
    id: nextId,
    userId,
    ...data,
    spentAmount: 0,
    monthYear,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  categories.push(newCategory);
  await AsyncStorage.setItem(BUDGET_CATEGORIES_KEY, JSON.stringify(categories));
  await AsyncStorage.setItem(BUDGET_NEXT_ID, String(nextId + 1));

  // Update total expenses
  await updateTotalExpenses(userId);
};

export const getBudgetCategories = async (userId: string, monthYear?: string): Promise<BudgetCategory[]> => {
  const data = await AsyncStorage.getItem(BUDGET_CATEGORIES_KEY);
  const categories = data ? JSON.parse(data) : [];

  const now = new Date();
  const currentMonthYear = monthYear || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return categories.filter((c: BudgetCategory) => c.userId === userId && c.monthYear === currentMonthYear);
};

export const updateBudgetCategory = async (id: number, updates: Partial<BudgetCategory>): Promise<void> => {
  const data = await AsyncStorage.getItem(BUDGET_CATEGORIES_KEY);
  const categories = data ? JSON.parse(data) : [];
  const index = categories.findIndex((c: BudgetCategory) => c.id === id);

  if (index !== -1) {
    categories[index] = {
      ...categories[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(BUDGET_CATEGORIES_KEY, JSON.stringify(categories));

    // Update total expenses
    await updateTotalExpenses(categories[index].userId);
  }
};

export const deleteBudgetCategory = async (id: number): Promise<void> => {
  const data = await AsyncStorage.getItem(BUDGET_CATEGORIES_KEY);
  const categories = data ? JSON.parse(data) : [];
  const filtered = categories.filter((c: BudgetCategory) => c.id !== id);
  await AsyncStorage.setItem(BUDGET_CATEGORIES_KEY, JSON.stringify(filtered));
};

const updateTotalExpenses = async (userId: string): Promise<void> => {
  const categories = await getBudgetCategories(userId);
  const totalExpenses = categories.reduce((sum, c) => sum + c.plannedAmount, 0);
  await updateFinanceProfile(userId, { monthlyExpenses: totalExpenses });
};

// =====================
// LESSON DATA TRACKING
// =====================

export const saveLessonData = async (
  userId: string,
  lessonId: string,
  dataType: string,
  dataValue: any
): Promise<void> => {
  const lessonData = await AsyncStorage.getItem(LESSON_DATA_KEY);
  const data = lessonData ? JSON.parse(lessonData) : [];

  const newData: LessonData = {
    userId,
    lessonId,
    dataType,
    dataValue,
    completedAt: new Date().toISOString(),
  };

  data.push(newData);
  await AsyncStorage.setItem(LESSON_DATA_KEY, JSON.stringify(data));
};

export const getLessonData = async (userId: string, lessonId: string): Promise<LessonData[]> => {
  const data = await AsyncStorage.getItem(LESSON_DATA_KEY);
  const allData = data ? JSON.parse(data) : [];
  return allData.filter((d: LessonData) => d.userId === userId && d.lessonId === lessonId);
};

// =====================
// INITIALIZATION
// =====================

export const initializeFinanceData = async (userId: string): Promise<void> => {
  const profile = await getFinanceProfile(userId);
  if (!profile) {
    await createFinanceProfile(userId);
  }
};
