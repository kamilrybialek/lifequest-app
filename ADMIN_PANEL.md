# 🔐 LifeQuest Admin Panel

Panel administracyjny do zarządzania aplikacją LifeQuest.

## 📋 Funkcje

### ✅ Zaimplementowane:

1. **👥 Zarządzanie Użytkownikami**
   - Lista wszystkich użytkowników
   - Szczegóły profilu (XP, level, streaki)
   - Aktywność użytkowników

2. **✅ Template Zadań**
   - Tworzenie nowych szablonów zadań
   - Edycja i usuwanie zadań
   - Losowanie zadań dla użytkowników

3. **📝 Zarządzanie Contentem**
   - Tworzenie lekcji, artykułów, tipów
   - Publikowanie/odpublikowywanie contentu
   - Organizacja po filarach

4. **🔔 Push Notifications**
   - Wysyłanie powiadomień do użytkowników
   - Segmentacja (wszyscy/aktywni/nieaktywni)
   - Planowanie powiadomień

5. **📊 Analytics**
   - Liczba użytkowników (total/active)
   - Statystyki zadań
   - Completion rate
   - Tracking metryk

6. **📜 Activity Logs**
   - Historia działań adminów
   - Audyt zmian w systemie

## 🚀 Jak Uruchomić

### 1. Backend API

```bash
cd admin-api
npm install
npm run dev
```

API będzie dostępne na `http://localhost:3001`

### 2. Frontend (Admin Panel)

Otwórz w przeglądarce:
```
admin-panel/index.html
```

Lub użyj prostego serwera:
```bash
cd admin-panel
python3 -m http.server 8000
# Otwórz: http://localhost:8000
```

### 3. Login

**Email:** `kamil.rybialek@gmail.com`

Panel jest zabezpieczony i dostępny TYLKO dla tego adresu email.

## 📁 Struktura Projektu

```
lifequest-app/
├── admin-api/                 # Backend API (Express + SQLite)
│   ├── src/
│   │   └── index.ts          # Main API server
│   ├── package.json
│   └── tsconfig.json
│
├── admin-panel/               # Frontend Panel (HTML/JS)
│   └── index.html            # Single-page admin UI
│
├── src/database/
│   ├── init.ts               # Extended schema with admin tables
│   └── admin.ts              # Admin database queries
│
└── lifequest.db              # SQLite database (shared)
```

## 🗄️ Nowe Tabele w Bazie Danych

### Admin Tables:

- `admin_users` - Administratorzy (tylko kamil.rybialek@gmail.com)
- `admin_activity_logs` - Logi aktywności adminów
- `task_templates` - Szablony zadań do losowania
- `content_items` - Zarządzanie contentem (lekcje, artykuły)
- `push_notifications` - Powiadomienia push
- `user_activity` - Tracking aktywności użytkowników
- `app_analytics` - Metryki aplikacji
- `user_feedback` - Feedback od użytkowników

## 🔌 API Endpoints

### Authentication
- `POST /api/admin/login` - Login admina

### User Management
- `GET /api/admin/users` - Lista użytkowników
- `GET /api/admin/users/:id` - Szczegóły użytkownika

### Analytics
- `GET /api/admin/analytics` - Podsumowanie statystyk

### Task Templates
- `GET /api/admin/task-templates` - Lista szablonów
- `POST /api/admin/task-templates` - Tworzenie szablonu
- `DELETE /api/admin/task-templates/:id` - Usuwanie szablonu

### Content Management
- `GET /api/admin/content` - Lista contentu
- `POST /api/admin/content` - Tworzenie contentu

### Push Notifications
- `GET /api/admin/notifications` - Lista powiadomień
- `POST /api/admin/notifications` - Tworzenie powiadomienia

### Activity Logs
- `GET /api/admin/activity-logs` - Historia działań

### Feedback
- `GET /api/admin/feedback` - Lista feedbacku od użytkowników

