/**
 * New Finance Path Structure - 10 Steps Method (Marcin Iwuć)
 * International adaptation for LifeQuest app
 */

// ============================================
// QUIZ TYPES
// ============================================

export type QuizQuestionType =
  | 'multiple-choice'
  | 'true-false'
  | 'scenario'
  | 'ordering'
  | 'fill-blank'
  | 'matching'
  | 'calculation'
  | 'reflection';

export interface QuizChoice {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  question: string;
  choices?: QuizChoice[]; // for multiple-choice, true-false
  correctAnswer?: string | number; // for fill-blank, calculation
  matchingPairs?: { left: string; right: string }[]; // for matching
  orderItems?: string[]; // for ordering (correct order)
  explanation: string; // shown after answering
  xp: number; // XP for correct answer
}

// ============================================
// LESSON CONTENT TYPES
// ============================================

export interface LessonSection {
  type: 'text' | 'list' | 'tip' | 'warning' | 'example' | 'quote';
  title?: string;
  content: string;
  items?: string[]; // for list type
  author?: string; // for quote type
}

export interface ActionQuestion {
  question: string;
  type: 'number' | 'text' | 'checkbox' | 'choice' | 'fill-blank';
  placeholder?: string;
  choices?: string[];
  unit?: string; // e.g., "$", "%"
  correctAnswer?: string | number; // for fill-blank type
  toolIntegration?: string; // which tool to navigate to
}

export interface LessonContent {
  lessonId: string;
  sections: LessonSection[];
  quiz: QuizQuestion[];
  actionQuestion?: ActionQuestion;
  navigateToTool?: string; // Optional: navigate to specific tool after completion
}

// ============================================
// LESSON & STEP TYPES
// ============================================

export interface FinanceLesson {
  id: string;
  title: string;
  description: string;
  type: 'education' | 'action' | 'practice' | 'mindset' | 'celebration';
  status: 'completed' | 'current' | 'locked';
  xp: number;
  estimatedTime: number; // minutes
  integratedTool?: string; // Tool screen name
}

export interface FinanceStep {
  id: string;
  number: number;
  title: string;
  subtitle: string; // The quote/tagline
  description: string;
  icon: string;
  color: string;
  status: 'completed' | 'current' | 'locked';
  lessons: FinanceLesson[];
  targetAmount?: number; // For steps with money goals
  currentAmount?: number;
  completionCriteria?: string; // What user needs to do to complete step
}

// ============================================
// TOOL INTEGRATION
// ============================================

export interface IntegratedTool {
  id: string;
  title: string;
  icon: string;
  description: string;
  screen: string;
  color: string;
  relatedSteps: number[]; // Which steps use this tool
}

// ============================================
// USER PROGRESS
// ============================================

export interface FinanceProgress {
  userId: string;
  currentStep: number;
  completedLessons: string[];
  completedSteps: string[];
  totalXP: number;
  streak: number; // days in a row
  achievements: string[];
  lastActivityDate: string;
  // Step-specific progress
  netWorth?: number;
  emergencyFund?: number;
  emergencyFundGoal?: number;
  debtCount?: number;
  debtTotalAmount?: number;
  monthlyExpenses?: number;
  hasPartner?: boolean;
  hasHome?: boolean;
  hasInvestments?: boolean;
}

// ============================================
// ACHIEVEMENTS
// ============================================

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: (progress: FinanceProgress) => boolean;
}

// ============================================
// THE 10 STEPS DATA
// ============================================

