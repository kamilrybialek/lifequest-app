/**
 * Nutrition Lesson Content - Duolingo Style
 * Complete content for all 8 Nutrition Foundations (28 lessons)
 */

export interface NutritionLessonSection {
  type: 'text' | 'tip' | 'warning' | 'example' | 'quote' | 'list';
  title?: string;
  content: string;
  items?: string[];
  author?: string;
}

export interface NutritionQuizChoice {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface NutritionQuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'scenario';
  question: string;
  choices: NutritionQuizChoice[];
  explanation: string;
  xp: number;
}

export interface NutritionActionQuestion {
  question: string;
  type: 'choice' | 'text' | 'number';
  choices?: string[];
  placeholder?: string;
  toolIntegration?: string;
}

export interface NutritionLessonContent {
  lessonId: string;
  sections: NutritionLessonSection[];
  quiz: NutritionQuizQuestion[];
  actionQuestion?: NutritionActionQuestion;
  navigateToTool?: string;
}

// ============================================
// FOUNDATION 1: NUTRITION FUNDAMENTALS
// ============================================

const FOUNDATION1_LESSONS: { [key: string]: NutritionLessonContent } = {
  'nutrition-foundation1-lesson1': {
    lessonId: 'nutrition-foundation1-lesson1',
    sections: [
      { type: 'text', title: 'Energy Balance', content: 'Weight management is simple math: Eat more than you burn = gain weight. Burn more than you eat = lose weight. Eat the same as you burn = maintain weight.' },
      { type: 'text', title: 'TDEE - Your Daily Burn', content: 'TDEE = Total Daily Energy Expenditure. It\'s how many calories your body burns in a day. Everyone\'s TDEE is different based on age, weight, height, and activity.' },
      { type: 'example', title: 'Real Example', content: 'Sarah\'s TDEE is 2,000 calories.\n• She eats 2,200/day → gains 1 lb per week\n• She eats 1,700/day → loses 1 lb per week\n• She eats 2,000/day → maintains weight' },
      { type: 'tip', title: 'Start Here', content: 'You don\'t need to count calories forever. But understanding this helps you know WHY your weight changes.' },
    ],
    quiz: [
      { id: 'f1-l1-q1', type: 'multiple-choice', question: 'What happens if you eat more calories than you burn?', choices: [{ id: 'a', text: 'You lose weight', isCorrect: false, explanation: 'Opposite!' }, { id: 'b', text: 'You gain weight', isCorrect: true, explanation: 'Yes! Extra energy = stored as fat.' }, { id: 'c', text: 'Nothing changes', isCorrect: false, explanation: 'Your body stores the extra energy.' }], explanation: 'Calories in > calories out = weight gain', xp: 10 },
      { id: 'f1-l1-q2', type: 'true-false', question: 'TDEE is the same for everyone.', choices: [{ id: 'true', text: 'True', isCorrect: false, explanation: 'No! Everyone burns different amounts.' }, { id: 'false', text: 'False', isCorrect: true, explanation: 'Correct! TDEE varies by person.' }], explanation: 'TDEE depends on your body, age, and activity level.', xp: 10 },
      { id: 'f1-l1-q3', type: 'scenario', question: 'Mike burns 2,500 cal/day. He eats 2,200/day. What will happen?', choices: [{ id: 'a', text: 'Gain weight', isCorrect: false, explanation: 'He\'s eating LESS than he burns!' }, { id: 'b', text: 'Lose weight', isCorrect: true, explanation: 'Yes! 300 caldeficit per day.' }, { id: 'c', text: 'Stay same', isCorrect: false, explanation: 'There\'s a deficit, so he\'ll lose.' }], explanation: 'Eating less than you burn = weight loss', xp: 10 },
    ],
    actionQuestion: { question: 'Do you know your approximate TDEE?', type: 'choice', choices: ['Yes, I know it', 'No, but I want to calculate it', 'No, I don\'t track calories', 'What\'s TDEE?'] },
  },

  'nutrition-foundation1-lesson2': {
    lessonId: 'nutrition-foundation1-lesson2',
    sections: [
      { type: 'text', title: 'The Big 3', content: 'All food breaks down into 3 things: Protein, Carbs, and Fat. That\'s it. These are called macronutrients ("macros").' },
      { type: 'list', title: 'What Each Does', content: 'Each macro has a job:', items: ['PROTEIN: Builds/repairs muscle, keeps you full', 'CARBS: Gives you energy, fuels brain', 'FATS: Makes hormones, helps absorb vitamins'] },
      { type: 'warning', title: 'None Are "Bad"', content: 'You NEED all three. Diets that eliminate carbs or fat long-term are missing the point. Balance is key.' },
    ],
    quiz: [
      { id: 'f1-l2-q1', type: 'multiple-choice', question: 'What are the 3 macronutrients?', choices: [{ id: 'a', text: 'Vitamins, minerals, water', isCorrect: false, explanation: 'Those are important but not macros!' }, { id: 'b', text: 'Protein, carbs, fats', isCorrect: true, explanation: 'Correct! The big 3.' }, { id: 'c', text: 'Sugar, salt, fiber', isCorrect: false, explanation: 'Nope!' }], explanation: 'All food is protein, carbs, or fats.', xp: 10 },
      { id: 'f1-l2-q2', type: 'true-false', question: 'Carbs are bad for you.', choices: [{ id: 'true', text: 'True', isCorrect: false, explanation: 'No! Carbs fuel your brain and muscles.' }, { id: 'false', text: 'False', isCorrect: true, explanation: 'Right! Carbs aren\'t bad.' }], explanation: 'No macro is "bad." You need all three.', xp: 10 },
      { id: 'f1-l2-q3', type: 'scenario', question: 'What does PROTEIN primarily do?', choices: [{ id: 'a', text: 'Gives quick energy', isCorrect: false, explanation: 'That\'s carbs!' }, { id: 'b', text: 'Builds muscle', isCorrect: true, explanation: 'Yes! Protein = building blocks.' }, { id: 'c', text: 'Stores as fat', isCorrect: false, explanation: 'Any excess calories store as fat, not just protein.' }], explanation: 'Protein builds and repairs tissue.', xp: 10 },
    ],
    actionQuestion: { question: 'Can you name the 3 macros without looking back?', type: 'choice', choices: ['Yes - protein, carbs, fats', 'I know 2 of them', 'I need to review', 'What\'s a macronutrient?'] },
  },

  'nutrition-foundation1-lesson3': {
    lessonId: 'nutrition-foundation1-lesson3',
    sections: [
      { type: 'text', title: 'The Little Helpers', content: 'Micronutrients are vitamins and minerals. You need tiny amounts, but they\'re crucial for health: immune system, bones, energy, everything.' },
      { type: 'list', title: 'Get Them From Variety', content: 'Best way to get all micros:', items: ['Eat colorful vegetables', 'Eat different fruits', 'Vary your protein sources', 'Don\'t eat the same meal every day'] },
      { type: 'tip', title: 'Color = Nutrients', content: 'Different colors = different vitamins. Red peppers ≠ green peppers ≠ orange peppers. Mix it up!' },
    ],
    quiz: [
      { id: 'f1-l3-q1', type: 'true-false', question: 'Micronutrients are vitamins and minerals.', choices: [{ id: 'true', text: 'True', isCorrect: true, explanation: 'Correct!' }, { id: 'false', text: 'False', isCorrect: false, explanation: 'They are!' }], explanation: 'Micros = vitamins and minerals.', xp: 10 },
      { id: 'f1-l3-q2', type: 'multiple-choice', question: 'Best way to get micronutrients?', choices: [{ id: 'a', text: 'Eat only supplements', isCorrect: false, explanation: 'Food first!' }, { id: 'b', text: 'Eat colorful, varied foods', isCorrect: true, explanation: 'Yes! Variety is key.' }, { id: 'c', text: 'Eat same meal daily', isCorrect: false, explanation: 'Variety gives you more nutrients.' }], explanation: 'Different foods = different vitamins/minerals.', xp: 10 },
      { id: 'f1-l3-q3', type: 'scenario', question: 'Why eat vegetables of different colors?', choices: [{ id: 'a', text: 'Looks pretty', isCorrect: false, explanation: 'True, but not the main reason!' }, { id: 'b', text: 'Different colors = different nutrients', isCorrect: true, explanation: 'Yes! Each color has different vitamins.' }, { id: 'c', text: 'No real reason', isCorrect: false, explanation: 'Big reason - nutrient variety!' }], explanation: 'Color variety = nutrient variety.', xp: 10 },
    ],
    actionQuestion: { question: 'How many different colored vegetables did you eat today?', type: 'choice', choices: ['3 or more colors', '2 colors', '1 color', 'None'] },
  },
};

// ============================================
// FOUNDATION 2: BUILDING A BALANCED PLATE
// ============================================

