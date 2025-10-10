import { LessonContent } from '../../types/financeNew';

/**
 * STEP 1: Know Your Starting Point
 * Lesson content with sections, quizzes, and action questions
 */

export const STEP1_LESSON_CONTENTS: { [key: string]: LessonContent } = {
  // ============================================
  // LESSON 1: Calculate Your Net Worth
  // ============================================
  'step1-lesson1': {
    lessonId: 'step1-lesson1',
    sections: [
      {
        type: 'text',
        title: 'Your Starting Point',
        content: 'You need to know where you are now. Just like using a map.',
      },
      {
        type: 'text',
        title: 'Simple Math',
        content: 'What you own - What you owe = Your net worth\n\nThat\'s it!',
      },
      {
        type: 'example',
        title: 'Example',
        content: 'Sarah:\n• Has $5,000 in bank\n• Has car worth $15,000\n• Owes $8,000 car loan\n• Owes $2,000 credit card\n\n$20,000 - $10,000 = $10,000',
      },
      {
        type: 'list',
        title: 'What You Own',
        content: 'Add up:',
        items: [
          'Money in bank',
          'Car',
          'House',
        ],
      },
      {
        type: 'list',
        title: 'What You Owe',
        content: 'Add up:',
        items: [
          'Credit cards',
          'Loans',
          'Money borrowed',
        ],
      },
      {
        type: 'tip',
        title: 'Why?',
        content: 'You need to know this number to get better.',
      },
    ],
    quiz: [
      {
        id: 'step1-l1-q1',
        type: 'multiple-choice',
        question: 'Net worth is:',
        choices: [
          {
            id: 'a',
            text: 'Income - Expenses',
            isCorrect: false,
            explanation: 'No.',
          },
          {
            id: 'b',
            text: 'What you own - What you owe',
            isCorrect: true,
            explanation: 'Yes!',
          },
          {
            id: 'c',
            text: 'Salary + Savings',
            isCorrect: false,
            explanation: 'No.',
          },
        ],
        explanation: 'What you own - What you owe',
        xp: 5,
      },
      {
        id: 'step1-l1-q2',
        type: 'true-false',
        question: 'Is salary net worth?',
        choices: [
          {
            id: 'true',
            text: 'True',
            isCorrect: false,
            explanation: 'No, salary is income.',
          },
          {
            id: 'false',
            text: 'False',
            isCorrect: true,
            explanation: 'Correct!',
          },
        ],
        explanation: 'Salary is income, not net worth.',
        xp: 5,
      },
      {
        id: 'step1-l1-q3',
        type: 'scenario',
        question: 'Mike has $3,000 cash, $12,000 car, and owes $8,000. His net worth?',
        choices: [
          {
            id: 'a',
            text: '$3,000',
            isCorrect: false,
            explanation: 'Add car, subtract debt.',
          },
          {
            id: 'b',
            text: '$7,000',
            isCorrect: true,
            explanation: 'Yes! $3k + $12k - $8k = $7k',
          },
          {
            id: 'c',
            text: '$15,000',
            isCorrect: false,
            explanation: 'You forgot the debt.',
          },
          {
            id: 'd',
            text: '$23,000',
            isCorrect: false,
            explanation: 'You added the loan instead of subtracting it!',
          },
        ],
        explanation: 'Assets ($3,000 cash + $12,000 car) minus Liabilities ($8,000 loan) = $7,000 net worth.',
        xp: 5,
      },
      {
        id: 'step1-l1-q4',
        type: 'multiple-choice',
        question: 'Why does debt REDUCE your net worth?',
        choices: [
          {
            id: 'a',
            text: 'Because banks are evil',
            isCorrect: false,
            explanation: 'Not about good/evil - it\'s simple math.',
          },
          {
            id: 'b',
            text: 'Because you owe that money to someone else',
            isCorrect: true,
            explanation: 'Exactly! Debt is money you OWE, not money you OWN.',
          },
          {
            id: 'c',
            text: 'It doesn\'t - debt is neutral',
            isCorrect: false,
            explanation: 'Debt absolutely reduces net worth because it\'s a liability.',
          },
          {
            id: 'd',
            text: 'Only "bad" debt reduces net worth',
            isCorrect: false,
            explanation: 'ALL debt reduces net worth, even "good" debt like mortgages.',
          },
        ],
        explanation: 'Debt is a liability - money you OWE to others. Liabilities always reduce your net worth.',
        xp: 5,
      },
    ],
    actionQuestion: {
      question: 'Is your net worth positive, negative, or zero?',
      type: 'choice',
      choices: [
        'Positive (I own more than I owe)',
        'Negative (I owe more than I own)',
        'Zero (Equal)',
        'I don\'t know yet',
      ],
    },
  },

  // ============================================
  // LESSON 2: Track Your Money Flow
  // ============================================
  'step1-lesson2': {
    lessonId: 'step1-lesson2',
    sections: [
      {
        type: 'text',
        title: 'The Money Flow Problem',
        content: 'Most people get paid and the money immediately goes to others: bills, stores, restaurants. They pay everyone except themselves.',
      },
      {
        type: 'warning',
        title: 'Are You Like This?',
        content: 'Money comes in → Bills get paid → Money gone → Repeat. Sound familiar? The money just flows through you.',
      },
      {
        type: 'text',
        title: 'Where Does Money Come From?',
        content: 'Track your income:\n• Your job\n• Side work\n• Other money\n\nFor most people, it\'s one job. That\'s fine! Just know the number.',
      },
      {
        type: 'text',
        title: 'Where Does It Go?',
        content: 'This is harder. Most people earn $3,000, spend $3,000, and don\'t know what they bought.',
      },
      {
        type: 'list',
        title: 'Where Money Leaks',
        content: 'Money goes here:',
        items: [
          'Old subscriptions ($10-50/month)',
          'Daily coffee ($100-150/month)',
          'Eating out ($200-400/month)',
          'Random shopping ($100-300/month)',
          'Bank fees ($20-100/month)',
        ],
      },
      {
        type: 'example',
        title: 'Real Example',
        content: 'Sarah tracked spending for 30 days. She found $437/month leaking:\n• 3 unused services: $35\n• Daily coffee: $72\n• Lunches out: $250\n• Unused gym: $80\n\nShe fixed it. That\'s $5,244 per year!',
      },
      {
        type: 'tip',
        title: '30-Day Challenge',
        content: 'Track every expense for 30 days. Every coffee, every purchase. Write it down. You\'ll be shocked.',
      },
      {
        type: 'quote',
        title: 'Remember',
        content: 'You can\'t fix a leak you don\'t know exists.',
        author: 'Money Truth',
      },
    ],
    quiz: [
      {
        id: 'step1-l2-q1',
        type: 'true-false',
        question: 'Does a "Money Transmitter" save money?',
        choices: [
          {
            id: 'true',
            text: 'True',
            isCorrect: false,
            explanation: 'No! They spend it all and save nothing.',
          },
          {
            id: 'false',
            text: 'False',
            isCorrect: true,
            explanation: 'Right! They earn money and spend it all.',
          },
        ],
        explanation: 'Money Transmitters spend everything they earn. They pay everyone else but not themselves.',
        xp: 5,
      },
      {
        id: 'step1-l2-q2',
        type: 'multiple-choice',
        question: 'Why track your spending for 30 days?',
        choices: [
          {
            id: 'a',
            text: 'To feel bad',
            isCorrect: false,
            explanation: 'No! It\'s about learning, not guilt.',
          },
          {
            id: 'b',
            text: 'To find money leaks',
            isCorrect: true,
            explanation: 'Yes! Most people find $200-500 leaking each month.',
          },
          {
            id: 'c',
            text: 'To show friends',
            isCorrect: false,
            explanation: 'This is for YOU, not others.',
          },
          {
            id: 'd',
            text: 'Because it\'s fun',
            isCorrect: false,
            explanation: 'It\'s not fun, but it\'s powerful.',
          },
        ],
        explanation: 'Tracking shows where money goes. Most people find $200-500 they can save.',
        xp: 5,
      },
      {
        id: 'step1-l2-q3',
        type: 'scenario',
        question: 'Tom earns $3,500/month. He has no idea where it goes, but he\'s always broke by month-end. What should he do FIRST?',
        choices: [
          {
            id: 'a',
            text: 'Get a second job',
            isCorrect: false,
            explanation: 'Before earning more, find out where current income goes.',
          },
          {
            id: 'b',
            text: 'Track every expense for 30 days',
            isCorrect: true,
            explanation: 'Yes! You can\'t fix leaks you haven\'t found. Awareness first.',
          },
          {
            id: 'c',
            text: 'Cut all fun spending immediately',
            isCorrect: false,
            explanation: 'Extreme cuts without knowing WHERE money goes usually fails.',
          },
          {
            id: 'd',
            text: 'Declare bankruptcy',
            isCorrect: false,
            explanation: 'Way too extreme! He probably just has spending leaks.',
          },
        ],
        explanation: 'Always start with AWARENESS. Track spending to identify where money is actually going before making changes.',
        xp: 5,
      },
      {
        id: 'step1-l2-q4',
        type: 'matching',
        question: 'Match the "money leak" to its typical monthly cost:',
        matchingPairs: [
          { left: 'Unused subscriptions', right: '$10-50' },
          { left: 'Daily coffee shop', right: '$100-150' },
          { left: 'Eating out vs cooking', right: '$200-400' },
          { left: 'Impulse purchases', right: '$100-300' },
        ],
        explanation: 'These are REAL average costs people discover when tracking spending. Small leaks add up to big money!',
        xp: 5,
      },
    ],
    actionQuestion: {
      question: 'Will you commit to tracking every expense for the next 30 days?',
      type: 'choice',
      choices: [
        'Yes, I\'ll start today',
        'Yes, but I need help setting up tracking',
        'Maybe, I want to learn more first',
        'No, I already track my spending',
      ],
      toolIntegration: 'ExpenseLogger',
    },
    navigateToTool: 'ExpenseLogger',
  },

  // ============================================
  // LESSON 3: The Brutal Truth Exercise
  // ============================================
  'step1-lesson3': {
    lessonId: 'step1-lesson3',
    sections: [
      {
        type: 'text',
        title: 'Face It',
        content: 'Most people avoid looking at their money. It\'s scary. But you can\'t fix what you don\'t see.',
      },
      {
        type: 'warning',
        title: 'Don\'t Hide',
        content: 'Not knowing keeps you stuck. The truth is always better than hiding.',
      },
      {
        type: 'quote',
        title: 'What People Say',
        content: 'It\'s bad, but not as bad as I thought.',
        author: 'Common reaction after facing finances',
      },
      {
        type: 'list',
        title: 'The Brutal Truth Inventory',
        content: 'Write down EVERYTHING (no judgment, just facts):',
        items: [
          'Every bank account and current balance',
          'Every credit card and current balance',
          'Every loan and remaining amount',
          'Monthly income (after taxes)',
          'Monthly essential expenses (estimate)',
          'Any investments or retirement accounts',
          'Value of car, home, other major assets',
        ],
      },
      {
        type: 'tip',
        title: 'No Judgment Zone',
        content: 'This exercise isn\'t about feeling bad. It\'s about getting CLARITY. You\'re taking the first step toward fixing things. That takes courage.',
      },
      {
        type: 'text',
        title: 'The Red Folder Concept',
        content: 'In every home, there should be a "Red Folder" - a place where all important financial documents live. If something happened to you tomorrow, could your family find:\n• Bank account info?\n• Insurance policies?\n• Loan documents?\n• Passwords and important contacts?',
      },
      {
        type: 'warning',
        title: 'The 11 Billion Problem',
        content: 'There\'s approximately $11 BILLION sitting in forgotten bank accounts. People die, and heirs have no idea these accounts exist. Don\'t let YOUR money disappear.',
      },
      {
        type: 'list',
        title: 'Start Your Red Folder',
        content: 'Create a physical or digital folder with:',
        items: [
          'List of ALL financial institutions you use',
          'Account numbers (keep secure!)',
          'Emergency contacts',
          'Insurance policies',
          'Important legal documents',
          'Instructions for loved ones',
        ],
      },
    ],
    quiz: [
      {
        id: 'step1-l3-q1',
        type: 'true-false',
        question: 'Avoiding your financial situation makes it less scary.',
        choices: [
          {
            id: 'true',
            text: 'True',
            isCorrect: false,
            explanation: 'Opposite! Avoidance makes your brain imagine it\'s WORSE than reality.',
          },
          {
            id: 'false',
            text: 'False',
            isCorrect: true,
            explanation: 'Correct! Fear of unknown is worse than reality. Facing it brings relief.',
          },
        ],
        explanation: 'The unknown creates paralyzing anxiety. Almost everyone says "it\'s not as bad as I thought" after facing their finances.',
        xp: 5,
      },
      {
        id: 'step1-l3-q2',
        type: 'multiple-choice',
        question: 'What\'s the main purpose of the "Red Folder"?',
        choices: [
          {
            id: 'a',
            text: 'To hide money from the government',
            isCorrect: false,
            explanation: 'No! It\'s about organization and protecting your family.',
          },
          {
            id: 'b',
            text: 'So family can find your financial info if needed',
            isCorrect: true,
            explanation: 'Yes! If something happens to you, loved ones need to know where everything is.',
          },
          {
            id: 'c',
            text: 'To make you feel organized',
            isCorrect: false,
            explanation: 'That\'s a nice benefit, but the MAIN purpose is protecting your family.',
          },
          {
            id: 'd',
            text: 'To store actual cash',
            isCorrect: false,
            explanation: 'It\'s for INFORMATION, not physical cash.',
          },
        ],
        explanation: 'The Red Folder ensures your family can access your financial info if something happens to you. $11 billion sits in forgotten accounts!',
        xp: 5,
      },
      {
        id: 'step1-l3-q3',
        type: 'scenario',
        question: 'Maria is terrified to check her credit card balances. She thinks she might owe $8,000. What should she do?',
        choices: [
          {
            id: 'a',
            text: 'Keep avoiding it - ignorance is bliss',
            isCorrect: false,
            explanation: 'Avoidance keeps her paralyzed with fear.',
          },
          {
            id: 'b',
            text: 'Look now - the truth is better than fear',
            isCorrect: true,
            explanation: 'Yes! She might owe less (or more), but knowing is the first step to fixing it.',
          },
          {
            id: 'c',
            text: 'Wait until she has money to pay it',
            isCorrect: false,
            explanation: 'She needs to know the number NOW to make a payoff plan.',
          },
          {
            id: 'd',
            text: 'Ask someone else to check for her',
            isCorrect: false,
            explanation: 'She needs to face it herself - it\'s HER financial life.',
          },
        ],
        explanation: 'Fear of the unknown is worse than reality. Almost everyone feels RELIEF after facing their numbers, even if they\'re bad.',
        xp: 5,
      },
      {
        id: 'step1-l3-q4',
        type: 'fill-blank',
        question: 'Approximately how many BILLION dollars sit in forgotten bank accounts? (number only)',
        correctAnswer: 11,
        explanation: '$11 billion sits unclaimed because people didn\'t document their accounts and heirs don\'t know they exist.',
        xp: 5,
      },
    ],
    actionQuestion: {
      question: 'Have you created a list of all your financial accounts?',
      type: 'choice',
      choices: [
        'Yes, I have a complete list',
        'Partially - I know some but not all',
        'No, but I\'ll start now',
        'No, I don\'t have many accounts',
      ],
    },
  },

  // ============================================
  // LESSON 4: Set Your 1-Year & 5-Year Goals
  // ============================================
  'step1-lesson4': {
    lessonId: 'step1-lesson4',
    sections: [
      {
        type: 'quote',
        title: 'The Harsh Truth',
        content: 'A goal not written down is just a wish.',
        author: 'Financial Wisdom',
      },
      {
        type: 'text',
        title: 'Why Write Goals?',
        content: 'Keeping goals "in your head" doesn\'t work. Your brain is brilliant at many things, but goal maintenance isn\'t one of them. Written goals are 42% more likely to be achieved than unwritten ones.',
      },
      {
        type: 'text',
        title: 'The Two-Goal System',
        content: 'You need exactly TWO net worth goals:\n\n1. Where you want to be in 1 YEAR\n2. Where you want to be in 5 YEARS\n\nWhy these two timeframes? Read on...',
      },
      {
        type: 'warning',
        title: 'The Timing Paradox',
        content: 'Most people OVERESTIMATE what they can do in 1 year (and get discouraged). But they MASSIVELY UNDERESTIMATE what they can do in 5 years (and aim too low).',
      },
      {
        type: 'text',
        title: 'Your 1-Year Goal',
        content: 'This should be REALISTIC but CHALLENGING. It helps you focus on solving IMMEDIATE problems:\n• Eliminate emergency debts\n• Build starter emergency fund\n• Start tracking expenses\n• Maybe kill smallest debt\n\nDon\'t expect miracles in year 1. Expect progress.',
      },
      {
        type: 'example',
        title: '1-Year Goal Example',
        content: 'Starting net worth: -$5,000 (more debt than assets)\n1-year goal: $3,000\n\nThis means: eliminate $5,000 debt + save $3,000 = $8,000 positive change. Aggressive but doable with focus!',
      },
      {
        type: 'text',
        title: 'Your 5-Year Goal',
        content: 'This should make you slightly UNCOMFORTABLE - like "wow, is that even possible?" This goal lets you dream:\n• What if you were debt-free?\n• What if you had 6 months expenses saved?\n• What if you started investing?\n\nDon\'t limit yourself. Most people achieve MORE than they think possible in 5 years.',
      },
      {
        type: 'example',
        title: '5-Year Goal Example',
        content: 'Starting net worth: -$5,000\n5-year goal: $75,000\n\nSounds crazy? People do this by:\n• Eliminating $30k in debt\n• Saving emergency fund ($20k)\n• Starting to invest ($20k)\n• Increasing income ($35k more over 5 years)\n\nIt happens more often than you think.',
      },
      {
        type: 'tip',
        title: 'Make It Specific',
        content: 'Not: "I want to be better with money"\nYes: "Net worth of $15,000 by December 31, 2025"\n\nSpecific numbers + specific dates = real goals.',
      },
      {
        type: 'list',
        title: 'After Writing Goals',
        content: 'Now do this:',
        items: [
          'Put goals somewhere you\'ll SEE them daily',
          'Phone wallpaper, bathroom mirror, desk',
          'Review them monthly - am I on track?',
          'Adjust if needed (life happens)',
          'Celebrate milestones along the way',
        ],
      },
    ],
    quiz: [
      {
        id: 'step1-l4-q1',
        type: 'true-false',
        question: 'People tend to OVERESTIMATE what they can do in 1 year.',
        choices: [
          {
            id: 'true',
            text: 'True',
            isCorrect: true,
            explanation: 'Yes! People expect too much too fast, then get discouraged.',
          },
          {
            id: 'false',
            text: 'False',
            isCorrect: false,
            explanation: 'Actually true - people often aim too high for year 1.',
          },
        ],
        explanation: 'Most people overestimate 1 year (get discouraged) but UNDERESTIMATE 5 years (aim too low). Set realistic 1-year, ambitious 5-year goals.',
        xp: 5,
      },
      {
        id: 'step1-l4-q2',
        type: 'multiple-choice',
        question: 'What percentage more likely are you to achieve a goal if it\'s WRITTEN down?',
        choices: [
          {
            id: 'a',
            text: '10% more likely',
            isCorrect: false,
            explanation: 'Even better than that!',
          },
          {
            id: 'b',
            text: '25% more likely',
            isCorrect: false,
            explanation: 'Still higher!',
          },
          {
            id: 'c',
            text: '42% more likely',
            isCorrect: true,
            explanation: 'Correct! Writing goals down nearly DOUBLES your success rate.',
          },
          {
            id: 'd',
            text: 'No difference',
            isCorrect: false,
            explanation: 'Big difference! Written goals are 42% more likely to be achieved.',
          },
        ],
        explanation: 'Studies show written goals are 42% more likely to be achieved. Your brain takes written goals more seriously.',
        xp: 5,
      },
      {
        id: 'step1-l4-q3',
        type: 'scenario',
        question: 'James has -$12,000 net worth (debt). Which is the BEST 5-year goal for him?',
        choices: [
          {
            id: 'a',
            text: '$0 (debt-free)',
            isCorrect: false,
            explanation: 'Too conservative! He can do MORE in 5 years.',
          },
          {
            id: 'b',
            text: '-$8,000 (less debt)',
            isCorrect: false,
            explanation: 'Way too low! This is a 1-year goal, not 5-year.',
          },
          {
            id: 'c',
            text: '$50,000 positive',
            isCorrect: true,
            explanation: 'Yes! Ambitious but achievable: eliminate debt + emergency fund + start investing.',
          },
          {
            id: 'd',
            text: '$1,000,000',
            isCorrect: false,
            explanation: 'Unrealistic jump from -$12k. Dream big, but stay grounded.',
          },
        ],
        explanation: '5-year goals should be ambitious but achievable. $50k means eliminating debt + building savings/investments - totally doable!',
        xp: 5,
      },
      {
        id: 'step1-l4-q4',
        type: 'multiple-choice',
        question: 'Where should you PUT your written goals?',
        choices: [
          {
            id: 'a',
            text: 'In a drawer so they\'re safe',
            isCorrect: false,
            explanation: 'Hidden goals = forgotten goals.',
          },
          {
            id: 'b',
            text: 'Somewhere you\'ll SEE them daily',
            isCorrect: true,
            explanation: 'Yes! Phone wallpaper, mirror, desk - constant reminders keep you on track.',
          },
          {
            id: 'c',
            text: 'Tell your goals to everyone',
            isCorrect: false,
            explanation: 'Actually, research shows telling everyone can make you LESS likely to achieve (false sense of accomplishment).',
          },
          {
            id: 'd',
            text: 'On social media',
            isCorrect: false,
            explanation: 'Too public. Keep them where YOU see them daily.',
          },
        ],
        explanation: 'Put goals where YOU see them every single day. Constant visual reminders keep them top-of-mind.',
        xp: 5,
      },
    ],
    actionQuestion: {
      question: 'Do you have a financial goal for next year?',
      type: 'choice',
      choices: [
        'Yes, I have a clear goal',
        'I have an idea but not clear',
        'Not yet, but I will create one',
        'I need help setting goals',
      ],
    },
  },
};
