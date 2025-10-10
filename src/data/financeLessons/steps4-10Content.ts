import { LessonContent } from '../../types/financeNew';

/**
 * STEPS 4-10: Remaining Financial Freedom Steps
 * Condensed content - can be expanded later
 */

export const STEPS_4_TO_10_CONTENT: { [key: string]: LessonContent } = {
  // ============================================
  // STEP 4: Build 3-6 Month Emergency Fund
  // ============================================
  'step4-lesson1': {
    lessonId: 'step4-lesson1',
    sections: [
      {
        type: 'text',
        title: 'From Starter to Fully Funded',
        content: 'Congratulations! You\'re debt-free! That $1,000 starter fund protected you during payoff. Now build your REAL safety net: 3-6 months of expenses.',
      },
      {
        type: 'warning',
        title: 'Expenses, Not Income',
        content: 'Common mistake: calculating 3-6 months of INCOME. Wrong! Calculate monthly EXPENSES - what you actually spend to live.',
      },
    ],
    quiz: [
      {
        id: 'step4-l1-q1',
        type: 'true-false',
        question: 'You should save 3-6 months of INCOME for emergency fund.',
        choices: [
          { id: 'true', text: 'True', isCorrect: false, explanation: 'No! Save 3-6 months of EXPENSES, not income.' },
          { id: 'false', text: 'False', isCorrect: true, explanation: 'Correct! Base it on expenses, not income.' },
        ],
        explanation: 'Calculate your monthly essential expenses, then multiply by 3-6 months.',
        xp: 5,
      },
    ],
    actionQuestion: {
      question: 'What are your total monthly essential expenses?',
      type: 'number',
      placeholder: '0',
      unit: '$',
      toolIntegration: 'EmergencyFund',
    },
    navigateToTool: 'EmergencyFund',
  },

  // Additional Step 4 lessons...
  'step4-lesson2': { lessonId: 'step4-lesson2', sections: [], quiz: [], actionQuestion: { question: 'How many months should YOUR fund cover?', type: 'choice', choices: ['3 months', '6 months', '9 months', '12 months'] } },
  'step4-lesson3': { lessonId: 'step4-lesson3', sections: [], quiz: [], actionQuestion: { question: 'Will you commit to using fund ONLY for true emergencies?', type: 'choice', choices: ['Yes, I understand', 'I need clarification'] } },
  'step4-lesson4': { lessonId: 'step4-lesson4', sections: [], quiz: [], actionQuestion: { question: 'Set up automatic transfer to emergency fund?', type: 'choice', choices: ['Yes, done', 'Yes, will do this week', 'Need help'] } },
  'step4-lesson5': { lessonId: 'step4-lesson5', sections: [], quiz: [], actionQuestion: { question: 'Current emergency fund balance?', type: 'number', placeholder: '0', unit: '$' } },

  // ============================================
  // STEP 5: Take Control With Budget
  // ============================================
  'step5-lesson1': {
    lessonId: 'step5-lesson1',
    sections: [
      {
        type: 'quote',
        title: 'Freedom, Not Prison',
        content: 'A budget doesn\'t restrict your freedom - it GIVES you control over your money.',
        author: 'Financial Truth',
      },
      {
        type: 'text',
        title: 'Tell Your Money Where to Go',
        content: 'Budget = giving every dollar a JOB. Without a plan, money disappears. With a plan, YOU decide where it goes.',
      },
    ],
    quiz: [
      {
        id: 'step5-l1-q1',
        type: 'true-false',
        question: 'A budget restricts your freedom and fun.',
        choices: [
          { id: 'true', text: 'True', isCorrect: false, explanation: 'Wrong! Budget gives you CONTROL = freedom.' },
          { id: 'false', text: 'False', isCorrect: true, explanation: 'Correct! Budget = control = freedom to spend on what matters.' },
        ],
        explanation: 'Budgets don\'t restrict - they direct. You choose where money goes instead of wondering where it went.',
        xp: 5,
      },
    ],
    actionQuestion: {
      question: 'Ready to create your first zero-based budget?',
      type: 'choice',
      choices: ['Yes, let\'s do it', 'I need to learn more first', 'I already have a budget'],
      toolIntegration: 'BudgetManager',
    },
    navigateToTool: 'BudgetManager',
  },

  'step5-lesson2': { lessonId: 'step5-lesson2', sections: [], quiz: [], actionQuestion: { question: 'Income - Expenses = ?', type: 'fill-blank', correctAnswer: 0 } },
  'step5-lesson3': { lessonId: 'step5-lesson3', sections: [], quiz: [], actionQuestion: { question: 'Track every expense for 30 days?', type: 'choice', choices: ['Yes, starting today', 'Yes, need help', 'Already tracking'] } },
  'step5-lesson4': { lessonId: 'step5-lesson4', sections: [], quiz: [], actionQuestion: { question: 'What\'s one expense you can cut this month?', type: 'text', placeholder: 'E.g., unused gym membership' } },
  'step5-lesson5': { lessonId: 'step5-lesson5', sections: [], quiz: [], actionQuestion: { question: 'Created your first monthly budget?', type: 'choice', choices: ['Yes, done', 'In progress', 'Need help'] } },

  // ============================================
  // STEP 6: Increase Your Income
  // ============================================
  'step6-lesson1': {
    lessonId: 'step6-lesson1',
    sections: [
      {
        type: 'text',
        title: 'Your Holy Obligation',
        content: 'Cutting expenses is defense. Increasing income is OFFENSE. You have a holy obligation to systematically increase your earnings.',
      },
      {
        type: 'example',
        title: 'Lifetime Earnings',
        content: 'Through your career, millions will flow through your hands. Don\'t leave that money on the table. Fight for every raise, every opportunity, every increase.',
      },
    ],
    quiz: [
      {
        id: 'step6-l1-q1',
        type: 'multiple-choice',
        question: 'What matters MORE for building wealth?',
        choices: [
          { id: 'a', text: 'Cutting expenses', isCorrect: false, explanation: 'Important, but income has no ceiling!' },
          { id: 'b', text: 'Increasing income', isCorrect: true, explanation: 'Yes! Expenses have a floor, income has NO ceiling.' },
          { id: 'c', text: 'Both equally', isCorrect: false, explanation: 'Income potential is unlimited!' },
        ],
        explanation: 'Control expenses (defense) AND increase income (offense). But income growth has unlimited potential.',
        xp: 5,
      },
    ],
    actionQuestion: {
      question: 'When did you last ask for a raise?',
      type: 'choice',
      choices: ['Within last year', '1-2 years ago', 'More than 2 years', 'Never asked'],
    },
  },

  'step6-lesson2': { lessonId: 'step6-lesson2', sections: [], quiz: [], actionQuestion: { question: 'Will you ask for raise in next 3 months?', type: 'choice', choices: ['Yes, I will', 'Maybe', 'Not applicable'] } },
  'step6-lesson3': { lessonId: 'step6-lesson3', sections: [], quiz: [], actionQuestion: { question: 'What side hustle could you start?', type: 'text', placeholder: 'E.g., freelance writing, tutoring...' } },
  'step6-lesson4': { lessonId: 'step6-lesson4', sections: [], quiz: [], actionQuestion: { question: 'Commit to saving 50% of next raise?', type: 'choice', choices: ['Yes, 50% to savings', 'Will try', 'Need to think about it'] } },

  // ============================================
  // STEP 7: Align Your Partner
  // ============================================
  'step7-lesson1': {
    lessonId: 'step7-lesson1',
    sections: [
      {
        type: 'warning',
        title: 'Money Kills Relationships',
        content: 'Financial disagreements are a leading cause of divorce. One person saves, one spends = constant conflict. You MUST get aligned.',
      },
    ],
    quiz: [
      {
        id: 'step7-l1-q1',
        type: 'true-false',
        question: 'Money fights are a leading cause of relationship problems.',
        choices: [
          { id: 'true', text: 'True', isCorrect: true, explanation: 'Yes! Financial stress destroys relationships.' },
          { id: 'false', text: 'False', isCorrect: false, explanation: 'Actually true - money IS a major relationship issue.' },
        ],
        explanation: 'Financial alignment is critical. One saves + one spends = disaster.',
        xp: 5,
      },
    ],
    actionQuestion: {
      question: 'Are you and partner aligned on money goals?',
      type: 'choice',
      choices: ['Yes, fully aligned', 'Somewhat aligned', 'Not aligned', 'No partner/Not applicable'],
    },
  },

  'step7-lesson2': { lessonId: 'step7-lesson2', sections: [], quiz: [], actionQuestion: { question: 'Set joint financial goals with partner?', type: 'choice', choices: ['Yes, done', 'Will do soon', 'N/A'] } },
  'step7-lesson3': { lessonId: 'step7-lesson3', sections: [], quiz: [], actionQuestion: { question: 'Schedule monthly budget meeting?', type: 'choice', choices: ['Yes, scheduled', 'Will schedule', 'N/A'] } },
  'step7-lesson4': { lessonId: 'step7-lesson4', sections: [], quiz: [], actionQuestion: { question: 'Created Red Folder with account info?', type: 'choice', choices: ['Yes', 'In progress', 'Need to do'] } },

  // ============================================
  // STEP 8: Smart Home Ownership
  // ============================================
  'step8-lesson1': {
    lessonId: 'step8-lesson1',
    sections: [
      {
        type: 'text',
        title: 'The 20/20/30 Rule',
        content: 'Smart mortgage means: 20% down payment, 20 years maximum, 30% of net income maximum payment. This keeps you from being house poor.',
      },
    ],
    quiz: [
      {
        id: 'step8-l1-q1',
        type: 'fill-blank',
        question: 'The 20/20/30 rule: __% down, __ years max, __% of income max payment',
        correctAnswer: '20, 20, 30',
        explanation: '20% down, 20 years max, 30% of net income max payment = smart mortgage.',
        xp: 5,
      },
    ],
    actionQuestion: {
      question: 'Current housing situation?',
      type: 'choice',
      choices: ['Own with mortgage', 'Own outright', 'Rent', 'Living with family'],
    },
  },

  'step8-lesson2': { lessonId: 'step8-lesson2', sections: [], quiz: [], actionQuestion: { question: 'What can you actually afford monthly?', type: 'number', placeholder: '0', unit: '$' } },
  'step8-lesson3': { lessonId: 'step8-lesson3', sections: [], quiz: [], actionQuestion: { question: 'Is renting or buying better for you right now?', type: 'choice', choices: ['Buying makes sense', 'Renting makes sense', 'Not sure'] } },
  'step8-lesson4': { lessonId: 'step8-lesson4', sections: [], quiz: [], actionQuestion: { question: 'If you have mortgage, pay extra monthly?', type: 'choice', choices: ['Yes, already doing', 'Will start', 'N/A'] } },

  // ============================================
  // STEP 9: Protect Your Wealth
  // ============================================
  'step9-lesson1': {
    lessonId: 'step9-lesson1',
    sections: [
      {
        type: 'list',
        title: 'The Essential Three',
        content: 'Non-negotiable insurance:',
        items: [
          'Vehicle liability (legal requirement)',
          'Home/renter insurance (disasters)',
          'Travel health insurance (medical abroad)',
        ],
      },
    ],
    quiz: [
      {
        id: 'step9-l1-q1',
        type: 'multiple-choice',
        question: 'Which insurance is NON-NEGOTIABLE?',
        choices: [
          { id: 'a', text: 'Extended warranty on electronics', isCorrect: false },
          { id: 'b', text: 'Vehicle liability insurance', isCorrect: true },
          { id: 'c', text: 'Credit card insurance', isCorrect: false },
        ],
        explanation: 'Vehicle liability, home, and travel health are essential. Everything else is optional.',
        xp: 5,
      },
    ],
    actionQuestion: {
      question: 'Do you have essential insurance coverage?',
      type: 'choice',
      choices: ['Yes, all covered', 'Some coverage', 'Need to get insurance'],
    },
  },

  'step9-lesson2': { lessonId: 'step9-lesson2', sections: [], quiz: [], actionQuestion: { question: 'Do you need life insurance?', type: 'choice', choices: ['Yes, have dependents', 'No, no dependents', 'Not sure'] } },
  'step9-lesson3': { lessonId: 'step9-lesson3', sections: [], quiz: [], actionQuestion: { question: 'Work with fee-only advisor?', type: 'choice', choices: ['Yes', 'No, commission-based', 'No advisor'] } },
  'step9-lesson4': { lessonId: 'step9-lesson4', sections: [], quiz: [], actionQuestion: { question: 'Rate your health habits (1-10)', type: 'number', placeholder: '5' } },

  // ============================================
  // STEP 10: Invest & Build Wealth
  // ============================================
  'step10-lesson1': {
    lessonId: 'step10-lesson1',
    sections: [
      {
        type: 'text',
        title: 'Why Invest?',
        content: 'Inflation eats 3-5% of cash annually. Money sitting idle LOSES value. Investing makes money work FOR you, not against you.',
      },
      {
        type: 'quote',
        title: 'Einstein\'s Wisdom',
        content: 'Compound interest is the eighth wonder of the world. He who understands it, earns it. He who doesn\'t, pays it.',
        author: 'Albert Einstein',
      },
    ],
    quiz: [
      {
        id: 'step10-l1-q1',
        type: 'true-false',
        question: 'Cash in savings loses value over time due to inflation.',
        choices: [
          { id: 'true', text: 'True', isCorrect: true, explanation: 'Yes! Inflation eats 3-5% yearly. Money must grow to keep up.' },
          { id: 'false', text: 'False', isCorrect: false, explanation: 'Actually true! Inflation reduces purchasing power.' },
        ],
        explanation: 'Cash is "safe" but loses value to inflation. Investing is necessary to build wealth.',
        xp: 5,
      },
    ],
    actionQuestion: {
      question: 'Are you currently investing for retirement?',
      type: 'choice',
      choices: ['Yes, regularly', 'Yes, but irregularly', 'Not yet'],
    },
  },

  'step10-lesson2': { lessonId: 'step10-lesson2', sections: [], quiz: [], actionQuestion: { question: 'Can you invest 15% of income to retirement?', type: 'choice', choices: ['Yes', 'Not yet', 'Need to calculate'] } },
  'step10-lesson3': { lessonId: 'step10-lesson3', sections: [], quiz: [], actionQuestion: { question: 'Do you understand index funds/ETFs?', type: 'choice', choices: ['Yes', 'Somewhat', 'No'] } },
  'step10-lesson4': { lessonId: 'step10-lesson4', sections: [], quiz: [], actionQuestion: { question: 'Investment strategy based on goals?', type: 'choice', choices: ['Yes, have strategy', 'Working on it', 'Need help'] } },
  'step10-lesson5': { lessonId: 'step10-lesson5', sections: [], quiz: [], actionQuestion: { question: 'Plan to give back once wealthy?', type: 'choice', choices: ['Yes, definitely', 'Probably', 'Haven\'t thought about it'] } },
  'step10-lesson6': {
    lessonId: 'step10-lesson6',
    sections: [
      {
        type: 'text',
        title: '🎉 CONGRATULATIONS! 🎉',
        content: 'You completed all 10 steps! You\'re now in the TOP 5% financially. You have the knowledge and tools to build lasting wealth.',
      },
      {
        type: 'quote',
        title: 'Your New Reality',
        content: 'Peace. Security. Options. Freedom. That\'s your new normal. No panic, no paycheck-to-paycheck, no debt. Just freedom.',
        author: 'Your Achievement',
      },
    ],
    quiz: [
      {
        id: 'step10-l6-q1',
        type: 'reflection',
        question: 'What will you do with your financial freedom? Write your vision.',
        explanation: 'You\'ve earned this freedom. Now live it, enjoy it, and help others find it too.',
        xp: 50,
      },
    ],
    actionQuestion: {
      question: 'Will you help others learn these principles?',
      type: 'choice',
      choices: ['Yes, I\'ll share what I learned', 'Maybe', 'I\'ll focus on myself first'],
    },
  },
};