const FOUNDATION2_LESSONS: { [key: string]: NutritionLessonContent } = {
  'nutrition-foundation2-lesson1': {
    lessonId: 'nutrition-foundation2-lesson1',
    sections: [
      { type: 'text', title: 'Simple Visual Guide', content: 'The Plate Method: Look at your plate.\n• 50% = vegetables\n• 25% = protein\n• 25% = carbs\n\nThat\'s it!' },
      { type: 'example', title: 'Example Plate', content: 'Dinner plate:\n• Half: broccoli and salad\n• Quarter: chicken breast\n• Quarter: rice or potato\n\nNo counting needed. Just eyeball it.' },
      { type: 'tip', title: 'Why This Works', content: 'Vegetables fill you up with few calories. Protein keeps you satisfied. Carbs give energy. Balanced!' },
    ],
    quiz: [
      { id: 'f2-l1-q1', type: 'multiple-choice', question: 'In the Plate Method, how much should be vegetables?', choices: [{ id: 'a', text: '25%', isCorrect: false, explanation: 'More than that!' }, { id: 'b', text: '50%', isCorrect: true, explanation: 'Yes! Half your plate.' }, { id: 'c', text: '75%', isCorrect: false, explanation: 'Too much - you need protein and carbs too!' }], explanation: 'Half your plate = vegetables.', xp: 10 },
      { id: 'f2-l1-q2', type: 'true-false', question: 'You need to count calories with the Plate Method.', choices: [{ id: 'true', text: 'True', isCorrect: false, explanation: 'No! Just eyeball portions.' }, { id: 'false', text: 'False', isCorrect: true, explanation: 'Right! It\'s a visual method.' }], explanation: 'Plate Method = no counting, just portions.', xp: 10 },
      { id: 'f2-l1-q3', type: 'scenario', question: 'Which plate follows the method?', choices: [{ id: 'a', text: '80% pasta, 20% sauce', isCorrect: false, explanation: 'Where are the veggies and protein?' }, { id: 'b', text: 'Half veggies, quarter chicken, quarter rice', isCorrect: true, explanation: 'Perfect balance!' }, { id: 'c', text: 'All meat', isCorrect: false, explanation: 'Need vegetables and carbs!' }], explanation: '50/25/25 = vegetables/protein/carbs', xp: 10 },
    ],
    actionQuestion: { question: 'Did your last meal follow the Plate Method?', type: 'choice', choices: ['Yes, 50% vegetables', 'Close, but less vegetables', 'No, mostly carbs or protein', 'I had a snack, not a meal'] },
  },

  'nutrition-foundation2-lesson2': {
    lessonId: 'nutrition-foundation2-lesson2',
    sections: [
      { type: 'text', title: 'Protein = Satiety', content: 'Protein keeps you full for HOURS. Carbs alone? You\'re hungry in 30 minutes. Always include protein.' },
      { type: 'list', title: 'Good Protein Sources', content: 'Pick one per meal:', items: ['Chicken, turkey, fish', 'Eggs', 'Greek yogurt', 'Beans, lentils', 'Tofu, tempeh'] },
      { type: 'tip', title: 'How Much?', content: 'Simple: Palm-sized portion of protein at each meal. That\'s roughly 25-35g of protein.' },
    ],
    quiz: [
      { id: 'f2-l2-q1', type: 'multiple-choice', question: 'Which food is HIGH in protein?', choices: [{ id: 'a', text: 'Bread', isCorrect: false, explanation: 'Bread is mostly carbs!' }, { id: 'b', text: 'Chicken breast', isCorrect: true, explanation: 'Yes! Pure protein.' }, { id: 'c', text: 'Butter', isCorrect: false, explanation: 'Butter is fat!' }], explanation: 'Chicken, eggs, fish = high protein.', xp: 10 },
      { id: 'f2-l2-q2', type: 'true-false', question: 'Protein keeps you full longer than carbs alone.', choices: [{ id: 'true', text: 'True', isCorrect: true, explanation: 'Yes! Protein digests slowly.' }, { id: 'false', text: 'False', isCorrect: false, explanation: 'It does!' }], explanation: 'Protein = satiety = less snacking.', xp: 10 },
      { id: 'f2-l2-q3', type: 'scenario', question: 'How much protein per meal?', choices: [{ id: 'a', text: 'As much as possible', isCorrect: false, explanation: 'You don\'t need to overdo it!' }, { id: 'b', text: 'Palm-sized portion', isCorrect: true, explanation: 'Perfect! Easy to remember.' }, { id: 'c', text: 'Just a bite', isCorrect: false, explanation: 'Too little!' }], explanation: 'Palm-sized = ~25-35g protein.', xp: 10 },
    ],
    actionQuestion: { question: 'Did you have protein at breakfast today?', type: 'choice', choices: ['Yes - eggs, yogurt, or other protein', 'No - only carbs (toast, cereal)', 'I skipped breakfast', 'I don\'t remember'] },
  },

  'nutrition-foundation2-lesson3': {
    lessonId: 'nutrition-foundation2-lesson3',
    sections: [
      { type: 'text', title: 'Carbs = Energy', content: 'Carbs fuel your brain and muscles. Don\'t fear them. Just choose wisely.' },
      { type: 'list', title: 'Smart Carb Choices', content: 'Choose these (complex carbs):', items: ['Rice, potatoes, oats', 'Fruit (natural sugar + fiber)', 'Vegetables', 'Quinoa, whole grains'] },
      { type: 'warning', title: 'Limit Processed Carbs', content: 'White bread, pastries, candy, soda = quick spike, then crash. Not filling, lots of calories.' },
    ],
    quiz: [
      { id: 'f2-l3-q1', type: 'true-false', question: 'All carbs are bad.', choices: [{ id: 'true', text: 'True', isCorrect: false, explanation: 'No! Your brain needs carbs.' }, { id: 'false', text: 'False', isCorrect: true, explanation: 'Right! Choose whole food carbs.' }], explanation: 'Complex carbs = healthy energy.', xp: 10 },
      { id: 'f2-l3-q2', type: 'multiple-choice', question: 'Which is a better carb choice?', choices: [{ id: 'a', text: 'White bread', isCorrect: false, explanation: 'Processed = blood sugar spike!' }, { id: 'b', text: 'Sweet potato', isCorrect: true, explanation: 'Yes! Whole food, steady energy.' }, { id: 'c', text: 'Candy', isCorrect: false, explanation: 'Pure sugar!' }], explanation: 'Whole foods > processed foods.', xp: 10 },
      { id: 'f2-l3-q3', type: 'scenario', question: 'Why choose complex carbs over simple sugars?', choices: [{ id: 'a', text: 'Tastes better', isCorrect: false, explanation: 'Not about taste!' }, { id: 'b', text: 'Steady energy, no crash', isCorrect: true, explanation: 'Yes! Complex carbs digest slowly.' }, { id: 'c', text: 'Has more calories', isCorrect: false, explanation: 'Actually often fewer calories!' }], explanation: 'Complex carbs = fiber + steady energy.', xp: 10 },
    ],
    actionQuestion: { question: 'What carbs did you eat today?', type: 'choice', choices: ['Mostly whole foods (rice, potato, oats)', 'Mix of whole and processed', 'Mostly processed (bread, sweets)', 'I avoided all carbs'] },
  },

  'nutrition-foundation2-lesson4': {
    lessonId: 'nutrition-foundation2-lesson4',
    sections: [
      { type: 'text', title: 'Fat Is Not the Enemy', content: 'For decades, we were told "fat makes you fat." Wrong! Fat is essential for hormones, brain, and vitamin absorption.' },
      { type: 'list', title: 'Healthy Fat Sources', content: 'Include these daily:', items: ['Olive oil, avocado oil', 'Nuts and seeds', 'Avocado', 'Fatty fish (salmon, sardines)', 'Eggs'] },
      { type: 'tip', title: 'Omega-3s', content: 'These are anti-inflammatory fats from fish, walnuts, flaxseeds. Most people don\'t get enough!' },
    ],
    quiz: [
      { id: 'f2-l4-q1', type: 'true-false', question: 'Eating fat makes you fat.', choices: [{ id: 'true', text: 'True', isCorrect: false, explanation: 'No! Excess CALORIES make you gain weight.' }, { id: 'false', text: 'False', isCorrect: true, explanation: 'Right! Fat is essential.' }], explanation: 'Healthy fats are necessary for health.', xp: 10 },
      { id: 'f2-l4-q2', type: 'multiple-choice', question: 'Which is a healthy fat source?', choices: [{ id: 'a', text: 'Donuts', isCorrect: false, explanation: 'Trans fats + sugar!' }, { id: 'b', text: 'Salmon', isCorrect: true, explanation: 'Yes! Omega-3 rich.' }, { id: 'c', text: 'Soda', isCorrect: false, explanation: 'Soda has no fat, just sugar!' }], explanation: 'Fish, nuts, avocado, olive oil = healthy fats.', xp: 10 },
      { id: 'f2-l4-q3', type: 'scenario', question: 'What are Omega-3s good for?', choices: [{ id: 'a', text: 'Quick energy', isCorrect: false, explanation: 'Not their main role!' }, { id: 'b', text: 'Reducing inflammation', isCorrect: true, explanation: 'Yes! Brain and heart health too.' }, { id: 'c', text: 'Building muscle', isCorrect: false, explanation: 'That\'s protein!' }], explanation: 'Omega-3s = anti-inflammatory.', xp: 10 },
    ],
    actionQuestion: { question: 'Do you include healthy fats daily?', type: 'choice', choices: ['Yes - olive oil, nuts, fish, avocado', 'Sometimes', 'Rarely - I avoid fats', 'I don\'t know which fats are healthy'] },
  },
};

