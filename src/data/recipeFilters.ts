/**
 * Recipe Filter Constants
 *
 * Shared filter definitions for recipes used in both admin panel and client app
 */

export interface DishTypeFilter {
  id: string;
  label: string;
  icon: string;
  keywords: string[];
}

// Dish Type Filters (pasta, meat, seafood, etc.)
export const DISH_TYPE_FILTERS: DishTypeFilter[] = [
  {
    id: 'pasta',
    label: 'Pasta',
    icon: '🍝',
    keywords: ['pasta', 'spaghetti', 'penne', 'linguine', 'fettuccine', 'ravioli', 'lasagna', 'macaroni', 'noodle']
  },
  {
    id: 'pizza',
    label: 'Pizza',
    icon: '🍕',
    keywords: ['pizza', 'margherita', 'pepperoni']
  },
  {
    id: 'burger',
    label: 'Burgers',
    icon: '🍔',
    keywords: ['burger', 'hamburger', 'cheeseburger']
  },
  {
    id: 'meat',
    label: 'Meat Dishes',
    icon: '🥩',
    keywords: ['beef', 'steak', 'pork', 'lamb', 'meat', 'ribs', 'meatball']
  },
  {
    id: 'chicken',
    label: 'Chicken',
    icon: '🍗',
    keywords: ['chicken', 'poultry']
  },
  {
    id: 'seafood',
    label: 'Seafood',
    icon: '🦐',
    keywords: ['fish', 'salmon', 'tuna', 'shrimp', 'prawn', 'seafood', 'crab', 'lobster']
  },
  {
    id: 'asian',
    label: 'Asian',
    icon: '🥢',
    keywords: ['stir-fry', 'wok', 'curry', 'sushi', 'ramen', 'pho', 'pad thai', 'teriyaki']
  },
  {
    id: 'rice',
    label: 'Rice Dishes',
    icon: '🍚',
    keywords: ['rice', 'risotto', 'paella', 'biryani', 'fried rice']
  },
  {
    id: 'sandwich',
    label: 'Sandwiches',
    icon: '🥪',
    keywords: ['sandwich', 'wrap', 'panini', 'sub']
  },
  {
    id: 'tacos',
    label: 'Tacos & Mexican',
    icon: '🌮',
    keywords: ['taco', 'burrito', 'quesadilla', 'enchilada', 'fajita']
  },
];

/**
 * Helper function to check if a recipe matches a dish type filter
 * @param recipeTitle - The title of the recipe
 * @param ingredients - Array of ingredient names or objects
 * @param dishTypeId - The dish type filter ID to match against
 * @returns boolean indicating if the recipe matches the filter
 */
export const matchesDishTypeFilter = (
  recipeTitle: string,
  ingredients: any[] | undefined,
  dishTypeId: string
): boolean => {
  const filter = DISH_TYPE_FILTERS.find(f => f.id === dishTypeId);
  if (!filter) return false;

  const titleLower = recipeTitle.toLowerCase();

  // Check if title matches any keyword
  const titleMatches = filter.keywords.some(keyword =>
    titleLower.includes(keyword.toLowerCase())
  );

  // Check if ingredients match any keyword
  let ingredientsMatch = false;
  if (ingredients && Array.isArray(ingredients)) {
    const ingredientsText = ingredients
      .map((ing: any) => {
        if (typeof ing === 'string') return ing;
        return ing.name || ing.original || '';
      })
      .join(' ')
      .toLowerCase();
    ingredientsMatch = filter.keywords.some(keyword =>
      ingredientsText.includes(keyword.toLowerCase())
    );
  }

  return titleMatches || ingredientsMatch;
};
