# LifeQuest - Onboarding Design

## Cel
Rozbudowany onboarding który zbiera dane od użytkownika, ocenia jego obecny stan i dopasowuje do odpowiednich ścieżek nauki.

## Flow Ekranów

### 1. Welcome Screen
**Cel:** Przywitać użytkownika i wyjaśnić cel onboardingu

**Treść:**
- Witaj w LifeQuest!
- "W ciągu 2 minut poznamy Twój obecny stan w 4 obszarach życia"
- "Dzięki temu dopasujemy ścieżkę rozwoju idealną dla Ciebie"
- Przycisk: "Zacznijmy"

---

### 2. Personal Info Screen
**Cel:** Podstawowe dane demograficzne

**Pola:**
- Imię (text)
- Wiek (number, 13-100)
- Płeć (select: Mężczyzna / Kobieta / Inna / Wolę nie podawać)
- Wzrost (number, cm, 100-250)
- Waga (number, kg, 30-300)

**Walidacja:**
- Wszystkie pola wymagane oprócz płci
- BMI będzie obliczone automatycznie

**Przyciski:**
- "Dalej" (disabled jeśli brak wymaganych pól)

---

### 3. Physical Health Screen
**Cel:** Stan fizyczny i aktywność

**Pytania:**

1. **Jak często ćwiczysz?** (radio)
   - Nie ćwiczę wcale (0)
   - 1-2 razy w tygodniu (1)
   - 3-4 razy w tygodniu (2)
   - 5+ razy w tygodniu (3)

2. **Jak oceniasz swoją kondycję fizyczną?** (slider 1-10)
   - 1 = Bardzo słaba
   - 10 = Doskonała

3. **Ile godzin śpisz średnio na dobę?** (number, 0-24)

4. **Czy masz jakieś problemy zdrowotne?** (radio)
   - Nie, jestem zdrowy/a (0)
   - Niewielkie dolegliwości (1)
   - Poważne problemy wymagające leczenia (2)

**Scoring:**
- exercise_score: 0-3
- fitness_level: 1-10
- sleep_hours: number
- health_issues: 0-2

---

### 4. Mental Health Screen
**Cel:** Stan psychiczny i stres

**Pytania:**

1. **Jak oceniasz swój poziom stresu?** (slider 1-10)
   - 1 = Bardzo niski
   - 10 = Ekstremalnie wysoki

2. **Jak często czujesz się przytłoczony/a?** (radio)
   - Nigdy lub bardzo rzadko (0)
   - Czasami (1)
   - Często (2)
   - Cały czas (3)

3. **Czy praktykujesz medytację lub mindfulness?** (radio)
   - Nie (0)
   - Próbowałem/am, ale nie regularnie (1)
   - Tak, regularnie (2)

4. **Jak oceniasz swoją jakość życia?** (slider 1-10)
   - 1 = Bardzo niska
   - 10 = Doskonała

**Scoring:**
- stress_level: 1-10
- overwhelmed_frequency: 0-3
- meditation_practice: 0-2
- life_quality: 1-10

---

### 5. Finance Screen
**Cel:** Sytuacja finansowa

**Pytania:**

1. **Jaki jest Twój miesięczny przychód netto?** (select)
   - Poniżej 3000 zł (0)
   - 3000 - 5000 zł (1)
   - 5000 - 8000 zł (2)
   - 8000 - 12000 zł (3)
   - Powyżej 12000 zł (4)

2. **Czy masz zadłużenie (kredyty, pożyczki)?** (radio)
   - Nie (0)
   - Tak, niewielkie (do 10k zł) (1)
   - Tak, średnie (10k-50k zł) (2)
   - Tak, duże (powyżej 50k zł) (3)

3. **Ile masz oszczędności?** (select)
   - Brak lub poniżej 1000 zł (0)
   - 1000 - 5000 zł (1)
   - 5000 - 20000 zł (2)
   - 20000 - 50000 zł (3)
   - Powyżej 50000 zł (4)

