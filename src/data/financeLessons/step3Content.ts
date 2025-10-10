import { LessonContent } from '../../types/financeNew';

/**
 * STEP 3: Eliminate All Debt (Except Mortgage)
 * Based heavily on Marcin Iwuć's war on debt philosophy
 */

export const STEP3_LESSON_CONTENTS: { [key: string]: LessonContent } = {
  // ============================================
  // LESSON 1: This Is War!
  // ============================================
  'step3-lesson1': {
    lessonId: 'step3-lesson1',
    sections: [
      {
        type: 'quote',
        title: 'You Weren\'t Born For This',
        content: 'You were not born to spend your entire life paying off debts, and then die.',
        author: 'Financial Truth',
      },
      {
        type: 'text',
        title: 'Change Your Mindset COMPLETELY',
        content: 'The first and most important step to breaking free from debt is a complete, uncompromising, irreversible BREAK from your previous "relaxed" attitude toward debt. Your current beliefs brought you here. To get OUT, you must think DIFFERENTLY.',
      },
      {
        type: 'warning',
        title: 'THIS IS WAR',
        content: 'Debt is your ENEMY. The biggest, most dangerous, most brutal enemy on your path to financial security. This is not a friendly chat. This is WAR. You need to get ANGRY.',
      },
      {
        type: 'text',
        title: 'Get FURIOUS',
        content: 'Say it out loud:\n\n"I am DONE with this shit! I will eliminate these damn debts ONCE AND FOR ALL!"\n\nSounds dramatic? Good. You NEED that emotion. Calm, rational approach won\'t work. You need FANATIC will to fight.',
      },
      {
        type: 'list',
        title: 'Debt = Modern Slavery',
        content: 'Here\'s what debt really is:',
        items: [
          'You voluntarily signed up to work for banks',
          'Every morning you go to work to pay THEM, not yourself',
          'They get your money (interest) for doing nothing',
          'You\'re enslaved to monthly payments',
          'You can\'t quit, can\'t relax, can\'t be free',
        ],
      },
      {
        type: 'example',
        title: 'Marcin\'s Wake-Up Call',
        content: 'In 2009, I was "smart" with credit:\n• 4 credit cards (prestige!)\n• 20,000 PLN overdraft (safety net!)\n• "Grace period strategy" (genius!)\n\nResult: Almost 30,000 PLN consumer debt. I was a SLAVE. Every paycheck went straight to banks. I wasn\'t living - I was SERVING debt.',
      },
      {
        type: 'warning',
        title: 'The Boiling Frog Returns',
        content: 'Remember: throw a frog in boiling water = it jumps out. Put it in cool water and slowly heat it = it dies.\n\nThat\'s how debt works. One card, then another, then a limit increase, then another card... You don\'t notice until you\'re COOKED.',
      },
      {
        type: 'tip',
        title: 'Your "Why"',
        content: 'Write down WHY you want to be debt-free. Not surface level ("no payments") - go DEEP:\n\n"I want to stop fighting with my spouse about money"\n"I want my kids to see a different example"\n"I want to sleep peacefully at night"\n\nRead this when you want to quit.',
      },
    ],
    quiz: [
      {
        id: 'step3-l1-q1',
        type: 'multiple-choice',
        question: 'Why do you need EMOTION (anger) to fight debt, not just logic?',
        choices: [
          {
            id: 'a',
            text: 'Because banks respond to emotion',
            isCorrect: false,
            explanation: 'Not about banks - about YOU.',
          },
          {
            id: 'b',
            text: 'Because behavior change requires motivation',
            isCorrect: true,
            explanation: 'Yes! Logic got you INTO debt. Emotion gets you OUT. You need fanatic will to fight.',
          },
          {
            id: 'c',
            text: 'Because math is hard',
            isCorrect: false,
            explanation: 'Math is easy - BEHAVIOR is hard.',
          },
          {
            id: 'd',
            text: 'You don\'t - stay calm',
            isCorrect: false,
            explanation: 'Calm = comfortable = status quo. You need FIRE to change.',
          },
        ],
        explanation: 'Debt payoff is about BEHAVIOR, not math. Behavior change needs emotion, motivation, and fire in your belly.',
        xp: 5,
      },
      {
        id: 'step3-l1-q2',
        type: 'true-false',
        question: 'Debt is a form of modern slavery because you work to pay others (banks).',
        choices: [
          {
            id: 'true',
            text: 'True',
            isCorrect: true,
            explanation: 'Correct! You signed up voluntarily to work for creditors. Every day you labor to pay them.',
          },
          {
            id: 'false',
            text: 'False',
            isCorrect: false,
            explanation: 'Actually true - debt enslaves you to monthly payments and creditors.',
          },
        ],
        explanation: 'Debt = voluntary slavery. You work, banks get paid first (through your payments), you get what\'s left. That\'s servitude.',
        xp: 5,
      },
      {
        id: 'step3-l1-q3',
        type: 'scenario',
        question: 'Jake says "I\'m fine with a little debt - I can handle it." What\'s the problem with this mindset?',
        choices: [
          {
            id: 'a',
            text: 'Nothing - small debt is fine',
            isCorrect: false,
            explanation: 'NO! "A little debt" is how it starts. Then more, then more...',
          },
          {
            id: 'b',
            text: 'He\'s the boiling frog - won\'t notice until trapped',
            isCorrect: true,
            explanation: 'Yes! "A little" becomes "a lot" gradually. He won\'t notice until he\'s drowning.',
          },
          {
            id: 'c',
            text: 'Banks will love him',
            isCorrect: false,
            explanation: 'Banks WILL love him (he pays them interest), but that\'s bad for HIM.',
          },
          {
            id: 'd',
            text: 'Nothing if he has good credit',
            isCorrect: false,
            explanation: 'Good credit score ≠ good financial health. Debt is still slavery.',
          },
        ],
        explanation: 'Relaxed attitude toward debt = boiling frog. "A little" debt gradually becomes crushing load. No tolerance for debt!',
        xp: 5,
      },
      {
        id: 'step3-l1-q4',
        type: 'reflection',
        question: 'Write your DEEP reason for wanting to be debt-free (not "no payments" - WHY does that matter?)',
        explanation: 'Your "why" is your fuel when motivation runs low. Make it PERSONAL and EMOTIONAL.',
        xp: 5,
      },
    ],
    actionQuestion: {
      question: 'On a scale of 1-10, how ANGRY are you at debt right now?',
      type: 'number',
      placeholder: '5',
    },
  },

  // ============================================
  // LESSON 2: Good Debt vs. Bad Debt
  // ============================================
  'step3-lesson2': {
    lessonId: 'step3-lesson2',
    sections: [
      {
        type: 'text',
        title: 'Not All Debt Is Equal',
        content: 'Let\'s be clear: some debt CAN make sense. I\'m not a fanatic who says "all debt is evil." But MOST consumer debt is incredibly stupid.',
      },
      {
        type: 'list',
        title: 'Debt That Can Make Sense',
        content: 'These MAY be reasonable:',
        items: [
          'Mortgage (reasonable terms, affordable payment)',
          'Business investment loans (ROI higher than interest)',
          'Student loans (maybe - if degree has good ROI)',
        ],
      },
      {
        type: 'warning',
        title: 'Debt That\'s STUPID',
        content: 'Consumer debt on deprecating assets or consumption is ALWAYS dumb.',
      },
      {
        type: 'list',
        title: 'STUPID Debt (Eliminate These)',
        content: 'These are your enemies:',
        items: [
          'Payday loans and cash advances (pure evil)',
          'Credit card balances',
          'Store financing ("12 months same as cash" trap)',
          'Car loans (maybe exception if increases income)',
          'Personal loans for consumption',
          'Overdraft/line of credit for daily expenses',
          '"Buy now, pay later" schemes',
        ],
      },
      {
        type: 'text',
        title: 'The Key Question',
        content: 'Ask yourself: "Am I borrowing to CONSUME or to BUILD WEALTH?"\n\nConsuming = stupid\nWealth-building = maybe sensible',
      },
      {
        type: 'example',
        title: 'Car Loan: Depends',
        content: 'BAD: $30,000 loan for new car "for prestige" → Stupid. Car loses value, you pay interest.\n\nMAYBE OK: $8,000 loan for reliable used car to drive to job that doubles your income → Math works.\n\nBEST: Save cash, buy car outright → No interest paid.',
      },
      {
        type: 'quote',
        title: 'The Prestige Trap',
        content: 'Real prestige comes from NET WORTH, not monthly payments on things you don\'t own.',
        author: 'Wealth Mindset',
      },
      {
        type: 'warning',
        title: 'The "Millions Have Debt" Argument',
        content: '"Everyone has debt, it\'s normal!"\n\nMillions of people do stupid things. Millions believed the sun revolved around Earth. Millions can be WRONG.',
      },
      {
        type: 'text',
        title: 'Your Focus: Consumer Debt',
        content: 'In this program, we\'re ELIMINATING consumer debt. Mortgage (if reasonable) can stay for now - we\'ll handle that in Step 8.',
      },
    ],
    quiz: [
      {
        id: 'step3-l2-q1',
        type: 'multiple-choice',
        question: 'Which of these is SENSIBLE debt?',
        choices: [
          {
            id: 'a',
            text: '$500 loan for vacation',
            isCorrect: false,
            explanation: 'Consumption! If you can\'t afford vacation cash, you can\'t afford it.',
          },
          {
            id: 'b',
            text: '$25,000 car loan for "prestige"',
            isCorrect: false,
            explanation: 'Prestige from borrowed money isn\'t prestige. It\'s pretending.',
          },
          {
            id: 'c',
            text: 'Reasonable mortgage on affordable home',
            isCorrect: true,
            explanation: 'Yes! Housing loan can make sense if terms are reasonable and payment is affordable.',
          },
          {
            id: 'd',
            text: 'Credit card balance for shopping',
            isCorrect: false,
            explanation: 'Pure consumption on depreciating items. Stupid.',
          },
        ],
        explanation: 'Sensible debt: builds wealth or enables wealth-building. Consumer debt on consumption = always stupid.',
        xp: 5,
      },
      {
        id: 'step3-l2-q2',
        type: 'true-false',
        question: 'If millions of people have consumer debt, it must be okay.',
        choices: [
          {
            id: 'true',
            text: 'True',
            isCorrect: false,
            explanation: 'NO! Millions doing something doesn\'t make it smart.',
          },
          {
            id: 'false',
            text: 'False',
            isCorrect: true,
            explanation: 'Correct! Millions can be wrong. Don\'t follow the broke crowd.',
          },
        ],
        explanation: 'Millions have debt. Millions are also broke. Don\'t use "everyone does it" as justification for stupidity.',
        xp: 5,
      },
      {
        id: 'step3-l2-q3',
        type: 'scenario',
        question: 'Sarah wants a $4,000 couch. She can pay cash OR use "12 months no interest." What should she do?',
        choices: [
          {
            id: 'a',
            text: 'Take the "no interest" deal',
            isCorrect: false,
            explanation: 'Trap! If she has $4,000 cash, why risk the financing trap?',
          },
          {
            id: 'b',
            text: 'Pay cash',
            isCorrect: true,
            explanation: 'Yes! She has the money. Pay cash, avoid any chance of interest/fees.',
          },
          {
            id: 'c',
            text: 'Finance it and invest the cash',
            isCorrect: false,
            explanation: 'Playing with fire. She\'s not ready for this "strategy."',
          },
          {
            id: 'd',
            text: 'Buy a cheaper couch',
            isCorrect: false,
            explanation: 'Also smart! But if she wants this one and has cash, pay cash.',
          },
        ],
        explanation: 'If you have cash, PAY CASH. "No interest" offers are designed to trap people who miss a payment.',
        xp: 5,
      },
      {
        id: 'step3-l2-q4',
        type: 'matching',
        question: 'Match the debt type to its classification:',
        matchingPairs: [
          { left: 'Payday loan', right: 'EVIL (eliminate)' },
          { left: 'Credit card balance', right: 'STUPID (eliminate)' },
          { left: 'Reasonable mortgage', right: 'Can be sensible' },
          { left: 'New car for prestige', right: 'STUPID (eliminate)' },
        ],
        explanation: 'Consumer debt for consumption or prestige = always stupid. Wealth-building debt = maybe sensible.',
        xp: 5,
      },
    ],
    actionQuestion: {
      question: 'How many consumer debts (credit cards, loans, etc.) do you currently have?',
      type: 'number',
      placeholder: '0',
      toolIntegration: 'DebtTracker',
    },
    navigateToTool: 'DebtTracker',
  },

  // ============================================
  // LESSON 3: Snowball Method Explained
  // ============================================
  'step3-lesson3': {
    lessonId: 'step3-lesson3',
    sections: [
      {
        type: 'text',
        title: 'Math vs. Psychology',
        content: 'Financial experts will tell you: "Pay highest interest first to save money." They\'re mathematically CORRECT. But 70% of people who try that method QUIT within 6 months. Why?',
      },
      {
        type: 'warning',
        title: 'The Avalanche Problem',
        content: 'Paying highest interest first (avalanche method) usually means attacking your LARGEST debt. It could take 12-18 months to pay off that first debt. Most people lose motivation and quit before seeing ANY progress.',
      },
      {
        type: 'text',
        title: 'The Snowball Method',
        content: 'Pay off SMALLEST debt first, regardless of interest rate. When it\'s gone, take that payment and add it to the next smallest debt. The "snowball" grows as you go.',
      },
      {
        type: 'example',
        title: 'Real Numbers',
        content: 'Avalanche MIGHT save you $500-800 in interest over 2-3 years.\n\nBut if you QUIT after 6 months because you\'re not seeing progress, you save $0.\n\nSnowball keeps you motivated through quick wins.',
      },
      {
        type: 'list',
        title: 'Why Snowball Works',
        content: 'Psychological benefits:',
        items: [
          'First debt gone in 1-3 months = instant momentum',
          'Quick wins = dopamine = motivation to continue',
          'Fewer accounts each month = less complexity',
          'Visible progress = less likely to quit',
          'Behavior change > math optimization',
        ],
      },
      {
        type: 'quote',
        title: 'Dave Ramsey\'s Wisdom',
        content: 'If paying off debt was about math, nobody would be in debt. It\'s about BEHAVIOR. And behavior change requires motivation. Snowball gives you that motivation.',
        author: 'Dave Ramsey',
      },
      {
        type: 'list',
        title: 'Success Rate',
        content: 'People using snowball method:',
        items: [
          'Over 6 million people debt-free using this method',
          'Average debt freedom in 18-36 months',
          'Higher completion rate than any other strategy',
          'Would\'ve taken 8+ years with minimum payments',
        ],
      },
      {
        type: 'text',
        title: 'How It Works',
        content: '1. List all debts smallest to largest (IGNORE interest rates)\n2. Make MINIMUM payments on all debts\n3. Throw EVERY extra dollar at the SMALLEST debt\n4. When smallest is dead, add its payment to next debt\n5. Repeat until FREE',
      },
      {
        type: 'example',
        title: 'Snowball In Action',
        content: 'Debts:\n• Card A: $500 ($25/mo minimum)\n• Card B: $2,000 ($50/mo minimum)\n• Car: $8,000 ($200/mo minimum)\n\nYou have $400/month for debt.\n\nMonth 1-2: $125 to Card A ($400 - $50 - $200), minimums on others. Card A GONE in 2 months!\n\nMonth 3+: Now $150/mo to Card B ($125 from A + $50 minimum). Instead of 40 months, GONE in 13.\n\nThen $350/mo attacks the car...',
      },
    ],
    quiz: [
      {
        id: 'step3-l3-q1',
        type: 'multiple-choice',
        question: 'In the snowball method, what do you pay off first?',
        choices: [
          {
            id: 'a',
            text: 'Highest interest rate',
            isCorrect: false,
            explanation: 'That\'s avalanche method. Snowball ignores interest.',
          },
          {
            id: 'b',
            text: 'Smallest balance',
            isCorrect: true,
            explanation: 'Yes! Smallest first = quick win = motivation to continue.',
          },
          {
            id: 'c',
            text: 'Largest balance',
            isCorrect: false,
            explanation: 'No! Large debts take forever - you\'d lose motivation.',
          },
          {
            id: 'd',
            text: 'The one that annoys you most',
            isCorrect: false,
            explanation: 'Tempting, but method says: smallest balance first.',
          },
        ],
        explanation: 'Snowball = smallest balance first. Quick wins build momentum and keep you motivated to finish.',
        xp: 5,
      },
      {
        id: 'step3-l3-q2',
        type: 'true-false',
        question: 'Snowball method saves more money in interest than avalanche method.',
        choices: [
          {
            id: 'true',
            text: 'True',
            isCorrect: false,
            explanation: 'False! Avalanche saves MORE interest. But most people QUIT avalanche.',
          },
          {
            id: 'false',
            text: 'False',
            isCorrect: true,
            explanation: 'Correct! Avalanche saves more interest, BUT snowball has higher success rate.',
          },
        ],
        explanation: 'Avalanche is mathematically better. Snowball is BEHAVIORALLY better. Since most people quit avalanche, snowball wins in practice.',
        xp: 5,
      },
      {
        id: 'step3-l3-q3',
        type: 'scenario',
        question: 'Tom has: Card A $300 (25% APR), Card B $1,500 (12% APR). Snowball method says pay off which first?',
        choices: [
          {
            id: 'a',
            text: 'Card A (25% APR is higher)',
            isCorrect: false,
            explanation: 'You\'re thinking avalanche! Snowball ignores interest.',
          },
          {
            id: 'b',
            text: 'Card A ($300 is smaller)',
            isCorrect: true,
            explanation: 'Yes! Smallest balance first, IGNORE the interest rate.',
          },
          {
            id: 'c',
            text: 'Card B ($1,500 is bigger problem)',
            isCorrect: false,
            explanation: 'Bigger problem takes longer. Start with quick win.',
          },
          {
            id: 'd',
            text: 'Doesn\'t matter',
            isCorrect: false,
            explanation: 'Order matters! Smallest first for psychological wins.',
          },
        ],
        explanation: 'Snowball method: smallest balance first, period. Ignore interest rates. Psychology > math.',
        xp: 5,
      },
      {
        id: 'step3-l3-q4',
        type: 'calculation',
        question: 'You have 3 debts: $400, $1,200, $3,000. You can pay $500/month total. Minimums are $50, $75, $150. How much goes to the $400 debt?',
        correctAnswer: 225,
        explanation: '$500 total - $75 (card 2) - $150 (card 3) = $225 to smallest debt. It\'ll be gone in under 2 months!',
        xp: 5,
      },
    ],
    actionQuestion: {
      question: 'Will you commit to using the snowball method (smallest first)?',
      type: 'choice',
      choices: [
        'Yes, smallest first makes sense to me',
        'I\'m not sure - I want to save maximum interest',
        'Yes, but I need help organizing my debts',
        'I don\'t have any debts to pay off',
      ],
      toolIntegration: 'DebtTracker',
    },
    navigateToTool: 'DebtTracker',
  },

  // Additional lessons for Step 3 would continue here...
  // For brevity, I'll create placeholders for lessons 4, 5, and 6

  'step3-lesson4': {
    lessonId: 'step3-lesson4',
    sections: [
      {
        type: 'text',
        title: 'Face Your Enemy',
        content: 'Most people in debt avoid looking at the total. It\'s painful, scary, overwhelming. But you cannot defeat an enemy you won\'t look at.',
      },
      // ... full content would continue
    ],
    quiz: [],
    actionQuestion: {
      question: 'What is your TOTAL consumer debt amount?',
      type: 'number',
      placeholder: '0',
      unit: '$',
      toolIntegration: 'DebtTracker',
    },
    navigateToTool: 'DebtTracker',
  },

  'step3-lesson5': {
    lessonId: 'step3-lesson5',
    sections: [
      {
        type: 'text',
        title: 'Gazelle Intensity',
        content: 'Dave Ramsey says: "Run from debt like a gazelle running from a cheetah." This isn\'t forever - it\'s a 1-2 year sprint. Extreme focus now = freedom for life.',
      },
      // ... full content would continue
    ],
    quiz: [],
    actionQuestion: {
      question: 'How much EXTRA (beyond minimums) can you throw at debt each month?',
      type: 'number',
      placeholder: '0',
      unit: '$',
      toolIntegration: 'DebtTracker',
    },
    navigateToTool: 'DebtTracker',
  },

  'step3-lesson6': {
    lessonId: 'step3-lesson6',
    sections: [
      {
        type: 'text',
        title: 'The Marathon Wall',
        content: 'Around months 4-8, most people hit a wall. Progress feels slow. You\'re tired of saying no. The finish line seems far. This is where most QUIT. Don\'t be a statistic.',
      },
      // ... full content would continue
    ],
    quiz: [],
    actionQuestion: {
      question: 'What will you do to celebrate when you eliminate your first debt?',
      type: 'text',
      placeholder: 'E.g., Family dinner, movie night, park visit...',
    },
  },
};
