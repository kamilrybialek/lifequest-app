/**
 * Mental Health Lesson Content - Full lesson materials for 5 Foundations
 * Each lesson contains sections with practical content and an action question at the end
 */

export interface MentalLessonSection {
  type: 'text' | 'list' | 'tip' | 'warning' | 'example' | 'science';
  title?: string;
  content: string;
  items?: string[];
}

export interface MentalLessonContent {
  lessonId: string;
  sections: MentalLessonSection[];
  actionQuestion: {
    question: string;
    type: 'number' | 'text' | 'choice' | 'time';
    placeholder?: string;
    choices?: string[];
    unit?: string;
  };
}

export const MENTAL_LESSON_CONTENTS: { [key: string]: MentalLessonContent } = {
  // ============================================
  // FOUNDATION 1: Dopamine Regulation
  // ============================================

  'foundation1-lesson1': {
    lessonId: 'foundation1-lesson1',
    sections: [
      {
        type: 'text',
        title: 'The Dopamine Crisis',
        content: 'You\'re not lazy. You\'re not unmotivated. Your dopamine system is hijacked. Social media, video games, porn, junk food - they\'re all engineered to flood your brain with dopamine, raising your baseline so high that normal life feels boring.',
      },
      {
        type: 'science',
        title: 'How Dopamine Works',
        content: 'Dopamine is your brain\'s reward chemical. It\'s released when you anticipate pleasure, driving you to pursue rewards. But here\'s the problem: modern technology delivers dopamine hits far more intense than anything in human evolution. Your brain adapts by raising the baseline, making everything else feel dull.',
      },
      {
        type: 'list',
        title: 'Signs Your Dopamine Is Dysregulated',
        content: 'You might have dopamine dysregulation if you:',
        items: [
          'Can\'t focus on tasks unless they\'re extremely stimulating',
          'Constantly reach for your phone when bored',
          'Feel unmotivated to do "normal" things (work, exercise, reading)',
          'Need constant entertainment or distraction',
          'Struggle to enjoy simple pleasures',
          'Feel restless and anxious without stimulation',
        ],
      },
      {
        type: 'warning',
        title: 'The Modern Trap',
        content: 'Apps are designed by teams of neuroscientists to maximize dopamine release. Every notification, like, and autoplay is engineered to keep you hooked. You\'re not weak - you\'re fighting billion-dollar companies who hired the best minds to exploit your brain chemistry.',
      },
      {
        type: 'text',
        title: 'The Solution',
        content: 'Reset your dopamine baseline. When you lower your baseline dopamine, normal activities become rewarding again. Work feels satisfying. Exercise feels good. Reading is enjoyable. You reclaim your motivation.',
      },
    ],
    actionQuestion: {
      question: 'On a scale of 1-10, how scattered and unmotivated do you feel?',
      type: 'number',
      placeholder: '5',
    },
  },

  'foundation1-lesson2': {
    lessonId: 'foundation1-lesson2',
    sections: [
      {
        type: 'text',
        title: 'The Dopamine Detox Protocol',
        content: 'A dopamine detox isn\'t forever - it\'s a reset button. 24-48 hours of low dopamine activities to bring your baseline back down. Think of it like fasting for your brain.',
      },
      {
        type: 'list',
        title: 'The 24-Hour Reset',
        content: 'For one day, eliminate all high-dopamine activities:',
        items: [
          'No phone (except for emergencies)',
          'No internet, social media, or screens',
          'No music or podcasts',
          'No video games',
          'No sugar or junk food',
          'No porn or sexual stimulation',
        ],
      },
      {
        type: 'list',
        title: 'What You CAN Do',
        content: 'Allow only low-dopamine activities:',
        items: [
          'Walking in nature',
          'Meditation or sitting quietly',
          'Journaling (pen and paper)',
          'Reading a physical book',
          'Light exercise or stretching',
          'Conversation with real people',
          'Drinking water, eating simple meals',
        ],
      },
      {
        type: 'science',
        title: 'What Happens',
        content: 'Hour 1-6: You\'ll feel bored, restless, anxious. This is withdrawal. Your brain is screaming for dopamine. Hour 6-12: It gets easier. You notice things - the sky, your thoughts, sounds. Hour 12-24: You feel calm, present, grounded. Tasks that felt impossible yesterday feel doable.',
      },
      {
        type: 'warning',
        title: 'The First Hours Are Hard',
        content: 'You\'ll be shocked how addicted you are. Reaching for your phone 50 times. Feeling like you\'re going crazy. This is normal. The discomfort is the point - it reveals your dependence.',
      },
      {
        type: 'tip',
        title: 'After the Detox',
        content: 'The next day, when you check your phone, it won\'t feel as compelling. You\'ve reset your baseline. Now maintain it by reducing daily dopamine spikes.',
      },
    ],
    actionQuestion: {
      question: 'When will you do your 24-hour dopamine detox?',
      type: 'choice',
      choices: [
        'This weekend',
        'Next weekend',
        'Within the next 2 weeks',
        'I need to prepare first',
      ],
    },
  },

  'foundation1-lesson3': {
    lessonId: 'foundation1-lesson3',
    sections: [
      {
        type: 'text',
        title: 'Breaking Phone Addiction',
        content: 'Your phone isn\'t a tool anymore - it\'s a slot machine. Every time you check it, you\'re pulling the lever hoping for a reward. New message? Dopamine. Notification? Dopamine. Red badge? Dopamine. You\'re in a variable reward loop, the same mechanism that makes gambling addictive.',
      },
      {
        type: 'science',
        title: 'The Average Person',
        content: 'Studies show the average person checks their phone 96 times per day - that\'s once every 10 minutes. Total screen time averages 4-6 hours daily. That\'s 25-40% of your waking life staring at a rectangle.',
      },
      {
        type: 'list',
        title: 'Immediate Actions',
        content: 'Do these right now:',
        items: [
          'Turn off ALL notifications (except calls from favorites)',
          'Delete social media apps (keep browser access if needed)',
          'Remove phone from bedroom (buy a $10 alarm clock)',
          'Enable greyscale mode (color triggers more dopamine)',
          'Set app time limits (iOS Screen Time, Android Digital Wellbeing)',
          'Never check phone first thing in morning or last thing at night',
        ],
      },
      {
        type: 'warning',
        title: 'The First Week Is Brutal',
        content: 'You\'ll feel phantom vibrations. You\'ll reach for your phone automatically. You\'ll panic when you can\'t find it instantly. This is addiction withdrawal. Power through.',
      },
      {
        type: 'example',
        title: 'Mike\'s Results',
        content: 'Mike deleted Instagram and turned off all notifications. Week 1: He was anxious, checking his phone constantly even with nothing to check. Week 2: The urge decreased. Month 1: Screen time dropped from 5 hours to 90 minutes. He read 3 books that month - hadn\'t read a book in 2 years.',
      },
      {
        type: 'tip',
        title: 'Replace, Don\'t Just Remove',
        content: 'If you just remove phone usage without replacing it, you\'ll relapse. Replace scrolling with: walking, reading, talking to people, exercising, creating something. Fill the void proactively.',
      },
    ],
    actionQuestion: {
      question: 'What\'s your current daily screen time?',
      type: 'number',
      placeholder: '0',
      unit: 'hours',
    },
  },

  'foundation1-lesson4': {
    lessonId: 'foundation1-lesson4',
    sections: [
      {
        type: 'text',
        title: 'Sustainable Motivation Without Dopamine Spikes',
        content: 'You\'ve lowered your dopamine baseline. Now you need to build sustainable motivation without constantly spiking it. The goal: steady, consistent drive instead of peaks and crashes.',
      },
      {
        type: 'science',
        title: 'Huberman\'s Motivation Protocol',
        content: 'Dr. Andrew Huberman teaches: dopamine baseline determines your motivation. Every time you spike dopamine (checking phone, gaming, porn), you temporarily raise the baseline, making normal tasks feel unrewarding. The solution: engage in hard tasks WITHOUT external rewards.',
      },
      {
        type: 'list',
        title: 'Building Intrinsic Motivation',
        content: 'How to sustain motivation naturally:',
        items: [
          'Do hard things without music, podcasts, or distractions',
          'Celebrate progress mentally, not with rewards (no "I worked out so I deserve ice cream")',
          'Associate effort itself with the reward (learn to enjoy the struggle)',
          'Cold exposure in morning (raises baseline dopamine by 2.5x for hours)',
          'Random intermittent rewards (not every time, unpredictable)',
        ],
      },
      {
        type: 'warning',
        title: 'Stop Layering Dopamine',
        content: 'Working out while watching Netflix? Studying with music? You\'re training your brain that the task requires entertainment. Eventually you can\'t do the task without the dopamine hit. Do hard things in silence.',
      },
      {
        type: 'example',
        title: 'Alex\'s Transformation',
        content: 'Alex couldn\'t study without music and snacks. He went cold turkey: studying in silence, no phone, no rewards. Week 1: Brutal. Week 2: Easier. Month 1: He could focus for 2-hour blocks without any stimulation. His grades improved and he needed less study time.',
      },
      {
        type: 'tip',
        title: 'The Cold Shower Hack',
        content: '2 minutes of cold shower in the morning raises baseline dopamine by 250% for 2-4 hours. This is natural, sustainable, and free. It\'s the best legal dopamine boost available.',
      },
    ],
    actionQuestion: {
      question: 'What hard task will you do today without any dopamine layering?',
      type: 'text',
      placeholder: 'I will do...',
    },
  },

  // ============================================
  // FOUNDATION 2: Stress Management
  // ============================================

  'foundation2-lesson1': {
    lessonId: 'foundation2-lesson1',
    sections: [
      {
        type: 'text',
        title: 'Stress Isn\'t the Enemy',
        content: 'Stress gets a bad rap. But stress itself isn\'t bad - chronic, unmanaged stress is the problem. Short-term stress actually makes you stronger, smarter, faster.',
      },
      {
        type: 'science',
        title: 'The Stress Response',
        content: 'When you perceive a threat, your sympathetic nervous system kicks in: heart rate up, breathing shallow, muscles tense. This is ancient biology - it kept our ancestors alive when facing predators.',
      },
      {
        type: 'warning',
        title: 'Modern Problem',
        content: 'But your brain can\'t tell the difference between a bear attack and a mean email from your boss. You\'re triggering this survival response dozens of times per day.',
      },
      {
        type: 'list',
        title: 'Signs of Chronic Stress',
        content: 'Your body is screaming at you:',
        items: [
          'Can\'t turn your mind off at night',
          'Constant muscle tension (neck, shoulders)',
          'Digestive issues',
          'Getting sick more often',
          'Short temper, easily irritated',
          'Difficulty focusing',
        ],
      },
      {
        type: 'text',
        title: 'The Solution',
        content: 'You need to activate your parasympathetic nervous system - your "rest and digest" mode. The fastest way? Your breath.',
      },
    ],
    actionQuestion: {
      question: 'On a scale of 1-10, how stressed do you feel right now?',
      type: 'number',
      placeholder: '5',
    },
  },

  'foundation2-lesson2': {
    lessonId: 'foundation2-lesson2',
    sections: [
      {
        type: 'text',
        title: 'Box Breathing: The Navy SEAL Technique',
        content: 'Navy SEALs use this breathing pattern before high-stress missions. It works because it activates your vagus nerve - the direct line to your "calm down" system.',
      },
      {
        type: 'list',
        title: 'The Pattern',
        content: 'The 4-4-4-4 pattern:',
        items: [
          'Inhale through nose for 4 seconds',
          'Hold breath for 4 seconds',
          'Exhale through mouth for 4 seconds',
          'Hold empty for 4 seconds',
          'Repeat 4-5 cycles',
        ],
      },
      {
        type: 'science',
        title: 'Why It Works',
        content: 'The equal counts balance your autonomic nervous system. The holds specifically activate your parasympathetic nervous system, lowering heart rate and blood pressure within 60 seconds.',
      },
      {
        type: 'tip',
        title: 'When to Use It',
        content: 'Before a stressful meeting, when you feel anxiety rising, before bed if your mind is racing, or anytime you need to calm down fast.',
      },
      {
        type: 'example',
        title: 'Real Usage',
        content: 'Mark used to get anxious before client presentations. He started doing 2 minutes of box breathing in the bathroom beforehand. His anxiety dropped from 8/10 to 3/10.',
      },
    ],
    actionQuestion: {
      question: 'Will you try box breathing right now for 2 minutes?',
      type: 'choice',
      choices: [
        'Yes, I\'ll do it now',
        'I\'ll try it later today',
        'I want to learn more first',
      ],
    },
  },

  'foundation2-lesson3': {
    lessonId: 'foundation2-lesson3',
    sections: [
      {
        type: 'text',
        title: 'The Physiological Sigh',
        content: 'Dr. Huberman\'s favorite stress tool: the physiological sigh. It\'s the fastest way to reduce stress - works in 1-3 breaths.',
      },
      {
        type: 'list',
        title: 'How to Do It',
        content: 'Super simple:',
        items: [
          'Double inhale through nose (one big inhale, then quick second inhale)',
          'Long, extended exhale through mouth',
          'That\'s it. Repeat 2-3 times.',
        ],
      },
      {
        type: 'science',
        title: 'The Science',
        content: 'When stressed, tiny sacs in your lungs (alveoli) collapse. The double inhale re-inflates them, and the long exhale offloads CO2. This immediately signals your brain: "Crisis over."',
      },
      {
        type: 'warning',
        title: 'Use It Anywhere',
        content: 'This is so subtle you can do it in a meeting, on a crowded train, anywhere. Nobody will notice.',
      },
      {
        type: 'tip',
        title: 'When to Use',
        content: 'Use box breathing for sustained calm (before bed, pre-meeting). Use physiological sighs for instant relief (traffic jam, argument, panic rising).',
      },
    ],
    actionQuestion: {
      question: 'Try it now: Do 3 physiological sighs. How do you feel?',
      type: 'choice',
      choices: [
        'Much calmer',
        'Slightly better',
        'No change',
        'Haven\'t tried it yet',
      ],
    },
  },

  'foundation2-lesson4': {
    lessonId: 'foundation2-lesson4',
    sections: [
      {
        type: 'text',
        title: 'Check In With Yourself',
        content: 'Most people don\'t notice they\'re stressed until they\'re completely overwhelmed. Daily stress check-ins build self-awareness before you hit crisis mode.',
      },
      {
        type: 'list',
        title: 'The Daily Check-In',
        content: 'Ask yourself:',
        items: [
          'On a scale of 1-10, how stressed am I right now?',
          'Where do I feel tension in my body?',
          'What\'s the main source of my stress today?',
          'What can I control vs. what\'s outside my control?',
        ],
      },
      {
        type: 'tip',
        title: 'The Pattern Recognition',
        content: 'After 2 weeks of daily check-ins, you\'ll see your triggers. "My stress spikes every Monday" or "I\'m always tense after calls with that client."',
      },
      {
        type: 'example',
        title: 'Sarah\'s Discovery',
        content: 'Sarah tracked her stress for a month. She realized her stress peaked at 4pm every day - right when her blood sugar crashed. Solution? A healthy snack at 3pm. Her 4pm stress dropped by half.',
      },
    ],
    actionQuestion: {
      question: 'What time of day will you do your daily stress check-in?',
      type: 'choice',
      choices: [
        'Morning (upon waking)',
        'Midday (lunch break)',
        'Evening (before bed)',
        'Whenever I feel stressed',
      ],
    },
  },

  // ============================================
  // FOUNDATION 3: Mindfulness & Gratitude
  // ============================================

  'foundation3-lesson1': {
    lessonId: 'foundation3-lesson1',
    sections: [
      {
        type: 'text',
        title: 'Gratitude Rewires Your Brain',
        content: 'Gratitude isn\'t just feel-good fluff. It\'s one of the most scientifically validated interventions for mental health. Consistent gratitude practice literally changes your brain structure.',
      },
      {
        type: 'science',
        title: 'The Research',
        content: 'Studies show that people who practice gratitude for just 3 weeks show increased activity in brain regions associated with reward and reduced activity in regions associated with stress and fear. The effects last for months.',
      },
      {
        type: 'list',
        title: 'Proven Benefits',
        content: 'What gratitude does for you:',
        items: [
          'Reduces symptoms of depression by up to 35%',
          'Improves sleep quality',
          'Lowers blood pressure and stress hormones',
          'Strengthens immune system',
          'Increases overall life satisfaction',
          'Makes you more resilient to adversity',
        ],
      },
      {
        type: 'warning',
        title: 'Why We Don\'t Do It',
        content: 'Your brain has a negativity bias - it\'s wired to scan for threats. Gratitude practice is deliberate training to notice the good. It feels unnatural at first because you\'re fighting millions of years of evolution.',
      },
      {
        type: 'text',
        title: 'The Simple Practice',
        content: 'Write down 3 things you\'re grateful for. That\'s it. The key is specificity and feeling. Not "I\'m grateful for my family" but "I\'m grateful my daughter laughed at my terrible joke today."',
      },
    ],
    actionQuestion: {
      question: 'What\'s one specific thing you\'re grateful for right now?',
      type: 'text',
      placeholder: 'I\'m grateful for...',
    },
  },

  'foundation3-lesson2': {
    lessonId: 'foundation3-lesson2',
    sections: [
      {
        type: 'text',
        title: 'Building the Daily Habit',
        content: 'The best time to practice gratitude? Right before bed. It trains your brain to review your day looking for positives instead of ruminating on negatives.',
      },
      {
        type: 'list',
        title: 'The Practice',
        content: 'Every night, write down:',
        items: [
          '3 things that went well today',
          'Why they went well (this is key)',
          'One person who made your day better',
        ],
      },
      {
        type: 'tip',
        title: 'Start Small',
        content: 'Can\'t think of 3 things? Start with 1. Had a truly awful day? "I\'m grateful this day is over and I get to sleep" counts.',
      },
      {
        type: 'example',
        title: 'John\'s Transformation',
        content: 'John was clinically depressed. His therapist had him write 3 gratitudes before bed. Week 1: It felt forced. Week 4: He actually looked forward to it. Month 3: His depression scores improved 40%.',
      },
      {
        type: 'science',
        title: 'The Mechanism',
        content: 'Writing gratitude before sleep primes your subconscious to process positive memories. You\'re literally training your brain to find the good while you sleep.',
      },
    ],
    actionQuestion: {
      question: 'What went well for you today?',
      type: 'text',
      placeholder: 'Today I...',
    },
  },

  'foundation3-lesson3': {
    lessonId: 'foundation3-lesson3',
    sections: [
      {
        type: 'text',
        title: 'The Present Moment',
        content: 'Anxiety is living in the future. Depression is living in the past. Peace is living in the present. Most of our suffering comes from mentally time-traveling.',
      },
      {
        type: 'list',
        title: '5-4-3-2-1 Grounding Technique',
        content: 'When your mind is racing, use your senses:',
        items: [
          '5 things you can see',
          '4 things you can touch',
          '3 things you can hear',
          '2 things you can smell',
          '1 thing you can taste',
        ],
      },
      {
        type: 'science',
        title: 'Why It Works',
        content: 'Your prefrontal cortex (rational brain) can\'t ruminate and process sensory input at the same time. Engaging your senses pulls you out of your anxious thoughts and into reality.',
      },
      {
        type: 'tip',
        title: 'Use It Throughout the Day',
        content: 'Waiting in line? Notice 5 things you see. Anxious before a meeting? Feel 4 things you can touch. This turns boring moments into mindfulness practice.',
      },
    ],
    actionQuestion: {
      question: 'Try it now: Name 5 things you can see right now.',
      type: 'text',
      placeholder: 'I see...',
    },
  },

  'foundation3-lesson4': {
    lessonId: 'foundation3-lesson4',
    sections: [
      {
        type: 'text',
        title: 'Meditation: Simpler Than You Think',
        content: 'Meditation isn\'t about clearing your mind. It\'s about noticing when your mind wanders and gently bringing it back. That\'s it. The "bringing it back" part is the exercise.',
      },
      {
        type: 'list',
        title: '5-Minute Beginner Meditation',
        content: 'Start here:',
        items: [
          'Sit comfortably, close your eyes',
          'Focus on your breath (belly rising and falling)',
          'Your mind will wander - this is normal',
          'When you notice it wandering, bring it back to breath',
          'Repeat for 5 minutes',
        ],
      },
      {
        type: 'warning',
        title: 'You\'re Not Doing It Wrong',
        content: 'Your mind wandering 100 times in 5 minutes? Perfect. You just did 100 reps of the "noticing and returning" exercise. That\'s the workout.',
      },
      {
        type: 'science',
        title: 'The Benefits',
        content: '8 weeks of daily meditation (even just 10 minutes) shows measurable changes in brain structure: thickening in areas associated with attention and emotional regulation, shrinking in areas associated with stress.',
      },
      {
        type: 'tip',
        title: 'Start Tiny',
        content: 'Don\'t start with 30 minutes. Start with 2 minutes. Build the habit first, duration later.',
      },
    ],
    actionQuestion: {
      question: 'How many minutes will you commit to daily meditation?',
      type: 'choice',
      choices: [
        '2 minutes (beginner)',
        '5 minutes (building)',
        '10 minutes (solid habit)',
        '15+ minutes (advanced)',
      ],
    },
  },

  // ============================================
  // FOUNDATION 4: Social Connection
  // ============================================

  'foundation4-lesson1': {
    lessonId: 'foundation4-lesson1',
    sections: [
      {
        type: 'text',
        title: 'Loneliness is a Health Crisis',
        content: 'Chronic loneliness has the same health impact as smoking 15 cigarettes per day. It increases mortality risk by 26%. We\'re more connected than ever (thanks, internet) and lonelier than ever.',
      },
      {
        type: 'science',
        title: 'The Data',
        content: '60% of Americans report feeling lonely. The UK appointed a "Minister of Loneliness." This isn\'t just feeling sad - loneliness increases inflammation, weakens immune system, and accelerates cognitive decline.',
      },
      {
        type: 'list',
        title: 'Why Modern Life Makes Us Lonely',
        content: 'The culprits:',
        items: [
          'Remote work (no casual office interactions)',
          'Social media (shallow connections replacing deep ones)',
          'Car culture (no neighborhood walking/talking)',
          'Entertainment at home (Netflix over gatherings)',
          'Geographic dispersion (friends/family live far away)',
        ],
      },
      {
        type: 'warning',
        title: 'Having Friends Isn\'t Enough',
        content: 'You can have 500 Instagram followers and still be deeply lonely. What matters is feeling truly seen, heard, and understood by at least one person.',
      },
      {
        type: 'text',
        title: 'The Solution',
        content: 'Quality over quantity. One deep friendship beats 100 superficial connections.',
      },
    ],
    actionQuestion: {
      question: 'How often do you have a meaningful conversation (not small talk)?',
      type: 'choice',
      choices: [
        'Multiple times a week',
        'Once a week',
        'A few times a month',
        'Rarely or never',
      ],
    },
  },

  'foundation4-lesson2': {
    lessonId: 'foundation4-lesson2',
    sections: [
      {
        type: 'text',
        title: 'Dunbar\'s Number: 150',
        content: 'Anthropologist Robin Dunbar found humans can maintain about 150 stable relationships. But within that, we have layers: 5 closest friends, 15 good friends, 50 friends, 150 meaningful contacts.',
      },
      {
        type: 'list',
        title: 'The Layers',
        content: 'How to think about your circles:',
        items: [
          '1-5: Your ride-or-die people (call at 3am)',
          '5-15: Close friends (see regularly, share deep stuff)',
          '15-50: Good friends (see occasionally, enjoy their company)',
          '50-150: Friendly acquaintances (know their name, catch up)',
        ],
      },
      {
        type: 'science',
        title: 'The Time Investment',
        content: 'Research shows maintaining a close friendship requires about 200 hours together. Casual friends: 50 hours. You literally can\'t be close friends with everyone - there aren\'t enough hours.',
      },
      {
        type: 'tip',
        title: 'Audit Your Time',
        content: 'Who are you actually spending time with? Are they your "5"? Or are you spending all your time on your "150" (social media) while your "5" get ignored?',
      },
      {
        type: 'example',
        title: 'Mike\'s Realization',
        content: 'Mike had 1000 LinkedIn connections but felt lonely. He did an audit: 0 hours with his 5 closest friends last month, 30 hours scrolling social media. He scheduled weekly video calls with his 3 best friends. His loneliness dropped within weeks.',
      },
    ],
    actionQuestion: {
      question: 'Who are your 3-5 closest people?',
      type: 'text',
      placeholder: 'List their names...',
    },
  },

  'foundation4-lesson3': {
    lessonId: 'foundation4-lesson3',
    sections: [
      {
        type: 'text',
        title: 'Reach Out Today',
        content: 'Here\'s a truth: everyone is busy, everyone is stressed, and almost everyone wishes they had deeper connections. That person you haven\'t talked to in months? They\'d be thrilled to hear from you.',
      },
      {
        type: 'list',
        title: 'How to Reconnect',
        content: 'It\'s simpler than you think:',
        items: [
          'Send a text: "Hey, been thinking about you. How are you?"',
          'Share a memory: "Remember when we...?"',
          'Be honest: "I realized we haven\'t talked in forever and I miss you"',
          'Make a plan: "Want to grab coffee this week?"',
        ],
      },
      {
        type: 'warning',
        title: 'Don\'t Wait for the Perfect Moment',
        content: 'You won\'t have time next week either. There\'s never a perfect time. Send that text right now.',
      },
      {
        type: 'tip',
        title: 'The 2-Minute Rule',
        content: 'If it takes less than 2 minutes, do it now. A text takes 30 seconds. That\'s less time than you\'ve spent reading this lesson.',
      },
      {
        type: 'example',
        title: 'Emma\'s Experience',
        content: 'Emma texted her old college friend she hadn\'t talked to in 2 years. Response came in 5 minutes: "OMG I was literally just thinking about you yesterday! Let\'s call this weekend!" They talked for 2 hours.',
      },
    ],
    actionQuestion: {
      question: 'Who will you reach out to today?',
      type: 'text',
      placeholder: 'Person\'s name...',
    },
  },

  'foundation4-lesson4': {
    lessonId: 'foundation4-lesson4',
    sections: [
      {
        type: 'text',
        title: 'The Lost Art of Listening',
        content: 'Most people don\'t listen to understand - they listen to respond. While you\'re talking, they\'re planning what to say next. This kills connection.',
      },
      {
        type: 'list',
        title: 'Active Listening Skills',
        content: 'How to truly listen:',
        items: [
          'Put your phone face down (seriously)',
          'Make eye contact',
          'Don\'t interrupt - let them finish',
          'Ask follow-up questions',
          'Reflect back: "So what I\'m hearing is..."',
          'Resist the urge to one-up their story',
        ],
      },
      {
        type: 'warning',
        title: 'Don\'t Fix, Just Listen',
        content: 'When someone shares a problem, they usually don\'t want solutions. They want to feel heard. Ask "Do you want advice or do you just want me to listen?" before offering solutions.',
      },
      {
        type: 'science',
        title: 'The Impact',
        content: 'Studies show that feeling heard activates the same brain regions as monetary reward. You listening to someone is literally rewarding their brain.',
      },
      {
        type: 'tip',
        title: 'The Practice',
        content: 'Next conversation: challenge yourself to ask 3 questions before making a statement. Watch how much deeper the conversation goes.',
      },
    ],
    actionQuestion: {
      question: 'In your next conversation, will you practice active listening?',
      type: 'choice',
      choices: [
        'Yes, I\'ll really focus on listening',
        'I\'ll try to ask more questions',
        'I need to practice not interrupting',
        'I\'ll put my phone away',
      ],
    },
  },

  // ============================================
  // FOUNDATION 5: Purpose & Growth
  // ============================================

  'foundation5-lesson1': {
    lessonId: 'foundation5-lesson1',
    sections: [
      {
        type: 'text',
        title: 'Your Why',
        content: 'Viktor Frankl survived Nazi concentration camps. He noticed: prisoners who had a "why" to live for survived longer. Those who lost their sense of purpose gave up quickly. He later wrote: "He who has a why to live can bear almost any how."',
      },
      {
        type: 'science',
        title: 'Purpose and Longevity',
        content: 'Studies show people with a strong sense of purpose live 7 years longer on average. They have lower rates of depression, dementia, and heart disease. Purpose is medicine.',
      },
      {
        type: 'list',
        title: 'Finding Your Purpose',
        content: 'Ask yourself:',
        items: [
          'What would I do if money wasn\'t a concern?',
          'What problems do I want to solve?',
          'What do I want to be remembered for?',
          'What makes me lose track of time?',
          'What would I regret not doing?',
        ],
      },
      {
        type: 'warning',
        title: 'Purpose Isn\'t Your Job',
        content: 'Your purpose might be related to your career, but it doesn\'t have to be. "I want to be a present parent" is a valid purpose. "I want to create art that moves people" is a purpose. Don\'t confuse purpose with profession.',
      },
      {
        type: 'text',
        title: 'Start Simple',
        content: 'Your purpose doesn\'t have to be "cure cancer." It can be "make my corner of the world a little better." Start small, refine as you go.',
      },
    ],
    actionQuestion: {
      question: 'What gives your life meaning?',
      type: 'text',
      placeholder: 'My purpose is...',
    },
  },

  'foundation5-lesson2': {
    lessonId: 'foundation5-lesson2',
    sections: [
      {
        type: 'text',
        title: 'Goals Without Purpose Are Empty',
        content: 'Most goals are someone else\'s definition of success. Big house, fancy car, six-figure salary - are these YOUR goals or society\'s goals you absorbed?',
      },
      {
        type: 'list',
        title: 'Values-Based Goals',
        content: 'Instead of arbitrary goals, ask:',
        items: [
          'What do I value most? (Family, creativity, health, freedom, etc.)',
          'Is this goal aligned with my values?',
          'Will achieving this goal make me happier or just look successful?',
          'Am I chasing this because I want it or because others expect it?',
        ],
      },
      {
        type: 'example',
        title: 'Sarah\'s Pivot',
        content: 'Sarah had a goal: Make VP by 35. She made it at 34. And felt... empty. Her real value was creativity, but VP meant more management, less creating. She quit and became a freelance designer. Same money, way happier.',
      },
      {
        type: 'tip',
        title: 'The Regret Test',
        content: 'Ask: "On my deathbed, will I regret NOT pursuing this goal?" If no, maybe it\'s not really your goal.',
      },
      {
        type: 'science',
        title: 'Intrinsic vs Extrinsic',
        content: 'Research shows goals driven by external validation (money, status) lead to less satisfaction than goals driven by internal values (growth, relationships, contribution).',
      },
    ],
    actionQuestion: {
      question: 'What\'s one goal aligned with your deepest values?',
      type: 'text',
      placeholder: 'My goal is...',
    },
  },

  'foundation5-lesson3': {
    lessonId: 'foundation5-lesson3',
    sections: [
      {
        type: 'text',
        title: 'Fixed vs Growth Mindset',
        content: 'Stanford psychologist Carol Dweck discovered something profound: people with a "growth mindset" (I can improve through effort) vastly outperform those with a "fixed mindset" (my abilities are set).',
      },
      {
        type: 'list',
        title: 'Fixed Mindset Signs',
        content: 'You might have a fixed mindset if you:',
        items: [
          'Avoid challenges (might fail)',
          'Give up easily (if I\'m not naturally good, why try?)',
          'See effort as pointless (either you have it or you don\'t)',
          'Feel threatened by others\' success',
          'Ignore useful feedback',
        ],
      },
      {
        type: 'list',
        title: 'Growth Mindset Signs',
        content: 'You have a growth mindset if you:',
        items: [
          'Embrace challenges (I\'ll learn from this)',
          'Persist through obstacles',
          'See effort as the path to mastery',
          'Get inspired by others\' success (if they can, I can)',
          'Learn from criticism',
        ],
      },
      {
        type: 'science',
        title: 'The Brain Science',
        content: 'Your brain is plastic - it physically changes based on what you practice. Every time you struggle with something hard, you\'re literally building new neural connections. Struggle = growth.',
      },
      {
        type: 'tip',
        title: 'The Power of "Yet"',
        content: 'Stop saying "I can\'t do this." Start saying "I can\'t do this YET." That one word changes everything.',
      },
    ],
    actionQuestion: {
      question: 'What\'s something you want to learn but thought you couldn\'t?',
      type: 'text',
      placeholder: 'I want to learn...',
    },
  },

  'foundation5-lesson4': {
    lessonId: 'foundation5-lesson4',
    sections: [
      {
        type: 'text',
        title: 'Track Your Growth',
        content: 'Progress is motivating. But day-to-day progress is invisible. You need to track it to see it.',
      },
      {
        type: 'list',
        title: 'What to Track',
        content: 'Track inputs, not just outputs:',
        items: [
          'Hours practiced (not just "am I good yet?")',
          'Days you showed up (consistency matters more than intensity)',
          'Obstacles overcome',
          'Things you learned',
          'Small wins celebrated',
        ],
      },
      {
        type: 'example',
        title: 'James\'s Progress',
        content: 'James wanted to learn guitar. Month 1: Terrible. Month 2: Still bad. Month 6: He could play 3 songs. Month 12: He played at open mic night. Tracking his practice hours (150+) showed progress his ears couldn\'t yet hear.',
      },
      {
        type: 'tip',
        title: 'The 2-Day Rule',
        content: 'Never miss twice in a row. Missed your meditation today? Fine. But DO IT tomorrow. This rule prevents "I missed one day" from becoming "I quit."',
      },
      {
        type: 'science',
        title: 'The Compound Effect',
        content: '1% better every day = 37x better in a year. 1% worse every day = nearly zero in a year. Small actions compound into massive results.',
      },
    ],
    actionQuestion: {
      question: 'What habit will you track starting today?',
      type: 'choice',
      choices: [
        'Daily meditation/mindfulness',
        'Gratitude journaling',
        'Sleep hours',
        'Time with loved ones',
      ],
    },
  },
};

export const getMentalLessonContent = (lessonId: string): MentalLessonContent | null => {
  return MENTAL_LESSON_CONTENTS[lessonId] || null;
};
