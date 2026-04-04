# LifeQuest - Opis Projektu (Claude Project)

## O aplikacji

**LifeQuest** to holistyczna aplikacja do samorozwoju oparta na grywalizacji. Slogan: "4 Pillars. One Journey. Better You."

Aplikacja pomaga uzytkownikowi rozwijac sie w 4 filarach zycia poswiecajac 20 minut dziennie (5 min na filar):
- **Finance** (zloty) - wolnosc finansowa, budzet, dlug, oszczednosci
- **Mental Health** (niebieski) - focus, dopamina, mindfulness, rutyny
- **Physical Health** (czerwony) - trening, sen, pomiary ciala
- **Nutrition** (zielony) - posilki, nawodnienie, kalorie

## Tech Stack

- **Frontend**: React Native (Expo) - cross-platform (iOS, Android, Web/PWA)
- **Jezyk**: TypeScript
- **State**: Zustand
- **Nawigacja**: React Navigation (bottom tabs + native stack)
- **UI**: React Native Paper + custom dark theme
- **Backend**: Firebase (Auth + Firestore)
- **Lokalna baza**: SQLite (offline-first) + AsyncStorage
- **Powiadomienia**: Expo Notifications

## Struktura aplikacji - 5 zakladek

1. **Home** - Dashboard ze streakami, daily quests (4 zadania dziennie), AI Coach insights, pillar progress grid
2. **Paths** - Sciezki nauki w stylu Duolingo: Finance (10 Baby Steps), Mental (5 Foundations), Physical (5 Foundations), Nutrition (8 Foundations)
3. **Arena** - Liga tygodniowa (Bronze/Silver/Gold/Diamond), Season Pass (7 tierow), Weekly Chest
4. **Tools** - 18 narzedzi: Budget Manager, Expense Logger, Debt Tracker, Emergency Fund, Savings Goals, Subscriptions, Net Worth, Dopamine Detox, Screen Time, Morning Routine, Meditation Timer, Workout Tracker, Exercise Logger, Sleep Tracker, Body Measurements, Meal Logger, Water Tracker, Calorie Calculator
5. **Profile** - Level/XP, statystyki, osiagniecia (achievements), ustawienia

## Systemy grywalizacji

- **Streaki** - osobny streak per filar (current + longest), ochrona streakiem z season pass
- **Level/XP** - 100 XP na level, XP za zadania (15), lekcje (50), streaki (5/dzien), osiagniecia (75), bonus dzienny (50)
- **Ligi** - 4 tiery, 20 graczy, top 3 awansuje, bottom 5 degraduje, reset co tydzien
- **Season Pass** - 7 tierow nagrod (odznaki, streak shields, XP boosty, motywy), sezon 90 dni
- **Achievements** - system odznaczek z warunkami i popupami
- **AI Coach** - kontekstowe podpowiedzi (tip/alert/praise/prediction) na dashboardzie

## Architektura

- **Offline-first**: dane lokalne w SQLite, sync z Firebase w tle
- **Zustand stores**: authStore, appStore, seasonStore, goalsStore, financeStore, settingsStore, onboardingStore
- **Firebase services**: firebaseUserService, firebaseFinanceService, firebaseTaskService, dashboardService, healthDataSync, syncService
- **Design system**: `/src/theme/lifequest3.ts` - dark-first, neonowe akcenty, pillar colors, gradienty, glow-efekty

## Kluczowe pliki

- `/src/navigation/` - TabNavigatorNew (bottom tabs), MainNavigator (stack)
- `/src/screens/` - 43 ekrany (auth, dashboard, paths, tools, profile)
- `/src/store/` - Zustand stores (auth, app, season, goals, finance, settings)
- `/src/services/` - Firebase services, sync, analytics
- `/src/components/` - wspoldzielone komponenty UI
- `/src/theme/lifequest3.ts` - design system (kolory, gradienty, typografia, spacing)
- `/src/types/index.ts` - typy TypeScript (User, Task, Pillar, UserProgress, Streak, Achievement)
- `/src/database/` - SQLite schema i operacje