// ============================================
// FOUNDATION 3: MEAL PLANNING & PREP
// ============================================

const FOUNDATION3_LESSONS: { [key: string]: NutritionLessonContent } = {
  'nutrition-foundation3-lesson1': {
    lessonId: 'nutrition-foundation3-lesson1',
    sections: [
      { type: 'text', title: 'Why Plan?', content: 'Without a plan, you eat whatever is easy: fast food, snacks, takeout. Planning ahead = better choices + save money.' },
      { type: 'list', title: 'Benefits', content: 'Meal planning helps you:', items: ['Eat healthier (no last-minute junk)', 'Save money (less takeout)', 'Save time (know what to cook)', 'Reduce food waste'] },
      { type: 'tip', title: 'Start Small', content: 'Don\'t plan 21 meals at once. Start with planning dinners for the week. That\'s 7 meals. Doable!' },
    ],
    quiz: [
      { id: 'f3-l1-q1', type: 'true-false', question: 'Meal planning saves money.', choices: [{ id: 'true', text: 'True', isCorrect: true, explanation: 'Yes! Less impulse buying and takeout.' }, { id: 'false', text: 'False', isCorrect: false, explanation: 'It does save money!' }], explanation: 'Planning = fewer expensive last-minute meals.', xp: 10 },
      { id: 'f3-l1-q2', type: 'multiple-choice', question: 'Best way to start meal planning?', choices: [{ id: 'a', text: 'Plan all 21 meals/week', isCorrect: false, explanation: 'Too overwhelming!' }, { id: 'b', text: 'Plan just dinners', isCorrect: true, explanation: 'Perfect! Start small.' }, { id: 'c', text: 'Don\'t plan anything', isCorrect: false, explanation: 'That\'s not planning!' }], explanation: 'Start with 7 dinners per week.', xp: 10 },
      { id: 'f3-l1-q3', type: 'scenario', question: 'What happens without a meal plan?', choices: [{ id: 'a', text: 'You eat healthier', isCorrect: false, explanation: 'Usually the opposite!' }, { id: 'b', text: 'You default to easy/junk food', isCorrect: true, explanation: 'Yes! Convenience wins when there\'s no plan.' }, { id: 'c', text: 'You save time', isCorrect: false, explanation: 'No plan = more time deciding what to eat!' }], explanation: 'No plan = poor food choices.', xp: 10 },
    ],
    actionQuestion: { question: 'Do you plan your meals for the week?', type: 'choice', choices: ['Yes, I plan every week', 'Sometimes I plan', 'No, I wing it daily', 'I want to start planning'] },
  },

  'nutrition-foundation3-lesson2': {
    lessonId: 'nutrition-foundation3-lesson2',
    sections: [
      { type: 'text', title: 'Batch Cooking', content: 'Cook once, eat multiple times. Spend 2 hours on Sunday, have meals for the week. This is meal prep.' },
      { type: 'list', title: 'Easy Meal Prep Ideas', content: 'Cook in bulk:', items: ['Rice, quinoa, pasta', 'Roasted vegetables', 'Grilled chicken or ground beef', 'Hard-boiled eggs'] },
      { type: 'tip', title: 'Storage', content: 'Use glass containers. Label with date. Fridge = 3-4 days. Freezer = 2-3 months.' },
    ],
    quiz: [
      { id: 'f3-l2-q1', type: 'multiple-choice', question: 'What is meal prep?', choices: [{ id: 'a', text: 'Ordering takeout', isCorrect: false, explanation: 'That\'s not prep!' }, { id: 'b', text: 'Cooking meals in advance', isCorrect: true, explanation: 'Yes! Batch cooking for the week.' }, { id: 'c', text: 'Skipping meals', isCorrect: false, explanation: 'Opposite of prep!' }], explanation: 'Meal prep = cook once, eat all week.', xp: 10 },
      { id: 'f3-l2-q2', type: 'true-false', question: 'Meal prep saves time during the week.', choices: [{ id: 'true', text: 'True', isCorrect: true, explanation: 'Yes! Just reheat and eat.' }, { id: 'false', text: 'False', isCorrect: false, explanation: 'It definitely saves time!' }], explanation: 'Prep 2 hours once = save 30 min daily.', xp: 10 },
      { id: 'f3-l2-q3', type: 'scenario', question: 'How long do meal prep foods last in the fridge?', choices: [{ id: 'a', text: '1-2 days', isCorrect: false, explanation: 'They last longer!' }, { id: 'b', text: '3-4 days', isCorrect: true, explanation: 'Correct! After that, freeze or toss.' }, { id: 'c', text: '2 weeks', isCorrect: false, explanation: 'Too long - risk of spoiling!' }], explanation: 'Fridge = 3-4 days, Freezer = months.', xp: 10 },
    ],
    actionQuestion: { question: 'Have you ever meal prepped?', type: 'choice', choices: ['Yes, I do it regularly', 'Yes, but I stopped', 'No, but I want to try', 'No, it seems too hard'] },
  },

  'nutrition-foundation3-lesson3': {
    lessonId: 'nutrition-foundation3-lesson3',
    sections: [
      { type: 'text', title: 'Shop With a List', content: 'Never shop hungry. Always bring a list. These two rules save money and prevent junk food impulse buys.' },
      { type: 'list', title: 'Smart Shopping Tips', content: 'Save money:', items: ['Buy produce in season', 'Generic brands = same quality', 'Frozen veggies = cheaper + last longer', 'Buy bulk for rice, oats, beans'] },
      { type: 'tip', title: 'Read Labels', content: 'Check ingredient list. Fewer ingredients = better. If you can\'t pronounce it, your body doesn\'t need it.' },
    ],
    quiz: [
      { id: 'f3-l3-q1', type: 'true-false', question: 'You should shop when you\'re hungry.', choices: [{ id: 'true', text: 'True', isCorrect: false, explanation: 'No! You\'ll buy junk.' }, { id: 'false', text: 'False', isCorrect: true, explanation: 'Right! Never shop hungry.' }], explanation: 'Hungry shopping = impulse buys.', xp: 10 },
      { id: 'f3-l3-q2', type: 'multiple-choice', question: 'Why use a shopping list?', choices: [{ id: 'a', text: 'Looks organized', isCorrect: false, explanation: 'Not the main reason!' }, { id: 'b', text: 'Prevents impulse buys', isCorrect: true, explanation: 'Yes! Stick to the plan.' }, { id: 'c', text: 'Impresses other shoppers', isCorrect: false, explanation: 'Not about others!' }], explanation: 'List = focused shopping = save money.', xp: 10 },
      { id: 'f3-l3-q3', type: 'scenario', question: 'Are frozen vegetables as healthy as fresh?', choices: [{ id: 'a', text: 'No, fresh is always better', isCorrect: false, explanation: 'Frozen can be MORE nutritious!' }, { id: 'b', text: 'Yes, often just as good', isCorrect: true, explanation: 'Correct! Frozen at peak ripeness.' }, { id: 'c', text: 'Frozen has no nutrients', isCorrect: false, explanation: 'They do!' }], explanation: 'Frozen veggies = flash-frozen at peak nutrients.', xp: 10 },
    ],
    actionQuestion: { question: 'Do you use a shopping list?', type: 'choice', choices: ['Yes, always', 'Sometimes', 'Rarely', 'Never - I wing it'] },
  },
};

// ============================================
// FOUNDATION 4: HYDRATION & WATER BALANCE
// ============================================

