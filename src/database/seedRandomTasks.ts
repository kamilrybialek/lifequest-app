import { getDatabase } from './init';

/**
 * Seed 100 unique random action tasks across all 4 pillars
 * Distribution: Finance (25), Mental (25), Physical (25), Nutrition (25)
 */

export const seedRandomActionTasks = async () => {
  const db = await getDatabase();

  const tasks = [
    // ===== FINANCE (25 tasks) =====
    { pillar: 'finance', title: 'Review last week\'s spending', description: 'Check your transactions and categorize expenses', duration: 10, xp: 25, difficulty: 'easy', icon: '💳', weight: 1 },
    { pillar: 'finance', title: 'Update emergency fund goal', description: 'Reassess your emergency fund target based on current expenses', duration: 15, xp: 30, difficulty: 'medium', icon: '🏦', weight: 1 },
    { pillar: 'finance', title: 'Cancel unused subscription', description: 'Find and cancel one subscription you no longer use', duration: 10, xp: 40, difficulty: 'medium', icon: '✂️', weight: 1 },
    { pillar: 'finance', title: 'Set up automatic savings transfer', description: 'Automate $50-100 transfer to savings each payday', duration: 15, xp: 50, difficulty: 'medium', icon: '🔄', weight: 1 },
    { pillar: 'finance', title: 'Check credit score', description: 'Log into your credit monitoring service and review your score', duration: 5, xp: 20, difficulty: 'easy', icon: '📊', weight: 1 },
    { pillar: 'finance', title: 'Research high-yield savings accounts', description: 'Compare rates and consider switching banks for better returns', duration: 20, xp: 35, difficulty: 'medium', icon: '🔍', weight: 1 },
    { pillar: 'finance', title: 'Calculate net worth', description: 'List all assets and liabilities to find your current net worth', duration: 20, xp: 40, difficulty: 'medium', icon: '💰', weight: 1 },
    { pillar: 'finance', title: 'Review insurance coverage', description: 'Check if your insurance policies still meet your needs', duration: 15, xp: 30, difficulty: 'medium', icon: '🛡️', weight: 1 },
    { pillar: 'finance', title: 'Make extra debt payment', description: 'Pay an extra $25-50 on your smallest debt', duration: 5, xp: 45, difficulty: 'medium', icon: '💸', weight: 1 },
    { pillar: 'finance', title: 'Negotiate one bill', description: 'Call a service provider and ask for a better rate', duration: 20, xp: 60, difficulty: 'hard', icon: '📞', weight: 1 },
    { pillar: 'finance', title: 'Track cash spending', description: 'Write down every cash transaction today', duration: 5, xp: 15, difficulty: 'easy', icon: '💵', weight: 1 },
    { pillar: 'finance', title: 'Research side hustle ideas', description: 'Spend time exploring potential income streams', duration: 15, xp: 25, difficulty: 'easy', icon: '💡', weight: 1 },
    { pillar: 'finance', title: 'Update budget categories', description: 'Adjust budget allocations based on actual spending patterns', duration: 15, xp: 30, difficulty: 'medium', icon: '📝', weight: 1 },
    { pillar: 'finance', title: 'Sell one unused item', description: 'List something you don\'t use on marketplace or eBay', duration: 15, xp: 35, difficulty: 'medium', icon: '🏷️', weight: 1 },
    { pillar: 'finance', title: 'Review retirement contributions', description: 'Check if you\'re maximizing employer match', duration: 10, xp: 30, difficulty: 'medium', icon: '👴', weight: 1 },
    { pillar: 'finance', title: 'Organize financial documents', description: 'Create digital copies of important financial papers', duration: 20, xp: 35, difficulty: 'medium', icon: '📂', weight: 1 },
    { pillar: 'finance', title: 'Plan next month\'s budget', description: 'Create budget for upcoming month before it starts', duration: 25, xp: 40, difficulty: 'medium', icon: '📅', weight: 1 },
    { pillar: 'finance', title: 'Compare grocery prices', description: 'Check if shopping at different store could save money', duration: 15, xp: 20, difficulty: 'easy', icon: '🛒', weight: 1 },
    { pillar: 'finance', title: 'Read personal finance article', description: 'Learn something new about money management', duration: 10, xp: 20, difficulty: 'easy', icon: '📰', weight: 1 },
    { pillar: 'finance', title: 'Calculate true hourly wage', description: 'Factor in commute, taxes, work expenses to find real pay', duration: 15, xp: 25, difficulty: 'medium', icon: '⏰', weight: 1 },
    { pillar: 'finance', title: 'Review investment allocations', description: 'Check if your portfolio matches your risk tolerance', duration: 20, xp: 40, difficulty: 'hard', icon: '📈', weight: 1 },
    { pillar: 'finance', title: 'Set one financial goal', description: 'Write down specific, measurable money goal for this month', duration: 10, xp: 25, difficulty: 'easy', icon: '🎯', weight: 1 },
    { pillar: 'finance', title: 'Audit monthly subscriptions', description: 'List all recurring charges and evaluate necessity', duration: 15, xp: 30, difficulty: 'medium', icon: '🔎', weight: 1 },
    { pillar: 'finance', title: 'Transfer savings to investment', description: 'Move extra cash from savings to long-term investments', duration: 10, xp: 35, difficulty: 'medium', icon: '➡️', weight: 1 },
    { pillar: 'finance', title: 'Calculate savings rate', description: 'Find what percentage of income you\'re saving', duration: 10, xp: 20, difficulty: 'easy', icon: '🧮', weight: 1 },

    // ===== MENTAL (25 tasks) =====
    { pillar: 'mental', title: 'Practice 5-minute meditation', description: 'Sit quietly and focus on your breath', duration: 5, xp: 20, difficulty: 'easy', icon: '🧘', weight: 1 },
    { pillar: 'mental', title: 'Write 3 gratitude items', description: 'List three things you\'re grateful for today', duration: 5, xp: 15, difficulty: 'easy', icon: '📝', weight: 1 },
    { pillar: 'mental', title: 'Get morning sunlight', description: 'Spend 10 minutes outside within 1 hour of waking', duration: 10, xp: 25, difficulty: 'easy', icon: '☀️', weight: 1 },
    { pillar: 'mental', title: 'Digital detox hour', description: 'Put phone away for 60 minutes', duration: 60, xp: 40, difficulty: 'hard', icon: '📵', weight: 1 },
    { pillar: 'mental', title: 'Practice box breathing', description: '4-4-4-4 breathing pattern for 5 minutes', duration: 5, xp: 20, difficulty: 'easy', icon: '💨', weight: 1 },
    { pillar: 'mental', title: 'Journal for 10 minutes', description: 'Free write about your thoughts and feelings', duration: 10, xp: 25, difficulty: 'easy', icon: '📔', weight: 1 },
    { pillar: 'mental', title: 'Call a friend or family', description: 'Have a real conversation, not just texting', duration: 15, xp: 30, difficulty: 'medium', icon: '📞', weight: 1 },
    { pillar: 'mental', title: 'Learn something new', description: 'Watch educational video or read article on topic of interest', duration: 15, xp: 25, difficulty: 'easy', icon: '🎓', weight: 1 },
    { pillar: 'mental', title: 'Declutter one space', description: 'Organize desk, drawer, or small area', duration: 15, xp: 30, difficulty: 'medium', icon: '🧹', weight: 1 },
    { pillar: 'mental', title: 'Practice mindful listening', description: 'Have conversation where you only listen, don\'t plan response', duration: 10, xp: 25, difficulty: 'medium', icon: '👂', weight: 1 },
    { pillar: 'mental', title: 'Do creative activity', description: 'Draw, write, play music, or other creative pursuit', duration: 20, xp: 35, difficulty: 'medium', icon: '🎨', weight: 1 },
    { pillar: 'mental', title: 'Set screen time limits', description: 'Configure app limits on your phone', duration: 10, xp: 30, difficulty: 'medium', icon: '⏱️', weight: 1 },
    { pillar: 'mental', title: 'Practice loving-kindness meditation', description: 'Send positive thoughts to yourself and others', duration: 10, xp: 25, difficulty: 'easy', icon: '💝', weight: 1 },
    { pillar: 'mental', title: 'Read 20 pages of book', description: 'Physical book preferred over digital', duration: 20, xp: 30, difficulty: 'easy', icon: '📚', weight: 1 },
    { pillar: 'mental', title: 'Write down your values', description: 'List 5 core values that guide your decisions', duration: 15, xp: 30, difficulty: 'medium', icon: '⭐', weight: 1 },
    { pillar: 'mental', title: 'Do brain training exercise', description: 'Puzzle, chess, memory game, or similar', duration: 10, xp: 20, difficulty: 'easy', icon: '🧩', weight: 1 },
    { pillar: 'mental', title: 'Practice progressive muscle relaxation', description: 'Tense and release each muscle group', duration: 15, xp: 30, difficulty: 'medium', icon: '😌', weight: 1 },
    { pillar: 'mental', title: 'Unfollow negative social media', description: 'Remove accounts that don\'t add value', duration: 10, xp: 25, difficulty: 'easy', icon: '🚫', weight: 1 },
    { pillar: 'mental', title: 'Set boundaries with someone', description: 'Communicate a healthy boundary you need', duration: 15, xp: 40, difficulty: 'hard', icon: '🛑', weight: 1 },
    { pillar: 'mental', title: 'Practice visualization', description: 'Visualize achieving your goals for 5 minutes', duration: 5, xp: 20, difficulty: 'easy', icon: '👁️', weight: 1 },
    { pillar: 'mental', title: 'Schedule worry time', description: 'Set aside 15 min to worry, then move on', duration: 15, xp: 25, difficulty: 'medium', icon: '⏰', weight: 1 },
    { pillar: 'mental', title: 'Compliment three people', description: 'Give genuine compliments to others', duration: 10, xp: 20, difficulty: 'easy', icon: '💬', weight: 1 },
    { pillar: 'mental', title: 'Practice saying no', description: 'Decline something that doesn\'t serve you', duration: 5, xp: 35, difficulty: 'hard', icon: '❌', weight: 1 },
    { pillar: 'mental', title: 'Review personal goals', description: 'Check progress on your life goals', duration: 15, xp: 25, difficulty: 'easy', icon: '🎯', weight: 1 },
    { pillar: 'mental', title: 'Delete 100 old emails', description: 'Clean up inbox for mental clarity', duration: 10, xp: 20, difficulty: 'easy', icon: '📧', weight: 1 },

    // ===== PHYSICAL (25 tasks) =====
    { pillar: 'physical', title: 'Do 20 push-ups', description: 'Modify as needed (knees, incline)', duration: 5, xp: 20, difficulty: 'medium', icon: '💪', weight: 1 },
    { pillar: 'physical', title: 'Walk for 15 minutes', description: 'Get outside and move at brisk pace', duration: 15, xp: 25, difficulty: 'easy', icon: '🚶', weight: 1 },
    { pillar: 'physical', title: 'Do 50 squats', description: 'Bodyweight squats with proper form', duration: 5, xp: 25, difficulty: 'medium', icon: '🦵', weight: 1 },
    { pillar: 'physical', title: 'Stretch for 10 minutes', description: 'Full body stretching routine', duration: 10, xp: 20, difficulty: 'easy', icon: '🤸', weight: 1 },
    { pillar: 'physical', title: 'Take the stairs', description: 'Use stairs instead of elevator today', duration: 5, xp: 15, difficulty: 'easy', icon: '🪜', weight: 1 },
    { pillar: 'physical', title: 'Do plank for 1 minute', description: 'Hold plank position, modify as needed', duration: 5, xp: 25, difficulty: 'medium', icon: '⏱️', weight: 1 },
    { pillar: 'physical', title: 'Dance to 3 songs', description: 'Move your body to music you enjoy', duration: 10, xp: 25, difficulty: 'easy', icon: '💃', weight: 1 },
    { pillar: 'physical', title: 'Do mobility flow', description: 'Cat-cow, hip circles, shoulder rolls', duration: 10, xp: 20, difficulty: 'easy', icon: '🧘', weight: 1 },
    { pillar: 'physical', title: 'Sprint intervals', description: '6x30 second sprints with 90 sec rest', duration: 15, xp: 40, difficulty: 'hard', icon: '🏃', weight: 1 },
    { pillar: 'physical', title: 'Do yoga flow', description: 'Follow 15-minute yoga routine', duration: 15, xp: 30, difficulty: 'medium', icon: '🧘‍♀️', weight: 1 },
    { pillar: 'physical', title: 'Jump rope 5 minutes', description: 'Cardio session with jump rope', duration: 5, xp: 25, difficulty: 'medium', icon: '🪢', weight: 1 },
    { pillar: 'physical', title: 'Do 10 burpees', description: 'Full body exercise with good form', duration: 5, xp: 30, difficulty: 'hard', icon: '🔥', weight: 1 },
    { pillar: 'physical', title: 'Take cold shower', description: '2-3 minutes cold water at end of shower', duration: 5, xp: 35, difficulty: 'hard', icon: '🚿', weight: 1 },
    { pillar: 'physical', title: 'Foam roll for 10 minutes', description: 'Self-myofascial release on tight muscles', duration: 10, xp: 20, difficulty: 'easy', icon: '🎯', weight: 1 },
    { pillar: 'physical', title: 'Do wall sits', description: 'Hold wall sit position for 90 seconds total', duration: 5, xp: 25, difficulty: 'medium', icon: '🧱', weight: 1 },
    { pillar: 'physical', title: 'Practice balance poses', description: 'Single leg stands, tree pose', duration: 10, xp: 20, difficulty: 'easy', icon: '🦩', weight: 1 },
    { pillar: 'physical', title: 'Do dead hangs', description: 'Hang from bar for grip and shoulder health', duration: 5, xp: 25, difficulty: 'medium', icon: '🔗', weight: 1 },
    { pillar: 'physical', title: 'Bike for 20 minutes', description: 'Cycling workout indoors or outdoors', duration: 20, xp: 35, difficulty: 'medium', icon: '🚴', weight: 1 },
    { pillar: 'physical', title: 'Do core circuit', description: 'Planks, crunches, leg raises, mountain climbers', duration: 15, xp: 30, difficulty: 'medium', icon: '🎯', weight: 1 },
    { pillar: 'physical', title: 'Practice pull-ups', description: 'Do max pull-ups or assisted variations', duration: 5, xp: 30, difficulty: 'hard', icon: '🏋️', weight: 1 },
    { pillar: 'physical', title: 'Go for nature walk', description: 'Walk in park or natural setting', duration: 30, xp: 35, difficulty: 'easy', icon: '🌳', weight: 1 },
    { pillar: 'physical', title: 'Do leg raises', description: '3 sets of 15 hanging or lying leg raises', duration: 10, xp: 25, difficulty: 'medium', icon: '🦿', weight: 1 },
    { pillar: 'physical', title: 'Practice handstands', description: 'Wall-supported handstand holds', duration: 10, xp: 35, difficulty: 'hard', icon: '🤸‍♂️', weight: 1 },
    { pillar: 'physical', title: 'Do kettlebell swings', description: '3 sets of 20 swings with good form', duration: 10, xp: 30, difficulty: 'medium', icon: '⚡', weight: 1 },
    { pillar: 'physical', title: 'Track daily steps', description: 'Log your step count for today', duration: 2, xp: 10, difficulty: 'easy', icon: '👟', weight: 1 },

    // ===== NUTRITION (25 tasks) =====
    { pillar: 'nutrition', title: 'Drink 8 glasses of water', description: 'Stay hydrated throughout the day', duration: 5, xp: 20, difficulty: 'easy', icon: '💧', weight: 1 },
    { pillar: 'nutrition', title: 'Eat protein with breakfast', description: 'Include 20-30g protein in morning meal', duration: 15, xp: 25, difficulty: 'easy', icon: '🍳', weight: 1 },
    { pillar: 'nutrition', title: 'Prep healthy snacks', description: 'Cut vegetables, portion nuts, prep fruit', duration: 15, xp: 25, difficulty: 'easy', icon: '🥕', weight: 1 },
    { pillar: 'nutrition', title: 'Skip processed food today', description: 'Eat only whole, unprocessed foods', duration: 5, xp: 35, difficulty: 'hard', icon: '🚫', weight: 1 },
    { pillar: 'nutrition', title: 'Track calories for one meal', description: 'Log macros and calories for today\'s lunch', duration: 10, xp: 20, difficulty: 'easy', icon: '📊', weight: 1 },
    { pillar: 'nutrition', title: 'Eat vegetables with every meal', description: 'Include veggies at breakfast, lunch, and dinner', duration: 5, xp: 30, difficulty: 'medium', icon: '🥗', weight: 1 },
    { pillar: 'nutrition', title: 'Delay first meal by 1 hour', description: 'Practice intermittent fasting extension', duration: 60, xp: 30, difficulty: 'medium', icon: '⏰', weight: 1 },
    { pillar: 'nutrition', title: 'Cook meal from scratch', description: 'Prepare homemade meal instead of takeout', duration: 30, xp: 35, difficulty: 'medium', icon: '👨‍🍳', weight: 1 },
    { pillar: 'nutrition', title: 'Limit caffeine after 2pm', description: 'No coffee or energy drinks in afternoon', duration: 5, xp: 25, difficulty: 'medium', icon: '☕', weight: 1 },
    { pillar: 'nutrition', title: 'Eat mindfully without screens', description: 'One meal with no phone, TV, or distractions', duration: 20, xp: 30, difficulty: 'medium', icon: '🧘', weight: 1 },
    { pillar: 'nutrition', title: 'Try new healthy recipe', description: 'Cook something nutritious you\'ve never made', duration: 40, xp: 35, difficulty: 'medium', icon: '📖', weight: 1 },
    { pillar: 'nutrition', title: 'Take multivitamin', description: 'Remember daily vitamin supplement', duration: 1, xp: 10, difficulty: 'easy', icon: '💊', weight: 1 },
    { pillar: 'nutrition', title: 'Meal prep for tomorrow', description: 'Prepare next day\'s meals in advance', duration: 30, xp: 35, difficulty: 'medium', icon: '🍱', weight: 1 },
    { pillar: 'nutrition', title: 'Eat omega-3 rich food', description: 'Include salmon, walnuts, flax, or chia seeds', duration: 5, xp: 25, difficulty: 'easy', icon: '🐟', weight: 1 },
    { pillar: 'nutrition', title: 'No sugar challenge', description: 'Avoid added sugars for entire day', duration: 5, xp: 40, difficulty: 'hard', icon: '🍬', weight: 1 },
    { pillar: 'nutrition', title: 'Eat colorful plate', description: 'Include 5 different colored vegetables', duration: 10, xp: 30, difficulty: 'medium', icon: '🌈', weight: 1 },
    { pillar: 'nutrition', title: 'Drink green smoothie', description: 'Make smoothie with leafy greens and fruit', duration: 10, xp: 25, difficulty: 'easy', icon: '🥤', weight: 1 },
    { pillar: 'nutrition', title: 'Chew food 30 times', description: 'Practice thorough chewing for better digestion', duration: 5, xp: 20, difficulty: 'easy', icon: '😋', weight: 1 },
    { pillar: 'nutrition', title: 'Replace one beverage with water', description: 'Choose water instead of soda, juice, or alcohol', duration: 2, xp: 20, difficulty: 'easy', icon: '💦', weight: 1 },
    { pillar: 'nutrition', title: 'Eat fermented food', description: 'Have kimchi, sauerkraut, yogurt, or kefir', duration: 5, xp: 25, difficulty: 'easy', icon: '🥒', weight: 1 },
    { pillar: 'nutrition', title: 'Plan weekly meals', description: 'Create meal plan for next 7 days', duration: 20, xp: 30, difficulty: 'medium', icon: '📅', weight: 1 },
    { pillar: 'nutrition', title: 'Grocery shop with list', description: 'Only buy items on pre-planned list', duration: 30, xp: 25, difficulty: 'medium', icon: '🛒', weight: 1 },
    { pillar: 'nutrition', title: 'Eat slowly for 20+ minutes', description: 'Take at least 20 minutes to finish meal', duration: 20, xp: 25, difficulty: 'medium', icon: '🐌', weight: 1 },
    { pillar: 'nutrition', title: 'Avoid eating 3 hours before bed', description: 'Last meal at least 3 hours before sleep', duration: 5, xp: 30, difficulty: 'medium', icon: '🌙', weight: 1 },
    { pillar: 'nutrition', title: 'Read nutrition labels', description: 'Check ingredients and macros on 5 products', duration: 10, xp: 20, difficulty: 'easy', icon: '🔍', weight: 1 },
  ];

  console.log('🌱 Seeding random action tasks...');

  for (const task of tasks) {
    await db.runAsync(`
      INSERT INTO random_action_tasks (pillar, title, description, duration_minutes, xp_reward, difficulty, icon, weight)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      task.pillar,
      task.title,
      task.description,
      task.duration,
      task.xp,
      task.difficulty,
      task.icon,
      task.weight,
    ]);
  }

  console.log(`✅ Successfully seeded ${tasks.length} random action tasks!`);
  console.log('Distribution:');
  console.log('  - Finance: 25 tasks');
  console.log('  - Mental: 25 tasks');
  console.log('  - Physical: 25 tasks');
  console.log('  - Nutrition: 25 tasks');
};

export const clearRandomActionTasks = async () => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM random_action_tasks');
  console.log('🗑️ Cleared all random action tasks');
};

/**
 * Replace all existing tasks with the 100 curated tasks
 * Use this to fix duplicates and Polish language tasks
 */
export const replaceAllRandomActionTasks = async () => {
  console.log('🔄 Replacing all random action tasks...');
  await clearRandomActionTasks();
  await seedRandomActionTasks();
  console.log('✅ Successfully replaced all tasks with 100 curated English tasks');
};
