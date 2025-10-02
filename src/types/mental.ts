export interface MentalFoundation {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  status: 'completed' | 'current' | 'locked';
  lessons: MentalLesson[];
}

export interface MentalLesson {
  id: string;
  title: string;
  description: string;
  type: 'education' | 'practice' | 'technique';
  status: 'completed' | 'current' | 'locked';
  xp: number;
  estimatedTime: number; // minutes
}

export const MENTAL_FOUNDATIONS: MentalFoundation[] = [
  {
    id: 'foundation1',
    number: 1,
    title: 'Dopamine Regulation',
    description: 'Reset your reward system for sustainable motivation',
    icon: '🧬',
    status: 'current',
    lessons: [
      {
        id: 'foundation1-lesson1',
        title: 'The Dopamine Crisis',
        description: 'Why you feel unmotivated and scattered',
        type: 'education',
        status: 'current',
        xp: 10,
        estimatedTime: 7,
      },
      {
        id: 'foundation1-lesson2',
        title: 'Dopamine Detox Protocol',
        description: 'Reset your baseline in 24-48 hours',
        type: 'practice',
        status: 'locked',
        xp: 20,
        estimatedTime: 10,
      },
      {
        id: 'foundation1-lesson3',
        title: 'Managing Screen Time',
        description: 'Break phone addiction permanently',
        type: 'practice',
        status: 'locked',
        xp: 15,
        estimatedTime: 7,
      },
      {
        id: 'foundation1-lesson4',
        title: 'Sustainable Motivation',
        description: 'Build long-term drive without burnout',
        type: 'technique',
        status: 'locked',
        xp: 15,
        estimatedTime: 8,
      },
    ],
  },
  {
    id: 'foundation2',
    number: 2,
    title: 'Stress Management',
    description: 'Tools to handle stress effectively',
    icon: '🧘',
    status: 'locked',
    lessons: [
      {
        id: 'foundation2-lesson1',
        title: 'Understanding Stress',
        description: 'How stress affects your body and mind',
        type: 'education',
        status: 'locked',
        xp: 10,
        estimatedTime: 5,
      },
      {
        id: 'foundation2-lesson2',
        title: 'Box Breathing',
        description: 'Master the 4-4-4-4 breathing technique',
        type: 'technique',
        status: 'locked',
        xp: 15,
        estimatedTime: 10,
      },
      {
        id: 'foundation2-lesson3',
        title: 'Physiological Sigh',
        description: 'Quick stress relief in real-time',
        type: 'technique',
        status: 'locked',
        xp: 10,
        estimatedTime: 5,
      },
      {
        id: 'foundation2-lesson4',
        title: 'Daily Stress Check',
        description: 'Monitor your stress levels',
        type: 'practice',
        status: 'locked',
        xp: 10,
        estimatedTime: 5,
      },
    ],
  },
  {
    id: 'foundation3',
    number: 3,
    title: 'Mindfulness & Gratitude',
    description: 'Cultivate presence and appreciation',
    icon: '🙏',
    status: 'locked',
    lessons: [
      {
        id: 'foundation3-lesson1',
        title: 'Science of Gratitude',
        description: 'Why gratitude rewires your brain',
        type: 'education',
        status: 'locked',
        xp: 10,
        estimatedTime: 5,
      },
      {
        id: 'foundation3-lesson2',
        title: 'Daily Gratitude Practice',
        description: 'Start your gratitude journal',
        type: 'practice',
        status: 'locked',
        xp: 15,
        estimatedTime: 5,
      },
      {
        id: 'foundation3-lesson3',
        title: 'Present Moment Awareness',
        description: 'Be here now',
        type: 'technique',
        status: 'locked',
        xp: 10,
        estimatedTime: 7,
      },
      {
        id: 'foundation3-lesson4',
        title: 'Meditation Basics',
        description: 'Your first 5-minute meditation',
        type: 'practice',
        status: 'locked',
        xp: 15,
        estimatedTime: 10,
      },
    ],
  },
  {
    id: 'foundation4',
    number: 4,
    title: 'Social Connection',
    description: 'Build meaningful relationships',
    icon: '💬',
    status: 'locked',
    lessons: [
      {
        id: 'foundation4-lesson1',
        title: 'Loneliness Crisis',
        description: 'Understanding our need for connection',
        type: 'education',
        status: 'locked',
        xp: 10,
        estimatedTime: 5,
      },
      {
        id: 'foundation4-lesson2',
        title: 'Quality Over Quantity',
        description: 'Deep connections matter most',
        type: 'education',
        status: 'locked',
        xp: 10,
        estimatedTime: 5,
      },
      {
        id: 'foundation4-lesson3',
        title: 'Reaching Out',
        description: 'Reconnect with someone today',
        type: 'practice',
        status: 'locked',
        xp: 15,
        estimatedTime: 5,
      },
      {
        id: 'foundation4-lesson4',
        title: 'Active Listening',
        description: 'Be fully present in conversations',
        type: 'technique',
        status: 'locked',
        xp: 10,
        estimatedTime: 7,
      },
    ],
  },
  {
    id: 'foundation5',
    number: 5,
    title: 'Purpose & Growth',
    description: 'Find meaning and keep evolving',
    icon: '🎯',
    status: 'locked',
    lessons: [
      {
        id: 'foundation5-lesson1',
        title: 'Finding Your Why',
        description: 'Discover what drives you',
        type: 'education',
        status: 'locked',
        xp: 15,
        estimatedTime: 10,
      },
      {
        id: 'foundation5-lesson2',
        title: 'Meaningful Goals',
        description: 'Set goals aligned with your values',
        type: 'practice',
        status: 'locked',
        xp: 15,
        estimatedTime: 10,
      },
      {
        id: 'foundation5-lesson3',
        title: 'Growth Mindset',
        description: 'Embrace challenges as opportunities',
        type: 'education',
        status: 'locked',
        xp: 10,
        estimatedTime: 7,
      },
      {
        id: 'foundation5-lesson4',
        title: 'Daily Progress',
        description: 'Track your personal growth',
        type: 'practice',
        status: 'locked',
        xp: 10,
        estimatedTime: 5,
      },
    ],
  },
];