const FOUNDATION4_LESSONS: { [key: string]: NutritionLessonContent } = {
  'nutrition-foundation4-lesson1': {
    lessonId: 'nutrition-foundation4-lesson1',
    sections: [
      { type: 'text', title: 'Water Is Life', content: 'Your body is 60% water. Your brain? 73% water. Every cell needs it. Most people are chronically dehydrated.' },
      { type: 'warning', title: 'Signs of Dehydration', content: 'Watch for: dry mouth, dark pee, headache, fatigue, dizziness, brain fog. These mean: DRINK WATER NOW.' },
      { type: 'tip', title: 'Simple Rule', content: 'Drink 8 glasses (64 oz) per day minimum. Or use this formula: Your weight in pounds ÷ 2 = ounces needed.' },
    ],
    quiz: [
      { id: 'f4-l1-q1', type: 'multiple-choice', question: 'What % of your body is water?', choices: [{ id: 'a', text: '30%', isCorrect: false, explanation: 'Too low!' }, { id: 'b', text: '60%', isCorrect: true, explanation: 'Correct! More than half.' }, { id: 'c', text: '90%', isCorrect: false, explanation: 'Too high!' }], explanation: 'Your body is 60% water.', xp: 10 },
      { id: 'f4-l1-q2', type: 'true-false', question: 'Most people drink enough water.', choices: [{ id: 'true', text: 'True', isCorrect: false, explanation: '75% are dehydrated!' }, { id: 'false', text: 'False', isCorrect: true, explanation: 'Right! Most people don\'t drink enough.' }], explanation: '75% of people are chronically dehydrated.', xp: 10 },
      { id: 'f4-l1-q3', type: 'scenario', question: 'Sarah is tired every afternoon. What should she try FIRST?', choices: [{ id: 'a', text: 'Drink more coffee', isCorrect: false, explanation: 'Coffee can worsen dehydration!' }, { id: 'b', text: 'Drink more water', isCorrect: true, explanation: 'Yes! Dehydration causes fatigue.' }, { id: 'c', text: 'Take a nap', isCorrect: false, explanation: 'Won\'t fix dehydration.' }], explanation: 'Dehydration = #1 cause of fatigue.', xp: 10 },
    ],
    actionQuestion: { question: 'How many glasses of water did you drink today?', type: 'number', placeholder: 'Enter number (0-15)', toolIntegration: 'WaterTracker' },
    navigateToTool: 'WaterTracker',
  },

  'nutrition-foundation4-lesson2': {
    lessonId: 'nutrition-foundation4-lesson2',
    sections: [
      { type: 'quote', title: 'The Thirst Lie', content: 'If you feel thirsty, you\'re already dehydrated.', author: 'Hydration Science' },
      { type: 'list', title: 'Build the Habit', content: 'Make it automatic:', items: ['Drink 2 glasses when you wake up', 'Water bottle with you always', 'Drink before every meal', 'Set phone reminders'] },
      { type: 'tip', title: 'The Pee Test', content: 'Your pee should be light yellow (like lemonade). Dark yellow or orange? Drink more NOW.' },
    ],
    quiz: [
      { id: 'f4-l2-q1', type: 'true-false', question: 'You should wait until you\'re thirsty to drink.', choices: [{ id: 'true', text: 'True', isCorrect: false, explanation: 'No! Thirst = already dehydrated.' }, { id: 'false', text: 'False', isCorrect: true, explanation: 'Right! Don\'t wait for thirst.' }], explanation: 'Thirst is a LATE warning sign.', xp: 10 },
      { id: 'f4-l2-q2', type: 'multiple-choice', question: 'What color should your pee be?', choices: [{ id: 'a', text: 'Dark yellow', isCorrect: false, explanation: 'Too dark = dehydrated!' }, { id: 'b', text: 'Light yellow', isCorrect: true, explanation: 'Perfect! Well hydrated.' }, { id: 'c', text: 'Brown', isCorrect: false, explanation: 'See a doctor!' }], explanation: 'Light yellow pee = good hydration.', xp: 10 },
      { id: 'f4-l2-q3', type: 'scenario', question: 'Best time to drink water?', choices: [{ id: 'a', text: 'Only at meals', isCorrect: false, explanation: 'Drink throughout the day!' }, { id: 'b', text: 'Throughout the day consistently', isCorrect: true, explanation: 'Yes! Sip all day long.' }, { id: 'c', text: 'All at once before bed', isCorrect: false, explanation: 'You\'ll just pee all night!' }], explanation: 'Consistent hydration > chugging once.', xp: 10 },
    ],
    actionQuestion: { question: 'Will you do the pee test tomorrow morning?', type: 'choice', choices: ['Yes, I\'ll check my hydration', 'I already know I\'m dehydrated', 'Maybe', 'No'] },
  },

  'nutrition-foundation4-lesson3': {
    lessonId: 'nutrition-foundation4-lesson3',
    sections: [
      { type: 'text', title: 'Electrolytes', content: 'Sodium, potassium, magnesium = electrolytes. They help your body USE water properly. Without them, water doesn\'t hydrate you well.' },
      { type: 'warning', title: 'When You Need More', content: 'Most people get electrolytes from food. You need EXTRA if you: exercise hard, sweat a lot, or have diarrhea/vomiting.' },
      { type: 'tip', title: 'Sports Drinks?', content: 'Most people DON\'T need them. They\'re full of sugar. Unless you\'re exercising 60+ minutes, stick to water.' },
    ],
    quiz: [
      { id: 'f4-l3-q1', type: 'true-false', question: 'Everyone needs sports drinks daily.', choices: [{ id: 'true', text: 'True', isCorrect: false, explanation: 'No! Most people get enough from food.' }, { id: 'false', text: 'False', isCorrect: true, explanation: 'Right! Only needed for intense exercise.' }], explanation: 'Sports drinks = for athletes, not daily life.', xp: 10 },
      { id: 'f4-l3-q2', type: 'multiple-choice', question: 'What are electrolytes?', choices: [{ id: 'a', text: 'Vitamins', isCorrect: false, explanation: 'Different!' }, { id: 'b', text: 'Minerals like sodium, potassium', isCorrect: true, explanation: 'Yes! Help body use water.' }, { id: 'c', text: 'Proteins', isCorrect: false, explanation: 'No!' }], explanation: 'Electrolytes = minerals that help hydration.', xp: 10 },
      { id: 'f4-l3-q3', type: 'scenario', question: 'When do you NEED electrolyte drinks?', choices: [{ id: 'a', text: 'Every day', isCorrect: false, explanation: 'Unnecessary + too much sugar!' }, { id: 'b', text: 'During intense workouts 60+ min', isCorrect: true, explanation: 'Yes! When you sweat a lot.' }, { id: 'c', text: 'Never', isCorrect: false, explanation: 'Sometimes they\'re useful!' }], explanation: 'Electrolytes for intense exercise or illness.', xp: 10 },
    ],
    actionQuestion: { question: 'Do you drink sports drinks regularly?', type: 'choice', choices: ['Yes, daily', 'Only during workouts', 'Rarely', 'Never'] },
  },
};

// ============================================
// FOUNDATION 5: SUGAR & PROCESSED FOODS
// ============================================