## 🔐 Bezpieczeństwo

### Obecnie:
- Prosta autentykacja przez email header (`x-admin-email`)
- Tylko `kamil.rybialek@gmail.com` ma dostęp
- Admin user automatycznie tworzony przy inicjalizacji DB

### Do Implementacji w Przyszłości:
- [ ] JWT tokens z expiracją
- [ ] OAuth2 (Google login)
- [ ] Rate limiting
- [ ] HTTPS w produkcji
- [ ] Session management
- [ ] Two-factor authentication (2FA)

## 📱 Integracja z Aplikacją Mobilną

Panel używa tej samej bazy SQLite co aplikacja mobilna (`lifequest.db`), więc wszystkie zmiany są natychmiastowe.

### Przykład użycia:

1. **Tworzenie nowego zadania w panelu**
   → Zadanie automatycznie pojawi się w puli losowania dla użytkowników

2. **Wysyłanie push notification**
   → Użytkownicy otrzymają powiadomienie w aplikacji

3. **Publikowanie nowej lekcji**
   → Lekcja pojawi się w odpowiednim filarze

## 🌐 Dostęp przez Stronę vs Aplikację

### Strona Webowa (admin-panel/index.html):
- ✅ Pełny dostęp do wszystkich funkcji
- ✅ Zarządzanie użytkownikami
- ✅ Tworzenie contentu
- ✅ Analytics

### Aplikacja Mobilna:
- 🔜 Do zaimplementowania: Admin mode w aplikacji
- 🔜 Wyświetlanie tylko dla admina
- 🔜 Podstawowe funkcje (notifications, feedback)

## 🔄 Następne Kroki

### High Priority:
- [ ] Deploy backend API (Heroku/Railway/Vercel)
- [ ] Połączenie z prawdziwą bazą (PostgreSQL)
- [ ] Push notifications integration (Expo)
- [ ] Admin mode w aplikacji mobilnej

### Medium Priority:
- [ ] Dashboard charts (Chart.js)
- [ ] Bulk operations (delete users, etc.)
- [ ] Export data (CSV, JSON)
- [ ] Backup & restore funkcje

### Low Priority:
- [ ] Dark mode dla panelu
- [ ] Mobile-responsive admin panel
- [ ] Email notifications do adminów
- [ ] Scheduled tasks (cron jobs)

## 🎯 Przykładowe Scenariusze Użycia

### 1. Dodanie Nowego Zadania
1. Login do panelu
2. Zakładka "Task Templates"
3. Kliknij "+ Create New Task"
4. Wypełnij formularz (Pillar, Title, Duration, XP)
5. Zapisz - zadanie trafi do puli losowania

### 2. Wysłanie Powiadomienia
1. Zakładka "Notifications"
2. Kliknij "+ Send Notification"
3. Wpisz tytuł i treść
4. Wybierz segment (All/Active/Inactive)
5. Wyślij - użytkownicy dostaną push

### 3. Sprawdzenie Statystyk
1. Dashboard - widok główny
2. Zobacz karty: Total Users, Active Users, Completion Rate
3. Zakładka "Activity Logs" - historia zmian

## 💡 Tips

- Backend API musi być uruchomiony, żeby panel działał
- Baza SQLite znajduje się w głównym katalogu projektu
- Wszystkie zmiany w panelu są logowane w `admin_activity_logs`
- Do testowania używaj `npm run dev` dla auto-reload

## 🐛 Troubleshooting

**Problem:** Panel nie łączy się z API
**Rozwiązanie:** Upewnij się, że backend działa na `localhost:3001`

**Problem:** Brak danych w tabelach
**Rozwiązanie:** Uruchom aplikację mobilną raz, żeby zainicjalizować bazę

**Problem:** "Admin not found"
**Rozwiązanie:** Sprawdź czy używasz email: `kamil.rybialek@gmail.com`

---

**Built with ❤️ for LifeQuest**