export const FINANCE_STEPS: FinanceStep[] = [
  // STEP 1
  {
    id: 'step1',
    number: 1,
    title: 'Know Your Starting Point',
    subtitle: "You can't reach a destination without knowing where you are",
    description: 'Calculate your net worth, track money flow, and set clear goals',
    icon: '📍',
    color: '#4A90E2',
    status: 'current',
    lessons: [
      {
        id: 'step1-lesson1',
        title: 'Calculate Your Net Worth',
        description: 'Learn what net worth is and why it matters',
        type: 'education',
        status: 'current',
        xp: 50,
        estimatedTime: 8,
      },
      {
        id: 'step1-lesson2',
        title: 'Track Your Money Flow',
        description: 'Where does your money come from and go?',
        type: 'action',
        status: 'locked',
        xp: 20,
        estimatedTime: 10,
        integratedTool: 'ExpenseLogger',
      },
      {
        id: 'step1-lesson3',
        title: 'The Brutal Truth Exercise',
        description: 'Face your financial reality with no judgment',
        type: 'practice',
        status: 'locked',
        xp: 15,
        estimatedTime: 12,
        integratedTool: 'FinancialSnapshot',
      },
      {
        id: 'step1-lesson4',
        title: 'Set Your 1-Year & 5-Year Goals',
        description: 'Goals not written down are just wishes',
        type: 'action',
        status: 'locked',
        xp: 20,
        estimatedTime: 10,
        integratedTool: 'GoalTracker',
      },
    ],
    completionCriteria: 'Enter your current net worth',
  },

  // STEP 2
  {
    id: 'step2',
    number: 2,
    title: 'Save Your First $1,000',
    subtitle: 'Build your first line of defense',
    description: 'Create a starter emergency fund to cover small emergencies',
    icon: '💵',
    color: '#58CC02',
    status: 'locked',
    targetAmount: 1000,
    currentAmount: 0,
    lessons: [
      {
        id: 'step2-lesson1',
        title: 'Why $1,000 First?',
        description: 'Learn why this amount covers 80% of emergencies',
        type: 'education',
        status: 'locked',
        xp: 15,
        estimatedTime: 7,
        integratedTool: 'EmergencyFund',
      },
      {
        id: 'step2-lesson2',
        title: 'Cut the Credit Cards',
        description: 'The radical move to stop debt expansion',
        type: 'action',
        status: 'locked',
        xp: 20,
        estimatedTime: 5,
      },
      {
        id: 'step2-lesson3',
        title: 'Find Money You Didn\'t Know You Had',
        description: 'Cut expenses, sell items, and earn extra income',
        type: 'action',
        status: 'locked',
        xp: 25,
        estimatedTime: 12,
        integratedTool: 'BudgetManager',
      },
      {
        id: 'step2-lesson4',
        title: 'The First $100 Challenge',
        description: 'Save $100 in 7 days - your first victory',
        type: 'practice',
        status: 'locked',
        xp: 20,
        estimatedTime: 10,
        integratedTool: 'ChallengeTracker',
      },
      {
        id: 'step2-lesson5',
        title: 'Where to Keep Your Fund',
        description: 'Choose the right account - out of sight, out of temptation',
        type: 'education',
        status: 'locked',
        xp: 15,
        estimatedTime: 8,
      },
    ],
    completionCriteria: 'Log $1,000 in emergency fund',
  },

  // STEP 3
  {
    id: 'step3',
    number: 3,
    title: 'Eliminate All Debt',
    subtitle: 'Debt is the enemy of your financial freedom',
    description: 'Use the snowball method to become debt-free (except mortgage)',
    icon: '⚔️',
    color: '#FF4B4B',
    status: 'locked',
    lessons: [
      {
        id: 'step3-lesson1',
        title: 'This Is War!',
        description: 'Change your mindset - debt is modern slavery',
        type: 'mindset',
        status: 'locked',
        xp: 15,
        estimatedTime: 8,
        integratedTool: 'MotivationBoard',
      },
      {
        id: 'step3-lesson2',
        title: 'Good Debt vs. Bad Debt',
        description: 'Learn which debts make sense and which are stupid',
        type: 'education',
        status: 'locked',
        xp: 15,
        estimatedTime: 10,
      },
      {
        id: 'step3-lesson3',
        title: 'Snowball Method Explained',
        description: 'Psychology beats math - smallest first!',
        type: 'education',
        status: 'locked',
        xp: 20,
        estimatedTime: 10,
        integratedTool: 'DebtTracker',
      },
      {
        id: 'step3-lesson4',
        title: 'List All Your Debts',
        description: 'Face the enemy - create your complete debt inventory',
        type: 'action',
        status: 'locked',
        xp: 20,
        estimatedTime: 15,
        integratedTool: 'DebtTracker',
      },
      {
        id: 'step3-lesson5',
        title: 'First Attack: Kill Smallest Debt',
        description: 'Throw every extra dollar at your smallest debt',
        type: 'action',
        status: 'locked',
        xp: 25,
        estimatedTime: 12,
        integratedTool: 'DebtTracker',
      },
      {
        id: 'step3-lesson6',
        title: 'Stay Motivated Through the Marathon',
        description: 'How to push through months 4-8 when most people quit',
        type: 'practice',
        status: 'locked',
        xp: 20,
        estimatedTime: 10,
        integratedTool: 'ProgressVisualizer',
      },
    ],
    completionCriteria: 'Mark all consumer debts as paid off',
  },

  // STEP 4
  {
    id: 'step4',
    number: 4,
    title: 'Build 3-6 Month Emergency Fund',
    subtitle: 'From starter fund to full financial peace',
    description: 'Build a fully funded emergency fund for true security',
    icon: '🛡️',
    color: '#1CB0F6',
    status: 'locked',
    lessons: [
      {
        id: 'step4-lesson1',
        title: 'Calculate Your Number',
        description: 'How much do YOU need? (Expenses, not income!)',
        type: 'action',
        status: 'locked',
        xp: 20,
        estimatedTime: 10,
        integratedTool: 'EmergencyFundCalculator',
      },
      {
        id: 'step4-lesson2',
        title: 'How Many Months Do YOU Need?',
        description: '3, 6, or 12 months? Depends on your situation',
        type: 'education',
        status: 'locked',
        xp: 15,
        estimatedTime: 8,
      },
      {
        id: 'step4-lesson3',
        title: 'What IS an Emergency?',
        description: 'The Emergency Test: Unexpected? Necessary? Urgent?',
        type: 'education',
        status: 'locked',
        xp: 15,
        estimatedTime: 7,
      },
      {
        id: 'step4-lesson4',
        title: 'Automate Your Savings',
        description: 'Set up automatic transfers and pay yourself FIRST',
        type: 'action',
        status: 'locked',
        xp: 20,
        estimatedTime: 10,
        integratedTool: 'AutoTransferGuide',
      },
      {
        id: 'step4-lesson5',
        title: 'You Made It! Foundation Complete',
        description: 'Celebrate - you\'re in the top 20% financially!',
        type: 'celebration',
        status: 'locked',
        xp: 30,
        estimatedTime: 5,
      },
    ],
    completionCriteria: 'Log 3-6 months of expenses saved',
  },

  // STEP 5
  {
    id: 'step5',
    number: 5,
    title: 'Take Control With a Budget',
    subtitle: 'Give every dollar a job',
    description: 'Create a budget that gives you freedom, not restricts it',
    icon: '📋',
    color: '#FFB800',
    status: 'locked',
    lessons: [
      {
        id: 'step5-lesson1',
        title: 'Budget = Freedom, Not Prison',
        description: 'Why budgets give you control, not take it away',
        type: 'mindset',
        status: 'locked',
        xp: 15,
        estimatedTime: 7,
      },
      {
        id: 'step5-lesson2',
        title: 'Zero-Based Budget Basics',
        description: 'Income - Expenses = Zero. Every dollar has a job.',
        type: 'education',
        status: 'locked',
        xp: 15,
        estimatedTime: 10,
        integratedTool: 'BudgetManager',
      },
      {
        id: 'step5-lesson3',
        title: 'Track Every Expense for 30 Days',
        description: 'Awareness is the first step to change',
        type: 'action',
        status: 'locked',
        xp: 25,
        estimatedTime: 10,
        integratedTool: 'ExpenseLogger',
      },
      {
        id: 'step5-lesson4',
        title: 'Cut Expenses to the Bone',
        description: 'War mode: needs vs. wants distinction',
        type: 'action',
        status: 'locked',
        xp: 20,
        estimatedTime: 12,
        integratedTool: 'ExpenseAnalyzer',
      },
      {
        id: 'step5-lesson5',
        title: 'The 50/30/20 Rule Alternative',
        description: '50% needs, 30% wants, 20% savings',
        type: 'education',
        status: 'locked',
        xp: 15,
        estimatedTime: 8,
        integratedTool: 'BudgetCalculator',
      },
    ],
    completionCriteria: 'Create first monthly budget',
  },

  // STEP 6
  {
    id: 'step6',
    number: 6,
    title: 'Increase Your Income',
    subtitle: 'Your income is your greatest wealth-building tool',
    description: 'Systematically increase earnings through raises and side hustles',
    icon: '📈',
    color: '#CE82FF',
    status: 'locked',
    lessons: [
      {
        id: 'step6-lesson1',
        title: 'Your Holy Obligation',
        description: 'Why increasing income matters more than cutting expenses',
        type: 'mindset',
        status: 'locked',
        xp: 15,
        estimatedTime: 7,
      },
      {
        id: 'step6-lesson2',
        title: 'Negotiate Your Salary',
        description: 'How to ask for a raise and get it',
        type: 'action',
        status: 'locked',
        xp: 25,
        estimatedTime: 12,
        integratedTool: 'NegotiationGuide',
      },
      {
        id: 'step6-lesson3',
        title: 'Side Hustle Ideas',
        description: 'Find ways to earn extra income (even 60-80 hours/week)',
        type: 'education',
        status: 'locked',
        xp: 20,
        estimatedTime: 10,
        integratedTool: 'SideHustleMatcher',
      },
      {
        id: 'step6-lesson4',
        title: 'Avoid Lifestyle Inflation',
        description: 'Save 50% of every raise - break the cycle',
        type: 'practice',
        status: 'locked',
        xp: 20,
        estimatedTime: 8,
        integratedTool: 'RaiseCalculator',
      },
    ],
    completionCriteria: 'Log income increase or side hustle start',
  },

  // STEP 7
  {
    id: 'step7',
    number: 7,
    title: 'Align Your Partner',
    subtitle: "You can't win if your partner is losing",
    description: 'Get on the same financial page with your significant other',
    icon: '💑',
    color: '#FF6B9D',
    status: 'locked',
    lessons: [
      {
        id: 'step7-lesson1',
        title: 'Money Fights = Relationship Fights',
        description: 'Why financial alignment is crucial for relationships',
        type: 'education',
        status: 'locked',
        xp: 15,
        estimatedTime: 8,
      },
      {
        id: 'step7-lesson2',
        title: 'Create Joint Financial Goals',
        description: 'Dream together, plan together, succeed together',
        type: 'action',
        status: 'locked',
        xp: 20,
        estimatedTime: 10,
        integratedTool: 'JointGoalPlanner',
      },
      {
        id: 'step7-lesson3',
        title: 'Budget Together, Fight Less',
        description: 'Monthly budget meetings = date night!',
        type: 'practice',
        status: 'locked',
        xp: 20,
        estimatedTime: 10,
        integratedTool: 'SharedBudget',
      },
      {
        id: 'step7-lesson4',
        title: 'The "Red Folder" for Your Family',
        description: 'Prepare for emergencies - 11 billion in forgotten accounts',
        type: 'action',
        status: 'locked',
        xp: 20,
        estimatedTime: 12,
        integratedTool: 'RedFolder',
      },
    ],
    completionCriteria: 'Confirm partner alignment or solo commitment',
  },

  // STEP 8
  {
    id: 'step8',
    number: 8,
    title: 'Smart Home Ownership',
    subtitle: "Buy a home that won't own you",
    description: 'Learn the 20/20/30 rule and make smart housing decisions',
    icon: '🏡',
    color: '#00CD9C',
    status: 'locked',
    lessons: [
      {
        id: 'step8-lesson1',
        title: 'The 20/20/30 Rule',
        description: '20% down, 20 years max, 30% of income payment',
        type: 'education',
        status: 'locked',
        xp: 20,
        estimatedTime: 10,
        integratedTool: 'MortgageCalculator',
      },
      {
        id: 'step8-lesson2',
        title: 'How Much House Can You ACTUALLY Afford?',
        description: 'Bank approval ≠ what you can afford',
        type: 'action',
        status: 'locked',
        xp: 20,
        estimatedTime: 10,
        integratedTool: 'AffordabilityCalculator',
      },
      {
        id: 'step8-lesson3',
        title: 'Should You Rent or Buy?',
        description: 'Run the numbers honestly - renting isn\'t "throwing away money"',
        type: 'education',
        status: 'locked',
        xp: 15,
        estimatedTime: 8,
        integratedTool: 'RentVsBuyCalculator',
      },
      {
        id: 'step8-lesson4',
        title: 'Pay Off Mortgage Early',
        description: 'Extra payments save years and thousands in interest',
        type: 'practice',
        status: 'locked',
        xp: 20,
        estimatedTime: 10,
        integratedTool: 'PayoffAccelerator',
      },
    ],
    completionCriteria: 'Enter housing situation and goals',
  },

  // STEP 9
  {
    id: 'step9',
    number: 9,
    title: 'Protect Your Wealth',
    subtitle: 'Insurance and smart protection',
    description: 'Get the right insurance without overpaying',
    icon: '🛡️',
    color: '#7C4DFF',
    status: 'locked',
    lessons: [
      {
        id: 'step9-lesson1',
        title: 'The Essential Three',
        description: 'Vehicle, home, and travel health insurance - non-negotiable',
        type: 'education',
        status: 'locked',
        xp: 15,
        estimatedTime: 8,
        integratedTool: 'InsuranceChecklist',
      },
      {
        id: 'step9-lesson2',
        title: 'Life Insurance: When You Need It',
        description: 'Term vs. whole life - when it makes sense',
        type: 'education',
        status: 'locked',
        xp: 20,
        estimatedTime: 10,
        integratedTool: 'LifeInsuranceCalculator',
      },
      {
        id: 'step9-lesson3',
        title: 'Advisors vs. Salespeople',
        description: 'How to identify real advisors from commission-hungry sellers',
        type: 'education',
        status: 'locked',
        xp: 15,
        estimatedTime: 8,
        integratedTool: 'AdvisorVettingGuide',
      },
      {
        id: 'step9-lesson4',
        title: 'Health is Wealth',
        description: 'Your #1 asset is your ability to earn - protect it',
        type: 'practice',
        status: 'locked',
        xp: 15,
        estimatedTime: 7,
        integratedTool: 'HealthCostCalculator',
      },
    ],
    completionCriteria: 'Confirm insurance coverage',
  },

  // STEP 10
  {
    id: 'step10',
    number: 10,
    title: 'Invest & Build Wealth',
    subtitle: 'Now that foundation is solid, build your empire',
    description: 'Start investing for long-term wealth and financial freedom',
    icon: '💎',
    color: '#FFD700',
    status: 'locked',
    lessons: [
      {
        id: 'step10-lesson1',
        title: 'Why Invest?',
        description: 'Inflation eats cash - make your money work FOR you',
        type: 'education',
        status: 'locked',
        xp: 20,
        estimatedTime: 10,
        integratedTool: 'CompoundCalculator',
      },
      {
        id: 'step10-lesson2',
        title: 'Retirement: Start NOW',
        description: 'Automate 15% to retirement - earlier = exponential advantage',
        type: 'action',
        status: 'locked',
        xp: 25,
        estimatedTime: 12,
        integratedTool: 'RetirementPlanner',
      },
      {
        id: 'step10-lesson3',
        title: 'Understand What You Buy',
        description: 'Index funds, ETFs, diversification - simple and effective',
        type: 'education',
        status: 'locked',
        xp: 20,
        estimatedTime: 15,
        integratedTool: 'InvestmentGuide',
      },
      {
        id: 'step10-lesson4',
        title: 'Invest Based on Goals',
        description: 'Different timelines need different strategies',
        type: 'practice',
        status: 'locked',
        xp: 20,
        estimatedTime: 10,
        integratedTool: 'GoalBasedInvesting',
      },
      {
        id: 'step10-lesson5',
        title: 'Give Back',
        description: 'Wealth = ability to help others - share your success',
        type: 'mindset',
        status: 'locked',
        xp: 20,
        estimatedTime: 7,
        integratedTool: 'GivingTracker',
      },
      {
        id: 'step10-lesson6',
        title: 'Your Financial Freedom Achieved!',
        description: 'You completed all 10 steps - you\'re in the top 5%!',
        type: 'celebration',
        status: 'locked',
        xp: 50,
        estimatedTime: 5,
        integratedTool: 'FreedomDashboard',
      },
    ],
    completionCriteria: 'Log first investment made',
  },
];