4. **Czy planujesz swój budżet?** (radio)
   - Nie, nie wiem ile wydaję (0)
   - Przybliżony plan w głowie (1)
   - Tak, śledzę w excelu/aplikacji (2)

**Scoring:**
- income_level: 0-4
- debt_level: 0-3
- savings_level: 0-4
- budgeting: 0-2

---

### 6. Nutrition Screen
**Cel:** Nawyki żywieniowe

**Pytania:**

1. **Ile posiłków dziennie jesz?** (select)
   - 1-2 (0)
   - 3 (1)
   - 4-5 (2)
   - 6+ (3)

2. **Jak często jesz fast food/niezdrowe jedzenie?** (radio)
   - Codziennie lub prawie codziennie (0)
   - 3-4 razy w tygodniu (1)
   - 1-2 razy w tygodniu (2)
   - Rzadko lub wcale (3)

3. **Czy pijesz wystarczająco dużo wody?** (radio)
   - Nie, poniżej 1L dziennie (0)
   - 1-2L dziennie (1)
   - 2-3L dziennie (2)
   - 3L+ dziennie (3)

4. **Jak oceniasz swoją dietę?** (slider 1-10)
   - 1 = Bardzo niezdrowa
   - 10 = Bardzo zdrowa

**Scoring:**
- meals_per_day: 0-3
- fast_food_frequency: 0-3 (inverted)
- water_intake: 0-3
- diet_quality: 1-10

---

### 7. Goals Screen
**Cel:** Główne cele użytkownika

**Pytanie:** Jakie są Twoje 3 najważniejsze cele? (multi-select, max 3)

**Finance:**
- Wyjść z długów
- Zbudować fundusz awaryjny
- Zacząć inwestować
- Zwiększyć zarobki
- Nauczyć się budżetowania

**Mental:**
- Zmniejszyć stres
- Lepiej spać
- Zacząć medytować
- Poprawić pewność siebie
- Znaleźć balans w życiu

**Physical:**
- Schudnąć
- Przytyć/nabrać masy
- Zwiększyć siłę
- Poprawić kondycję
- Wyleczyć dolegliwości

**Nutrition:**
- Jeść zdrowiej
- Pić więcej wody
- Przestać jeść fast food
- Nauczyć się gotować
- Kontrolować porcje

**Scoring:**
- goals: string[] (max 3)
- Dla każdego celu przypisane jest pillar

---

### 8. Assessment & Results Screen
**Cel:** Pokazać wyniki oceny i rekomendacje

**Kalkulacje:**

#### BMI
```typescript
bmi = weight_kg / (height_m * height_m)

Categories:
- < 18.5: Underweight
- 18.5 - 24.9: Normal
- 25 - 29.9: Overweight
- >= 30: Obese
```

#### Physical Score (0-100)
```typescript
physical_score = (
  (exercise_score / 3) * 25 +
  (fitness_level / 10) * 25 +
  (sleep_hours >= 7 && sleep_hours <= 9 ? 25 : (sleep_hours >= 6 && sleep_hours <= 10 ? 15 : 5)) +
  ((2 - health_issues) / 2) * 25
)

Categories:
- 0-30: Critical - Immediate action needed
- 31-50: Poor - Needs improvement
- 51-70: Fair - On the right track
- 71-85: Good - Keep it up
- 86-100: Excellent - Maintain this level
```

#### Mental Score (0-100)
```typescript
mental_score = (
  ((10 - stress_level) / 10) * 30 +
  ((3 - overwhelmed_frequency) / 3) * 30 +
  (meditation_practice / 2) * 20 +
  (life_quality / 10) * 20
)

Categories: same as physical
```

#### Finance Score (0-100)
```typescript
finance_score = (
  (income_level / 4) * 25 +
  ((3 - debt_level) / 3) * 25 +
  (savings_level / 4) * 25 +
  (budgeting / 2) * 25
)

Categories: same as physical
```