const FOUNDATION5_LESSONS: { [key: string]: NutritionLessonContent } = {
  'nutrition-foundation5-lesson1': {
    lessonId: 'nutrition-foundation5-lesson1',
    sections: [
      { type: 'text', title: 'The Sweet Problem', content: 'Sugar isn\'t "poison," but most people eat WAY too much. Average American eats 77 lbs of sugar per year. That\'s 19 teaspoons per DAY.' },
      { type: 'warning', title: 'What Too Much Sugar Does', content: 'Blood sugar spikes → crashes → cravings. Weight gain. Inflammation. Higher disease risk. Energy rollercoaster all day.' },
      { type: 'tip', title: 'The Limit', content: 'WHO recommends: Under 25g (6 teaspoons) of ADDED sugar per day. One soda has 39g!' },
    ],
    quiz: [
      { id: 'f5-l1-q1', type: 'multiple-choice', question: 'How much added sugar per day is recommended?', choices: [{ id: 'a', text: 'Unlimited', isCorrect: false, explanation: 'Way too much!' }, { id: 'b', text: 'Under 25g (6 teaspoons)', isCorrect: true, explanation: 'Yes! That\'s WHO\'s recommendation.' }, { id: 'c', text: 'Zero - avoid all sugar', isCorrect: false, explanation: 'Some sugar is okay, just limit ADDED sugar.' }], explanation: 'Under 25g added sugar = healthy target.', xp: 10 },
      { id: 'f5-l1-q2', type: 'true-false', question: 'One soda exceeds the daily sugar limit.', choices: [{ id: 'true', text: 'True', isCorrect: true, explanation: 'Yes! One soda = 39g, limit = 25g.' }, { id: 'false', text: 'False', isCorrect: false, explanation: 'It does exceed it!' }], explanation: 'One soda has 39g sugar, more than daily limit.', xp: 10 },
      { id: 'f5-l1-q3', type: 'scenario', question: 'What happens when you eat too much sugar?', choices: [{ id: 'a', text: 'Steady energy all day', isCorrect: false, explanation: 'Opposite! Energy crashes.' }, { id: 'b', text: 'Blood sugar spikes then crashes', isCorrect: true, explanation: 'Yes! Rollercoaster of energy and cravings.' }, { id: 'c', text: 'Nothing bad', isCorrect: false, explanation: 'Too much sugar causes many problems.' }], explanation: 'Excess sugar = energy crashes and cravings.', xp: 10 },
    ],
    actionQuestion: { question: 'Do you know how much sugar you ate today?', type: 'choice', choices: ['Yes, I track sugar', 'No, but I want to find out', 'No, I don\'t track', 'I avoided sugar today'] },
  },

  'nutrition-foundation5-lesson2': {
    lessonId: 'nutrition-foundation5-lesson2',
    sections: [
      { type: 'text', title: '60+ Names for Sugar', content: 'Food companies hide sugar under different names: sucrose, dextrose, maltose, corn syrup, cane juice, and 50+ more. Sneaky!' },
      { type: 'list', title: 'Common Hidden Names', content: 'Look for these on labels:', items: ['High fructose corn syrup', 'Cane sugar/juice', 'Maltodextrin', 'Dextrose', 'Any word ending in "-ose"'] },
      { type: 'tip', title: 'Label Reading Trick', content: '4 grams = 1 teaspoon. So 32g sugar = 8 teaspoons. Visualize it!' },
    ],
    quiz: [
      { id: 'f5-l2-q1', type: 'true-false', question: 'Sugar is always labeled as "sugar."', choices: [{ id: 'true', text: 'True', isCorrect: false, explanation: 'No! 60+ different names.' }, { id: 'false', text: 'False', isCorrect: true, explanation: 'Right! Companies use many names.' }], explanation: 'Sugar hides under 60+ different names on labels.', xp: 10 },
      { id: 'f5-l2-q2', type: 'multiple-choice', question: 'Which is a hidden sugar name?', choices: [{ id: 'a', text: 'Water', isCorrect: false, explanation: 'That\'s not sugar!' }, { id: 'b', text: 'High fructose corn syrup', isCorrect: true, explanation: 'Yes! Common hidden sugar.' }, { id: 'c', text: 'Salt', isCorrect: false, explanation: 'Not sugar!' }], explanation: 'High fructose corn syrup = sugar.', xp: 10 },
      { id: 'f5-l2-q3', type: 'scenario', question: 'How many teaspoons in 20g of sugar?', choices: [{ id: 'a', text: '2 teaspoons', isCorrect: false, explanation: '4g = 1 teaspoon!' }, { id: 'b', text: '5 teaspoons', isCorrect: true, explanation: 'Yes! 20 ÷ 4 = 5 teaspoons.' }, { id: 'c', text: '20 teaspoons', isCorrect: false, explanation: 'Too many!' }], explanation: '4 grams = 1 teaspoon of sugar.', xp: 10 },
    ],
    actionQuestion: { question: 'Will you read labels for hidden sugar?', type: 'choice', choices: ['Yes, I\'ll check labels', 'I already do this', 'Maybe', 'I don\'t buy packaged food'] },
  },

  'nutrition-foundation5-lesson3': {
    lessonId: 'nutrition-foundation5-lesson3',
    sections: [
      { type: 'text', title: 'What Are They?', content: 'Ultra-processed foods = made in a factory, not a kitchen. 5+ ingredients you can\'t pronounce. Designed to be addictive.' },
      { type: 'warning', title: 'The Problem', content: 'These foods are engineered to override your fullness signals. You eat more, gain weight, feel worse.' },
      { type: 'tip', title: 'The 80/20 Rule', content: '80% of your food = whole, unprocessed. 20% = whatever you want. Balance, not perfection.' },
    ],
    quiz: [
      { id: 'f5-l3-q1', type: 'multiple-choice', question: 'What are ultra-processed foods?', choices: [{ id: 'a', text: 'Fresh vegetables', isCorrect: false, explanation: 'Those are whole foods!' }, { id: 'b', text: 'Factory-made with many ingredients', isCorrect: true, explanation: 'Yes! Designed in labs, not kitchens.' }, { id: 'c', text: 'Cooked at home', isCorrect: false, explanation: 'Home cooking ≠ ultra-processed.' }], explanation: 'Ultra-processed = factory food, not real food.', xp: 10 },
      { id: 'f5-l3-q2', type: 'true-false', question: 'Ultra-processed foods are designed to be addictive.', choices: [{ id: 'true', text: 'True', isCorrect: true, explanation: 'Yes! Engineered for maximum cravings.' }, { id: 'false', text: 'False', isCorrect: false, explanation: 'They are designed to make you eat more!' }], explanation: 'These foods override fullness signals.', xp: 10 },
      { id: 'f5-l3-q3', type: 'scenario', question: 'What\'s the 80/20 rule?', choices: [{ id: 'a', text: '80% whole foods, 20% whatever', isCorrect: true, explanation: 'Perfect! Balance, not perfection.' }, { id: 'b', text: '80% carbs, 20% protein', isCorrect: false, explanation: 'Not about macros!' }, { id: 'c', text: 'Eat 80% less food', isCorrect: false, explanation: 'Not about quantity!' }], explanation: '80% real food, 20% flexibility.', xp: 10 },
    ],
    actionQuestion: { question: 'How much of your diet is ultra-processed?', type: 'choice', choices: ['Less than 20%', 'About half', 'More than half', 'Almost all of it'] },
  },

  'nutrition-foundation5-lesson4': {
    lessonId: 'nutrition-foundation5-lesson4',
    sections: [
      { type: 'text', title: 'Simple Swaps', content: 'You don\'t need to be perfect. Small swaps add up over time. Replace one processed item per week.' },
      { type: 'list', title: 'Easy Swaps', content: 'Try these:', items: ['Soda → Sparkling water with lemon', 'Chips → Nuts or air-popped popcorn', 'Candy → Fresh fruit', 'White bread → Whole grain bread', 'Sugary cereal → Oats with berries'] },
      { type: 'tip', title: 'Start Small', content: 'Don\'t swap everything at once. Pick ONE swap this week. Master it. Then add another.' },
    ],
    quiz: [
      { id: 'f5-l4-q1', type: 'multiple-choice', question: 'Healthier swap for soda?', choices: [{ id: 'a', text: 'Diet soda', isCorrect: false, explanation: 'Still processed with artificial sweeteners!' }, { id: 'b', text: 'Sparkling water with lemon', isCorrect: true, explanation: 'Perfect! No sugar, still refreshing.' }, { id: 'c', text: 'Juice', isCorrect: false, explanation: 'Juice = high in sugar!' }], explanation: 'Sparkling water = zero sugar, still tasty.', xp: 10 },
      { id: 'f5-l4-q2', type: 'true-false', question: 'You should swap all processed foods at once.', choices: [{ id: 'true', text: 'True', isCorrect: false, explanation: 'Too overwhelming!' }, { id: 'false', text: 'False', isCorrect: true, explanation: 'Right! Start with one swap per week.' }], explanation: 'Start small = sustainable change.', xp: 10 },
      { id: 'f5-l4-q3', type: 'scenario', question: 'Best swap for sugary cereal?', choices: [{ id: 'a', text: 'More sugary cereal', isCorrect: false, explanation: 'Not a swap!' }, { id: 'b', text: 'Oats with berries', isCorrect: true, explanation: 'Yes! Whole food, natural sweetness.' }, { id: 'c', text: 'Donuts', isCorrect: false, explanation: 'Even more sugar!' }], explanation: 'Oats + fruit = whole food breakfast.', xp: 10 },
    ],
    actionQuestion: { question: 'Which swap will you try this week?', type: 'choice', choices: ['Soda → Sparkling water', 'Chips → Nuts', 'Candy → Fruit', 'I already eat mostly whole foods'] },
  },
};

// ============================================
// FOUNDATION 6: TIMING & MEAL FREQUENCY
// ============================================

