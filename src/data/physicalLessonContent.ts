/**
 * Physical Health Lesson Content - Lesson materials for Physical Wellness Path
 * Foundation 1: Understanding Your Body (4 lessons)
 */

export interface PhysicalLessonSection {
  type: 'text' | 'list' | 'tip' | 'warning' | 'example' | 'science';
  title?: string;
  content: string;
  items?: string[];
}

export interface PhysicalLessonContent {
  lessonId: string;
  sections: PhysicalLessonSection[];
  actionQuestion: {
    question: string;
    type: 'number' | 'text' | 'choice' | 'time';
    placeholder?: string;
    choices?: string[];
    unit?: string;
  };
}

export const PHYSICAL_LESSON_CONTENTS: { [key: string]: PhysicalLessonContent } = {
  // ============================================
  // FOUNDATION 1: Understanding Your Body
  // ============================================

  'foundation1-lesson1': {
    lessonId: 'foundation1-lesson1',
    sections: [
      {
        type: 'text',
        title: 'What is BMI?',
        content: 'Body Mass Index (BMI) is a simple calculation using your height and weight to estimate if you\'re at a healthy weight. It\'s been used for decades as a quick screening tool.',
      },
      {
        type: 'science',
        title: 'The Formula',
        content: 'BMI = weight (kg) / [height (m)]². For example, if you weigh 70kg and are 1.75m tall: BMI = 70 / (1.75 × 1.75) = 22.9. This falls in the "normal" range.',
      },
      {
        type: 'list',
        title: 'BMI Ranges',
        content: 'The standard BMI categories are:',
        items: [
          'Underweight: Below 18.5',
          'Normal weight: 18.5-24.9',
          'Overweight: 25-29.9',
          'Obese: 30 and above',
        ],
      },
      {
        type: 'warning',
        title: 'BMI Has Limitations',
        content: 'BMI doesn\'t distinguish between muscle and fat. A bodybuilder with lots of muscle might have a "high" BMI but very low body fat. It also doesn\'t account for age, gender, or bone structure.',
      },
      {
        type: 'tip',
        title: 'Use BMI as a Starting Point',
        content: 'BMI is useful for population-level health data and as a rough indicator. But combine it with other measurements like waist circumference, body fat percentage, and how you feel.',
      },
      {
        type: 'example',
        title: 'Tom\'s Realization',
        content: 'Tom had a BMI of 27 (overweight) but he was training for a marathon and felt great. His doctor checked his waist measurement and body fat - both healthy. BMI alone didn\'t tell the full story.',
      },
    ],
    actionQuestion: {
      question: 'What is your current weight in kilograms?',
      type: 'number',
      placeholder: '70',
      unit: 'kg',
    },
  },

  'foundation1-lesson2': {
    lessonId: 'foundation1-lesson2',
    sections: [
      {
        type: 'text',
        title: 'Understanding Your Energy Needs',
        content: 'Your body burns calories 24/7 - even while sleeping. This is called your Total Daily Energy Expenditure (TDEE). Knowing your TDEE helps you eat the right amount for your goals.',
      },
      {
        type: 'science',
        title: 'TDEE Components',
        content: 'TDEE = BMR (Basal Metabolic Rate) × Activity Multiplier. Your BMR is the calories you burn at rest. The activity multiplier accounts for exercise and daily movement.',
      },
      {
        type: 'list',
        title: 'Activity Levels',
        content: 'Choose your activity level:',
        items: [
          'Sedentary: Little or no exercise (1.2x)',
          'Light: Exercise 1-3 days/week (1.375x)',
          'Moderate: Exercise 3-5 days/week (1.55x)',
          'Active: Exercise 6-7 days/week (1.725x)',
        ],
      },
      {
        type: 'text',
        title: 'Using Your TDEE',
        content: 'Once you know your TDEE, you can adjust calories based on your goal: Lose weight = TDEE - 500 calories. Maintain = TDEE. Gain muscle = TDEE + 300-500 calories.',
      },
      {
        type: 'warning',
        title: 'Don\'t Cut Too Much',
        content: 'Eating way below your TDEE (1000+ calorie deficit) can slow your metabolism, make you lose muscle, and leave you exhausted. Slow and steady wins the race.',
      },
      {
        type: 'tip',
        title: 'Track for 2 Weeks',
        content: 'Use your calculated TDEE as a starting point. Track your food and weight for 2 weeks. Adjust if you\'re not seeing the results you want. Your actual TDEE might be slightly different.',
      },
    ],
    actionQuestion: {
      question: 'What is your primary fitness goal right now?',
      type: 'choice',
      choices: [
        'Lose weight/fat',
        'Build muscle',
        'Maintain current weight',
        'Improve overall health',
      ],
    },
  },

  'foundation1-lesson3': {
    lessonId: 'foundation1-lesson3',
    sections: [
      {
        type: 'text',
        title: 'Beyond the Scale',
        content: 'Your weight on the scale doesn\'t tell the whole story. Two people can weigh the same but look completely different. It\'s all about body composition - the ratio of muscle to fat.',
      },
      {
        type: 'science',
        title: 'Muscle vs Fat',
        content: 'Muscle is denser than fat. A pound of muscle takes up less space than a pound of fat. You can lose fat, gain muscle, and weigh the same - but look leaner, stronger, and healthier.',
      },
      {
        type: 'list',
        title: 'Better Metrics Than Scale Weight',
        content: 'Track these instead (or in addition):',
        items: [
          'Progress photos (weekly or monthly)',
          'How your clothes fit',
          'Waist/hip measurements',
          'Body fat percentage (calipers, DEXA scan)',
          'Strength gains (lifting heavier weights)',
          'Energy levels and how you feel',
        ],
      },
      {
        type: 'warning',
        title: 'Scale Fluctuations Are Normal',
        content: 'Your weight can fluctuate 2-5 pounds in a single day due to water retention, sodium intake, carbs eaten, time of day, and digestion. Don\'t panic over daily changes.',
      },
      {
        type: 'example',
        title: 'Sarah\'s Transformation',
        content: 'Sarah lost 15 pounds of fat and gained 10 pounds of muscle over 6 months. The scale only showed 5 pounds lost, but she dropped 2 dress sizes and felt amazing. The scale lied about her progress.',
      },
      {
        type: 'tip',
        title: 'Weigh Yourself Strategically',
        content: 'If you weigh yourself, do it weekly (not daily) at the same time under the same conditions - like first thing in the morning before eating. This reduces water weight variables.',
      },
    ],
    actionQuestion: {
      question: 'Besides the scale, what will you track your progress with?',
      type: 'text',
      placeholder: 'I will track...',
    },
  },

  'foundation1-lesson4': {
    lessonId: 'foundation1-lesson4',
    sections: [
      {
        type: 'text',
        title: 'Setting SMART Fitness Goals',
        content: 'Most fitness goals fail because they\'re vague. "Get in shape" or "lose weight" isn\'t specific enough. SMART goals are Specific, Measurable, Achievable, Relevant, and Time-bound.',
      },
      {
        type: 'list',
        title: 'SMART Breakdown',
        content: 'How to make your goal SMART:',
        items: [
          'Specific: What exactly will you do? (e.g., "Run a 5K")',
          'Measurable: How will you track it? (e.g., "3 runs per week")',
          'Achievable: Is it realistic? (don\'t go 0 to marathon)',
          'Relevant: Does it align with your values?',
          'Time-bound: When will you achieve it? (e.g., "in 12 weeks")',
        ],
      },
      {
        type: 'example',
        title: 'Before and After',
        content: 'Vague goal: "Get stronger." SMART goal: "Increase my squat from 135 lbs to 185 lbs within 16 weeks by training legs twice per week with progressive overload."',
      },
      {
        type: 'warning',
        title: 'Focus on Process, Not Just Outcome',
        content: 'Outcome goal: "Lose 20 pounds." Process goal: "Eat 2000 calories daily, hit 10,000 steps, and strength train 3x/week." Process goals are within your control. Do the process, results follow.',
      },
      {
        type: 'tip',
        title: 'Start Small',
        content: 'Big goals are built from small habits. Instead of "work out every day," start with "work out twice this week." Build confidence, then increase. Small wins create momentum.',
      },
      {
        type: 'science',
        title: 'The Power of Written Goals',
        content: 'Studies show people who write down their goals are 42% more likely to achieve them. The act of writing forces clarity and creates accountability.',
      },
    ],
    actionQuestion: {
      question: 'What is one SMART fitness goal you want to achieve?',
      type: 'text',
      placeholder: 'My SMART goal is...',
    },
  },
};

export const getPhysicalLessonContent = (lessonId: string): PhysicalLessonContent | null => {
  return PHYSICAL_LESSON_CONTENTS[lessonId] || null;
};
