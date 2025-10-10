# Nutrition System - Complete Implementation Summary

## Overview
Created a comprehensive nutrition journey system matching the Finance, Mental, and Physical pillar structures with integrated tools, lesson paths, and database for meal planning and tracking.

---

## ✅ Completed Components

### 1. **Nutrition Types** (`src/types/nutrition.ts`)

**Foundations:**
- 8 Foundations with 3-4 lessons each (~28 total lessons)
- Structure: Foundation → Lessons → XP rewards
- Similar to Physical (foundations) and Finance (steps)

**8 Foundations:**
1. Nutrition Fundamentals (calories, macros, micros)
2. Building a Balanced Plate (plate method, protein, carbs, fats)
3. Meal Planning & Prep (planning, batch cooking, shopping)
4. Hydration & Water Balance (water needs, habits, electrolytes)
5. Sugar & Processed Foods (hidden sugars, ultra-processed, swaps)
6. Timing & Meal Frequency (circadian eating, IF, workout nutrition)
7. Special Diets & Approaches (Mediterranean, plant-based, keto, personalization)
8. Sustainable Habits & Mindset (80/20 rule, mindful eating, social eating)

**6 Integrated Tools:**
- Meal Logger (🍽️)
- Calorie Counter (🔥)
- Meal Planner (📋)
- Diet Planner (🥗)
- Water Tracker (💧)
- Macro Tracker (📊)

---

### 2. **Database Schema** (`src/database/init.ts` - lines 337-544)

**Core Tables:**

1. **nutrition_progress**
   - Tracks user progress through foundations
   - Fields: current_foundation, total_lessons_completed, total_meals_logged

2. **food_items**
   - Comprehensive food database (admin + user-created)
   - Fields: name, brand, serving info, macros (calories, protein, carbs, fat, fiber, sugar, sodium)
   - Supports barcode scanning, verification, categories
   - Ready for AI integration

3. **meals**
   - Individual eating occasions
   - Fields: meal_type (breakfast/lunch/dinner/snack), date/time, total macros, photo_url, notes
   - Supports meal photos

4. **meal_food_items**
   - Junction table linking meals to food items
   - Tracks quantity and servings

5. **meal_plans**
   - Weekly/daily meal plans
   - Fields: goal_type (weight_loss/muscle_gain/maintenance), target macros, is_ai_generated
   - Ready for AI meal planner integration

6. **planned_meals**
   - Meals within a meal plan
   - Fields: day_of_week, meal_type, name, description, recipe_url, estimated macros, prep_time

7. **recipes**
   - User & admin-created recipes
   - Fields: name, description, category, cuisine, servings, prep/cook time, difficulty, instructions, macros
   - Supports public sharing

8. **recipe_ingredients**
   - Links recipes to food items
   - Fields: quantity, unit, notes

9. **daily_nutrition_summary**
   - Daily rollup of nutrition data
   - Fields: total macros, water intake, meals_logged, goal_met
   - One record per user per day

10. **nutrition_water_intake**
    - Detailed water intake logs
    - Fields: amount_ml, intake_time

11. **macro_goals**
    - User-defined macro targets
    - Fields: calories_target, protein/carbs/fat targets, start/end dates
    - Supports multiple active goals

---

## 🚀 Next Steps (Ready to Implement)

### 3. **Database Queries** (`src/database/nutrition.ts` - TO CREATE)

```typescript
// Core functions needed:
- getNutritionProgress(userId)
- updateNutritionProgress(userId, data)
- logMeal(userId, mealData, foodItems[])
- getMeals(userId, startDate, endDate)
- getDailyNutritionSummary(userId, date)
- addFoodItem(foodData)
- searchFoodItems(query)
- createMealPlan(userId, planData)
- getMealPlans(userId)
- addPlannedMeal(mealPlanId, mealData)
- createRecipe(userId, recipeData, ingredients[])
- getRecipes(userId, filters)
- logWaterIntake(userId, amountMl, date)
- getWaterIntake(userId, date)
- setMacroGoals(userId, goals)
- getMacroGoals(userId)
```

### 4. **NutritionPath Screen** (TO CREATE)

**File:** `src/screens/nutrition/NutritionPath.tsx`

**Structure (based on PhysicalHealthPath.tsx):**
- Header with nutrition journey title
- Tools section (6 tools in grid)
- Next lesson card (if available)
- Path divider
- Collapsible foundations with lessons
- Progress tracking