// ============================================
// INTEGRATED TOOLS
// ============================================

export const INTEGRATED_TOOLS: IntegratedTool[] = [
  {
    id: 'finance-manager',
    title: 'Finance Manager',
    icon: '💰',
    description: 'Unified budget & expenses - track everything in one place',
    screen: 'BudgetManagerScreen',
    color: '#4A90E2',
    relatedSteps: [1, 2, 5],
  },
  {
    id: 'emergency-fund',
    title: 'Emergency Fund',
    icon: '🛡️',
    description: 'Track progress toward your $1,000 and 3-6 month fund',
    screen: 'EmergencyFundScreen',
    color: '#58CC02',
    relatedSteps: [2, 4],
  },
  {
    id: 'debt-tracker',
    title: 'Debt Snowball',
    icon: '⚔️',
    description: 'List debts and track snowball payoff progress',
    screen: 'DebtTrackerScreen',
    color: '#FF4B4B',
    relatedSteps: [3],
  },
  {
    id: 'savings-goals',
    title: 'Savings Goals',
    icon: '🎯',
    description: 'Set and track multiple savings goals',
    screen: 'SavingsGoalsScreen',
    color: '#00CD9C',
    relatedSteps: [1, 6, 10],
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions',
    icon: '🔄',
    description: 'Track and manage recurring bills & subscriptions',
    screen: 'SubscriptionsScreen',
    color: '#FF6B9D',
    relatedSteps: [2, 5],
  },
  {
    id: 'net-worth-calculator',
    title: 'Net Worth',
    icon: '📈',
    description: 'Calculate and track your net worth over time',
    screen: 'NetWorthCalculatorScreen',
    color: '#7C4DFF',
    relatedSteps: [1],
  },
];

