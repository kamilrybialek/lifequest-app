export interface PhysicalFoundation {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  status: 'completed' | 'current' | 'locked';
  lessons: PhysicalLesson[];
}

export interface PhysicalLesson {
  id: string;
  title: string;
  description: string;
  type: 'education' | 'practice' | 'assessment';
  status: 'completed' | 'current' | 'locked';
  xp: number;
  estimatedTime: number;
}

// 5 Foundations x 4 Lessons = 20 Total Lessons
export const PHYSICAL_FOUNDATIONS: PhysicalFoundation[] = [
  {
    id: 'foundation1',
    number: 1,
    title: 'Understanding Your Body',
    description: 'Learn BMI, body composition, and set realistic goals',
    icon: '📊',
    status: 'current',
    lessons: [
      {
        id: 'foundation1-lesson1',
        title: 'What is BMI?',
        description: 'Understanding Body Mass Index and its limitations',
        type: 'education',
        status: 'current',
        xp: 50,
        estimatedTime: 5,
      },
      {
        id: 'foundation1-lesson2',
        title: 'Calculate Your Needs',
        description: 'TDEE, BMR, and calorie requirements',
        type: 'assessment',
        status: 'locked',
        xp: 50,
        estimatedTime: 5,
      },
      {
        id: 'foundation1-lesson3',
        title: 'Body Composition',
        description: 'Muscle vs fat - beyond the scale',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 5,
      },
      {
        id: 'foundation1-lesson4',
        title: 'Setting SMART Goals',
        description: 'Create achievable fitness goals',
        type: 'practice',
        status: 'locked',
        xp: 50,
        estimatedTime: 7,
      },
    ],
  },
  {
    id: 'foundation2',
    number: 2,
    title: 'Movement Fundamentals',
    description: 'Master the basics of exercise and movement patterns',
    icon: '🏃',
    status: 'locked',
    lessons: [
      {
        id: 'foundation2-lesson1',
        title: 'Why We Move',
        description: 'Benefits of regular physical activity',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 5,
      },
      {
        id: 'foundation2-lesson2',
        title: 'Cardio Basics',
        description: 'Heart health and aerobic exercise',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 5,
      },
      {
        id: 'foundation2-lesson3',
        title: 'Strength Training 101',
        description: 'Building muscle and bone density',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 6,
      },
      {
        id: 'foundation2-lesson4',
        title: 'Mobility & Flexibility',
        description: 'Stay mobile and prevent injury',
        type: 'practice',
        status: 'locked',
        xp: 50,
        estimatedTime: 7,
      },
    ],
  },
  {
    id: 'foundation3',
    number: 3,
    title: 'Build Your Routine',
    description: 'Create a sustainable workout schedule',
    icon: '📅',
    status: 'locked',
    lessons: [
      {
        id: 'foundation3-lesson1',
        title: 'Weekly Planning',
        description: 'Structure your training week',
        type: 'practice',
        status: 'locked',
        xp: 50,
        estimatedTime: 6,
      },
      {
        id: 'foundation3-lesson2',
        title: 'Progressive Overload',
        description: 'How to get stronger over time',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 5,
      },
      {
        id: 'foundation3-lesson3',
        title: 'Rest and Recovery',
        description: 'Why rest days matter',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 5,
      },
      {
        id: 'foundation3-lesson4',
        title: 'Track Your Progress',
        description: 'Measuring improvements',
        type: 'practice',
        status: 'locked',
        xp: 50,
        estimatedTime: 6,
      },
    ],
  },
  {
    id: 'foundation4',
    number: 4,
    title: 'Nutrition for Performance',
    description: 'Fuel your workouts and recovery',
    icon: '🍎',
    status: 'locked',
    lessons: [
      {
        id: 'foundation4-lesson1',
        title: 'Macronutrients',
        description: 'Protein, carbs, and fats explained',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 6,
      },
      {
        id: 'foundation4-lesson2',
        title: 'Meal Timing',
        description: 'Pre and post-workout nutrition',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 5,
      },
      {
        id: 'foundation4-lesson3',
        title: 'Hydration',
        description: 'Water intake for athletes',
        type: 'practice',
        status: 'locked',
        xp: 50,
        estimatedTime: 5,
      },
      {
        id: 'foundation4-lesson4',
        title: 'Plan Your Meals',
        description: 'Create a weekly meal plan',
        type: 'practice',
        status: 'locked',
        xp: 50,
        estimatedTime: 8,
      },
    ],
  },
  {
    id: 'foundation5',
    number: 5,
    title: 'Long-term Success',
    description: 'Maintain healthy habits for life',
    icon: '🎯',
    status: 'locked',
    lessons: [
      {
        id: 'foundation5-lesson1',
        title: 'Habit Formation',
        description: 'Making fitness automatic',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 5,
      },
      {
        id: 'foundation5-lesson2',
        title: 'Overcoming Plateaus',
        description: 'When progress stalls',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 6,
      },
      {
        id: 'foundation5-lesson3',
        title: 'Injury Prevention',
        description: 'Stay healthy long-term',
        type: 'education',
        status: 'locked',
        xp: 50,
        estimatedTime: 6,
      },
      {
        id: 'foundation5-lesson4',
        title: 'Your Fitness Future',
        description: 'Create a lifelong plan',
        type: 'practice',
        status: 'locked',
        xp: 50,
        estimatedTime: 8,
      },
    ],
  },
];