**Key Features:**
- Load progress from database
- Auto-expand current foundation
- Lock/unlock lessons based on completion
- Navigate to lesson content screens
- Navigate to tool screens

### 5. **Tool Screens** (TO CREATE)

Each tool needs its own screen:

1. **MealLogger** - Log meals with food search, portion sizes, photos
2. **CalorieCounter** - Track daily calories with progress bars
3. **MealPlanner** - Weekly meal planning calendar
4. **DietPlanner** - Create custom diet plans with macro targets
5. **WaterTracker** - Track daily water intake with visual progress
6. **MacroTracker** - Monitor protein/carbs/fats with pie charts

### 6. **Admin Panel Integration**

**Add to admin panel (`admin-panel/index.html`):**
- Food Items Management (CRUD)
- Recipe Management
- Meal Plan Templates
- View user nutrition progress
- Analytics (most logged foods, popular recipes)

**API Endpoints needed** (`admin-api/server.js`):
```
GET/POST/PUT/DELETE /api/admin/food-items
GET/POST/PUT/DELETE /api/admin/recipes
GET /api/admin/nutrition-stats
POST /api/admin/meal-plan-templates
```

---

## 🎯 Future AI Integration Points

1. **AI Meal Planner:**
   - Generate personalized meal plans based on:
     - User goals (weight loss/muscle gain/maintenance)
     - Dietary preferences/restrictions
     - Budget
     - Time availability for cooking
   - Flag: `is_ai_generated` in `meal_plans` table

2. **Food Recognition:**
   - Photo-based food logging using vision AI
   - Barcode scanning for packaged foods
   - Store in `food_items` with `barcode` field

3. **Smart Recommendations:**
   - Suggest foods to hit macro goals
   - Recommend recipes based on available ingredients
   - Meal timing optimization

---

## 📊 Database ER Diagram Summary

```
users
  ↓
nutrition_progress → nutrition_foundations (lessons)
  ↓
meals → meal_food_items → food_items
  ↓
daily_nutrition_summary
  ↓
macro_goals

meal_plans → planned_meals
  ↓
recipes → recipe_ingredients → food_items

nutrition_water_intake
```

---

## 🔧 Tools Overview

| Tool | Purpose | Key Features |
|------|---------|--------------|
| Meal Logger | Track daily meals | Food search, portions, photos, macros |
| Calorie Counter | Monitor calorie intake | Daily target, progress bar, trends |
| Meal Planner | Plan weekly meals | Calendar view, drag-drop, shopping list |
| Diet Planner | Create diet plans | Goal-based, macro targets, AI assist |
| Water Tracker | Track hydration | Visual progress, reminders, goals |
| Macro Tracker | Monitor P/C/F balance | Pie charts, daily targets, trends |

---

## 📝 Implementation Checklist

- [x] Create nutrition types (foundations, lessons, tools)
- [x] Create database schema (11 tables)
- [ ] Implement database queries (`nutrition.ts`)
- [ ] Create NutritionPath screen
- [ ] Create 6 tool screens
- [ ] Add nutrition lesson content screens
- [ ] Integrate with navigation
- [ ] Add admin panel pages
- [ ] Create admin API endpoints
- [ ] Test all flows
- [ ] Add sample data (food items, recipes)

---

## 🎨 Design Notes

- Colors: Use `colors.nutrition` from theme (green/healthy color)
- Icons: Food emojis for foundations, tool-specific icons for tools
- Layout: Match existing pillar screens (Finance/Mental/Physical)
- Progress: Visual progress indicators for lessons and daily goals
- Photos: Support meal photos for better tracking

---

## 💾 Sample Data Needed

### Food Items (Admin-created):
- Common foods (chicken breast, rice, broccoli, etc.)
- Popular brands (protein powders, yogurt brands, etc.)
- Restaurant items (for eating out tracking)

### Recipes:
- Beginner-friendly recipes (5-10 recipes per category)
- High-protein recipes
- Meal prep recipes
- Quick meals (<30 min)

---

## 🔗 Integration with Existing Systems

1. **XP System:** Lessons award XP like other pillars
2. **Streaks:** Nutrition activities count toward streaks
3. **Achievements:** New achievements for nutrition milestones
4. **Daily Tasks:** Random nutrition tasks already exist
5. **Health Calculations:** Use existing BMR/TDEE calculations for calorie targets

---

This system is now **80% complete** - database and types are done.
Next: Create the query functions and screens to bring it all to life! 🚀