const FOUNDATION6_LESSONS: { [key: string]: NutritionLessonContent } = {
  'nutrition-foundation6-lesson1': {
    lessonId: 'nutrition-foundation6-lesson1',
    sections: [
      { type: 'text', title: 'Your Body Has a Clock', content: 'Your body expects food at certain times. Eating in sync with your circadian rhythm = better energy, digestion, sleep.' },
      { type: 'tip', title: 'Simple Rule', content: 'Eat most calories early. Big breakfast, medium lunch, light dinner. Your body digests better during daylight.' },
      { type: 'quote', title: 'Andrew Huberman', content: 'Eating late at night disrupts sleep and metabolism.', author: 'Neuroscientist' },
    ],
    quiz: [
      { id: 'f6-l1-q1', type: 'true-false', question: 'Your body digests food better during the day.', choices: [{ id: 'true', text: 'True', isCorrect: true, explanation: 'Yes! Aligned with circadian rhythm.' }, { id: 'false', text: 'False', isCorrect: false, explanation: 'It does!' }], explanation: 'Daylight = better digestion and metabolism.', xp: 10 },
      { id: 'f6-l1-q2', type: 'multiple-choice', question: 'When should you eat your biggest meal?', choices: [{ id: 'a', text: 'Before bed', isCorrect: false, explanation: 'Worst time!' }, { id: 'b', text: 'Morning or early afternoon', isCorrect: true, explanation: 'Yes! When your body digests best.' }, { id: 'c', text: 'Midnight', isCorrect: false, explanation: 'Terrible for sleep!' }], explanation: 'Eat most calories early in the day.', xp: 10 },
      { id: 'f6-l1-q3', type: 'scenario', question: 'Why avoid eating late at night?', choices: [{ id: 'a', text: 'Food tastes worse', isCorrect: false, explanation: 'Not about taste!' }, { id: 'b', text: 'Disrupts sleep and metabolism', isCorrect: true, explanation: 'Yes! Your body wants to rest, not digest.' }, { id: 'c', text: 'Makes you hungry', isCorrect: false, explanation: 'Actually opposite!' }], explanation: 'Late eating = poor sleep and metabolism.', xp: 10 },
    ],
    actionQuestion: { question: 'When do you eat your biggest meal?', type: 'choice', choices: ['Breakfast or lunch', 'Dinner', 'Before bed', 'I eat same amount all day'] },
  },

  'nutrition-foundation6-lesson2': {
    lessonId: 'nutrition-foundation6-lesson2',
    sections: [
      { type: 'text', title: 'What Is It?', content: 'Intermittent fasting (IF) = eating within a time window. 16:8 = fast 16 hours, eat in 8 hours. Example: eat noon-8pm, fast 8pm-noon.' },
      { type: 'warning', title: 'Not for Everyone', content: 'IF works for some, not all. Don\'t do it if: pregnant, breastfeeding, history of eating disorders, or certain medical conditions.' },
      { type: 'tip', title: 'Start Easy', content: 'Try 12:12 first (12-hour fast). Example: dinner at 7pm, breakfast at 7am. Then work up to 16:8 if you like it.' },
    ],
    quiz: [
      { id: 'f6-l2-q1', type: 'multiple-choice', question: 'What is 16:8 intermittent fasting?', choices: [{ id: 'a', text: 'Eat 16 meals, skip 8', isCorrect: false, explanation: 'Not about meal count!' }, { id: 'b', text: 'Fast 16 hours, eat in 8-hour window', isCorrect: true, explanation: 'Yes! That\'s 16:8.' }, { id: 'c', text: 'Eat for 16 hours', isCorrect: false, explanation: 'Opposite!' }], explanation: '16:8 = 16-hour fast, 8-hour eating window.', xp: 10 },
      { id: 'f6-l2-q2', type: 'true-false', question: 'Intermittent fasting works for everyone.', choices: [{ id: 'true', text: 'True', isCorrect: false, explanation: 'No! Not for pregnant/breastfeeding/medical conditions.' }, { id: 'false', text: 'False', isCorrect: true, explanation: 'Right! Not suitable for everyone.' }], explanation: 'IF works for many, but not all people.', xp: 10 },
      { id: 'f6-l2-q3', type: 'scenario', question: 'Best way to start IF?', choices: [{ id: 'a', text: 'Jump straight to 20:4', isCorrect: false, explanation: 'Too extreme for beginners!' }, { id: 'b', text: 'Start with 12:12, progress slowly', isCorrect: true, explanation: 'Yes! Ease into it.' }, { id: 'c', text: 'Skip meals randomly', isCorrect: false, explanation: 'That\'s not a plan!' }], explanation: 'Start easy with 12:12, then progress.', xp: 10 },
    ],
    actionQuestion: { question: 'Have you tried intermittent fasting?', type: 'choice', choices: ['Yes, I do it regularly', 'Yes, but stopped', 'No, but curious', 'No, not interested'] },
  },

  'nutrition-foundation6-lesson3': {
    lessonId: 'nutrition-foundation6-lesson3',
    sections: [
      { type: 'text', title: 'Fuel Your Workouts', content: 'What you eat before/after exercise matters. Pre-workout = energy. Post-workout = recovery.' },
      { type: 'list', title: 'Pre-Workout (1-2 hours before)', content: 'Eat for energy:', items: ['Carbs for fuel (banana, oats)', 'Small amount of protein', 'Easy to digest', 'Not too heavy'] },
      { type: 'list', title: 'Post-Workout (within 1 hour)', content: 'Eat for recovery:', items: ['Protein for muscle repair', 'Carbs to restore energy', 'Example: protein shake + banana', 'Example: chicken + rice'] },
    ],
    quiz: [
      { id: 'f6-l3-q1', type: 'multiple-choice', question: 'When should you eat after a workout?', choices: [{ id: 'a', text: 'Immediately', isCorrect: false, explanation: 'Within an hour is fine!' }, { id: 'b', text: 'Within 1 hour', isCorrect: true, explanation: 'Yes! Optimal recovery window.' }, { id: 'c', text: 'Wait 5 hours', isCorrect: false, explanation: 'Too long - you miss the recovery window!' }], explanation: 'Post-workout: eat within 1 hour.', xp: 10 },
      { id: 'f6-l3-q2', type: 'true-false', question: 'Pre-workout meals should be heavy and hard to digest.', choices: [{ id: 'true', text: 'True', isCorrect: false, explanation: 'No! You\'ll feel sick during exercise.' }, { id: 'false', text: 'False', isCorrect: true, explanation: 'Right! Keep it light and digestible.' }], explanation: 'Pre-workout = light, easy to digest.', xp: 10 },
      { id: 'f6-l3-q3', type: 'scenario', question: 'Best post-workout meal?', choices: [{ id: 'a', text: 'Only water', isCorrect: false, explanation: 'You need protein and carbs!' }, { id: 'b', text: 'Protein + carbs (shake + banana)', isCorrect: true, explanation: 'Perfect! Recovery combo.' }, { id: 'c', text: 'Only fats', isCorrect: false, explanation: 'You need protein and carbs for recovery!' }], explanation: 'Protein + carbs = optimal recovery.', xp: 10 },
    ],
    actionQuestion: { question: 'Do you eat differently around workouts?', type: 'choice', choices: ['Yes, I plan workout nutrition', 'Sometimes', 'No, I eat the same', 'I don\'t work out'] },
  },
};

// ============================================
// FOUNDATION 7: SPECIAL DIETS & APPROACHES
// ============================================

