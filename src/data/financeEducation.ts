/**
 * Educational content for all finance lessons
 */

export const FINANCE_EDUCATION = {
  // Step 1, Lesson 1: Net Worth
  'step1-lesson1': {
    title: 'What is Net Worth?',
    sections: [
      {
        type: 'header' as const,
        icon: 'stats-chart',
        title: 'Your Financial Scoreboard',
        content: 'Net worth is the single most important number in your financial life. It\'s simple math that tells you exactly where you stand.',
      },
      {
        type: 'text' as const,
        title: 'The Formula',
        content: 'Net Worth = Everything You OWN - Everything You OWE\n\nThat\'s it. Assets minus liabilities. Simple, but powerful.',
      },
      {
        type: 'list' as const,
        title: 'What You Own (Assets):',
        items: [
          'Cash in savings and checking accounts',
          'Investment accounts (stocks, bonds, mutual funds)',
          'Retirement accounts (401k, IRA, pension)',
          'Your home value (if you own)',
          'Vehicles',
          'Other valuable possessions',
        ],
      },
      {
        type: 'list' as const,
        title: 'What You Owe (Liabilities):',
        items: [
          'Mortgage balance',
          'Car loans',
          'Student loans',
          'Credit card debt',
          'Personal loans',
          'Any other debts',
        ],
      },
      {
        type: 'example' as const,
        title: 'Real Example',
        content: 'Sarah has $5,000 in savings, a $200,000 house, and a car worth $15,000. Total assets: $220,000.\n\nShe owes $150,000 on her mortgage, $10,000 on her car, and $5,000 in credit cards. Total liabilities: $165,000.\n\nHer net worth: $220,000 - $165,000 = $55,000',
      },
      {
        type: 'tip' as const,
        title: 'Why Track It?',
        content: 'Your net worth shows if you\'re moving forward or backward financially. Track it monthly and watch it grow. It\'s more important than your income!',
      },
      {
        type: 'warning' as const,
        title: 'Negative is Normal (At First)',
        content: 'Many people start with negative net worth, especially with student loans or new mortgages. Don\'t panic - this is your STARTING point, not your destiny.',
      },
    ],
  },

  // Step 1, Lesson 2: Income Sources
  'step1-lesson2': {
    title: 'Track Your Money Flow',
    sections: [
      {
        type: 'header' as const,
        icon: 'cash',
        title: 'Know Where Money Comes From',
        content: 'You can\'t manage what you don\'t measure. Every dollar coming in needs to be tracked.',
      },
      {
        type: 'text' as const,
        title: 'Why Track Income?',
        content: 'Most people only think about their main job salary. But successful people track ALL income sources - and actively work to add more.',
      },
      {
        type: 'list' as const,
        title: 'Common Income Sources:',
        items: [
          'Salary/Wages - Your main job',
          'Business Income - If you own a business',
          'Freelance Work - Side projects and gigs',
          'Rental Income - From properties you rent out',
          'Investment Income - Dividends, interest, capital gains',
          'Other - Anything else that brings money in',
        ],
      },
      {
        type: 'tip' as const,
        title: 'The Power of Multiple Streams',
        content: 'Millionaires average 7 income streams. You don\'t need that many, but having 2-3 gives you security and accelerates wealth building.',
      },
      {
        type: 'example' as const,
        title: 'Building Multiple Streams',
        content: 'John makes $4,000/month from his job. He starts freelancing 5 hours/week for $500/month, and rents out his spare room for $600/month.\n\nTotal monthly income: $5,100 (27.5% increase!) - and that extra $1,100 goes straight to debt or savings.',
      },
    ],
  },

  // Step 1, Lesson 4: Financial Goals
  'step1-lesson4': {
    title: 'Set Your Financial Goals',
    sections: [
      {
        type: 'header' as const,
        icon: 'flag',
        title: '"A Goal Not Written Down is Just a Wish"',
        content: 'Studies show people who write down goals are 42% more likely to achieve them. Let\'s make your wishes into plans.',
      },
      {
        type: 'text' as const,
        title: 'The 1-Year & 5-Year Framework',
        content: 'You need both short-term wins and long-term vision. 1-year goals keep you motivated. 5-year goals give you direction.',
      },
      {
        type: 'list' as const,
        title: '1-Year Goal Examples:',
        items: [
          'Save $1,000 emergency fund',
          'Pay off $5,000 credit card debt',
          'Increase income by $500/month',
          'Build 3 months of expenses in savings',
        ],
      },
      {
        type: 'list' as const,
        title: '5-Year Goal Examples:',
        items: [
          'Save $50,000 for house down payment',
          'Become completely debt-free',
          'Build $100,000 net worth',
          'Start a business generating $2,000/month',
        ],
      },
      {
        type: 'tip' as const,
        title: 'Make Them SMART',
        content: 'Specific, Measurable, Achievable, Relevant, Time-bound. "Save money" is not a goal. "Save $10,000 by December 31, 2026" is.',
      },
      {
        type: 'warning' as const,
        title: 'Review Monthly',
        content: 'Goals you don\'t review become dreams. Look at them every month, adjust as needed, and celebrate progress!',
      },
    ],
  },

  // Step 2, Lesson 1: Emergency Fund $1,000
  'step2-lesson1': {
    title: 'Why $1,000 First?',
    sections: [
      {
        type: 'header' as const,
        icon: 'shield-checkmark',
        title: 'Your First Line of Defense',
        content: 'Before attacking debt or investing, you need a small buffer. This $1,000 keeps small emergencies from becoming disasters.',
      },
      {
        type: 'text' as const,
        title: 'The Murphy\'s Law Fund',
        content: 'If something can go wrong, it will. Car repairs, medical bills, broken appliances - life happens. This fund means you won\'t go deeper into debt when it does.',
      },
      {
        type: 'list' as const,
        title: 'What $1,000 Covers:',
        items: [
          'Car repair ($300-800 typically)',
          'Urgent medical co-pays',
          'Broken appliance replacement',
          'Emergency travel',
          'Unexpected job loss (buys you time)',
        ],
      },
      {
        type: 'example' as const,
        title: 'Real Life Example',
        content: 'Your car battery dies. Tow + new battery = $250. Without emergency fund? It goes on credit card at 18% interest. With fund? You pay cash and refill it next month. Crisis avoided.',
      },
      {
        type: 'tip' as const,
        title: 'Keep It Separate',
        content: 'Put this in a separate savings account - out of sight, out of mind. You want it available but not too easy to access for non-emergencies.',
      },
      {
        type: 'warning' as const,
        title: 'Only for TRUE Emergencies',
        content: 'A sale on shoes is NOT an emergency. Broken transmission IS. Be honest with yourself.',
      },
    ],
  },

  // Step 3, Lesson 3: Debt Snowball
  'step3-lesson3': {
    title: 'The Debt Snowball Method',
    sections: [
      {
        type: 'header' as const,
        icon: 'snow',
        title: 'Psychology Beats Math',
        content: 'The fastest mathematical way to pay off debt is highest interest first. But humans aren\'t calculators - we need WINS.',
      },
      {
        type: 'text' as const,
        title: 'How It Works',
        content: 'List all your debts smallest to largest (ignore interest rates). Pay minimums on everything except the smallest. Attack that one with EVERYTHING you\'ve got. When it\'s gone, roll that payment to the next smallest. Repeat.',
      },
      {
        type: 'list' as const,
        title: 'The Snowball Steps:',
        items: [
          '1. List ALL debts from smallest to largest',
          '2. Pay minimum payments on all debts',
          '3. Throw every extra dollar at the smallest debt',
          '4. When smallest is paid off, celebrate!',
          '5. Take that payment and add it to the next debt',
          '6. Watch the snowball get bigger and faster',
        ],
      },
      {
        type: 'example' as const,
        title: 'Snowball in Action',
        content: 'Debt 1: $500 medical bill - $50/month minimum\nDebt 2: $2,000 credit card - $60/month minimum\nDebt 3: $5,000 car loan - $150/month minimum\n\nYou have $350 extra. Pay minimums ($260) then throw $350 at Debt 1. It\'s gone in 2 months! Now you have $400/month for Debt 2.',
      },
      {
        type: 'tip' as const,
        title: 'The Momentum Factor',
        content: 'Each debt you kill gives you more money and more motivation. By debt #3, you\'re paying $700+/month on it. That\'s the snowball effect!',
      },
      {
        type: 'warning' as const,
        title: 'No New Debt!',
        content: 'Cut up the credit cards. Stop the bleeding. You can\'t bail out a sinking boat while someone\'s still drilling holes.',
      },
    ],
  },

  // Step 5, Lesson 2: Zero-Based Budget
  'step5-lesson2': {
    title: 'Zero-Based Budgeting',
    sections: [
      {
        type: 'header' as const,
        icon: 'calculator',
        title: 'Give Every Dollar a Job',
        content: 'Zero-based budgeting means Income - Expenses = Zero. Not because you spend everything, but because every dollar has an assignment.',
      },
      {
        type: 'text' as const,
        title: 'The Formula',
        content: 'Take your monthly income. Assign every dollar to a category (rent, food, savings, debt, fun, etc.) until you hit zero. If you have $3,000 income, you assign all $3,000.',
      },
      {
        type: 'list' as const,
        title: 'Key Categories:',
        items: [
          'Housing (rent/mortgage, utilities)',
          'Transportation (car payment, gas, insurance)',
          'Food (groceries, restaurants)',
          'Debt payments',
          'Savings (emergency fund, goals)',
          'Insurance (health, life, etc.)',
          'Personal (phone, subscriptions, fun)',
        ],
      },
      {
        type: 'example' as const,
        title: 'Example Budget',
        content: 'Income: $4,000\nHousing: $1,200\nFood: $500\nCar: $400\nDebt: $600\nSavings: $500\nInsurance: $300\nPersonal: $500\n\nTotal: $4,000 (zero left over)',
      },
      {
        type: 'tip' as const,
        title: 'Budget Before the Month Begins',
        content: 'Sit down at the end of each month and plan next month. Don\'t wait until money is gone to figure out where it should go!',
      },
    ],
  },

  // Step 6, Lesson 1: Income is Your Greatest Tool
  'step6-lesson1': {
    title: 'Your Holy Obligation to Increase Income',
    sections: [
      {
        type: 'header' as const,
        icon: 'trending-up',
        title: 'The Wealth Equation',
        content: 'Building wealth = (Income - Expenses) x Time. You can only cut expenses so far. But income? Income is UNLIMITED.',
      },
      {
        type: 'text' as const,
        title: 'Why Income Beats Frugality',
        content: 'You can save $10/day by skipping coffee ($3,650/year). OR you can get a $5,000 raise. Same result, but one has a ceiling and the other doesn\'t.',
      },
      {
        type: 'list' as const,
        title: 'Why You MUST Increase Income:',
        items: [
          'Expenses have a floor - you need food, shelter, utilities',
          'Income has NO ceiling - always room to earn more',
          'Raises compound FOREVER - a $10k raise = $10k/year for life',
          'Side hustles can become full businesses',
          'More income = faster debt payoff, faster wealth building',
        ],
      },
      {
        type: 'example' as const,
        title: 'The Math',
        content: 'Cut $500/month in expenses = $6,000/year saved.\n\nGet a $10,000 raise = $10,000/year PLUS it stays forever.\n\n5 years: $50,000 from raise vs $30,000 from cutting expenses.\n\nIncome wins.',
      },
      {
        type: 'tip' as const,
        title: 'The 50% Rule',
        content: 'Save 50% of every raise. Your lifestyle improves AND your wealth accelerates. Best of both worlds.',
      },
      {
        type: 'warning' as const,
        title: 'It\'s Not Greedy',
        content: 'Wanting more income isn\'t greedy - it\'s smart. More money = more security, more generosity, more options. You have a moral obligation to maximize your potential.',
      },
    ],
  },

  // Step 6, Lesson 2: Salary Negotiation
  'step6-lesson2': {
    title: 'How to Negotiate Your Salary',
    sections: [
      {
        type: 'header' as const,
        icon: 'cash',
        title: 'The Raise You Don\'t Ask For is $0',
        content: 'Most people never ask. That\'s why they never get it. One conversation can change your entire financial trajectory.',
      },
      {
        type: 'list' as const,
        title: 'The Negotiation Formula:',
        items: [
          '1. Document your wins (numbers, metrics, results)',
          '2. Research market rates (know your worth)',
          '3. Pick the right time (after big wins, budget cycles)',
          '4. Ask confidently (you deserve it)',
          '5. Get a number first (don\'t low-ball yourself)',
          '6. Be willing to walk (best leverage)',
        ],
      },
      {
        type: 'example' as const,
        title: 'The Script',
        content: '"I\'ve been researching market rates and given my performance (cite 2-3 wins), I\'d like to discuss bringing my salary to $X. What do you think?"\n\nDirect. Confident. Backed by data.',
      },
      {
        type: 'tip' as const,
        title: 'The Best Time to Negotiate',
        content: 'Right after a major win, during performance reviews, or when you have another offer. Timing matters.',
      },
    ],
  },

  // Step 6, Lesson 3: Side Hustles
  'step6-lesson3': {
    title: 'Side Hustle Ideas That Work',
    sections: [
      {
        type: 'header' as const,
        icon: 'laptop',
        title: 'Your Second Income Stream',
        content: 'Every millionaire has multiple income streams. Start with one side hustle. Even $500/month = $6,000/year toward debt or investments.',
      },
      {
        type: 'list' as const,
        title: 'Proven Side Hustles:',
        items: [
          'Freelancing (writing, design, coding, consulting)',
          'Tutoring (online or in-person)',
          'Food/grocery delivery (Uber, DoorDash, Instacart)',
          'Rental income (room, parking spot, storage)',
          'Selling items (eBay, Facebook Marketplace)',
          'Online courses or digital products',
        ],
      },
      {
        type: 'tip' as const,
        title: 'The 5-Hour Rule',
        content: 'Dedicate 5-10 hours/week to your side hustle. That\'s just 1-2 hours/day. $25/hour × 10 hours = $1,000/month extra!',
      },
      {
        type: 'warning' as const,
        title: 'Beware the Trap',
        content: 'Trading time for money forever is a trap. Start with freelancing, but build toward products, passive income, or business ownership.',
      },
    ],
  },

  // Step 7, Lesson 1: Partner Alignment
  'step7-lesson1': {
    title: 'Money Fights = Relationship Fights',
    sections: [
      {
        type: 'header' as const,
        icon: 'heart',
        title: 'The #1 Cause of Divorce',
        content: 'Financial problems are cited as the leading cause of stress in relationships. You can\'t win financially if your partner is pulling the opposite direction.',
      },
      {
        type: 'text' as const,
        title: 'Financial Alignment is Everything',
        content: 'Two people rowing in different directions go nowhere. Two people rowing together can cross oceans. Your financial success depends on being aligned.',
      },
      {
        type: 'list' as const,
        title: 'Why Couples Fight About Money:',
        items: [
          'Different values (spender vs saver)',
          'Lack of transparency (hidden spending)',
          'No shared goals (pulling different directions)',
          'Power imbalances (one controls all money)',
          'No regular communication (problems fester)',
        ],
      },
      {
        type: 'example' as const,
        title: 'The Aligned Couple',
        content: 'Sarah wants to save for a house. Mike wants a new truck. Instead of fighting, they sit down together, create JOINT goals, and agree: house first (80% of extra money), truck later (20% of extra money). Both win.',
      },
      {
        type: 'tip' as const,
        title: 'Monthly Money Dates',
        content: 'Schedule monthly budget meetings. Make it fun - grab coffee, review goals, celebrate wins. When you plan together, you win together.',
      },
      {
        type: 'warning' as const,
        title: 'Don\'t Hide Money',
        content: 'Financial infidelity (hiding purchases, secret accounts) destroys trust. Complete transparency is non-negotiable for financial success.',
      },
    ],
  },

  // Step 7, Lesson 2: Joint Goals
  'step7-lesson2': {
    title: 'Create Joint Financial Goals',
    sections: [
      {
        type: 'header' as const,
        icon: 'flag',
        title: 'Dream Together, Win Together',
        content: 'Individual goals compete. Joint goals unite. When you both want the same things, money stops being a fight and becomes a team sport.',
      },
      {
        type: 'list' as const,
        title: 'Creating Joint Goals:',
        items: [
          '1. Share individual dreams openly',
          '2. Find common ground (what do you BOTH want?)',
          '3. Write down 3-5 joint goals',
          '4. Assign dollar amounts and timelines',
          '5. Review progress monthly',
          '6. Celebrate milestones together',
        ],
      },
      {
        type: 'example' as const,
        title: 'Sample Joint Goals',
        content: '1-Year: Pay off $10,000 credit card debt together\n3-Year: Save $30,000 for house down payment\n5-Year: Be completely debt-free\n10-Year: Build $500,000 net worth',
      },
      {
        type: 'tip' as const,
        title: 'The Power of "We"',
        content: 'Change "my money" and "your money" to "our money." You\'re a team. When one wins, both win.',
      },
    ],
  },

  // Step 8, Lesson 1: Housing 20/20/30 Rule
  'step8-lesson1': {
    title: 'The 20/20/30 Rule for Home Buying',
    sections: [
      {
        type: 'header' as const,
        icon: 'home',
        title: 'Buy a Home That Won\'t Own You',
        content: 'Most people buy too much house. Banks approve you for way more than you should spend. Follow the 20/20/30 rule instead.',
      },
      {
        type: 'list' as const,
        title: 'The 20/20/30 Rule:',
        items: [
          '20% Down Payment - Avoids PMI, builds equity immediately',
          '20-Year Mortgage Maximum - Not 30 years (save $100k+ in interest)',
          '30% of Gross Income or Less - Your total housing payment',
        ],
      },
      {
        type: 'example' as const,
        title: 'The Math',
        content: 'Income: $80,000/year ($6,667/month)\nMax payment: 30% = $2,000/month\nWith 20% down, 20-year mortgage at 6% = ~$300k house\n\nBank will approve you for $400k+. DON\'T DO IT.',
      },
      {
        type: 'tip' as const,
        title: 'The Hidden Costs',
        content: 'Remember: Your payment includes mortgage + property tax + insurance + HOA + maintenance. Budget 1-2% of home value annually for repairs.',
      },
    ],
  },

  // Step 9, Lesson 1: Insurance Basics
  'step9-lesson1': {
    title: 'Insurance: The Foundation of Wealth Protection',
    sections: [
      {
        type: 'header' as const,
        icon: 'shield',
        title: 'Protect What You\'ve Built',
        content: 'Insurance seems like a waste...until you need it. The right insurance protects your wealth from catastrophic loss.',
      },
      {
        type: 'list' as const,
        title: 'Essential Insurance Types:',
        items: [
          'Health Insurance - Medical bills are the #1 cause of bankruptcy',
          'Term Life Insurance - If anyone depends on your income (10-12x your income)',
          'Auto Insurance - Required by law, protects assets',
          'Homeowners/Renters - Protects home and belongings',
          'Disability Insurance - Covers income if you can\'t work (60% of income)',
        ],
      },
      {
        type: 'warning' as const,
        title: 'Avoid These Traps',
        content: 'Skip: Whole life insurance (buy term, invest the difference), credit card insurance, cancer-specific insurance. Focus on big risks, not small ones.',
      },
      {
        type: 'tip' as const,
        title: 'The Rule',
        content: 'Self-insure small stuff (higher deductibles = lower premiums). Insurance is for catastrophes that would destroy you financially.',
      },
    ],
  },

  // Step 10, Lesson 1: Investment Basics
  'step10-lesson1': {
    title: 'Start Investing for the Future',
    sections: [
      {
        type: 'header' as const,
        icon: 'trending-up',
        title: 'Make Your Money Work for You',
        content: 'Saving is defense. Investing is offense. You can\'t save your way to wealth - you have to invest.',
      },
      {
        type: 'text' as const,
        title: 'The Power of Compound Interest',
        content: 'Einstein called it the 8th wonder of the world. $500/month invested at 10% annual return = $1 million in 30 years. Time is your greatest asset.',
      },
      {
        type: 'list' as const,
        title: 'Investment Priority Order:',
        items: [
          '1. 401(k) match - Free money, take it ALL',
          '2. Emergency fund - 3-6 months expenses',
          '3. Pay off high-interest debt - >6% interest',
          '4. Roth IRA - $7,000/year tax-free growth',
          '5. Max 401(k) - Up to $23,000/year',
          '6. Brokerage account - After tax-advantaged accounts',
        ],
      },
      {
        type: 'tip' as const,
        title: 'Keep It Simple',
        content: 'Low-cost index funds beat 95% of professional investors. S&P 500 index fund = instant diversification across 500 companies. Set it and forget it.',
      },
      {
        type: 'warning' as const,
        title: 'Avoid',
        content: 'Individual stocks (unless <5% of portfolio), crypto as retirement plan, anything you don\'t understand, high-fee mutual funds (>0.5%).',
      },
    ],
  },

  // Additional lessons will be added as we build them
};

export type LessonEducationKey = keyof typeof FINANCE_EDUCATION;
