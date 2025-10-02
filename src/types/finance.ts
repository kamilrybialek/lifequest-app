export interface BabyStep {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  status: 'completed' | 'current' | 'locked';
  lessons: Lesson[];
  targetAmount?: number;
  currentAmount?: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'education' | 'action' | 'practice';
  status: 'completed' | 'current' | 'locked';
  xp: number;
  estimatedTime: number; // minutes
  tasks?: LessonTask[];
}

export interface LessonTask {
  id: string;
  title: string;
  completed: boolean;
}

export const BABY_STEPS: BabyStep[] = [
  {
    id: 'step1',
    number: 1,
    title: '$1,000 Emergency Fund',
    description: 'Save your first $1,000 for emergencies',
    icon: '💰',
    status: 'current',
    targetAmount: 1000,
    currentAmount: 0,
    lessons: [
      {
        id: 'step1-lesson1',
        title: 'Why Emergency Fund?',
        description: 'Learn the importance of having emergency savings',
        type: 'education',
        status: 'current',
        xp: 10,
        estimatedTime: 5,
      },
      {
        id: 'step1-lesson2',
        title: 'Create Savings Plan',
        description: 'Set up your plan to save $1,000',
        type: 'action',
        status: 'locked',
        xp: 15,
        estimatedTime: 10,
      },
      {
        id: 'step1-lesson3',
        title: 'Where to Keep Your Fund',
        description: 'Choose the right account for your money',
        type: 'education',
        status: 'locked',
        xp: 10,
        estimatedTime: 5,
      },
      {
        id: 'step1-lesson4',
        title: 'First $100 Challenge',
        description: 'Save your first $100 this week',
        type: 'action',
        status: 'locked',
        xp: 15,
        estimatedTime: 10,
      },
    ],
  },
  {
    id: 'step2',
    number: 2,
    title: 'Pay Off Debt (Snowball)',
    description: 'Eliminate all debt except your home',
    icon: '❄️',
    status: 'locked',
    lessons: [
      {
        id: 'step2-lesson1',
        title: 'List All Your Debts',
        description: 'Create a complete debt inventory',
        type: 'action',
        status: 'locked',
        xp: 15,
        estimatedTime: 10,
      },
      {
        id: 'step2-lesson2',
        title: 'Snowball Method Explained',
        description: 'Learn the debt snowball strategy',
        type: 'education',
        status: 'locked',
        xp: 10,
        estimatedTime: 5,
      },
      {
        id: 'step2-lesson3',
        title: 'Make First Payment',
        description: 'Pay extra on your smallest debt',
        type: 'action',
        status: 'locked',
        xp: 20,
        estimatedTime: 15,
      },
      {
        id: 'step2-lesson4',
        title: 'Monthly Budget Check',
        description: 'Review and optimize your spending',
        type: 'practice',
        status: 'locked',
        xp: 10,
        estimatedTime: 10,
      },
    ],
  },
  {
    id: 'step3',
    number: 3,
    title: '3-6 Months Expenses',
    description: 'Build a fully funded emergency fund',
    icon: '🛡️',
    status: 'locked',
    lessons: [
      {
        id: 'step3-lesson1',
        title: 'Calculate Monthly Expenses',
        description: 'Determine your monthly baseline',
        type: 'action',
        status: 'locked',
        xp: 15,
        estimatedTime: 15,
      },
      {
        id: 'step3-lesson2',
        title: 'Set Your Target',
        description: 'Choose 3 or 6 months goal',
        type: 'education',
        status: 'locked',
        xp: 10,
        estimatedTime: 5,
      },
      {
        id: 'step3-lesson3',
        title: 'Automate Savings',
        description: 'Set up automatic transfers',
        type: 'action',
        status: 'locked',
        xp: 20,
        estimatedTime: 10,
      },
      {
        id: 'step3-lesson4',
        title: 'Stay on Track',
        description: 'Monthly progress reviews',
        type: 'practice',
        status: 'locked',
        xp: 10,
        estimatedTime: 5,
      },
    ],
  },
  {
    id: 'step4',
    number: 4,
    title: 'Invest 15% for Retirement',
    description: 'Start building wealth for the future',
    icon: '📈',
    status: 'locked',
    lessons: [
      {
        id: 'step4-lesson1',
        title: 'Retirement Basics',
        description: 'Learn about retirement accounts',
        type: 'education',
        status: 'locked',
        xp: 15,
        estimatedTime: 10,
      },
      {
        id: 'step4-lesson2',
        title: 'Calculate 15%',
        description: 'Find your retirement contribution amount',
        type: 'action',
        status: 'locked',
        xp: 10,
        estimatedTime: 5,
      },
    ],
  },
  {
    id: 'step5',
    number: 5,
    title: "College Fund for Kids",
    description: "Save for children's education",
    icon: '🎓',
    status: 'locked',
    lessons: [
      {
        id: 'step5-lesson1',
        title: 'Education Savings Options',
        description: 'Explore 529 plans and alternatives',
        type: 'education',
        status: 'locked',
        xp: 15,
        estimatedTime: 10,
      },
    ],
  },
  {
    id: 'step6',
    number: 6,
    title: 'Pay Off Your Home',
    description: 'Become completely debt-free',
    icon: '🏠',
    status: 'locked',
    lessons: [
      {
        id: 'step6-lesson1',
        title: 'Mortgage Payoff Strategy',
        description: 'Plan to eliminate your mortgage',
        type: 'education',
        status: 'locked',
        xp: 20,
        estimatedTime: 15,
      },
    ],
  },
  {
    id: 'step7',
    number: 7,
    title: 'Build Wealth & Give',
    description: 'Invest aggressively and give generously',
    icon: '💎',
    status: 'locked',
    lessons: [
      {
        id: 'step7-lesson1',
        title: 'Wealth Building',
        description: 'Advanced investment strategies',
        type: 'education',
        status: 'locked',
        xp: 25,
        estimatedTime: 20,
      },
    ],
  },
];