// ============================================
// ACHIEVEMENTS
// ============================================

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-100',
    title: 'First $100 Saved',
    description: 'Saved your first $100 - momentum begins!',
    icon: '🎯',
    xpReward: 50,
    condition: (progress) => (progress.emergencyFund || 0) >= 100,
  },
  {
    id: 'starter-fund',
    title: 'Starter Fund Complete',
    description: 'Built $1,000 emergency fund',
    icon: '💰',
    xpReward: 100,
    condition: (progress) => (progress.emergencyFund || 0) >= 1000,
  },
  {
    id: 'debt-warrior',
    title: 'Debt Warrior',
    description: 'Eliminated all consumer debt',
    icon: '⚔️',
    xpReward: 200,
    condition: (progress) => progress.completedSteps.includes('step3'),
  },
  {
    id: 'budget-master',
    title: 'Budget Master',
    description: 'Created first monthly budget',
    icon: '📋',
    xpReward: 75,
    condition: (progress) => progress.completedSteps.includes('step5'),
  },
  {
    id: 'foundation-builder',
    title: 'Foundation Builder',
    description: 'Completed first 4 steps - solid foundation!',
    icon: '🏗️',
    xpReward: 150,
    condition: (progress) => {
      const firstFour = ['step1', 'step2', 'step3', 'step4'];
      return firstFour.every(step => progress.completedSteps.includes(step));
    },
  },
  {
    id: 'financially-free',
    title: 'Financially Free',
    description: 'Completed all 10 steps - you\'re in top 5%!',
    icon: '💎',
    xpReward: 500,
    condition: (progress) => progress.completedSteps.length === 10,
  },
  {
    id: 'week-streak',
    title: '7-Day Streak',
    description: 'Completed lessons 7 days in a row',
    icon: '🔥',
    xpReward: 50,
    condition: (progress) => progress.streak >= 7,
  },
  {
    id: 'month-streak',
    title: '30-Day Streak',
    description: 'Completed lessons 30 days in a row!',
    icon: '🔥',
    xpReward: 200,
    condition: (progress) => progress.streak >= 30,
  },
];
