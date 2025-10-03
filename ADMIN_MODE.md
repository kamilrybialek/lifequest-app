# 🔧 Admin Mode - Instrukcja

Admin Mode jest teraz **wbudowany w aplikację mobilną** i dostępny tylko dla `kamil.rybialek@gmail.com`.

## 🎯 Jak Uruchomić

### 1. Uruchom Backend API

```bash
# W nowym terminalu
cd admin-api
npm install
npm run dev
```

API będzie działać na `http://localhost:3001`

### 2. Uruchom Aplikację

```bash
# W głównym katalogu projektu
npm start
```

### 3. Zaloguj się jako Admin

1. Otwórz aplikację w Expo Go / symulatorze
2. Zaloguj się emailem: **`kamil.rybialek@gmail.com`**
3. Zobaczysz dodatkową zakładkę **"Admin"** w bottom nav (⚙️ ikona)

## ✨ Funkcje Admin Mode

### 📊 Analytics Tab
- Total Users
- Active Users (7 dni)
- Total Tasks
- Completion Rate

### 👥 Users Tab
- Lista wszystkich użytkowników
- XP, Level, Streaki dla każdego
- Pull-to-refresh

### ✅ Tasks Tab
- Tworzenie nowych task templates
- Lista wszystkich szablonów
- Usuwanie zadań
- Zadania są losowane dla użytkowników

### 🔔 Notifications Tab
- Wysyłanie push notifications
- Segmentacja: All / Active / Inactive
- Historia wysłanych powiadomień

## 🔄 Workflow

### Dodanie Nowego Zadania:
1. Kliknij zakładkę **Admin** (⚙️)
2. Przejdź do **Tasks**
3. Kliknij **"Create Task Template"**
4. Wypełnij formularz:
   - Pillar (Finance/Mental/Physical/Nutrition)
   - Title
   - Description
   - Duration (minuty)
   - XP Reward
   - Difficulty
5. **Create Task** - gotowe!

Zadanie automatycznie pojawi się w puli losowania dla użytkowników.

### Wysłanie Powiadomienia:
1. Zakładka **Admin** → **Push**
2. **"Send Push Notification"**
3. Wypełnij:
   - Title
   - Message
   - Target (all/active/inactive)
4. **Send Now**

### Sprawdzanie Statystyk:
1. Zakładka **Admin** → **Stats**
2. Pull-to-refresh dla odświeżenia
3. Zobacz metryki w czasie rzeczywistym

## 🔐 Bezpieczeństwo

- Zakładka Admin **widoczna TYLKO** dla `kamil.rybialek@gmail.com`
- Inne użytkownicy NIE widzą tej zakładki
- Wszystkie API requesty wymagają auth header
- Backend sprawdza email przed każdą operacją

## 🌐 Wersja PWA

Aplikacja działa również jako PWA:

```bash
npx expo start --web
```

Panel admin będzie dostępny w wersji webowej również!

## 📱 Dostęp w Aplikacji vs Strona Web

### Aplikacja Mobilna (Teraz ✅):
- Admin tab w bottom navigation
- Native controls
- Pull-to-refresh
- Mobilne formularze

### Strona Web (admin-panel/index.html):
- Alternatywny interfejs
- Więcej miejsca na desktop
- Większe tabele
- Lepsze dla zarządzania dużą ilością danych

**Możesz używać obu jednocześnie!**

## 🔧 Troubleshooting

**Problem:** Zakładka Admin nie widoczna
**Rozwiązanie:** Sprawdź czy jesteś zalogowany jako `kamil.rybialek@gmail.com`

**Problem:** "Failed to connect to server"
**Rozwiązanie:** Upewnij się że backend API działa (`cd admin-api && npm run dev`)

**Problem:** Brak danych w Admin
**Rozwiązanie:** Backend łączy się z lokalną bazą SQLite (`lifequest.db`)

## 🚀 Deployment

### Backend API:
```bash
# Deploy to Railway/Heroku/Vercel
# Zmień ADMIN_API_URL w src/screens/AdminScreen.tsx
```

### Aplikacja:
```bash
# Build PWA
npx expo export:web

# Deploy do Netlify/Vercel
```

## 📋 To-Do Next

- [ ] Deploy backend API
- [ ] Zmienić SQLite na PostgreSQL dla produkcji
- [ ] Dodać prawdziwe push notifications (Expo)
- [ ] Charts dla analytics (recharts/victory)
- [ ] Bulk operations (delete multiple users)
- [ ] Export data (CSV/JSON)

---

**Built with ❤️ - Admin Mode jest teraz częścią aplikacji!**
