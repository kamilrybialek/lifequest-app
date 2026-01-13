/**
 * Lesson Content - Full lesson materials for Baby Steps 1-3
 * Each lesson contains sections with practical content and an action question at the end
 */

export interface LessonSection {
  type: 'text' | 'list' | 'tip' | 'warning' | 'example';
  title?: string;
  content: string;
  items?: string[];
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false';
  question: string;
  choices: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  explanation: string;
  xp: number;
}

export interface ContentBlock {
  blockType: 'section' | 'quiz';
  section?: LessonSection;
  quiz?: QuizQuestion;
}

export interface LessonContent {
  lessonId: string;
  content: ContentBlock[]; // Interleaved sections and quizzes
  actionQuestion: {
    question: string;
    type: 'number' | 'text' | 'checkbox' | 'choice';
    placeholder?: string;
    choices?: string[];
    unit?: string;
  };
  navigateToTool?: string; // Optional: navigate to specific tool after completion
}

// Old structure for backward compatibility
export interface OldLessonContent {
  lessonId: string;
  sections: LessonSection[];
  actionQuestion: {
    question: string;
    type: 'number' | 'text' | 'checkbox' | 'choice';
    placeholder?: string;
    choices?: string[];
    unit?: string;
  };
  navigateToTool?: string;
}

