import { colors } from '../theme/colors';

export interface NutritionFoundation {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  status: 'completed' | 'current' | 'locked';
  lessons: NutritionLesson[];
}

export interface NutritionTool {
  id: string;
  title: string;
  icon: string;
  description: string;
  screen: string;
  color: string;
}

export interface NutritionLesson {
  id: string;
  title: string;
  description: string;
  type: 'education' | 'practice' | 'assessment';
  status: 'completed' | 'current' | 'locked';
  xp: number;
  estimatedTime: number;
}

// 8 Foundations x 3-4 Lessons = ~28 Total Lessons
export const NUTRITION_FOUNDATIONS: NutritionFoundation[] = [
  {
    id: 'nutrition-foundation1',
    number: 1,
    title: 'Nutrition Fundamentals',
    description: 'Understanding macros, calories, and how food fuels your body',
    icon: '🥗',
    status: 'current',
    lessons: [
      {
        id: 'nutrition-foundation1-lesson1',
        title: 'Calories In vs Calories Out',
        description: 'Energy balance, TDEE, and how weight management works',
        type: 'education',
        status: 'current',
        xp: 50,
        estimatedTime: 7,
      },
      {
        id: 'nutrition-foundation1-lesson2',
        title: 'The Three Macronutrients',
        description: 'Protein, carbs, and fats - what they do and why you need them',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 8,
      },
      {
        id: 'nutrition-foundation1-lesson3',
        title: 'Micronutrients Matter',
        description: 'Vitamins, minerals, and why variety is key',
        type: 'practice',
        status: 'locked',
        xp: 50,
        estimatedTime: 6,
      },
    ],
  },
  {
    id: 'nutrition-foundation2',
    number: 2,
    title: 'Building a Balanced Plate',
    description: 'Learn to create nutritious, satisfying meals',
    icon: '🍽️',
    status: 'locked',
    lessons: [
      {
        id: 'nutrition-foundation2-lesson1',
        title: 'The Plate Method',
        description: 'Visual guide to balanced portions (50% veggies, 25% protein, 25% carbs)',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 6,
      },
      {
        id: 'nutrition-foundation2-lesson2',
        title: 'Protein at Every Meal',
        description: 'Why protein is crucial for satiety, muscle, and metabolism',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 7,
      },
      {
        id: 'nutrition-foundation2-lesson3',
        title: 'Smart Carb Choices',
        description: 'Complex vs simple carbs, fiber, and blood sugar stability',
        type: 'practice',
        status: 'locked',
        xp: 50,
        estimatedTime: 7,
      },
      {
        id: 'nutrition-foundation2-lesson4',
        title: 'Healthy Fats Explained',
        description: 'Omega-3s, saturated fats, and what to prioritize',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 6,
      },
    ],
  },
  {
    id: 'nutrition-foundation3',
    number: 3,
    title: 'Meal Planning & Prep',
    description: 'Save time, money, and stay on track with smart planning',
    icon: '📋',
    status: 'locked',
    lessons: [
      {
        id: 'nutrition-foundation3-lesson1',
        title: 'Why Meal Planning Works',
        description: 'Benefits of planning ahead for health and budget',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 5,
      },
      {
        id: 'nutrition-foundation3-lesson2',
        title: 'Weekly Meal Prep Basics',
        description: 'Batch cooking, storage tips, and time-saving strategies',
        type: 'practice',
        status: 'locked',
        xp: 50,
        estimatedTime: 8,
      },
      {
        id: 'nutrition-foundation3-lesson3',
        title: 'Shopping Smart',
        description: 'Creating a grocery list, reading labels, and budgeting',
        type: 'practice',
        status: 'locked',
        xp: 50,
        estimatedTime: 6,
      },
    ],
  },
  {
    id: 'nutrition-foundation4',
    number: 4,
    title: 'Hydration & Water Balance',
    description: 'Master proper hydration for energy and health',
    icon: '💧',
    status: 'locked',
    lessons: [
      {
        id: 'nutrition-foundation4-lesson1',
        title: 'Water is Life',
        description: 'How much water you need and signs of dehydration',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 6,
      },
      {
        id: 'nutrition-foundation4-lesson2',
        title: 'Hydration Strategy',
        description: 'Building a consistent water-drinking habit',
        type: 'practice',
        status: 'locked',
        xp: 50,
        estimatedTime: 5,
      },
      {
        id: 'nutrition-foundation4-lesson3',
        title: 'Beyond Water',
        description: 'Electrolytes, sports drinks, and when you need them',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 6,
      },
    ],
  },
  {
    id: 'nutrition-foundation5',
    number: 5,
    title: 'Sugar & Processed Foods',
    description: 'Understand and reduce hidden sugars and ultra-processed foods',
    icon: '🍬',
    status: 'locked',
    lessons: [
      {
        id: 'nutrition-foundation5-lesson1',
        title: 'The Truth About Sugar',
        description: 'Added sugars, blood sugar spikes, and health impacts',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 7,
      },
      {
        id: 'nutrition-foundation5-lesson2',
        title: 'Hidden Sugar Detective',
        description: 'Finding sugar on ingredient labels (60+ names for sugar)',
        type: 'assessment',
        status: 'locked',
        xp: 50,
        estimatedTime: 6,
      },
      {
        id: 'nutrition-foundation5-lesson3',
        title: 'Ultra-Processed Foods',
        description: 'What they are and why to limit them',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 7,
      },
      {
        id: 'nutrition-foundation5-lesson4',
        title: 'Healthier Swaps',
        description: 'Simple substitutions for common processed foods',
        type: 'practice',
        status: 'locked',
        xp: 50,
        estimatedTime: 6,
      },
    ],
  },
  {
    id: 'nutrition-foundation6',
    number: 6,
    title: 'Timing & Meal Frequency',
    description: 'When to eat for optimal energy and metabolism',
    icon: '⏰',
    status: 'locked',
    lessons: [
      {
        id: 'nutrition-foundation6-lesson1',
        title: 'Circadian Eating',
        description: 'Eating in sync with your body clock (Huberman Protocol)',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 7,
      },
      {
        id: 'nutrition-foundation6-lesson2',
        title: 'Intermittent Fasting 101',
        description: '16:8, 18:6 protocols and who they work for',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 8,
      },
      {
        id: 'nutrition-foundation6-lesson3',
        title: 'Pre & Post Workout Nutrition',
        description: 'Fueling exercise and recovery',
        type: 'practice',
        status: 'locked',
        xp: 50,
        estimatedTime: 6,
      },
    ],
  },
  {
    id: 'nutrition-foundation7',
    number: 7,
    title: 'Special Diets & Approaches',
    description: 'Explore different nutrition strategies',
    icon: '🥑',
    status: 'locked',
    lessons: [
      {
        id: 'nutrition-foundation7-lesson1',
        title: 'Mediterranean Diet',
        description: 'One of the healthiest eating patterns in the world',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 7,
      },
      {
        id: 'nutrition-foundation7-lesson2',
        title: 'Plant-Based Eating',
        description: 'Benefits, challenges, and how to get complete nutrition',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 7,
      },
      {
        id: 'nutrition-foundation7-lesson3',
        title: 'Low-Carb & Keto',
        description: 'Understanding ketogenic diets and who they help',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 7,
      },
      {
        id: 'nutrition-foundation7-lesson4',
        title: 'Finding What Works for YOU',
        description: 'Bio-individuality and experimenting safely',
        type: 'assessment',
        status: 'locked',
        xp: 50,
        estimatedTime: 6,
      },
    ],
  },
  {
    id: 'nutrition-foundation8',
    number: 8,
    title: 'Sustainable Habits & Mindset',
    description: 'Build a healthy relationship with food for life',
    icon: '🎯',
    status: 'locked',
    lessons: [
      {
        id: 'nutrition-foundation8-lesson1',
        title: 'The 80/20 Rule',
        description: 'Flexibility and balance over perfection',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 6,
      },
      {
        id: 'nutrition-foundation8-lesson2',
        title: 'Mindful Eating',
        description: 'Slow down, enjoy food, recognize fullness',
        type: 'practice',
        status: 'locked',
        xp: 50,
        estimatedTime: 7,
      },
      {
        id: 'nutrition-foundation8-lesson3',
        title: 'Eating Out & Social Events',
        description: 'Strategies for staying on track without sacrificing fun',
        type: 'practice',
        status: 'locked',
        xp: 50,
        estimatedTime: 6,
      },
      {
        id: 'nutrition-foundation8-lesson4',
        title: 'Your Nutrition Journey Continues',
        description: 'Celebrate progress and plan your next steps',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 5,
      },
    ],
  },
];

// Nutrition Tools - Integrated into the nutrition journey
export const NUTRITION_TOOLS: NutritionTool[] = [
  {
    id: 'meal-logger',
    title: 'Meal Logger',
    icon: '🍽️',
    description: 'Log meals with calories & macros',
    screen: 'MealLoggerScreen',
    color: colors.nutrition,
  },
  {
    id: 'calorie-counter',
    title: 'Calorie Calculator',
    icon: '🔥',
    description: 'Calculate BMR, TDEE & set goals',
    screen: 'CalorieCalculatorScreen',
    color: '#FF9800',
  },
  {
    id: 'water-tracker',
    title: 'Water Tracker',
    icon: '💧',
    description: 'Track daily hydration (2L goal)',
    screen: 'WaterTrackerScreen',
    color: '#1CB0F6',
  },
];
