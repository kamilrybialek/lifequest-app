# Diet Dashboard - Setup Guide

## Overview

The Diet Dashboard is a comprehensive meal planning tool that helps users:
- **Plan meals** for the week with recipe suggestions
- **Generate shopping lists** automatically from meal plans
- **Estimate costs** to save money on groceries
- **Batch cook** with portion selection (1-20 portions)

## Features

### 1. Meal Planner
- Search 2.3M+ recipes via Spoonacular API
- Browse by ingredients, cuisine, diet type
- View recipe details: time, servings, cost per serving
- Add meals to weekly calendar (breakfast, lunch, dinner, snack)
- Select portions for batch cooking (perfect for weekend meal prep)

### 2. Shopping List
- Auto-generated from meal plan
- Grouped by aisle for easy shopping
- Shows quantities needed for all portions
- Estimated costs per ingredient

### 3. Cost Estimates
- Weekly meal cost summary
- Monthly projection (weekly × 4.33)
- Daily average cost
- Money-saving tips

## API Setup

### Spoonacular API (Required)

1. **Get Free API Key**
   - Visit: https://spoonacular.com/food-api/console#Dashboard
   - Sign up for free account
   - Free tier: **150 requests/day** (sufficient for normal use)

2. **Add to Environment**
   - Create `.env` file in project root:
     ```bash
     cp .env.example .env
     ```
   - Add your API key:
     ```
     EXPO_PUBLIC_SPOONACULAR_API_KEY=your_actual_api_key_here
     ```

3. **Restart App**
   ```bash
   npm start
   ```

## Usage Flow

1. **Search Recipes**
   - Type ingredients or dish name (e.g., "chicken", "pasta", "vegan")
   - Browse results with images, time, and cost

2. **View Recipe**
   - Tap recipe card to see full details
   - Check ingredients, instructions, nutritional info

3. **Add to Plan**
   - Click "Add to Plan"
   - Select day (Mon-Sun)
   - Choose meal type (breakfast/lunch/dinner/snack)
   - Set portions (1-20) for batch cooking

4. **Shopping List**
   - Auto-generated from all planned meals
   - Combines duplicate ingredients
   - Calculates total quantities needed
   - Shows estimated costs

5. **Cost Analysis**
   - View weekly and monthly projections
   - Track spending vs. eating out
   - See money-saving tips

## Integration with Finance Dashboard

Cost estimates from Diet Dashboard will integrate with Finance Dashboard:
- Track actual vs. budgeted food costs
- Compare home cooking vs. eating out
- Analyze monthly food spending trends
- Set grocery budgets based on meal plans

## Design Philosophy

**Connected Pillars:**
- **Finance**: Meal planning reduces food costs
- **Mental**: Glycemic index affects mood and dopamine
- **Physical**: Diet impacts weight and overall health
- **Nutrition**: Foundation for all other pillars

**Money-Saving Focus:**
- Batch cooking on weekends
- Smart portion planning (cook once, eat all week)
- Ingredient cost visibility
- Seasonal produce suggestions

## Future Enhancements

- [ ] Admin panel for editing recipes
- [ ] Custom recipe creation
- [ ] Grocery store price integration
- [ ] Meal prep scheduling
- [ ] Nutritional goal tracking (macros, calories)
- [ ] Diet type filters (keto, vegan, gluten-free)
- [ ] Ingredient substitutions
- [ ] Leftover management
- [ ] Integration with Finance Dashboard for actual spending

## Technical Details

**File**: `DietDashboardScreen.tsx`

**API Endpoints Used:**
- `/recipes/complexSearch` - Search recipes
- `/recipes/{id}/information` - Get recipe details
- `/recipes/{id}/ingredientWidget.json` - Get ingredients for shopping list

**State Management:**
- Local state for meal plan
- AsyncStorage for persistence
- Future: Firebase sync for multi-device access

**Dependencies:**
- `@expo/vector-icons` - Icons
- `react-native-paper` - UI components
- `fetch` - API calls

## Troubleshooting

**"Failed to fetch recipes"**
- Check API key is set correctly in `.env`
- Verify API key is active on Spoonacular dashboard
- Check you haven't exceeded rate limit (150 requests/day)

**"No recipe results"**
- Try broader search terms
- Check internet connection
- Verify API is working: https://spoonacular.com/food-api/console#Dashboard

**Empty shopping list**
- Make sure meals are added to plan
- Check that recipes have ingredient data
- Some recipes may not have complete ingredient info

## API Rate Limits

**Free Tier (150 requests/day):**
- Recipe search: 1 request per search
- Recipe details: 1 request per recipe
- Ingredients: 1 request per recipe

**Usage Tips:**
- Cache recipe data locally
- Search smartly (use specific terms)
- Add multiple meals at once to minimize API calls

## Support

For issues or questions:
- Check Spoonacular API docs: https://spoonacular.com/food-api/docs
- Review code comments in `DietDashboardScreen.tsx`
- Contact development team