#### Nutrition Score (0-100)
```typescript
nutrition_score = (
  (meals_per_day / 3) * 20 +
  (fast_food_frequency / 3) * 30 +
  (water_intake / 3) * 20 +
  (diet_quality / 10) * 30
)

Categories: same as physical
```

#### Overall Score
```typescript
overall_score = (physical_score + mental_score + finance_score + nutrition_score) / 4
```

**Wyświetlane dane:**

1. **Your Current Status**
   - Overall Score: X/100 (with color: red<50, orange 50-70, yellow 70-85, green 85+)
   - "You are at [Beginner/Intermediate/Advanced] level"

2. **Your Scores by Pillar**
   - 4 karty z score dla każdego pillara
   - Kolor + ikona + tekst opisowy

3. **Health Metrics**
   - BMI: X.X (Category)
   - Ideal weight range: X - Y kg
   - Sleep quality: Good/Fair/Poor

4. **Immediate Actions** (Top 3 priorities based on lowest scores)
   - "Start with these 3 quick wins:"
   - [Pillar] [Action] (button to go to specific lesson)

5. **Your Personalized Path**
   - "We've placed you at the right starting point in each pillar"
   - Finance: Foundation X, Lesson Y
   - Mental: Foundation X, Lesson Y
   - Physical: Foundation X, Lesson Y
   - Nutrition: Foundation X, Lesson Y

**Przyciski:**
- "Start Your Journey" -> Navigate to Dashboard

---

## Ścieżka Dopasowania (Path Placement)

### Scoring System dla dopasowania lekcji:

**Foundation 1 (Beginner):**
- Score: 0-40
- Lekcja startowa: 1

**Foundation 2 (Early Intermediate):**
- Score: 41-55
- Lekcja startowa: 11

**Foundation 3 (Intermediate):**
- Score: 56-70
- Lekcja startowa: 21

**Foundation 4 (Advanced):**
- Score: 71-85
- Lekcja startowa: 31

**Foundation 5 (Expert):**
- Score: 86-100
- Lekcja startowa: 41

---

## Database Schema Changes

### New Table: onboarding_data