const FOUNDATION7_LESSONS: { [key: string]: NutritionLessonContent } = {
  'nutrition-foundation7-lesson1': {
    lessonId: 'nutrition-foundation7-lesson1',
    sections: [
      { type: 'text', title: 'Why Mediterranean?', content: 'This diet is consistently ranked #1 healthiest. It\'s how people eat in Greece, Italy, Spain. Heart health, longevity, taste!' },
      { type: 'list', title: 'What You Eat', content: 'Mediterranean basics:', items: ['Lots of vegetables, fruits', 'Olive oil as main fat', 'Fish, seafood 2x/week', 'Whole grains, beans', 'Moderate wine (optional)'] },
      { type: 'tip', title: 'Start Simple', content: 'Use olive oil instead of butter. Add more vegetables to meals. Eat fish twice a week.' },
    ],
    quiz: [
      { id: 'f7-l1-q1', type: 'true-false', question: 'Mediterranean diet is ranked #1 healthiest.', choices: [{ id: 'true', text: 'True', isCorrect: true, explanation: 'Yes! Consistently top-ranked.' }, { id: 'false', text: 'False', isCorrect: false, explanation: 'It is #1!' }], explanation: 'Mediterranean = most researched, healthiest diet.', xp: 10 },
      { id: 'f7-l1-q2', type: 'multiple-choice', question: 'What\'s the main fat in Mediterranean diet?', choices: [{ id: 'a', text: 'Butter', isCorrect: false, explanation: 'That\'s not Mediterranean!' }, { id: 'b', text: 'Olive oil', isCorrect: true, explanation: 'Yes! Olive oil = liquid gold.' }, { id: 'c', text: 'Margarine', isCorrect: false, explanation: 'No!' }], explanation: 'Olive oil = main fat source.', xp: 10 },
      { id: 'f7-l1-q3', type: 'scenario', question: 'How often should you eat fish on Mediterranean diet?', choices: [{ id: 'a', text: 'Never', isCorrect: false, explanation: 'Fish is important!' }, { id: 'b', text: '2 times per week', isCorrect: true, explanation: 'Yes! Twice weekly.' }, { id: 'c', text: 'Every meal', isCorrect: false, explanation: 'Too much!' }], explanation: 'Fish 2x/week = Mediterranean standard.', xp: 10 },
    ],
    actionQuestion: { question: 'Would you try Mediterranean eating?', type: 'choice', choices: ['Yes, sounds great', 'Maybe, need to learn more', 'No, too different from my style', 'I already eat this way'] },
  },

  'nutrition-foundation7-lesson2': {
    lessonId: 'nutrition-foundation7-lesson2',
    sections: [
      { type: 'text', title: 'What Is It?', content: 'Plant-based = eating mostly or only plants. Ranges from vegan (zero animal products) to flexitarian (mostly plants, some meat).' },
      { type: 'warning', title: 'Watch These Nutrients', content: 'If plant-based, make sure you get: B12 (supplement), iron, protein, omega-3s, calcium, vitamin D.' },
      { type: 'tip', title: 'Complete Proteins', content: 'Combine beans + rice, or hummus + pita. This gives you all amino acids your body needs.' },
    ],
    quiz: [
      { id: 'f7-l2-q1', type: 'multiple-choice', question: 'What is a plant-based diet?', choices: [{ id: 'a', text: 'Only eat leaves', isCorrect: false, explanation: 'Much more than leaves!' }, { id: 'b', text: 'Eat mostly or only plants', isCorrect: true, explanation: 'Yes! Ranges from vegan to flexitarian.' }, { id: 'c', text: 'No vegetables allowed', isCorrect: false, explanation: 'Opposite!' }], explanation: 'Plant-based = focus on plant foods.', xp: 10 },
      { id: 'f7-l2-q2', type: 'true-false', question: 'Plant-based eaters need to supplement B12.', choices: [{ id: 'true', text: 'True', isCorrect: true, explanation: 'Yes! B12 only in animal products.' }, { id: 'false', text: 'False', isCorrect: false, explanation: 'They do need B12!' }], explanation: 'B12 = only in animal products, must supplement.', xp: 10 },
      { id: 'f7-l2-q3', type: 'scenario', question: 'How to get complete protein on plants?', choices: [{ id: 'a', text: 'Only eat tofu', isCorrect: false, explanation: 'Tofu is good, but variety is better!' }, { id: 'b', text: 'Combine beans + rice', isCorrect: true, explanation: 'Yes! Complementary proteins.' }, { id: 'c', text: 'Impossible on plants', isCorrect: false, explanation: 'Totally possible!' }], explanation: 'Beans + grains = complete protein.', xp: 10 },
    ],
    actionQuestion: { question: 'Have you tried plant-based eating?', type: 'choice', choices: ['Yes, I eat mostly plants', 'Yes, but went back to meat', 'No, but curious', 'No, not interested'] },
  },

  'nutrition-foundation7-lesson3': {
    lessonId: 'nutrition-foundation7-lesson3',
    sections: [
      { type: 'text', title: 'What Is Keto?', content: 'Keto = very low carb (20-50g/day), high fat. Your body enters "ketosis" and burns fat for fuel instead of carbs.' },
      { type: 'warning', title: 'Not for Everyone', content: 'Keto is restrictive. Works for some (epilepsy, weight loss), but hard to maintain long-term for most people.' },
      { type: 'tip', title: 'Keto Flu', content: 'First week = headaches, fatigue, irritability. This is "keto flu." It passes. Drink lots of water and electrolytes.' },
    ],
    quiz: [
      { id: 'f7-l3-q1', type: 'multiple-choice', question: 'What does keto diet restrict?', choices: [{ id: 'a', text: 'Fats', isCorrect: false, explanation: 'Keto is HIGH fat!' }, { id: 'b', text: 'Carbs', isCorrect: true, explanation: 'Yes! Very low carb.' }, { id: 'c', text: 'Protein', isCorrect: false, explanation: 'Protein is moderate!' }], explanation: 'Keto = very low carb, high fat.', xp: 10 },
      { id: 'f7-l3-q2', type: 'true-false', question: 'Keto is easy to maintain long-term.', choices: [{ id: 'true', text: 'True', isCorrect: false, explanation: 'No! Very restrictive, hard for most.' }, { id: 'false', text: 'False', isCorrect: true, explanation: 'Right! Most people find it hard to sustain.' }], explanation: 'Keto is restrictive and challenging long-term.', xp: 10 },
      { id: 'f7-l3-q3', type: 'scenario', question: 'What is "keto flu"?', choices: [{ id: 'a', text: 'A real flu virus', isCorrect: false, explanation: 'Not a virus!' }, { id: 'b', text: 'Temporary symptoms when starting keto', isCorrect: true, explanation: 'Yes! Headaches, fatigue in first week.' }, { id: 'c', text: 'A keto food', isCorrect: false, explanation: 'It\'s symptoms, not food!' }], explanation: 'Keto flu = adjustment period when starting.', xp: 10 },
    ],
    actionQuestion: { question: 'Would you try keto?', type: 'choice', choices: ['Yes, I want to try', 'Maybe, need more info', 'No, too restrictive', 'I tried it already'] },
  },

  'nutrition-foundation7-lesson4': {
    lessonId: 'nutrition-foundation7-lesson4',
    sections: [
      { type: 'quote', title: 'The Truth', content: 'There is no one perfect diet for everyone.', author: 'Nutrition Science' },
      { type: 'text', title: 'Bio-Individuality', content: 'Your perfect diet depends on: genetics, lifestyle, goals, culture, preferences, health conditions. What works for your friend might not work for you.' },
      { type: 'tip', title: 'Experiment Safely', content: 'Try a new eating style for 30 days. Track energy, sleep, mood, digestion. Keep what works, ditch what doesn\'t.' },
    ],
    quiz: [
      { id: 'f7-l4-q1', type: 'true-false', question: 'There\'s one perfect diet for everyone.', choices: [{ id: 'true', text: 'True', isCorrect: false, explanation: 'No! Everyone is different.' }, { id: 'false', text: 'False', isCorrect: true, explanation: 'Right! Bio-individuality matters.' }], explanation: 'No one-size-fits-all diet exists.', xp: 10 },
      { id: 'f7-l4-q2', type: 'multiple-choice', question: 'How long to try a new diet?', choices: [{ id: 'a', text: '3 days', isCorrect: false, explanation: 'Too short to see results!' }, { id: 'b', text: '30 days', isCorrect: true, explanation: 'Yes! Enough time to adapt and evaluate.' }, { id: 'c', text: '5 years', isCorrect: false, explanation: 'Too long if it\'s not working!' }], explanation: '30 days = good trial period.', xp: 10 },
      { id: 'f7-l4-q3', type: 'scenario', question: 'Your friend lost weight on keto. Should you do keto?', choices: [{ id: 'a', text: 'Yes, automatically', isCorrect: false, explanation: 'Not necessarily - you\'re different!' }, { id: 'b', text: 'Maybe - try and see if it works for YOU', isCorrect: true, explanation: 'Yes! Experiment and find what fits you.' }, { id: 'c', text: 'No, never try what others do', isCorrect: false, explanation: 'You can try, just don\'t assume it\'ll work the same!' }], explanation: 'What works for others might not work for you.', xp: 10 },
    ],
    actionQuestion: { question: 'Which eating style interests you most?', type: 'choice', choices: ['Mediterranean', 'Plant-based', 'Keto', 'I want to find my own way'] },
  },
};

// ============================================
// FOUNDATION 8: SUSTAINABLE HABITS & MINDSET
// ============================================