export const LESSON_CONTENTS: { [key: string]: LessonContent | OldLessonContent } = {
  // ============================================
  // STEP 1: Know Your Starting Point
  // ============================================

  'step1-lesson1': {
    lessonId: 'step1-lesson1',
    content: [
      // Intro sections
      {
        blockType: 'section',
        section: {
          type: 'text',
          title: 'Your Financial GPS',
          content: 'Imagine driving to a new city without knowing where you\'re starting from. GPS won\'t work. Same with money - you can\'t reach financial freedom without knowing your starting point.',
        },
      },
      {
        blockType: 'section',
        section: {
          type: 'text',
          title: 'What is Net Worth?',
          content: 'Net worth is simple: Everything you OWN minus everything you OWE. It\'s the truest measure of your financial health - not your salary, not your car, not your house. Just: Assets - Debts = Net Worth.',
        },
      },
      {
        blockType: 'section',
        section: {
          type: 'example',
          title: 'Real Example',
          content: 'Sarah owns:\n• Car worth $8,000\n• Savings $2,500\n• Checking $800\nTotal: $11,300\n\nSarah owes:\n• Car loan $5,000\n• Credit cards $3,200\nTotal: $8,200\n\nNet Worth: $11,300 - $8,200 = $3,100',
        },
      },
      {
        blockType: 'section',
        section: {
          type: 'tip',
          title: 'Don\'t Be Discouraged',
          content: 'If your net worth is negative (you owe more than you own), you\'re not alone. 30% of Americans have negative net worth. The key is knowing the number so you can improve it.',
        },
      },
      // First quiz
      {
        blockType: 'quiz',
        quiz: {
          id: 'q1',
          type: 'multiple-choice',
          question: 'Which of these counts as an ASSET (something you own)?',
          choices: [
            {
              id: 'a',
              text: 'Credit card debt',
              isCorrect: false,
              explanation: 'Credit card debt is a liability - something you OWE, not something you OWN.',
            },
            {
              id: 'b',
              text: 'Money in your savings account',
              isCorrect: true,
              explanation: 'Correct! Cash savings is an asset - it\'s money YOU own.',
            },
            {
              id: 'c',
              text: 'Monthly rent payment',
              isCorrect: false,
              explanation: 'Rent is an expense, not an asset. You don\'t own the apartment.',
            },
            {
              id: 'd',
              text: 'Car loan',
              isCorrect: false,
              explanation: 'A car loan is a liability - debt you owe to the bank.',
            },
          ],
          explanation: 'Assets are things you OWN that have value: cash, investments, property you own (not rent), vehicles, etc.',
          xp: 10,
        },
      },
      // Continue with assets
      {
        blockType: 'section',
        section: {
          type: 'list',
          title: 'Common Assets (What You Own)',
          content: 'Things that count toward your net worth:',
          items: [
            '💵 Cash in checking/savings accounts',
            '🏠 Home value (if you own it)',
            '🚗 Vehicle value (not what you paid - current worth)',
            '📈 Investments (401k, stocks, mutual funds)',
            '💎 Valuable items (jewelry, art, collectibles)',
            '🏢 Business value (if you own one)',
          ],
        },
      },
      {
        blockType: 'section',
        section: {
          type: 'warning',
          title: 'Don\'t Include These',
          content: 'Don\'t count: personal items (clothes, furniture), items you can\'t easily sell, or inflated values. Be realistic - use what you could sell it for TODAY, not what you paid.',
        },
      },
      // Second quiz
      {
        blockType: 'quiz',
        quiz: {
          id: 'q2',
          type: 'true-false',
          question: 'True or False: Your salary is the best measure of your financial health.',
          choices: [
            {
              id: 'true',
              text: 'True',
              isCorrect: false,
              explanation: 'False! You can make $100,000/year and still be broke if you spend $110,000. Net worth is what matters.',
            },
            {
              id: 'false',
              text: 'False',
              isCorrect: true,
              explanation: 'Correct! High income doesn\'t mean wealth. Someone making $50k with $100k saved is wealthier than someone making $150k with $200k in debt.',
            },
          ],
          explanation: 'It\'s not what you MAKE, it\'s what you KEEP. Net worth shows if you\'re building wealth or just treading water.',
          xp: 10,
        },
      },
      // Liabilities section
      {
        blockType: 'section',
        section: {
          type: 'list',
          title: 'Common Liabilities (What You Owe)',
          content: 'Debts that reduce your net worth:',
          items: [
            '💳 Credit card balances',
            '🏦 Personal loans',
            '🎓 Student loans',
            '🚗 Car loans',
            '🏠 Mortgage (if you own a home)',
            '👨‍⚕️ Medical bills',
            '👨‍👩‍👧 Money owed to family/friends',
          ],
        },
      },
      {
        blockType: 'section',
        section: {
          type: 'tip',
          title: 'Don\'t Include Monthly Bills',
          content: 'Rent, utilities, phone bills - these are monthly expenses, not debts. Only count actual LOANS and DEBT you owe.',
        },
      },
      // Third quiz
      {
        blockType: 'quiz',
        quiz: {
          id: 'q3',
          type: 'multiple-choice',
          question: 'Mike has $500 in savings and $2,000 in credit card debt. What is his net worth?',
          choices: [
            {
              id: 'a',
              text: '$2,500',
              isCorrect: false,
              explanation: 'No - you don\'t ADD debt to assets. Debt SUBTRACTS from your net worth.',
            },
            {
              id: 'b',
              text: '$500',
              isCorrect: false,
              explanation: 'Close, but you need to subtract the debt too!',
            },
            {
              id: 'c',
              text: '-$1,500',
              isCorrect: true,
              explanation: 'Correct! $500 (assets) - $2,000 (debt) = -$1,500. He has negative net worth.',
            },
            {
              id: 'd',
              text: '$0',
              isCorrect: false,
              explanation: 'Not quite - he has debt that needs to be subtracted.',
            },
          ],
          explanation: 'Negative net worth means you owe more than you own. It\'s common - and fixable! The key is knowing where you stand.',
          xp: 15,
        },
      },
      // Why it matters
      {
        blockType: 'section',
        section: {
          type: 'text',
          title: 'Why This Number Matters',
          content: 'Your net worth is your financial report card. Track it quarterly. As you pay off debt and build savings, this number will grow. It\'s the ONLY number that shows true financial progress.',
        },
      },
      {
        blockType: 'section',
        section: {
          type: 'list',
          title: 'What Your Net Worth Tells You',
          content: 'This one number reveals:',
          items: [
            '📊 Your true financial position (not just income)',
            '📈 Whether you\'re building wealth or just surviving',
            '🎯 How far you are from financial goals',
            '⏱️ Progress over time (track quarterly)',
            '💪 If your money habits are working',
          ],
        },
      },
      {
        blockType: 'section',
        section: {
          type: 'example',
          title: 'The Power of Tracking',
          content: 'Jennifer started with -$15,000 net worth (lots of debt). She tracked it quarterly:\n\nQ1: -$15,000\nQ2: -$10,500 (paid off $4,500 debt!)\nQ3: -$6,200 (another $4,300 gone!)\nQ4: -$1,500 (almost there!)\n\nSeeing the progress kept her motivated. 16 months later: $0 debt, $8,000 saved = $8,000 net worth!',
        },
      },
      // Final quiz
      {
        blockType: 'quiz',
        quiz: {
          id: 'q4',
          type: 'multiple-choice',
          question: 'What\'s the BEST way to improve your net worth?',
          choices: [
            {
              id: 'a',
              text: 'Get a raise at work',
              isCorrect: false,
              explanation: 'A raise helps, but if you spend it all, your net worth doesn\'t improve. You need to save or pay debt.',
            },
            {
              id: 'b',
              text: 'Buy expensive things to increase assets',
              isCorrect: false,
              explanation: 'Buying stuff usually involves debt! That actually DECREASES net worth.',
            },
            {
              id: 'c',
              text: 'Pay off debt AND increase savings',
              isCorrect: true,
              explanation: 'Correct! Paying debt reduces liabilities, saving increases assets. Both improve net worth!',
            },
            {
              id: 'd',
              text: 'Just wait for inheritance',
              isCorrect: false,
              explanation: 'Relying on inheritance is not a plan! YOU control your financial destiny.',
            },
          ],
          explanation: 'Two ways to grow net worth: reduce what you OWE (pay debt) and increase what you OWN (save money). Best strategy? Do both!',
          xp: 15,
        },
      },
    ],
    actionQuestion: {
      question: 'Are you ready to calculate your net worth?',
      type: 'choice',
      choices: [
        'Yes, I\'ll calculate it today',
        'I already know my net worth',
        'I need help calculating it',
        'I\'ll do it this week',
      ],
    },
    navigateToTool: 'NetWorthCalculator',
  },

  // ============================================
  // BABY STEP 1: $1,000 Emergency Fund
  // ============================================

  'old-step1-lesson1': {
    lessonId: 'step1-lesson1',
    sections: [
      {
        type: 'text',
        title: 'The Truth About Emergencies',
        content: 'Life doesn\'t care about your budget. Your car will break down. Your water heater will leak. Your kid will need urgent dental work. These aren\'t "if" scenarios - they\'re "when" scenarios.',
      },
      {
        type: 'warning',
        title: 'The Credit Card Trap',
        content: 'Without an emergency fund, every crisis becomes debt. A $800 car repair at 18% APR turns into $956 if you take a year to pay it off. Multiple emergencies? You\'re in a debt spiral.',
      },
      {
        type: 'text',
        title: 'Why $1,000 First?',
        content: '$1,000 covers 80% of life\'s unexpected expenses. It\'s achievable fast (30-90 days for most people), giving you a quick psychological win. This momentum is crucial for the debt payoff journey ahead.',
      },
      {
        type: 'tip',
        title: 'The Power of Behavior Change',
        content: 'Dave Ramsey\'s method isn\'t mathematically optimal - it\'s psychologically optimal. Saving $1,000 before tackling debt proves to yourself that you CAN change your financial behavior.',
      },
      {
        type: 'list',
        title: 'What This Fund Prevents',
        content: 'Your $1,000 emergency fund protects you from:',
        items: [
          'New credit card debt from car repairs',
          'Payday loans for medical emergencies',
          'Borrowing from family (and the awkwardness)',
          'Missing work because you can\'t afford to fix your car',
          'Financial panic and stress',
        ],
      },
      {
        type: 'text',
        title: 'Next Step',
        content: 'Once you have this $1,000 safety net, you can attack your debts with intensity, knowing that life\'s small emergencies won\'t derail your progress.',
      },
    ],
    actionQuestion: {
      question: 'Have you started your emergency fund? If yes, how much have you saved so far?',
      type: 'number',
      placeholder: '0',
      unit: '$',
    },
  },

  'step1-lesson2': {
    lessonId: 'step1-lesson2',
    sections: [
      {
        type: 'text',
        title: 'Finding Money You Didn\'t Know You Had',
        content: 'Most people think they have no money to save. But the truth is, we all have "spending leaks" - money flowing out on things that don\'t add real value to our lives.',
      },
      {
        type: 'list',
        title: 'Quick Wins: Temporary Cuts (30-60 days)',
        content: 'These aren\'t forever - just during your emergency fund sprint:',
        items: [
          'Cancel unused subscriptions (streaming, gym, apps) = $50-150/month',
          'Pause dining out and do meal prep = $200-400/month',
          'Skip coffee shops, brew at home = $60-120/month',
          'Cancel premium cable, use free options = $80-150/month',
          'Stop impulse shopping (30-day rule) = $100-300/month',
        ],
      },
      {
        type: 'example',
        title: 'Real Example',
        content: 'Sarah found $437/month by: canceling 3 streaming services ($35), meal prepping instead of takeout ($250), brewing coffee at home ($72), and pausing her gym membership ($80). In just over 2 months, she had her $1,000.',
      },
      {
        type: 'list',
        title: 'Sell Stuff You Don\'t Use',
        content: 'Look around your home - what hasn\'t been used in 6 months?',
        items: [
          'Old electronics, phones, tablets = $100-500',
          'Clothes, shoes, accessories = $50-200',
          'Tools, sports equipment = $100-400',
          'Furniture you don\'t need = $150-800',
          'Kids toys and gear they outgrew = $75-300',
        ],
      },
      {
        type: 'list',
        title: 'Earn Extra Income (Temporary)',
        content: 'Short-term side hustles to accelerate your goal:',
        items: [
          'Overtime at your current job',
          'Freelance skills (writing, design, coding)',
          'Gig economy (Uber, DoorDash, TaskRabbit)',
          'Babysitting, pet sitting',
          'Yard work, snow removal for neighbors',
          'Sell handmade items online',
        ],
      },
      {
        type: 'tip',
        title: 'The 30-Day Sprint',
        content: 'Treat this like a game: How fast can you get to $1,000? The intensity keeps you motivated and builds momentum for the debt payoff ahead.',
      },
    ],
    actionQuestion: {
      question: 'Which strategy will you use first to find $500 this month?',
      type: 'choice',
      choices: [
        'Cut subscriptions and dining out',
        'Sell unused items',
        'Pick up a side hustle',
        'Combination of all three',
      ],
    },
  },

  'step1-lesson3': {
    lessonId: 'step1-lesson3',
    sections: [
      {
        type: 'text',
        title: 'Out of Sight, Out of Temptation',
        content: 'Where you keep your emergency fund is almost as important as having one. The wrong location = money "mysteriously" disappears.',
      },
      {
        type: 'warning',
        title: 'Don\'t Do This',
        content: 'Keeping your emergency fund in your checking account is like keeping cookies on the counter when you\'re on a diet. The temptation is too high. 70% of people spend their fund on non-emergencies when it\'s easily accessible.',
      },
      {
        type: 'list',
        title: 'Where to Keep Your $1,000',
        content: 'Your emergency fund needs to be:',
        items: [
          '✅ Separate from daily spending accounts',
          '✅ Accessible within 24 hours (real emergencies)',
          '✅ NOT invested in stocks/crypto (too volatile)',
          '✅ Preferably at a different bank (psychological barrier)',
          '✅ No debit card attached (reduces temptation)',
        ],
      },
      {
        type: 'list',
        title: 'Best Options',
        content: 'Where to actually put the money:',
        items: [
          'High-yield savings account (online banks offer 4-5%)',
          'Separate savings account at a different bank',
          'Money market account',
        ],
      },
      {
        type: 'list',
        title: 'Avoid These',
        content: 'Don\'t keep your emergency fund in:',
        items: [
          '❌ Regular checking account (too easy to spend)',
          '❌ Cash at home (unsafe, no interest, too tempting)',
          '❌ Stocks or index funds (market could drop when you need it)',
          '❌ Long-term CDs (penalties for early withdrawal)',
          '❌ Cryptocurrency (way too volatile)',
        ],
      },
      {
        type: 'tip',
        title: 'The Psychological Barrier',
        content: 'Putting your fund in a different bank creates a 2-3 day transfer time. This delay makes you think twice: "Is this REALLY an emergency, or do I just want it?"',
      },
      {
        type: 'example',
        title: 'Real Example',
        content: 'Mike kept his emergency fund in his checking account. Within 4 months, he had "emergencies" like: new shoes ($120), dinner with friends ($80), a "great deal" on a TV ($400). His $1,000 fund shrank to $200. He moved it to an online savings account - 18 months later, it\'s still fully funded.',
      },
    ],
    actionQuestion: {
      question: 'Have you opened a separate savings account for your emergency fund?',
      type: 'choice',
      choices: [
        'Yes, already set up',
        'No, but I will this week',
        'No, need help choosing a bank',
      ],
    },
  },

  'step1-lesson4': {
    lessonId: 'step1-lesson4',
    sections: [
      {
        type: 'text',
        title: 'The First $100 Challenge',
        content: 'Theory is great. But nothing beats the feeling of seeing actual money pile up in your emergency fund. This week, your goal is simple: save your first $100 in 7 days.',
      },
      {
        type: 'list',
        title: 'Day-by-Day Action Plan',
        content: '7 days, $100. Here\'s how:',
        items: [
          'Day 1: Audit your subscriptions, cancel 2-3 unused ones = $20-40',
          'Day 2: Sell one unused item online (Facebook Marketplace, eBay) = $30-60',
          'Day 3: Pack lunch instead of eating out = $15',
          'Day 4: Do a small side gig (babysit, yard work) = $30-50',
          'Day 5: Skip coffee shop, brew at home = $8',
          'Day 6: Cook dinner instead of takeout = $25',
          'Day 7: Review progress, transfer everything to emergency fund',
        ],
      },
      {
        type: 'tip',
        title: 'Track Every Dollar',
        content: 'Use your phone\'s notes app or a simple spreadsheet. Every time you save money (didn\'t buy coffee, sold an item), write it down. Watching the number grow is incredibly motivating.',
      },
      {
        type: 'list',
        title: 'What to Sell for Quick Cash',
        content: 'Look for these high-value items you don\'t use:',
        items: [
          'Old smartphones, tablets, laptops',
          'Video games, consoles',
          'Designer clothes, handbags',
          'Power tools, lawn equipment',
          'Furniture, home decor',
          'Sports equipment, bikes',
          'Musical instruments',
        ],
      },
      {
        type: 'example',
        title: 'Real Example',
        content: 'Jennifer\'s 7-day challenge: Sold old iPhone ($120), canceled Spotify and Hulu ($25), did 2 babysitting gigs ($80), meal prepped all week ($60 saved), sold kids\' old toys ($35). Total: $320 in 7 days. She was hooked and hit $1,000 in 5 weeks.',
      },
      {
        type: 'warning',
        title: 'Don\'t Wait for Perfection',
        content: 'You might not hit $100 in the first 7 days. That\'s OK. The point is to START and build momentum. Even $50 is a huge win - it\'s $50 more than you had last week.',
      },
      {
        type: 'text',
        title: 'Celebrate Small Wins',
        content: 'When you hit your first $100, celebrate (cheaply!). Tell your accountability partner. Post about it. You\'re breaking the cycle of living paycheck-to-paycheck.',
      },
    ],
    actionQuestion: {
      question: 'How much did you transfer to your emergency fund this week?',
      type: 'number',
      placeholder: '0',
      unit: '$',
    },
  },

  // ============================================
  // BABY STEP 2: Debt Snowball
  // ============================================

  'step2-lesson1': {
    lessonId: 'step2-lesson1',
    sections: [
      {
        type: 'text',
        title: 'Math vs. Psychology',
        content: 'Financial experts will tell you: "Pay off highest interest debt first to save money." They\'re mathematically correct. But 70% of people who try that method quit within 6 months. Why?',
      },
      {
        type: 'warning',
        title: 'The Avalanche Problem',
        content: 'Paying highest interest first (avalanche method) means your largest debt usually goes first. It could take 12-18 months to pay off that first debt. Most people lose motivation and give up before seeing progress.',
      },
      {
        type: 'text',
        title: 'The Snowball Method',
        content: 'Pay off smallest debt first, regardless of interest rate. When it\'s gone, take that payment and add it to the next smallest debt. The "snowball" gets bigger as you go.',
      },
      {
        type: 'example',
        title: 'Real Numbers',
        content: 'Avalanche saves you maybe $500-800 in interest over 2-3 years. But if you QUIT after 6 months because you\'re not seeing progress, you save $0. Snowball keeps you motivated through quick wins.',
      },
      {
        type: 'list',
        title: 'Why Snowball Works',
        content: 'The psychological benefits:',
        items: [
          'First debt gone in 1-3 months = instant momentum',
          'Quick wins = dopamine = motivation to continue',
          'Fewer accounts to manage each month = less complexity',
          'Visible progress = less likely to quit',
          'Behavior change > math optimization',
        ],
      },
      {
        type: 'list',
        title: 'Real Success Stories',
        content: 'People who used snowball method:',
        items: [
          'Paid off $50,000 in 26 months (would\'ve taken 8+ years minimum payments)',
          'Average debt freedom in 18-36 months',
          'Over 6 million people debt-free using this method',
          'Higher completion rate than any other debt payoff strategy',
        ],
      },
      {
        type: 'tip',
        title: 'Dave Ramsey\'s Insight',
        content: '"If paying off debt was about math, nobody would be in debt. It\'s about behavior. And behavior change requires motivation. Snowball gives you that motivation."',
      },
    ],
    actionQuestion: {
      question: 'What motivates you most about the snowball method?',
      type: 'choice',
      choices: [
        'Quick wins and seeing debts disappear',
        'Building momentum with each payoff',
        'Simplifying my finances step by step',
        'Proving to myself I can do this',
      ],
    },
  },

  'step2-lesson2': {
    lessonId: 'step2-lesson2',
    sections: [
      {
        type: 'text',
        title: 'Face Your Enemy',
        content: 'Most people in debt avoid looking at the total. It\'s painful. Scary. Overwhelming. But you can\'t defeat an enemy you won\'t look at.',
      },
      {
        type: 'warning',
        title: 'The Avoidance Trap',
        content: 'Not knowing your exact debt total keeps you stuck. Your brain imagines it\'s worse than reality, creating paralyzing anxiety. The truth - even if it\'s bad - is ALWAYS better than the unknown.',
      },
      {
        type: 'list',
        title: 'Create Your Debt List',
        content: 'For EACH debt, write down:',
        items: [
          '1. Debt name (Credit Card, Car Loan, etc.)',
          '2. Total amount owed',
          '3. Minimum monthly payment',
          '4. Interest rate (for reference only)',
        ],
      },
      {
        type: 'list',
        title: 'Sort Smallest to Largest',
        content: 'Ignore interest rates. Sort by total balance:',
        items: [
          'Smallest debt goes first (even if it\'s 0% interest)',
          'Largest debt goes last (even if it\'s 29% interest)',
          'This is your roadmap to freedom',
        ],
      },
      {
        type: 'example',
        title: 'Sample Debt List',
        content: 'John\'s snowball list:\n\n1. Medical bill: $350 - $50/mo\n2. Credit Card A: $1,200 - $35/mo\n3. Credit Card B: $3,800 - $95/mo\n4. Car Loan: $8,500 - $285/mo\n5. Student Loan: $24,000 - $220/mo\n\nTotal: $37,850\n\nHe attacked the $350 first. Paid it off in 7 months. The momentum was incredible.',
      },
      {
        type: 'tip',
        title: 'The Relief of Knowing',
        content: 'Almost everyone says the same thing after making their list: "It\'s bad, but not as bad as I thought." The fear of the unknown is worse than the reality.',
      },
      {
        type: 'text',
        title: 'This Is Your Map',
        content: 'This list is your roadmap. You\'ll cross off each debt as you eliminate it. Keep it visible - on your fridge, your desk, your phone. Every payment brings you closer to freedom.',
      },
    ],
    actionQuestion: {
      question: 'How many debts (credit cards, loans, etc.) do you have total?',
      type: 'number',
      placeholder: '0',
    },
  },

  'step2-lesson3': {
    lessonId: 'step2-lesson3',
    sections: [
      {
        type: 'text',
        title: 'Intensity Determines Timeline',
        content: 'People ask: "How long until I\'m debt-free?" The answer: How intense do you want to be? Minimum payments = decades. Gazelle intensity = 18-36 months.',
      },
      {
        type: 'list',
        title: 'The Snowball Attack Plan',
        content: 'Here\'s exactly what to do:',
        items: [
          '1. Make MINIMUM payments on all debts except smallest',
          '2. Throw EVERY extra dollar at smallest debt',
          '3. When smallest is gone, add its payment to next debt',
          '4. Repeat until debt-free',
        ],
      },
      {
        type: 'example',
        title: 'The Snowball in Action',
        content: 'Sarah\'s debts:\n- Card A: $500 ($25/mo)\n- Card B: $2,000 ($50/mo)\n- Car: $8,000 ($200/mo)\n\nMonthly debt budget: $400\n\nMonth 1-2: Pay $125/mo on Card A ($400 - $50 - $200), plus minimums on others. Card A GONE in 2 months.\n\nMonth 3+: Now she has $150/mo for Card B ($125 from A + $50 minimum). Instead of 40 months, it\'s gone in 13.\n\nThen she attacks the car with $350/mo...',
      },
      {
        type: 'list',
        title: 'Finding Extra Money for Debt',
        content: 'Where to find money to accelerate payoff:',
        items: [
          'Side hustle income (all of it goes to debt)',
          'Overtime at work',
          'Sell stuff you don\'t need',
          'Tax refund (entire amount)',
          'Work bonus (entire amount)',
          'Cash gifts (birthdays, holidays)',
          'Cut expenses temporarily',
        ],
      },
      {
        type: 'warning',
        title: 'No New Debt',
        content: 'Rule #1: Stop using credit cards. Cut them up. Freeze them. You can\'t get out of a hole while still digging. If you keep borrowing, you\'ll never escape.',
      },
      {
        type: 'tip',
        title: 'Gazelle Intensity',
        content: 'Dave Ramsey says: "Run from debt like a gazelle running from a cheetah." This isn\'t forever - it\'s a 1-2 year sprint. Extreme focus now = freedom for life.',
      },
      {
        type: 'text',
        title: 'Every Dollar is a Soldier',
        content: 'Think of every dollar as a soldier fighting for your freedom. The more soldiers (dollars) you send to battle (debt), the faster you win the war.',
      },
    ],
    actionQuestion: {
      question: 'How much extra (beyond minimums) can you throw at debt each month?',
      type: 'number',
      placeholder: '0',
      unit: '$',
    },
  },

  'step2-lesson4': {
    lessonId: 'step2-lesson4',
    sections: [
      {
        type: 'text',
        title: 'The Marathon Wall',
        content: 'Debt payoff is hard. Around months 4-8, most people hit a wall. Progress feels slow. You\'re tired of saying no. The finish line seems far away. This is where most people quit.',
      },
      {
        type: 'warning',
        title: 'The Danger Zone',
        content: 'Studies show people are most likely to quit their debt payoff plan between months 4-8. You\'ve lost the initial excitement, but haven\'t seen enough progress yet. Don\'t be a statistic.',
      },
      {
        type: 'list',
        title: 'Strategies to Stay Motivated',
        content: 'How to push through:',
        items: [
          'Visual progress tracker (chart on your fridge)',
          'Celebrate EVERY debt you eliminate (even small ones)',
          'Share your journey (accountability partner, online community)',
          'Calculate your "debt-free date" and countdown',
          'Imagine life without payments (what will you do with that money?)',
          'Look at your progress, not just the remaining balance',
        ],
      },
      {
        type: 'tip',
        title: 'The Debt-Free Scream',
        content: 'In Dave Ramsey\'s office, people who finish paying off debt get to do a "debt-free scream" on air. What will YOUR celebration be? Plan it now - it\'s something to look forward to.',
      },
      {
        type: 'list',
        title: 'Small Rewards Along the Way',
        content: 'When you pay off each debt, celebrate (cheaply!):',
        items: [
          'First debt gone: Nice dinner at home with family',
          'Second debt gone: Movie night with saved money',
          'Halfway point: Picnic at the park',
          'Final debt: Bigger celebration (but still budget-friendly)',
        ],
      },
      {
        type: 'example',
        title: 'Real Story',
        content: 'Mike was $43,000 in debt. Month 6, he was exhausted and discouraged. His wife made a paper chain - one link for every $100 of debt. Every payment, they cut off links. Watching the chain shrink kept them going. Debt-free in 31 months.',
      },
      {
        type: 'text',
        title: 'Your Why',
        content: 'Write down WHY you want to be debt-free. Not "to have no payments" - go deeper. "To stop fighting with my spouse about money." "To give my kids a different example." "To sleep peacefully." Read it when you want to quit.',
      },
      {
        type: 'tip',
        title: 'Progress, Not Perfection',
        content: 'Some months you\'ll crush it. Some months you\'ll barely make minimums. That\'s OK. As long as you\'re moving forward, you\'re winning.',
      },
    ],
    actionQuestion: {
      question: 'What will you do to celebrate when you pay off your first debt?',
      type: 'text',
      placeholder: 'E.g., Family dinner, movie night, park visit...',
    },
  },

  // ============================================
  // BABY STEP 3: 3-6 Months Emergency Fund
  // ============================================

  'step3-lesson1': {
    lessonId: 'step3-lesson1',
    sections: [
      {
        type: 'text',
        title: 'From Starter to Fully Funded',
        content: 'Congratulations - if you\'re here, you\'ve paid off all non-mortgage debt! That $1,000 starter emergency fund protected you during the debt payoff. Now it\'s time to build your REAL safety net.',
      },
      {
        type: 'text',
        title: 'Why 3-6 Months?',
        content: '$1,000 covers small emergencies. But what if you lose your job? Serious illness? Major home repair? You need a fully-funded emergency fund: 3-6 months of EXPENSES.',
      },
      {
        type: 'warning',
        title: 'Expenses, Not Income',
        content: 'Common mistake: calculating 3-6 months of INCOME. Wrong. Calculate your monthly EXPENSES - what you actually spend to live. If you make $5,000 but spend $3,500, you need $10,500-$21,000 (not $15,000-$30,000).',
      },
      {
        type: 'list',
        title: 'How to Calculate Your Number',
        content: 'Step by step:',
        items: [
          '1. Add up ONE month of essential expenses (housing, food, utilities, insurance, transportation)',
          '2. Don\'t include debt payments (you\'re debt-free now!)',
          '3. Don\'t include fun money (in emergency, you\'d cut that)',
          '4. Multiply that number × 3 to 6',
          '5. That\'s your target emergency fund',
        ],
      },
      {
        type: 'example',
        title: 'Real Example',
        content: 'Kelly\'s monthly expenses:\n- Rent: $1,200\n- Food: $400\n- Utilities: $150\n- Car insurance: $100\n- Gas: $150\n- Phone: $50\n- Basic needs: $2,050/month\n\n3 months = $6,150\n6 months = $12,300\n\nShe chose 6 months because she\'s self-employed.',
      },
      {
        type: 'tip',
        title: 'This Is Your Insurance Policy',
        content: 'A fully-funded emergency fund means you ARE your own insurance company. Job loss? Covered. Medical emergency? Covered. Major car repair? No stress. You have MONTHS to figure it out.',
      },
      {
        type: 'text',
        title: 'The Peace Factor',
        content: 'People with a full emergency fund sleep differently. No panic. No fear. Just peace knowing that life\'s curveballs won\'t send you back into debt.',
      },
    ],
    actionQuestion: {
      question: 'What are your total monthly essential expenses?',
      type: 'number',
      placeholder: '0',
      unit: '$',
    },
  },

  'step3-lesson2': {
    lessonId: 'step3-lesson2',
    sections: [
      {
        type: 'text',
        title: 'Not One-Size-Fits-All',
        content: 'Some people need 3 months. Others need 12. It depends on your situation. This lesson helps you find YOUR number.',
      },
      {
        type: 'list',
        title: '3 Months Is Enough If:',
        content: 'Choose 3 months if you have:',
        items: [
          'Stable W-2 job with consistent income',
          'Dual income household (two working adults)',
          'Young, healthy, no dependents',
          'Low-risk job (teacher, government, established company)',
          'Strong professional network for job hunting',
        ],
      },
      {
        type: 'list',
        title: '6 Months Is Standard For:',
        content: 'Choose 6 months if you have:',
        items: [
          'Single income household',
          'One person self-employed',
          'Kids or other dependents',
          'Moderate job security',
          'Health concerns in family',
          'Homeowner (more things can break)',
        ],
      },
      {
        type: 'list',
        title: '9-12 Months If:',
        content: 'Choose 12 months if you have:',
        items: [
          'Self-employed or freelance (irregular income)',
          'High-risk industry (commission-based, seasonal)',
          'Serious health issues',
          'Primary breadwinner for large family',
          'Older worker (harder to find new job)',
          'Live in area with limited job opportunities',
        ],
      },
      {
        type: 'example',
        title: 'Real Examples',
        content: 'Sarah: Teacher, married, both working, no kids = 3 months ($9,000)\n\nMike: Self-employed, wife stays home with 3 kids = 12 months ($42,000)\n\nJen: Single, corporate job, rents apartment = 6 months ($15,000)',
      },
      {
        type: 'tip',
        title: 'When in Doubt, Go Higher',
        content: 'Nobody ever said "I wish I had LESS in my emergency fund." If you\'re between two numbers, choose the higher one for extra peace of mind.',
      },
      {
        type: 'warning',
        title: 'Don\'t Overdo It',
        content: 'Some people want 24 months "just to be safe." That\'s too much - it means tens of thousands sitting idle instead of building wealth. After 3-6 months, start investing.',
      },
    ],
    actionQuestion: {
      question: 'How many months of expenses should YOUR emergency fund cover?',
      type: 'choice',
      choices: [
        '3 months',
        '6 months',
        '9 months',
        '12 months',
      ],
    },
  },

  'step3-lesson3': {
    lessonId: 'step3-lesson3',
    sections: [
      {
        type: 'text',
        title: 'Protecting Your Fund',
        content: 'The hardest part isn\'t building the fund - it\'s NOT spending it on non-emergencies. "Great deal" on a TV? Not an emergency. Christmas gifts? Not an emergency. Vacation? Definitely not an emergency.',
      },
      {
        type: 'list',
        title: 'What IS an Emergency',
        content: 'Use your fund ONLY for these:',
        items: [
          'Job loss (while searching for new job)',
          'Unexpected medical expenses not covered by insurance',
          'Major car repairs needed to get to work',
          'Essential home repairs (roof leak, broken furnace)',
          'Urgent family situations (funeral travel, etc.)',
        ],
      },
      {
        type: 'list',
        title: 'What is NOT an Emergency',
        content: 'Do NOT use your fund for:',
        items: [
          'Holidays, birthdays, Christmas (you can plan for these)',
          'Vacation (save separately)',
          'New phone, laptop, TV',
          'Wedding, parties, events',
          '"Great deal" or sale on something you want',
          'Helping family/friends financially',
          'Non-essential purchases',
        ],
      },
      {
        type: 'tip',
        title: 'The Emergency Test',
        content: 'Ask yourself three questions:\n\n1. Is it unexpected?\n2. Is it necessary?\n3. Is it urgent?\n\nAll three must be YES for it to be an emergency.',
      },
      {
        type: 'warning',
        title: 'The Slow Drain',
        content: '60% of people with emergency funds spend them on non-emergencies within the first year. Don\'t be a statistic. Every time you\'re tempted, ask: "Is this REALLY an emergency, or do I just want it?"',
      },
      {
        type: 'example',
        title: 'Real Examples',
        content: 'NOT emergency: Tom saw a "must-see" concert for $200. "It\'s only once!" - No. Not emergency.\n\nEMERGENCY: Sarah\'s car transmission died ($2,400). She needs it to get to work - YES. Emergency.\n\nNOT emergency: Christmas is coming and Mike wants to buy nice gifts - No. Christmas happens every year. Plan for it.',
      },
      {
        type: 'text',
        title: 'Replenish Immediately',
        content: 'If you DO use your emergency fund for a real emergency, make replenishing it your TOP priority. Pause investing, pause extra savings goals. Get that fund back to full as fast as possible.',
      },
    ],
    actionQuestion: {
      question: 'Will you commit to using your fund ONLY for true emergencies?',
      type: 'choice',
      choices: [
        'Yes, I understand the rules',
        'I need more clarification',
        'I\'ll do my best',
      ],
    },
  },

  'step3-lesson4': {
    lessonId: 'step3-lesson4',
    sections: [
      {
        type: 'text',
        title: 'You Made It!',
        content: 'If you have a fully-funded emergency fund (3-6 months of expenses), you\'re in the TOP 20% financially. Most people live paycheck-to-paycheck. You have MONTHS of runway. Congratulations.',
      },
      {
        type: 'list',
        title: 'What You\'ve Accomplished',
        content: 'Look how far you\'ve come:',
        items: [
          '✅ Saved $1,000 starter emergency fund',
          '✅ Paid off ALL debt (except mortgage)',
          '✅ Built 3-6 months of expenses in savings',
          '✅ Changed your money behavior permanently',
          '✅ Created financial peace and security',
        ],
      },
      {
        type: 'text',
        title: 'The Foundation Is Complete',
        content: 'Baby Steps 1-3 are your financial foundation. No debt. No payments (except maybe mortgage). Months of expenses saved. You\'re not worried about next month - you\'re thinking about next DECADE.',
      },
      {
        type: 'tip',
        title: 'Now You Can Build Wealth',
        content: 'With your foundation solid, you can take smart risks. Invest aggressively. Start a business. Buy real estate. Because if something goes wrong, you have MONTHS to figure it out without panic.',
      },
      {
        type: 'list',
        title: 'What\'s Next: Baby Steps 4-7',
        content: 'Now that you have financial security, build wealth:',
        items: [
          'Baby Step 4: Invest 15% of income for retirement',
          'Baby Step 5: Save for kids\' college',
          'Baby Step 6: Pay off mortgage early',
          'Baby Step 7: Build wealth and give generously',
        ],
      },
      {
        type: 'example',
        title: 'Real Impact',
        content: 'Maria started with $35,000 in debt and $200 in savings. 28 months later: debt-free with $18,000 emergency fund. She now invests $750/month. Projected millionaire by age 55.',
      },
      {
        type: 'text',
        title: 'Pay It Forward',
        content: 'You\'ve learned what most people never learn. Share it. Help a friend. Mentor someone. The principles that changed your life can change theirs too.',
      },
      {
        type: 'tip',
        title: 'The New Normal',
        content: 'Peace. Security. Options. That\'s your new normal. No more panic. No more living paycheck-to-paycheck. No more debt. Just freedom to build the life you want.',
      },
    ],
    actionQuestion: {
      question: 'How much do you have in your emergency fund right now?',
      type: 'number',
      placeholder: '0',
      unit: '$',
    },
  },
};

// Helper function to get lesson content by ID
export const getLessonContent = (lessonId: string): LessonContent | OldLessonContent | null => {
  return LESSON_CONTENTS[lessonId] || null;
};
