# Structura - Personal Growth MVP

**4 Pillars. One Journey. Better You.**

A holistic personal development app built with React Native and Expo, focusing on Finance, Mental Health, Physical Health, and Nutrition.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation

```bash
cd Structura
npm install
```

### Running the App

#### Mobile (Expo Go)
```bash
npm start
```

Then:
1. Scan the QR code with Expo Go (Android) or Camera app (iOS)
2. The app will open in Expo Go on your device

#### Web / PWA
```bash
npx expo start --web
```

The app will open in your browser at `http://localhost:8081`

**To install as PWA:**
1. Open the app in Chrome/Edge/Safari
2. Click the "Install" button in the address bar
3. Or go to Settings → Install Structura
4. The app will appear on your home screen like a native app

## 🏗️ App Architecture

### Core Philosophy: Integrated Tools

**IMPORTANT:** There are NO standalone "Tools" section. All calculators, trackers, and utilities are **INTEGRATED INTO** their respective development paths.

#### Traditional Approach (❌ What We DON'T Do):
```
Main Menu
└── Tools (separate section)
    ├── Budget Calculator
    ├── Debt Calculator
    └── Expense Tracker
```
- Tools isolated from learning
- No data saved
- No progress tracking
- No connection to daily tasks

#### Structura Approach (✅ What We DO):
```
Finance Path
├── Baby Steps Dashboard
└── My Finance Tools (Integrated)
    ├── 📊 Budget Manager
    ├── ❄️ Debt Tracker
    ├── 💸 Expense Logger
    └── 💰 Emergency Fund Tracker
```
- Tools integrated into learning paths
- All data saved to database
- Updates path progress
- Generates personalized daily tasks
- Unlocks achievements

### Data Flow Example

```
User opens Finance Path
    ↓
Uses Emergency Fund Tracker (integrated tool)
    ↓
Adds $200 contribution
    ↓
Data saved to finance_progress table
    ↓
Baby Step 1 progress updated (20% → 40%)
    ↓
Daily task generated: "Add $10 to emergency fund today"
    ↓
User completes task → Earns 10 XP
    ↓
When fund reaches $1,000 → Step 1 complete → Step 2 unlocked
```

**Key Principle:** Every tool interaction saves data, affects progress, and influences the user's journey.

---

## 📱 Features

### MVP Includes:

#### 🏠 Home Dashboard
- Daily task overview for all 4 pillars
- Level and XP progress tracking
- Streak counters
- Quick task completion

#### 💰 Finance Path (Dave Ramsey + Marcin Iwuć + Michał Szafrański)

**Duolingo-style progression with 7 Baby Steps**

**Integrated Tools (Save Data → Update Progress):**
- 📊 **Budget Manager** - Create monthly budget, track spending by category
- ❄️ **Debt Tracker** - Snowball method with payment logging and prioritization
- 💸 **Expense Logger** - Quick expense entry, updates budget automatically
- 💰 **Emergency Fund Tracker** - Visual progress thermometer for Baby Steps 1 & 3

**Features:**
- Baby Step 1: $1,000 Emergency Fund
- Baby Step 2: Debt Snowball method
- Baby Steps 3-7: Progressive financial freedom
- Daily finance tasks generated from tool usage
- Financial tips and education

#### 🧠 Mental Health Path (Huberman Protocols)

**Coming Soon: Integrated Tools**
- 🧘 Sleep Tracker
- ⏱️ Meditation Timer
- 📝 Mood Journal
- 📊 Stress Monitor

**Current MVP Features:**
- Morning sunlight exposure tracker
- Breathing exercises (Box breathing, Physiological sigh)
- Gratitude journal
- Sleep optimization tracker
- Stress level check-ins

#### 💪 Physical Health Path (Huberman + Sylwester Kłos)

**Coming Soon: Integrated Tools**
- 🏋️ Workout Logger
- 📅 Exercise Planner
- 👟 Step Counter
- 🔄 Recovery Tracker

**Current MVP Features:**
- Daily steps counter
- Workout logger (strength, cardio, mobility)
- Morning mobility routine
- Cold exposure protocol
- Movement reminders

#### 🥗 Nutrition Path (Circadian Eating + Huberman)

**Coming Soon: Integrated Tools**
- 🍽️ Meal Planner
- 📖 Food Diary
- 💧 Water Tracker
- 📊 Macro Calculator

**Current MVP Features:**
- Hydration tracker (8 glasses/day)
- Meal timing logger (intermittent fasting)
- Protein intake awareness
- Meal quality rating
- Daily nutrition checklist

#### 🎮 Gamification
- Level system (XP-based progression)
- Streak tracking per pillar
- Achievement badges
- Points system
- Progress visualization

#### 👤 Profile & Settings
- User statistics
- Achievement showcase
- Profile information
- Settings management
- Database reset (dev mode)