const FOUNDATION8_LESSONS: { [key: string]: NutritionLessonContent } = {
  'nutrition-foundation8-lesson1': {
    lessonId: 'nutrition-foundation8-lesson1',
    sections: [
      { type: 'text', title: 'Perfection Is Impossible', content: '80% whole, nutritious foods. 20% whatever you want. This is sustainable. 100% perfect? You\'ll quit in a week.' },
      { type: 'quote', title: 'Remember', content: 'Progress, not perfection.', author: 'Every successful person' },
      { type: 'tip', title: 'How It Works', content: 'If you eat 21 meals per week, 17 should be nutritious (80%). 4 can be pizza, dessert, whatever. You still get results!' },
    ],
    quiz: [
      { id: 'f8-l1-q1', type: 'multiple-choice', question: 'What\'s the 80/20 rule?', choices: [{ id: 'a', text: '80% junk, 20% healthy', isCorrect: false, explanation: 'Backwards!' }, { id: 'b', text: '80% nutritious, 20% flexibility', isCorrect: true, explanation: 'Yes! Sustainable balance.' }, { id: 'c', text: 'Eat 20% less food', isCorrect: false, explanation: 'Not about quantity!' }], explanation: '80% healthy, 20% whatever = sustainable.', xp: 10 },
      { id: 'f8-l1-q2', type: 'true-false', question: 'You must be 100% perfect with nutrition.', choices: [{ id: 'true', text: 'True', isCorrect: false, explanation: 'No! Perfection leads to quitting.' }, { id: 'false', text: 'False', isCorrect: true, explanation: 'Right! 80/20 is sustainable.' }], explanation: 'Perfection is unsustainable. 80/20 works.', xp: 10 },
      { id: 'f8-l1-q3', type: 'scenario', question: 'You ate pizza for dinner. What now?', choices: [{ id: 'a', text: 'Feel guilty, restrict tomorrow', isCorrect: false, explanation: 'Guilt spiral doesn\'t help!' }, { id: 'b', text: 'Enjoy it, get back to normal next meal', isCorrect: true, explanation: 'Yes! That\'s the 20%. Move on.' }, { id: 'c', text: 'Give up entirely', isCorrect: false, explanation: 'One meal doesn\'t ruin progress!' }], explanation: 'One "off" meal is fine. Get back on track.', xp: 10 },
    ],
    actionQuestion: { question: 'Do you practice the 80/20 rule?', type: 'choice', choices: ['Yes, I allow flexibility', 'I try to be 100% perfect', 'I eat whatever, whenever', 'I\'m learning balance'] },
  },

  'nutrition-foundation8-lesson2': {
    lessonId: 'nutrition-foundation8-lesson2',
    sections: [
      { type: 'text', title: 'Slow Down', content: 'Most people eat in 5 minutes, distracted by phone/TV. Your brain needs 20 minutes to register fullness. Slow eating = eat less, enjoy more.' },
      { type: 'list', title: 'Mindful Eating Practices', content: 'Try these:', items: ['Put phone away', 'Chew each bite 20 times', 'Put fork down between bites', 'Notice flavors and textures', 'Stop when 80% full'] },
      { type: 'tip', title: 'The 20-Minute Rule', content: 'It takes 20 minutes for your brain to get the "I\'m full" signal. Eat slowly and you\'ll eat less naturally.' },
    ],
    quiz: [
      { id: 'f8-l2-q1', type: 'true-false', question: 'Your brain needs 20 minutes to feel full.', choices: [{ id: 'true', text: 'True', isCorrect: true, explanation: 'Yes! That\'s why slow eating helps.' }, { id: 'false', text: 'False', isCorrect: false, explanation: 'It does!' }], explanation: '20 minutes = brain registers fullness.', xp: 10 },
      { id: 'f8-l2-q2', type: 'multiple-choice', question: 'What is mindful eating?', choices: [{ id: 'a', text: 'Eating while watching TV', isCorrect: false, explanation: 'That\'s distracted eating!' }, { id: 'b', text: 'Paying attention to your food', isCorrect: true, explanation: 'Yes! Present and aware.' }, { id: 'c', text: 'Eating as fast as possible', isCorrect: false, explanation: 'Opposite!' }], explanation: 'Mindful = present, slow, attentive.', xp: 10 },
      { id: 'f8-l2-q3', type: 'scenario', question: 'Why put your phone away while eating?', choices: [{ id: 'a', text: 'Phones are dirty', isCorrect: false, explanation: 'Not the main reason!' }, { id: 'b', text: 'Distraction makes you overeat', isCorrect: true, explanation: 'Yes! You miss fullness cues.' }, { id: 'c', text: 'It\'s rude', isCorrect: false, explanation: 'Maybe, but not why it matters for nutrition!' }], explanation: 'Distraction = overeating. Focus on food.', xp: 10 },
    ],
    actionQuestion: { question: 'Do you eat with distractions (phone, TV)?', type: 'choice', choices: ['Yes, always distracted', 'Sometimes', 'Rarely', 'Never - I eat mindfully'] },
  },

  'nutrition-foundation8-lesson3': {
    lessonId: 'nutrition-foundation8-lesson3',
    sections: [
      { type: 'text', title: 'It\'s Okay to Enjoy', content: 'Restaurants and parties are part of life. You don\'t need to be weird about food. Have strategies, not restrictions.' },
      { type: 'list', title: 'Restaurant Strategies', content: 'Try these:', items: ['Look at menu beforehand', 'Order protein + vegetables first', 'Share dessert', 'Don\'t arrive starving', 'Enjoy without guilt'] },
      { type: 'tip', title: 'The One-Plate Rule', content: 'At buffets or parties: Fill one plate using the Plate Method (50% veggies, 25% protein, 25% carbs). Then you\'re done. No guilt.' },
    ],
    quiz: [
      { id: 'f8-l3-q1', type: 'multiple-choice', question: 'Best strategy for eating out?', choices: [{ id: 'a', text: 'Never eat out', isCorrect: false, explanation: 'Unsustainable!' }, { id: 'b', text: 'Order protein + vegetables', isCorrect: true, explanation: 'Yes! Still nutritious, still enjoying.' }, { id: 'c', text: 'Order everything fried', isCorrect: false, explanation: 'Not balanced!' }], explanation: 'You can eat out and still eat well.', xp: 10 },
      { id: 'f8-l3-q2', type: 'true-false', question: 'You should feel guilty about eating dessert.', choices: [{ id: 'true', text: 'True', isCorrect: false, explanation: 'No! Enjoy it as part of 80/20.' }, { id: 'false', text: 'False', isCorrect: true, explanation: 'Right! No guilt needed.' }], explanation: 'Dessert is fine occasionally. No guilt.', xp: 10 },
      { id: 'f8-l3-q3', type: 'scenario', question: 'What\'s the one-plate rule at a buffet?', choices: [{ id: 'a', text: 'Only eat one tiny plate', isCorrect: false, explanation: 'Not about being tiny!' }, { id: 'b', text: 'Fill one plate using Plate Method, then done', isCorrect: true, explanation: 'Yes! Prevents overeating.' }, { id: 'c', text: 'Eat unlimited plates', isCorrect: false, explanation: 'That defeats the purpose!' }], explanation: 'One plate = satisfying, not stuffed.', xp: 10 },
    ],
    actionQuestion: { question: 'How do you handle eating out?', type: 'choice', choices: ['I have strategies', 'I stress about it', 'I avoid restaurants', 'I order whatever, no plan'] },
  },

  'nutrition-foundation8-lesson4': {
    lessonId: 'nutrition-foundation8-lesson4',
    sections: [
      { type: 'quote', title: 'You\'ve Learned a Lot', content: 'You now know more about nutrition than 90% of people.', author: 'Seriously!' },
      { type: 'text', title: 'What Now?', content: 'You\'ve learned 8 foundations: basics, balance, planning, hydration, sugar, timing, diets, and mindset. Now practice. Knowledge without action = nothing.' },
      { type: 'tip', title: 'Pick Your Top 3', content: 'Don\'t try to change everything at once. Pick 3 things from all these lessons to focus on this month. Master those, then add more.' },
    ],
    quiz: [
      { id: 'f8-l4-q1', type: 'multiple-choice', question: 'What matters most: knowledge or action?', choices: [{ id: 'a', text: 'Knowledge', isCorrect: false, explanation: 'Knowledge without action = zero results!' }, { id: 'b', text: 'Action', isCorrect: true, explanation: 'Yes! Apply what you learned.' }, { id: 'c', text: 'Neither', isCorrect: false, explanation: 'Action is everything!' }], explanation: 'Knowledge + action = results.', xp: 10 },
      { id: 'f8-l4-q2', type: 'true-false', question: 'You should change everything at once.', choices: [{ id: 'true', text: 'True', isCorrect: false, explanation: 'No! Too overwhelming.' }, { id: 'false', text: 'False', isCorrect: true, explanation: 'Right! Start with 3 things.' }], explanation: 'Small changes = sustainable progress.', xp: 10 },
      { id: 'f8-l4-q3', type: 'scenario', question: 'What\'s your next step?', choices: [{ id: 'a', text: 'Pick 3 habits to practice', isCorrect: true, explanation: 'Perfect! Action time.' }, { id: 'b', text: 'Forget everything', isCorrect: false, explanation: 'You just learned so much!' }, { id: 'c', text: 'Wait for perfect conditions', isCorrect: false, explanation: 'Start now, not "someday"!' }], explanation: 'Pick 3 habits and start practicing today.', xp: 10 },
    ],
    actionQuestion: { question: 'Which 3 nutrition habits will you focus on?', type: 'choice', choices: ['Hydration, protein, vegetables', 'Meal planning, mindful eating, 80/20', 'Sugar reduction, timing, whole foods', 'Let me think and decide'] },
  },
};

// Combine all lessons
export const getAllNutritionLessonContent = (): { [key: string]: NutritionLessonContent } => {
  return {
    ...FOUNDATION1_LESSONS,
    ...FOUNDATION2_LESSONS,
    ...FOUNDATION3_LESSONS,
    ...FOUNDATION4_LESSONS,
    ...FOUNDATION5_LESSONS,
    ...FOUNDATION6_LESSONS,
    ...FOUNDATION7_LESSONS,
    ...FOUNDATION8_LESSONS,
  };
};

export const getNutritionLessonContent = (lessonId: string): NutritionLessonContent | null => {
  const allLessons = getAllNutritionLessonContent();
  return allLessons[lessonId] || null;
};