```sql
CREATE TABLE IF NOT EXISTS onboarding_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,

  -- Personal Info
  first_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT,
  height_cm INTEGER NOT NULL,
  weight_kg REAL NOT NULL,

  -- Physical Health
  exercise_frequency INTEGER,
  fitness_level INTEGER,
  sleep_hours REAL,
  health_issues INTEGER,
  physical_score REAL,

  -- Mental Health
  stress_level INTEGER,
  overwhelmed_frequency INTEGER,
  meditation_practice INTEGER,
  life_quality INTEGER,
  mental_score REAL,

  -- Finance
  income_level INTEGER,
  debt_level INTEGER,
  savings_level INTEGER,
  budgeting INTEGER,
  finance_score REAL,

  -- Nutrition
  meals_per_day INTEGER,
  fast_food_frequency INTEGER,
  water_intake INTEGER,
  diet_quality INTEGER,
  nutrition_score REAL,

  -- Overall
  overall_score REAL,
  bmi REAL,

  -- Goals
  selected_goals TEXT, -- JSON array of goal IDs

  -- Timestamps
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Update users table:

```sql
ALTER TABLE users ADD COLUMN onboarding_completed INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN first_name TEXT;
```

### Update progress tables to include starting foundation:

```sql
ALTER TABLE finance_progress ADD COLUMN starting_foundation INTEGER DEFAULT 1;
ALTER TABLE mental_health_progress ADD COLUMN starting_foundation INTEGER DEFAULT 1;
ALTER TABLE physical_health_progress ADD COLUMN starting_foundation INTEGER DEFAULT 1;
ALTER TABLE nutrition_progress ADD COLUMN starting_foundation INTEGER DEFAULT 1;
```

---

## Immediate Actions Recommendations

### Physical Health (based on lowest component):
- **Low exercise:** "Start with 10-minute daily walks"
- **Low fitness:** "Try our beginner bodyweight workout"
- **Poor sleep:** "Establish a consistent sleep schedule"
- **Health issues:** "Consult your doctor and start gentle movement"

### Mental Health:
- **High stress:** "Try our 5-minute breathing exercise"
- **Overwhelmed:** "Learn to say no - boundaries lesson"
- **No meditation:** "Start with 2-minute mindfulness"
- **Low life quality:** "Gratitude journal - write 3 things daily"

### Finance:
- **Low income:** "Explore side hustle opportunities"
- **High debt:** "Snowball method - pay smallest debt first"
- **Low savings:** "Start emergency fund with 50 zł weekly"
- **No budgeting:** "Track expenses for 7 days"

### Nutrition:
- **Few meals:** "Add one healthy snack between meals"
- **High fast food:** "Cook one meal at home this week"
- **Low water:** "Drink 1 glass before each meal"
- **Poor diet:** "Add one vegetable to every meal"

---

## UI/UX Guidelines

### Colors:
- Critical (0-30): #EF4444 (red)
- Poor (31-50): #F97316 (orange)
- Fair (51-70): #EAB308 (yellow)
- Good (71-85): #22C55E (green)
- Excellent (86-100): #10B981 (emerald)

### Progress Indicators:
- Show step number (1/8, 2/8, etc.)
- Progress bar at top
- Allow going back (except after assessment)

### Input Validation:
- Real-time validation
- Show errors below fields
- Disable "Next" until valid

### Animations:
- Smooth transitions between screens
- Score counter animations on results screen
- Progress bar animations

---

## TypeScript Types

```typescript
interface OnboardingData {
  // Personal
  firstName: string;
  age: number;
  gender?: string;
  heightCm: number;
  weightKg: number;

  // Physical
  exerciseFrequency: number;
  fitnessLevel: number;
  sleepHours: number;
  healthIssues: number;
  physicalScore: number;

  // Mental
  stressLevel: number;
  overwhelmedFrequency: number;
  meditationPractice: number;
  lifeQuality: number;
  mentalScore: number;

  // Finance
  incomeLevel: number;
  debtLevel: number;
  savingsLevel: number;
  budgeting: number;
  financeScore: number;

  // Nutrition
  mealsPerDay: number;
  fastFoodFrequency: number;
  waterIntake: number;
  dietQuality: number;
  nutritionScore: number;

  // Overall
  overallScore: number;
  bmi: number;

  // Goals
  selectedGoals: string[];
}

interface AssessmentResult {
  overallScore: number;
  scores: {
    physical: number;
    mental: number;
    finance: number;
    nutrition: number;
  };
  bmi: {
    value: number;
    category: string;
    idealWeightRange: { min: number; max: number };
  };
  immediateActions: Array<{
    pillar: Pillar;
    action: string;
    lessonId?: number;
  }>;
  pathPlacement: {
    finance: { foundation: number; lesson: number };
    mental: { foundation: number; lesson: number };
    physical: { foundation: number; lesson: number };
    nutrition: { foundation: number; lesson: number };
  };
}
```

---

## Implementation Order

1. Create database schema updates
2. Create TypeScript types
3. Create onboarding screens (1-7)
4. Implement assessment algorithms
5. Create results screen (8)
6. Update navigation to show onboarding for new users
7. Save data to database
8. Update user profile with onboarding data
9. Set starting foundation/lesson for each pillar
10. Test entire flow

---

## Success Metrics

- Time to complete: Target 2-3 minutes
- Completion rate: Target >80%
- User satisfaction: Accurate assessment
- Engagement: Users start with recommended lessons

---

## Future Enhancements

- Photo upload for progress tracking
- Integration with health apps (Google Fit, Apple Health)
- Periodic re-assessment (every 30 days)
- Share results with friends
- Export onboarding report as PDF