## 🏗️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack + Bottom Tabs + Drawer)
- **State Management**: Zustand
- **UI Components**: React Native Paper
- **Database**: SQLite (via Expo SQLite) for integrated tools data
- **Storage**: AsyncStorage for user preferences
- **Notifications**: Expo Notifications
- **Language**: TypeScript
- **Design System**: Duolingo-inspired flat design (#58CC02 green)

## 📂 Project Structure

```
Structura/
├── src/
│   ├── navigation/
│   │   ├── AppNavigator.tsx          # Root navigator
│   │   ├── DrawerNavigator.tsx       # Hamburger menu (NO "Tools" section)
│   │   └── TabNavigator.tsx          # Bottom tabs
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── OnboardingScreen.tsx
│   │   │
│   │   ├── finance/                  # Finance Path (integrated tools)
│   │   │   ├── FinanceScreenPath.tsx      # Main dashboard with Baby Steps
│   │   │   ├── BudgetManagerScreen.tsx    # 📊 Budget tool (integrated)
│   │   │   ├── DebtTrackerScreen.tsx      # ❄️ Debt snowball (integrated)
│   │   │   ├── ExpenseLoggerScreen.tsx    # 💸 Expense entry (integrated)
│   │   │   └── EmergencyFundScreen.tsx    # 💰 Fund tracker (integrated)
│   │   │
│   │   ├── mental/                   # Mental Health Path (future)
│   │   │   ├── MentalHealthScreen.tsx
│   │   │   └── [integrated tools coming soon]
│   │   │
│   │   ├── physical/                 # Physical Health Path (future)
│   │   │   ├── PhysicalHealthScreen.tsx
│   │   │   └── [integrated tools coming soon]
│   │   │
│   │   ├── nutrition/                # Nutrition Path (future)
│   │   │   ├── NutritionScreen.tsx
│   │   │   └── [integrated tools coming soon]
│   │   │
│   │   ├── tasks/                    # Task execution screens
│   │   │   ├── TrackExpensesScreen.tsx
│   │   │   └── MorningSunlightScreen.tsx
│   │   │
│   │   ├── HomeScreenFlat.tsx
│   │   └── ProfileScreen.tsx
│   │
│   ├── database/                     # Database layer (future)
│   │   ├── init.ts                   # Schema initialization
│   │   ├── finance.ts                # Finance queries
│   │   └── user.ts                   # User queries
│   │
│   ├── store/
│   │   ├── authStore.ts              # Authentication state
│   │   ├── appStore.ts               # Global app state
│   │   └── financeStore.ts           # Finance path + tools data (future)
│   │
│   ├── types/
│   │   ├── index.ts                  # Global types
│   │   └── finance.ts                # Finance path types (BabyStep, Lesson)
│   │
│   ├── theme/
│   │   ├── colors.ts                 # Duolingo-inspired colors
│   │   └── theme.ts                  # Theme configuration
│   │
│   └── components/                   # Reusable components
│       ├── ProgressBar.tsx
│       ├── DebtCard.tsx
│       └── BudgetCategoryCard.tsx
│
├── App.tsx
├── app.json
└── package.json
```

**Key Architectural Points:**
- Tools are inside `screens/finance/`, `screens/mental/`, etc. (NOT in separate `tools/` folder)
- Each path has its own folder with integrated tools
- NO standalone "Tools" section in navigation

---

## 🧭 Navigation Structure

### Bottom Tab Navigation (6 Tabs)
1. **Home** 🏠 - Today's tasks, streaks, quick overview
2. **Finance** 💰 - Finance Path with Baby Steps
3. **Mental** 🧠 - Mental Health Path
4. **Physical** 💪 - Physical Health Path
5. **Nutrition** 🥗 - Nutrition Path
6. **Profile** 👤 - User settings and achievements

### Hamburger Menu (Drawer - Future)
```
╔════════════════════════════════════╗
║  Structura                         ║
╠════════════════════════════════════╣
║  📊 MY DEVELOPMENT PATHS           ║
║  ├── 💰 Finance                    ║
║  ├── 🧠 Mental Health              ║
║  ├── 💪 Physical Health            ║
║  └── 🥗 Nutrition                  ║
╠════════════════════════════════════╣
║  ⚙️ SETTINGS                       ║
║  ├── 🔔 Notifications              ║
║  ├── 👤 Profile                    ║
║  ├── 📖 About                      ║
║  └── 🔄 Reset Database (DEV)       ║
╚════════════════════════════════════╝
```

**Important:** NO "Tools" section in navigation. All tools accessed from within their paths.

### Finance Path Navigation Example
```
Finance Path Home (FinanceScreenPath)
├── Current Baby Step progress
├── Lesson nodes (Duolingo-style)
└── My Finance Tools (Integrated)
    ├── 📊 Budget Manager → BudgetManagerScreen.tsx
    ├── ❄️ Debt Tracker → DebtTrackerScreen.tsx
    ├── 💸 Expense Logger → ExpenseLoggerScreen.tsx
    └── 💰 Emergency Fund → EmergencyFundScreen.tsx
```

---

## 🗄️ Database Schema

### Finance Tables (Integrated Tools Data)

```sql
-- Finance Progress (main user finance data)
CREATE TABLE finance_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  current_baby_step INTEGER DEFAULT 1,
  monthly_income REAL DEFAULT 0,
  monthly_expenses REAL DEFAULT 0,
  emergency_fund_goal REAL DEFAULT 1000,
  emergency_fund_current REAL DEFAULT 0,
  total_debt REAL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User Budgets (Budget Manager tool)
CREATE TABLE user_budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  month TEXT NOT NULL,
  monthly_income REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Budget Categories
CREATE TABLE budget_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  budget_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT,
  allocated_amount REAL NOT NULL,
  spent_amount REAL DEFAULT 0
);

-- User Debts (Debt Tracker tool)
CREATE TABLE user_debts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  original_amount REAL NOT NULL,
  current_balance REAL NOT NULL,
  interest_rate REAL DEFAULT 0,
  minimum_payment REAL DEFAULT 0,
  snowball_order INTEGER,
  is_paid_off INTEGER DEFAULT 0
);

-- Debt Payments
CREATE TABLE debt_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  debt_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  payment_date DATE NOT NULL,
  new_balance REAL NOT NULL
);

-- User Expenses (Expense Logger tool)
CREATE TABLE user_expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL
);
```

**Key Point:** Every integrated tool has its own tables. Tool interactions update these tables, which then update path progress and generate daily tasks.

---

## 🎯 Usage

### First Time Setup
1. Create an account (email + password)
2. Complete the 5-question onboarding:
   - Basic info (age, weight, height)
   - Financial situation
   - Activity level
   - Sleep quality assessment

### Daily Workflow
1. Open the app to see today's tasks (generated from your progress)
2. Complete 5-minute tasks from each pillar
3. Use integrated tools within paths to track detailed progress
4. Build streaks and unlock achievements
5. Level up as you earn XP

### Using Integrated Tools - Finance Example

**Step 1: Enter Finance Path**
- Tap "Finance" tab → See Baby Steps progression

**Step 2: Use Emergency Fund Tracker (Integrated Tool)**
- Tap on Emergency Fund node
- Add contribution: $50
- Data saves to `finance_progress` table
- Progress updates: 5% → 10%

**Step 3: Automatic Task Generation**
- Next day: New task generated: "Add $10 to emergency fund"
- Complete task → Earn 10 XP
- Streak increases

**Step 4: Path Progression**
- Reach $1,000 → Baby Step 1 completed
- Baby Step 2 unlocks automatically
- Achievement earned: "Emergency Fund Master 💰"

### Tracking Progress
- **Home**: Overview of all pillars and daily progress
- **Finance Path**: Baby Steps progression, integrated tools (Budget, Debt, Expenses, Emergency Fund)
- **Mental Path**: Mood tracking, meditation, sleep optimization
- **Physical Path**: Workouts, steps, recovery
- **Nutrition Path**: Meals, water intake, diet quality
- **Profile**: View overall stats and achievements

## 🔥 Key Features

### Streak System
- Maintain daily streaks in each pillar
- Loss aversion psychology (Hooked framework)
- Streak freeze available (1 per month)

### Gamification
- Earn 10 points per completed task
- Level up every 100 XP
- Unlock achievements for milestones
- Visual progress indicators

### Achievements
- 🎯 First Steps - Complete your first task
- 🔥 7 Day Warrior - 7-day streak in any pillar
- ⚖️ Balanced Life - Complete all 4 pillars in one day
- 🌱 Growing Strong - Reach level 5
- ⭐ Peak Performance - Reach level 10

## 🛠️ Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Open on Android emulator
- `npm run ios` - Open on iOS simulator
- `npm run web` - Open in web browser

### Adding New Features

The app is built with modularity in mind:

**Adding a New Integrated Tool:**
1. Create screen in `src/screens/[path]/` (e.g., `src/screens/finance/NewToolScreen.tsx`)
2. Add database tables in `src/database/` for tool data
3. Update path store in `src/store/[path]Store.ts`
4. Add navigation route in path's stack navigator
5. Update types in `src/types/[path].ts`
6. Link tool from path's home screen (NOT from main menu)

**Example: Adding Savings Goal Tracker to Finance Path**
```typescript
// 1. Create: src/screens/finance/SavingsGoalScreen.tsx
// 2. Add DB: CREATE TABLE savings_goals (...)
// 3. Update: src/store/financeStore.ts
// 4. Route: FinanceStackNavigator → SavingsGoal
// 5. Type: src/types/finance.ts → SavingsGoal interface
// 6. Link: FinanceScreenPath → "My Tools" section
```

**General Development:**
- Add new screens in `src/screens/[pillar]/`
- Add new store slices in `src/store/`
- Update navigation in `src/navigation/AppNavigator.tsx`
- Define types in `src/types/`
- Add database queries in `src/database/`

## 📊 Roadmap

### Phase 1: MVP (Months 1-4) - Current
- ✅ Authentication & Onboarding
- ✅ Duolingo-style flat design
- ✅ Bottom tab navigation (6 tabs)
- ✅ Home dashboard with daily tasks
- ✅ Gamification (streaks, levels, achievements)
- ✅ Finance Path with Baby Steps visualization
- ⏳ **Finance Integrated Tools (In Progress)**
  - ⏳ Budget Manager (save to DB)
  - ⏳ Debt Tracker (snowball method)
  - ⏳ Expense Logger (quick entry)
  - ⏳ Emergency Fund Tracker (progress bar)
- ⏳ Database layer (SQLite)
- ⏳ Daily task generation from tool usage

### Phase 2: Engagement Optimization (Months 5-7)
- Mental Health integrated tools (Sleep Tracker, Meditation Timer, Mood Journal)
- Physical Health integrated tools (Workout Logger, Exercise Planner, Step Counter)
- Nutrition integrated tools (Meal Planner, Food Diary, Water Tracker)
- Push notifications (scheduled reminders)
- Variable rewards system
- Advanced analytics dashboard
- Hooked framework implementation

### Phase 3: Premium & Scale (Months 8-10)
- Backend API with cloud sync
- Premium subscription features
- Health app integrations (Apple Health, Google Fit)
- Banking integration (Plaid) for automatic expense tracking
- AI-powered personalized recommendations
- Video tutorials and educational content
- Web admin panel

### Phase 4: Community & Advanced (Months 11-12)
- Social features (optional, privacy-first)
- Multi-language support (Polish/English)
- Advanced personalization with ML
- Content partnerships
- Team/corporate wellness features

## 🎨 Design Philosophy

Based on the **Hooked Framework**:
1. **Trigger**: Push notifications, contextual reminders
2. **Action**: 5-minute micro-tasks (minimal friction)
3. **Variable Reward**: Points, achievements, surprises
4. **Investment**: Streaks, data history, customization

Inspired by:
- Duolingo's engagement model
- Dave Ramsey's Baby Steps
- Andrew Huberman's protocols
- Marcin Iwuć & Michał Szafrański (Polish finance experts)
- Sylwester Kłos (mobility methodology)

## 📄 License

Private - MVP for testing purposes

## 🤝 Contributing

This is an MVP. Feedback and suggestions welcome!

## 📱 Support

For issues or questions, please open an issue in the repository.

---

## 🌐 PWA Deployment & Testing

### Building for PWA

```bash
# Build production PWA
npx expo export:web

# The build will be in the `dist` folder
```

### Free Hosting Options for Testing

1. **Vercel** (Recommended - Easiest)
   ```bash
   npm install -g vercel
   vercel --prod
   ```
   - Free tier includes: Unlimited deployments, HTTPS, Custom domains
   - URL: `https://lifequest-xxx.vercel.app`
   - Deploy time: ~1 minute

2. **Netlify**
   ```bash
   npm install -g netlify-cli
   npx expo export:web
   netlify deploy --prod --dir dist
   ```
   - Free tier: 100GB bandwidth/month
   - URL: `https://lifequest-xxx.netlify.app`

3. **GitHub Pages**
   - Push to GitHub
   - Enable GitHub Pages in Settings
   - Set source to `/docs` or `gh-pages` branch
   - URL: `https://yourusername.github.io/lifequest`

4. **Cloudflare Pages**
   - Connect GitHub repo
   - Build command: `npx expo export:web`
   - Output directory: `dist`
   - URL: `https://lifequest.pages.dev`

### Quick Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel --prod
```

### Testing PWA Features

After deployment, test these PWA features:

1. **Installation**
   - Chrome: Click install icon in address bar
   - Safari (iOS): Share → Add to Home Screen
   - Edge: Settings → Apps → Install

2. **Offline Mode**
   - Install the app
   - Turn off internet
   - App should still load (basic functionality)

3. **Mobile Experience**
   - Full-screen mode (no browser UI)
   - Native-like app behavior
   - Home screen icon

### Sharing with Testers

Once deployed to Vercel/Netlify:

1. Share the URL: `https://your-app.vercel.app`
2. Testers can:
   - Open link in mobile browser
   - Install as PWA (Add to Home Screen)
   - Use like a native app

**No App Store needed - Just a link!** 🎉

---

Built with ❤️ using React Native & Expo