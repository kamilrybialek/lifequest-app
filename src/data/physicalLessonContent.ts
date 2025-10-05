/**
 * Physical Health Lesson Content - Holistic Health Path
 * Comprehensive wellness approach covering physical, mental, and lifestyle health
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
  // FOUNDATION 1: Understanding Holistic Health
  // ============================================

  'foundation1-lesson1': {
    lessonId: 'foundation1-lesson1',
    sections: [
      {
        type: 'text',
        title: 'What is Holistic Health?',
        content: 'Holistic health means looking at your whole self - not just your body, but also your mind, emotions, and lifestyle. Everything is connected. When one part is out of balance, it affects the rest.',
      },
      {
        type: 'list',
        title: 'The Four Pillars of Holistic Health',
        content: 'True health requires balance in all areas:',
        items: [
          'Physical: Movement, nutrition, sleep, and body care',
          'Mental: Stress management, mindfulness, mental clarity',
          'Emotional: Processing feelings, relationships, self-awareness',
          'Lifestyle: Environment, habits, purpose, and daily routines',
        ],
      },
      {
        type: 'example',
        title: 'Maria\'s Story',
        content: 'Maria exercised daily and ate healthy, but still felt exhausted. She ignored chronic stress and poor sleep. When she addressed all areas together - exercise, sleep, stress management - her energy returned.',
      },
    ],
    actionQuestion: {
      question: 'Which pillar needs the most attention in your life right now?',
      type: 'choice',
      choices: [
        'Physical health',
        'Mental clarity',
        'Emotional balance',
        'Lifestyle habits',
      ],
    },
  },

  'foundation1-lesson2': {
    lessonId: 'foundation1-lesson2',
    sections: [
      {
        type: 'text',
        title: 'Your Body is a System',
        content: 'Think of your body like a smart home - everything is interconnected. Your gut talks to your brain. Your sleep affects your hormones. Your stress impacts your immune system.',
      },
      {
        type: 'science',
        title: 'The Gut-Brain Connection',
        content: 'Your gut produces 90% of your body\'s serotonin (the "happy chemical"). Poor gut health can lead to anxiety, depression, and brain fog. A healthy gut means a healthy mind.',
      },
      {
        type: 'tip',
        title: 'Start With One Change',
        content: 'Don\'t try to fix everything at once. Pick one area - better sleep, less sugar, daily walks. One positive change creates a ripple effect throughout your whole system.',
      },
    ],
    actionQuestion: {
      question: 'How would you rate your current gut health (digestion, bloating, energy)?',
      type: 'choice',
      choices: [
        'Great - no issues',
        'Good - minor problems',
        'Fair - some discomfort',
        'Poor - frequent issues',
      ],
    },
  },

  'foundation1-lesson3': {
    lessonId: 'foundation1-lesson3',
    sections: [
      {
        type: 'text',
        title: 'Prevention Over Treatment',
        content: 'Holistic health focuses on preventing problems before they start. It\'s easier to maintain good health than to fix poor health. Small daily actions compound into major results.',
      },
      {
        type: 'list',
        title: 'Daily Prevention Habits',
        content: 'Simple actions that protect your long-term health:',
        items: [
          'Drink enough water (8 glasses daily)',
          'Move your body for 30 minutes',
          'Eat whole foods, not processed junk',
          'Get 7-9 hours of quality sleep',
          'Manage stress daily (meditation, nature, hobbies)',
          'Build strong relationships and community',
        ],
      },
      {
        type: 'warning',
        title: 'Health is Not Just Absence of Disease',
        content: 'Just because you\'re not sick doesn\'t mean you\'re healthy. True health is having energy, mental clarity, emotional balance, and the ability to thrive - not just survive.',
      },
    ],
    actionQuestion: {
      question: 'How many glasses of water do you drink daily?',
      type: 'number',
      placeholder: '8',
      unit: 'glasses',
    },
  },

  // ============================================
  // FOUNDATION 2: Sleep and Recovery
  // ============================================

  'foundation2-lesson1': {
    lessonId: 'foundation2-lesson1',
    sections: [
      {
        type: 'text',
        title: 'Why Sleep is Your Superpower',
        content: 'Sleep isn\'t just rest - it\'s when your body repairs itself. During sleep, your brain clears toxins, your muscles rebuild, your immune system strengthens, and your hormones rebalance.',
      },
      {
        type: 'science',
        title: 'What Happens When You Sleep',
        content: 'Your body cycles through stages: light sleep, deep sleep, and REM sleep. Deep sleep repairs your body. REM sleep processes emotions and memories. You need both to feel your best.',
      },
      {
        type: 'warning',
        title: 'Sleep Debt is Real',
        content: 'You can\'t "catch up" on sleep over the weekend. Chronic sleep deprivation increases risk of obesity, diabetes, heart disease, depression, and weakens your immune system.',
      },
    ],
    actionQuestion: {
      question: 'How many hours of sleep do you get on average per night?',
      type: 'number',
      placeholder: '7',
      unit: 'hours',
    },
  },

  'foundation2-lesson2': {
    lessonId: 'foundation2-lesson2',
    sections: [
      {
        type: 'text',
        title: 'The Circadian Rhythm',
        content: 'Your body has an internal clock called the circadian rhythm. It controls when you feel sleepy, hungry, and energized. When this clock is disrupted, your health suffers.',
      },
      {
        type: 'list',
        title: 'How to Support Your Circadian Rhythm',
        content: 'Align with your natural sleep-wake cycle:',
        items: [
          'Wake up and sleep at the same time daily (even weekends)',
          'Get morning sunlight within 30 minutes of waking',
          'Dim lights 2 hours before bed',
          'Avoid screens (blue light) before sleep',
          'Keep your bedroom cool, dark, and quiet',
          'Limit caffeine after 2 PM',
        ],
      },
      {
        type: 'tip',
        title: 'Morning Sunlight is Key',
        content: 'Get 10-15 minutes of natural sunlight in the morning. This resets your circadian clock, boosts mood, and helps you sleep better at night. Even on cloudy days, outdoor light is powerful.',
      },
    ],
    actionQuestion: {
      question: 'What time do you usually go to bed?',
      type: 'text',
      placeholder: '10:30 PM',
    },
  },

  'foundation2-lesson3': {
    lessonId: 'foundation2-lesson3',
    sections: [
      {
        type: 'text',
        title: 'Sleep Hygiene Basics',
        content: 'Sleep hygiene means creating the right environment and habits for quality sleep. Small changes to your bedroom and routine can dramatically improve your rest.',
      },
      {
        type: 'example',
        title: 'David\'s Transformation',
        content: 'David struggled with insomnia for years. He changed three things: no phone in bedroom, blackout curtains, and a 10 PM bedtime routine. Within two weeks, he slept 7+ hours nightly.',
      },
      {
        type: 'list',
        title: 'Sleep Hygiene Checklist',
        content: 'Create the perfect sleep environment:',
        items: [
          'Temperature: 60-67°F (15-19°C) is ideal',
          'Darkness: Use blackout curtains or an eye mask',
          'Quiet: Use earplugs or white noise if needed',
          'Comfort: Invest in a good mattress and pillows',
          'No screens: Keep phones, TVs, tablets out of bedroom',
          'Wind-down routine: Read, stretch, or meditate before bed',
        ],
      },
    ],
    actionQuestion: {
      question: 'What is one sleep hygiene habit you will start tonight?',
      type: 'text',
      placeholder: 'I will...',
    },
  },

  // ============================================
  // FOUNDATION 3: Stress and Inflammation
  // ============================================

  'foundation3-lesson1': {
    lessonId: 'foundation3-lesson1',
    sections: [
      {
        type: 'text',
        title: 'Stress: The Silent Killer',
        content: 'Chronic stress is one of the biggest threats to modern health. It\'s linked to heart disease, obesity, diabetes, depression, gut issues, and weakened immunity. Managing stress isn\'t optional - it\'s essential.',
      },
      {
        type: 'science',
        title: 'What Stress Does to Your Body',
        content: 'When stressed, your body releases cortisol (stress hormone). Short-term cortisol is helpful. But chronic high cortisol damages your gut, raises blood sugar, stores belly fat, and disrupts sleep.',
      },
      {
        type: 'warning',
        title: 'You Can\'t Outrun Your Stress',
        content: 'Exercise and healthy eating help, but they can\'t fix chronic stress alone. You must address the root cause - whether it\'s work, relationships, or lifestyle - and learn stress management tools.',
      },
    ],
    actionQuestion: {
      question: 'On a scale of 1-10, how stressed do you feel daily?',
      type: 'number',
      placeholder: '5',
      unit: '/10',
    },
  },

  'foundation3-lesson2': {
    lessonId: 'foundation3-lesson2',
    sections: [
      {
        type: 'text',
        title: 'Inflammation: Friend or Foe?',
        content: 'Inflammation is your body\'s defense mechanism. Acute inflammation (like a cut healing) is good. Chronic inflammation (from poor diet, stress, toxins) silently damages your body and accelerates aging.',
      },
      {
        type: 'list',
        title: 'Signs of Chronic Inflammation',
        content: 'Your body may be inflamed if you experience:',
        items: [
          'Constant fatigue, even after sleep',
          'Joint pain or stiffness',
          'Digestive issues (bloating, gas, discomfort)',
          'Skin problems (acne, eczema, rashes)',
          'Brain fog and poor concentration',
          'Frequent infections or slow healing',
        ],
      },
      {
        type: 'tip',
        title: 'Anti-Inflammatory Lifestyle',
        content: 'Reduce inflammation with: whole foods, omega-3s (fish, walnuts), colorful vegetables, quality sleep, stress management, avoiding sugar and processed foods, and regular movement.',
      },
    ],
    actionQuestion: {
      question: 'Do you experience any signs of chronic inflammation?',
      type: 'choice',
      choices: [
        'Yes, multiple symptoms',
        'Yes, a few symptoms',
        'Rarely',
        'No symptoms',
      ],
    },
  },

  'foundation3-lesson3': {
    lessonId: 'foundation3-lesson3',
    sections: [
      {
        type: 'text',
        title: 'Simple Stress Management Tools',
        content: 'You don\'t need hours of meditation or yoga. Even 5-10 minutes of daily stress relief makes a huge difference. Consistency beats intensity.',
      },
      {
        type: 'list',
        title: 'Daily Stress Relief Practices',
        content: 'Pick one or two to practice daily:',
        items: [
          'Deep breathing: 4 seconds in, 6 seconds out (5 minutes)',
          'Nature walks: 15 minutes outdoors, no phone',
          'Journaling: Write your thoughts and worries',
          'Gratitude practice: List 3 things you\'re grateful for',
          'Movement: Yoga, stretching, or light exercise',
          'Social connection: Call a friend, hug someone',
        ],
      },
      {
        type: 'example',
        title: 'Jessica\'s Breakthrough',
        content: 'Jessica had chronic anxiety and gut issues. She started 10-minute morning walks in nature (no phone). Within a month, her anxiety dropped, digestion improved, and sleep quality increased.',
      },
    ],
    actionQuestion: {
      question: 'Which stress relief practice will you try this week?',
      type: 'text',
      placeholder: 'I will...',
    },
  },

  // ============================================
  // FOUNDATION 4: Nutrition Fundamentals
  // ============================================

  'foundation4-lesson1': {
    lessonId: 'foundation4-lesson1',
    sections: [
      {
        type: 'text',
        title: 'Food as Medicine',
        content: 'What you eat directly impacts your energy, mood, immunity, hormones, and long-term health. Food isn\'t just fuel - it\'s information that tells your cells how to function.',
      },
      {
        type: 'science',
        title: 'The Microbiome Connection',
        content: 'Your gut contains trillions of bacteria (microbiome) that influence your mood, immunity, weight, and disease risk. Whole foods feed good bacteria. Processed foods feed bad bacteria.',
      },
      {
        type: 'tip',
        title: 'Eat Real Food',
        content: 'Focus on foods your great-grandmother would recognize: vegetables, fruits, whole grains, lean proteins, nuts, seeds. Avoid ultra-processed foods with ingredients you can\'t pronounce.',
      },
    ],
    actionQuestion: {
      question: 'How many servings of vegetables do you eat daily?',
      type: 'number',
      placeholder: '3',
      unit: 'servings',
    },
  },

  'foundation4-lesson2': {
    lessonId: 'foundation4-lesson2',
    sections: [
      {
        type: 'text',
        title: 'The Truth About Sugar',
        content: 'Sugar is everywhere - and it\'s destroying health. The average person eats 17 teaspoons of added sugar daily. This drives obesity, diabetes, heart disease, inflammation, and even cancer.',
      },
      {
        type: 'warning',
        title: 'Hidden Sugar Sources',
        content: 'Sugar hides in "healthy" foods: yogurt, granola, salad dressing, sauces, bread, protein bars. Always read labels. Sugar has 50+ names: high fructose corn syrup, agave, maltose, dextrose, etc.',
      },
      {
        type: 'list',
        title: 'What Sugar Does to Your Body',
        content: 'Excessive sugar causes:',
        items: [
          'Energy crashes and cravings',
          'Weight gain, especially belly fat',
          'Insulin resistance (pre-diabetes)',
          'Chronic inflammation',
          'Mood swings and anxiety',
          'Weakened immune system',
          'Accelerated aging and wrinkles',
        ],
      },
      {
        type: 'tip',
        title: 'Reduce Sugar Gradually',
        content: 'Don\'t quit cold turkey. Reduce slowly: swap soda for sparkling water, use fruit instead of dessert, choose dark chocolate (85%+), and cook at home more. Your taste buds will adapt.',
      },
    ],
    actionQuestion: {
      question: 'How many sugary drinks or snacks do you have daily?',
      type: 'number',
      placeholder: '2',
      unit: 'items',
    },
  },

  'foundation4-lesson3': {
    lessonId: 'foundation4-lesson3',
    sections: [
      {
        type: 'text',
        title: 'Building a Balanced Plate',
        content: 'You don\'t need to count every calorie. Just build balanced meals with the right proportions of protein, healthy fats, and complex carbs.',
      },
      {
        type: 'list',
        title: 'The Balanced Plate Method',
        content: 'For each meal, aim for:',
        items: [
          'Half plate: Colorful vegetables (fiber, vitamins)',
          'Quarter plate: Lean protein (chicken, fish, tofu, beans)',
          'Quarter plate: Complex carbs (quinoa, sweet potato, brown rice)',
          'Thumb-size portion: Healthy fats (olive oil, avocado, nuts)',
        ],
      },
      {
        type: 'example',
        title: 'Tom\'s Simple Switch',
        content: 'Tom used to eat pasta with sauce. He switched to: half plate vegetables, quarter plate whole grain pasta, quarter plate grilled chicken, olive oil drizzle. Lost 15 lbs in 3 months without counting calories.',
      },
    ],
    actionQuestion: {
      question: 'What is one meal you will make more balanced this week?',
      type: 'text',
      placeholder: 'I will improve...',
    },
  },

  // ============================================
  // FOUNDATION 5: Movement and Exercise
  // ============================================

  'foundation5-lesson1': {
    lessonId: 'foundation5-lesson1',
    sections: [
      {
        type: 'text',
        title: 'You Were Born to Move',
        content: 'Your body is designed for movement. Sitting for hours daily increases risk of obesity, heart disease, diabetes, and early death. Movement is medicine - and it\'s free.',
      },
      {
        type: 'science',
        title: 'Exercise Benefits Your Entire System',
        content: 'Exercise improves: heart health, brain function, mood (releases endorphins), immune system, sleep quality, insulin sensitivity, bone density, and longevity. It\'s the closest thing to a miracle drug.',
      },
      {
        type: 'warning',
        title: 'Sitting is the New Smoking',
        content: 'Even if you exercise daily, sitting 8+ hours increases health risks. Break up sitting every 30 minutes: stand, stretch, walk. Use a standing desk or take walking meetings.',
      },
    ],
    actionQuestion: {
      question: 'How many hours do you sit daily (work, commute, TV)?',
      type: 'number',
      placeholder: '8',
      unit: 'hours',
    },
  },

  'foundation5-lesson2': {
    lessonId: 'foundation5-lesson2',
    sections: [
      {
        type: 'text',
        title: 'The Best Exercise is the One You\'ll Do',
        content: 'Don\'t force yourself to run if you hate running. Find movement you enjoy - dancing, hiking, swimming, cycling, yoga, sports. Consistency beats perfection.',
      },
      {
        type: 'list',
        title: 'Types of Exercise You Need',
        content: 'For complete fitness, include:',
        items: [
          'Cardio: Walking, running, cycling (heart health, endurance)',
          'Strength: Weights, bodyweight exercises (muscle, metabolism)',
          'Flexibility: Yoga, stretching (mobility, injury prevention)',
          'Balance: Tai chi, single-leg exercises (stability, aging well)',
        ],
      },
      {
        type: 'tip',
        title: 'Start With 10 Minutes',
        content: 'If you\'re sedentary, don\'t jump to 1-hour workouts. Start with 10-minute daily walks. Build the habit first, then increase intensity. Small steps lead to big transformations.',
      },
    ],
    actionQuestion: {
      question: 'What type of movement do you genuinely enjoy?',
      type: 'text',
      placeholder: 'I enjoy...',
    },
  },

  'foundation5-lesson3': {
    lessonId: 'foundation5-lesson3',
    sections: [
      {
        type: 'text',
        title: 'Recovery is Part of Training',
        content: 'Your muscles don\'t grow during workouts - they grow during rest. Overtraining leads to injury, burnout, and decreased performance. Rest days are when the magic happens.',
      },
      {
        type: 'list',
        title: 'Active Recovery Ideas',
        content: 'Rest doesn\'t mean doing nothing:',
        items: [
          'Gentle yoga or stretching',
          'Easy walking or swimming',
          'Foam rolling or massage',
          'Light mobility work',
          'Nature hikes at a relaxed pace',
        ],
      },
      {
        type: 'example',
        title: 'Anna\'s Injury Prevention',
        content: 'Anna trained hard 6 days/week and kept getting injured. She added 2 rest days with yoga and walking. Injuries stopped, performance improved, and she felt stronger.',
      },
    ],
    actionQuestion: {
      question: 'How many rest/recovery days do you take per week?',
      type: 'number',
      placeholder: '2',
      unit: 'days',
    },
  },

  // ============================================
  // FOUNDATION 6: Preventive Health Screenings
  // ============================================

  'foundation6-lesson1': {
    lessonId: 'foundation6-lesson1',
    sections: [
      {
        type: 'text',
        title: 'Prevention Saves Lives',
        content: 'Regular health screenings catch problems early when they\'re easier to treat. Many serious conditions (diabetes, high blood pressure, cancer) have no symptoms until it\'s too late.',
      },
      {
        type: 'list',
        title: 'Essential Health Screenings',
        content: 'Get these checked regularly:',
        items: [
          'Blood pressure: Every 1-2 years (or more if high)',
          'Cholesterol: Every 4-6 years (more if at risk)',
          'Blood sugar/diabetes: Every 3 years after age 35',
          'Body weight/BMI: Annually',
          'Cancer screenings: As recommended by doctor (varies by age/sex)',
        ],
      },
      {
        type: 'warning',
        title: 'Don\'t Wait for Symptoms',
        content: 'High blood pressure is called the "silent killer" because it has no symptoms. Same with high cholesterol and early diabetes. By the time you feel sick, damage may be done.',
      },
    ],
    actionQuestion: {
      question: 'When was your last complete health checkup?',
      type: 'text',
      placeholder: 'Month, Year',
    },
  },

  'foundation6-lesson2': {
    lessonId: 'foundation6-lesson2',
    sections: [
      {
        type: 'text',
        title: 'Know Your Numbers',
        content: 'You can\'t improve what you don\'t measure. Track key health markers: blood pressure, cholesterol, blood sugar, and weight. Small changes in numbers predict big changes in health.',
      },
      {
        type: 'science',
        title: 'Blood Pressure Basics',
        content: 'Blood pressure shows as two numbers (e.g., 120/80). Top number is systolic (heart pumping). Bottom is diastolic (heart resting). Ideal: below 120/80. High: 130/80 or above.',
      },
      {
        type: 'tip',
        title: 'Track at Home',
        content: 'Buy a home blood pressure monitor. Check weekly at the same time. Share results with your doctor. Tracking trends helps catch problems early and motivates healthy changes.',
      },
    ],
    actionQuestion: {
      question: 'Do you know your current blood pressure numbers?',
      type: 'choice',
      choices: [
        'Yes, I track regularly',
        'Yes, from last checkup',
        'No, but I will check soon',
        'No, never checked',
      ],
    },
  },

  'foundation6-lesson3': {
    lessonId: 'foundation6-lesson3',
    sections: [
      {
        type: 'text',
        title: 'Build a Relationship with Your Doctor',
        content: 'Your doctor is your health partner. Don\'t just visit when sick. Schedule annual checkups, ask questions, discuss concerns, and be honest about your lifestyle.',
      },
      {
        type: 'list',
        title: 'Questions to Ask Your Doctor',
        content: 'At your next checkup, ask:',
        items: [
          'What screenings do I need based on my age/risk factors?',
          'Are my numbers (BP, cholesterol, blood sugar) in a healthy range?',
          'What lifestyle changes would benefit me most?',
          'Are my medications necessary? Any alternatives?',
          'What are my biggest health risks?',
        ],
      },
      {
        type: 'example',
        title: 'Michael\'s Early Detection',
        content: 'Michael felt fine but went for a checkup. Doctor found pre-diabetes (blood sugar 110). He changed diet and lost 20 lbs. Six months later, blood sugar was normal. Early detection prevented diabetes.',
      },
    ],
    actionQuestion: {
      question: 'What is one health concern you want to discuss with your doctor?',
      type: 'text',
      placeholder: 'I want to ask about...',
    },
  },

  // ============================================
  // FOUNDATION 7: Gut Health and Digestion
  // ============================================

  'foundation7-lesson1': {
    lessonId: 'foundation7-lesson1',
    sections: [
      {
        type: 'text',
        title: 'Your Gut is Your Second Brain',
        content: 'The gut contains 500 million neurons and produces neurotransmitters that affect mood, sleep, and cognition. Poor gut health leads to depression, anxiety, brain fog, and weakened immunity.',
      },
      {
        type: 'science',
        title: 'The Microbiome',
        content: 'Your gut hosts trillions of bacteria, viruses, and fungi (microbiome). A diverse, balanced microbiome keeps you healthy. Imbalance (dysbiosis) causes digestive issues, inflammation, and disease.',
      },
      {
        type: 'warning',
        title: 'Signs of Poor Gut Health',
        content: 'You may have gut issues if you experience: bloating, gas, constipation, diarrhea, heartburn, food intolerances, frequent infections, skin problems, fatigue, or mood swings.',
      },
    ],
    actionQuestion: {
      question: 'Do you experience regular digestive discomfort?',
      type: 'choice',
      choices: [
        'Yes, frequently',
        'Yes, occasionally',
        'Rarely',
        'Never',
      ],
    },
  },

  'foundation7-lesson2': {
    lessonId: 'foundation7-lesson2',
    sections: [
      {
        type: 'text',
        title: 'Feeding Your Good Bacteria',
        content: 'Your microbiome thrives on fiber-rich whole foods. Processed foods, sugar, and antibiotics kill good bacteria and feed bad bacteria. You control your microbiome with every meal.',
      },
      {
        type: 'list',
        title: 'Gut-Healing Foods',
        content: 'Eat these to improve gut health:',
        items: [
          'Fiber: Vegetables, fruits, whole grains, legumes',
          'Fermented foods: Yogurt, kefir, sauerkraut, kimchi (probiotics)',
          'Prebiotics: Garlic, onions, leeks, asparagus (feed good bacteria)',
          'Polyphenols: Berries, green tea, dark chocolate, olive oil',
          'Bone broth: Supports gut lining repair',
        ],
      },
      {
        type: 'tip',
        title: 'Diversity is Key',
        content: 'Eat 30+ different plant foods weekly (vegetables, fruits, nuts, seeds, grains). Each plant feeds different bacteria. More diversity = healthier microbiome.',
      },
    ],
    actionQuestion: {
      question: 'How many different plant foods do you eat weekly?',
      type: 'number',
      placeholder: '15',
      unit: 'types',
    },
  },

  'foundation7-lesson3': {
    lessonId: 'foundation7-lesson3',
    sections: [
      {
        type: 'text',
        title: 'Parasites and Gut Health',
        content: 'Intestinal parasites are more common than you think. They can cause digestive issues, fatigue, nutrient deficiencies, and immune dysfunction. If you have persistent gut problems, consider testing.',
      },
      {
        type: 'list',
        title: 'Signs of Possible Parasites',
        content: 'Parasites may be present if you have:',
        items: [
          'Chronic digestive issues (diarrhea, constipation, bloating)',
          'Unexplained weight loss or inability to gain weight',
          'Constant fatigue despite adequate rest',
          'Grinding teeth at night',
          'Skin issues (rashes, eczema, itching)',
          'Recent travel to developing countries',
        ],
      },
      {
        type: 'warning',
        title: 'Always Consult a Doctor',
        content: 'Don\'t self-diagnose or self-treat. If you suspect parasites, get tested by a healthcare provider. Proper diagnosis requires stool tests or blood work. Medical treatment is most effective.',
      },
    ],
    actionQuestion: {
      question: 'Have you ever been tested for intestinal parasites?',
      type: 'choice',
      choices: [
        'Yes, recently',
        'Yes, long ago',
        'No, but I want to',
        'No, not necessary for me',
      ],
    },
  },

  // ============================================
  // FOUNDATION 8: Hormones and Balance
  // ============================================

  'foundation8-lesson1': {
    lessonId: 'foundation8-lesson1',
    sections: [
      {
        type: 'text',
        title: 'Hormones Control Everything',
        content: 'Hormones are chemical messengers that regulate metabolism, mood, sleep, appetite, energy, and reproduction. When hormones are balanced, you feel great. When imbalanced, everything suffers.',
      },
      {
        type: 'list',
        title: 'Key Hormones to Know',
        content: 'These hormones impact your daily health:',
        items: [
          'Insulin: Regulates blood sugar and fat storage',
          'Cortisol: Stress hormone, affects sleep and weight',
          'Thyroid: Controls metabolism and energy',
          'Sex hormones: Testosterone, estrogen, progesterone',
          'Leptin & Ghrelin: Hunger and fullness signals',
          'Melatonin: Sleep-wake cycles',
        ],
      },
      {
        type: 'science',
        title: 'The Domino Effect',
        content: 'Hormones work together. High cortisol disrupts insulin and thyroid. Poor sleep lowers leptin and raises ghrelin (making you hungrier). Fix one hormone, and others improve.',
      },
    ],
    actionQuestion: {
      question: 'Do you experience symptoms of hormonal imbalance (fatigue, weight gain, mood swings)?',
      type: 'choice',
      choices: [
        'Yes, multiple symptoms',
        'Yes, a few symptoms',
        'Occasionally',
        'No symptoms',
      ],
    },
  },

  'foundation8-lesson2': {
    lessonId: 'foundation8-lesson2',
    sections: [
      {
        type: 'text',
        title: 'Blood Sugar and Insulin',
        content: 'Every time you eat, your blood sugar rises and insulin is released to bring it down. Constant sugar spikes and crashes lead to insulin resistance - the path to diabetes and weight gain.',
      },
      {
        type: 'warning',
        title: 'Insulin Resistance is Epidemic',
        content: 'Nearly 1 in 3 adults have insulin resistance (pre-diabetes) and most don\'t know it. It causes fatigue, cravings, belly fat, inflammation, and eventually type 2 diabetes.',
      },
      {
        type: 'tip',
        title: 'Stabilize Blood Sugar',
        content: 'Avoid sugar spikes: eat protein with every meal, choose low-glycemic carbs (vegetables, whole grains), add fiber, avoid sugary drinks, and never skip meals.',
      },
    ],
    actionQuestion: {
      question: 'How often do you experience energy crashes or intense cravings?',
      type: 'choice',
      choices: [
        'Multiple times daily',
        'Once daily',
        'Few times per week',
        'Rarely',
      ],
    },
  },

  'foundation8-lesson3': {
    lessonId: 'foundation8-lesson3',
    sections: [
      {
        type: 'text',
        title: 'Supporting Hormonal Balance',
        content: 'You can\'t control hormones directly, but you can create conditions for balance: quality sleep, stress management, whole foods, regular movement, and avoiding endocrine disruptors.',
      },
      {
        type: 'list',
        title: 'Lifestyle Changes for Hormone Health',
        content: 'Support your hormones naturally:',
        items: [
          'Sleep 7-9 hours nightly (hormones reset during sleep)',
          'Manage chronic stress (lowers cortisol)',
          'Eat healthy fats (hormones are made from fats)',
          'Avoid plastics, chemicals, processed foods (endocrine disruptors)',
          'Strength train (boosts testosterone and growth hormone)',
          'Get tested: Know your levels before making changes',
        ],
      },
      {
        type: 'example',
        title: 'Lisa\'s Hormone Reset',
        content: 'Lisa had fatigue, weight gain, and mood swings. Blood tests showed low thyroid and high cortisol. She improved sleep, reduced stress, and ate whole foods. In 6 months, hormones normalized and she felt like herself again.',
      },
    ],
    actionQuestion: {
      question: 'What is one lifestyle change you\'ll make to support hormone balance?',
      type: 'text',
      placeholder: 'I will...',
    },
  },

  // ============================================
  // FOUNDATION 9: Hydration and Detox
  // ============================================

  'foundation9-lesson1': {
    lessonId: 'foundation9-lesson1',
    sections: [
      {
        type: 'text',
        title: 'Water is Life',
        content: 'Your body is 60% water. Water transports nutrients, removes waste, regulates temperature, cushions joints, and keeps every cell functioning. Even mild dehydration affects energy, mood, and cognition.',
      },
      {
        type: 'list',
        title: 'Signs of Dehydration',
        content: 'You may be dehydrated if you experience:',
        items: [
          'Fatigue and low energy',
          'Headaches or dizziness',
          'Dry skin, lips, or mouth',
          'Dark yellow urine',
          'Constipation',
          'Brain fog or poor concentration',
        ],
      },
      {
        type: 'tip',
        title: 'How Much Water to Drink',
        content: 'General rule: Half your body weight in ounces. (e.g., 160 lbs = 80 oz water). Drink more if you exercise, live in hot climates, or consume caffeine/alcohol.',
      },
    ],
    actionQuestion: {
      question: 'How many ounces of water do you drink daily?',
      type: 'number',
      placeholder: '64',
      unit: 'oz',
    },
  },

  'foundation9-lesson2': {
    lessonId: 'foundation9-lesson2',
    sections: [
      {
        type: 'text',
        title: 'Your Liver: The Detox Powerhouse',
        content: 'Your liver filters toxins from blood, produces bile for digestion, stores vitamins, and regulates hormones. A healthy liver = healthy body. Support it, don\'t burden it.',
      },
      {
        type: 'science',
        title: 'How the Liver Detoxifies',
        content: 'The liver processes toxins in two phases. Phase 1 breaks them down. Phase 2 packages them for removal. This process needs nutrients: B vitamins, antioxidants, amino acids, and sulfur compounds.',
      },
      {
        type: 'list',
        title: 'Foods That Support Liver Health',
        content: 'Nourish your liver with:',
        items: [
          'Cruciferous vegetables: Broccoli, cauliflower, Brussels sprouts',
          'Leafy greens: Spinach, kale, arugula',
          'Garlic and onions: Sulfur compounds for detox',
          'Beets: Support bile production',
          'Green tea: Antioxidants protect liver cells',
          'Turmeric: Reduces inflammation',
        ],
      },
    ],
    actionQuestion: {
      question: 'How often do you eat liver-supporting foods (greens, cruciferous veggies)?',
      type: 'choice',
      choices: [
        'Daily',
        'Few times per week',
        'Occasionally',
        'Rarely',
      ],
    },
  },

  'foundation9-lesson3': {
    lessonId: 'foundation9-lesson3',
    sections: [
      {
        type: 'text',
        title: 'Do You Need to "Detox"?',
        content: 'Your body detoxifies naturally every second via liver, kidneys, lungs, and skin. Expensive detox teas or cleanses aren\'t necessary. Just support your natural detox systems with healthy habits.',
      },
      {
        type: 'warning',
        title: 'Beware of Detox Scams',
        content: 'Most detox products are marketing gimmicks. Your liver and kidneys already do the job. Focus on: reducing toxin exposure, eating whole foods, staying hydrated, and sweating regularly.',
      },
      {
        type: 'tip',
        title: 'Reduce Toxin Exposure',
        content: 'Support detox by avoiding: processed foods, excessive alcohol, smoking, plastic containers, chemical cleaners, and pesticides. Choose organic when possible, use glass containers, and clean with natural products.',
      },
    ],
    actionQuestion: {
      question: 'What is one toxin you will reduce or eliminate from your life?',
      type: 'text',
      placeholder: 'I will reduce...',
    },
  },

  // ============================================
  // FOUNDATION 10: Mindset and Long-Term Success
  // ============================================

  'foundation10-lesson1': {
    lessonId: 'foundation10-lesson1',
    sections: [
      {
        type: 'text',
        title: 'Health is a Journey, Not a Destination',
        content: 'There\'s no finish line. Health is daily choices compounded over a lifetime. Progress isn\'t linear - you\'ll have setbacks. What matters is consistency, not perfection.',
      },
      {
        type: 'example',
        title: 'The 80/20 Rule',
        content: 'Aim to make healthy choices 80% of the time. Allow 20% flexibility for treats, social events, and life. This balance is sustainable long-term and prevents burnout or guilt.',
      },
      {
        type: 'tip',
        title: 'Focus on Systems, Not Goals',
        content: 'Don\'t just set a goal (lose 20 lbs). Build systems (meal prep Sundays, workout 3x/week, sleep by 10 PM). Systems create lasting change. Goals are temporary.',
      },
    ],
    actionQuestion: {
      question: 'What is one health system (daily habit) you will build?',
      type: 'text',
      placeholder: 'My system is...',
    },
  },

  'foundation10-lesson2': {
    lessonId: 'foundation10-lesson2',
    sections: [
      {
        type: 'text',
        title: 'Your Health, Your Responsibility',
        content: 'Doctors, trainers, and apps can guide you - but YOU are in control. No one cares about your health more than you. Educate yourself, advocate for your needs, and take ownership.',
      },
      {
        type: 'list',
        title: 'How to Take Ownership',
        content: 'Be your own health advocate:',
        items: [
          'Track your metrics (sleep, food, exercise, mood)',
          'Ask questions and seek second opinions',
          'Research and stay informed (from credible sources)',
          'Speak up about symptoms or concerns',
          'Make time for health - it\'s not selfish, it\'s essential',
          'Surround yourself with people who support your health',
        ],
      },
      {
        type: 'science',
        title: 'The Compound Effect',
        content: 'Small daily actions compound over time. Drinking water, walking 10 minutes, eating vegetables - seem insignificant daily but transform health over months and years.',
      },
    ],
    actionQuestion: {
      question: 'What is one small daily action you commit to for the next 30 days?',
      type: 'text',
      placeholder: 'I commit to...',
    },
  },

  'foundation10-lesson3': {
    lessonId: 'foundation10-lesson3',
    sections: [
      {
        type: 'text',
        title: 'Celebrate Your Progress',
        content: 'Health journeys are long. Celebrate small wins: sleeping better, having more energy, fitting into old clothes, completing a workout. Progress is progress - no matter how small.',
      },
      {
        type: 'list',
        title: 'Non-Scale Victories to Track',
        content: 'Celebrate these wins:',
        items: [
          'More energy throughout the day',
          'Better sleep quality',
          'Improved mood and mental clarity',
          'Clothes fitting better',
          'Strength gains (lifting heavier, more reps)',
          'Consistency (showing up even when you don\'t feel like it)',
        ],
      },
      {
        type: 'example',
        title: 'Ryan\'s Transformation',
        content: 'Ryan started at 250 lbs. After 6 months, he only lost 20 lbs. But he slept better, had no more joint pain, his energy doubled, and he felt happy. The scale didn\'t reflect his true progress.',
      },
      {
        type: 'tip',
        title: 'Keep Going',
        content: 'You\'ve completed this health path. Now apply what you\'ve learned. Health is daily practice. Keep showing up. You\'ve got this. 🎉',
      },
    ],
    actionQuestion: {
      question: 'What is one health victory you\'re proud of (big or small)?',
      type: 'text',
      placeholder: 'I\'m proud of...',
    },
  },
};

export const getPhysicalLessonContent = (lessonId: string): PhysicalLessonContent | null => {
  return PHYSICAL_LESSON_CONTENTS[lessonId] || null;
};
