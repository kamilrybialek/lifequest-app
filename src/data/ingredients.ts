// Common ingredients database for recipe matching
// Users can select which ingredients they have in their fridge

export interface Ingredient {
  id: string;
  name: string;
  namePL: string; // Polish translation
  category: 'protein' | 'vegetable' | 'grain' | 'dairy' | 'spice' | 'other';
  icon: string;
  searchTerms: string[]; // Alternative names for API search
}

export const COMMON_INGREDIENTS: Ingredient[] = [
  // Proteins (7 items)
  {
    id: 'chicken',
    name: 'Chicken',
    namePL: 'Kurczak',
    category: 'protein',
    icon: '🍗',
    searchTerms: ['chicken', 'chicken breast', 'poultry'],
  },
  {
    id: 'beef',
    name: 'Beef',
    namePL: 'Wołowina',
    category: 'protein',
    icon: '🥩',
    searchTerms: ['beef', 'steak', 'ground beef'],
  },
  {
    id: 'pork',
    name: 'Pork',
    namePL: 'Wieprzowina',
    category: 'protein',
    icon: '🥓',
    searchTerms: ['pork', 'bacon', 'ham'],
  },
  {
    id: 'fish',
    name: 'Fish',
    namePL: 'Ryba',
    category: 'protein',
    icon: '🐟',
    searchTerms: ['fish', 'salmon', 'tuna', 'cod'],
  },
  {
    id: 'eggs',
    name: 'Eggs',
    namePL: 'Jajka',
    category: 'protein',
    icon: '🥚',
    searchTerms: ['eggs', 'egg'],
  },
  {
    id: 'tofu',
    name: 'Tofu',
    namePL: 'Tofu',
    category: 'protein',
    icon: '🧈',
    searchTerms: ['tofu', 'soy'],
  },
  {
    id: 'beans',
    name: 'Beans',
    namePL: 'Fasola',
    category: 'protein',
    icon: '🫘',
    searchTerms: ['beans', 'black beans', 'kidney beans', 'chickpeas'],
  },

  // Vegetables (10 items)
  {
    id: 'tomato',
    name: 'Tomatoes',
    namePL: 'Pomidory',
    category: 'vegetable',
    icon: '🍅',
    searchTerms: ['tomato', 'tomatoes'],
  },
  {
    id: 'onion',
    name: 'Onions',
    namePL: 'Cebula',
    category: 'vegetable',
    icon: '🧅',
    searchTerms: ['onion', 'onions'],
  },
  {
    id: 'garlic',
    name: 'Garlic',
    namePL: 'Czosnek',
    category: 'vegetable',
    icon: '🧄',
    searchTerms: ['garlic'],
  },
  {
    id: 'potato',
    name: 'Potatoes',
    namePL: 'Ziemniaki',
    category: 'vegetable',
    icon: '🥔',
    searchTerms: ['potato', 'potatoes'],
  },
  {
    id: 'carrot',
    name: 'Carrots',
    namePL: 'Marchew',
    category: 'vegetable',
    icon: '🥕',
    searchTerms: ['carrot', 'carrots'],
  },
  {
    id: 'broccoli',
    name: 'Broccoli',
    namePL: 'Brokuły',
    category: 'vegetable',
    icon: '🥦',
    searchTerms: ['broccoli'],
  },
  {
    id: 'pepper',
    name: 'Bell Peppers',
    namePL: 'Papryka',
    category: 'vegetable',
    icon: '🫑',
    searchTerms: ['bell pepper', 'peppers', 'pepper'],
  },
  {
    id: 'mushroom',
    name: 'Mushrooms',
    namePL: 'Pieczarki',
    category: 'vegetable',
    icon: '🍄',
    searchTerms: ['mushroom', 'mushrooms'],
  },
  {
    id: 'spinach',
    name: 'Spinach',
    namePL: 'Szpinak',
    category: 'vegetable',
    icon: '🥬',
    searchTerms: ['spinach'],
  },
  {
    id: 'lettuce',
    name: 'Lettuce',
    namePL: 'Sałata',
    category: 'vegetable',
    icon: '🥗',
    searchTerms: ['lettuce', 'salad greens'],
  },

  // Grains & Carbs (5 items)
  {
    id: 'rice',
    name: 'Rice',
    namePL: 'Ryż',
    category: 'grain',
    icon: '🍚',
    searchTerms: ['rice', 'white rice', 'brown rice'],
  },
  {
    id: 'pasta',
    name: 'Pasta',
    namePL: 'Makaron',
    category: 'grain',
    icon: '🍝',
    searchTerms: ['pasta', 'noodles', 'spaghetti'],
  },
  {
    id: 'bread',
    name: 'Bread',
    namePL: 'Chleb',
    category: 'grain',
    icon: '🍞',
    searchTerms: ['bread', 'toast'],
  },
  {
    id: 'flour',
    name: 'Flour',
    namePL: 'Mąka',
    category: 'grain',
    icon: '🌾',
    searchTerms: ['flour', 'all-purpose flour'],
  },
  {
    id: 'oats',
    name: 'Oats',
    namePL: 'Płatki owsiane',
    category: 'grain',
    icon: '🌾',
    searchTerms: ['oats', 'oatmeal'],
  },

  // Dairy (4 items)
  {
    id: 'milk',
    name: 'Milk',
    namePL: 'Mleko',
    category: 'dairy',
    icon: '🥛',
    searchTerms: ['milk'],
  },
  {
    id: 'cheese',
    name: 'Cheese',
    namePL: 'Ser',
    category: 'dairy',
    icon: '🧀',
    searchTerms: ['cheese', 'cheddar', 'mozzarella'],
  },
  {
    id: 'butter',
    name: 'Butter',
    namePL: 'Masło',
    category: 'dairy',
    icon: '🧈',
    searchTerms: ['butter'],
  },
  {
    id: 'yogurt',
    name: 'Yogurt',
    namePL: 'Jogurt',
    category: 'dairy',
    icon: '🥛',
    searchTerms: ['yogurt', 'yoghurt'],
  },

  // Common Spices/Staples (4 items)
  {
    id: 'salt',
    name: 'Salt',
    namePL: 'Sól',
    category: 'spice',
    icon: '🧂',
    searchTerms: ['salt'],
  },
  {
    id: 'pepper-spice',
    name: 'Black Pepper',
    namePL: 'Pieprz',
    category: 'spice',
    icon: '🌶️',
    searchTerms: ['pepper', 'black pepper'],
  },
  {
    id: 'olive-oil',
    name: 'Olive Oil',
    namePL: 'Oliwa z oliwek',
    category: 'other',
    icon: '🫒',
    searchTerms: ['olive oil', 'oil'],
  },
  {
    id: 'sugar',
    name: 'Sugar',
    namePL: 'Cukier',
    category: 'other',
    icon: '🍬',
    searchTerms: ['sugar'],
  },
];

// Group ingredients by category for UI display
export const INGREDIENTS_BY_CATEGORY = {
  protein: COMMON_INGREDIENTS.filter((i) => i.category === 'protein'),
  vegetable: COMMON_INGREDIENTS.filter((i) => i.category === 'vegetable'),
  grain: COMMON_INGREDIENTS.filter((i) => i.category === 'grain'),
  dairy: COMMON_INGREDIENTS.filter((i) => i.category === 'dairy'),
  spice: COMMON_INGREDIENTS.filter((i) => i.category === 'spice'),
  other: COMMON_INGREDIENTS.filter((i) => i.category === 'other'),
};

export const CATEGORY_LABELS = {
  protein: { en: 'Proteins', pl: 'Białka', icon: '🍗' },
  vegetable: { en: 'Vegetables', pl: 'Warzywa', icon: '🥬' },
  grain: { en: 'Grains & Carbs', pl: 'Zboża', icon: '🌾' },
  dairy: { en: 'Dairy', pl: 'Nabiał', icon: '🥛' },
  spice: { en: 'Spices', pl: 'Przyprawy', icon: '🧂' },
  other: { en: 'Other', pl: 'Inne', icon: '🧺' },
};
