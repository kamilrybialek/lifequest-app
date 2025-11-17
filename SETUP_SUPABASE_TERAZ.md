# 🚀 SETUP SUPABASE - KROK PO KROKU

## ⚠️ WAŻNE: Wykonaj te kroki TERAZ, aby aplikacja zadziałała!

---

## KROK 1: Uruchom SQL w Supabase (2 minuty)

### 1.1 Otwórz SQL Editor

1. Kliknij ten link: https://supabase.com/dashboard/project/bxofbbqocwnhwjgykhqd/sql
2. Kliknij **"+ New query"** (zielony przycisk w prawym górnym rogu)

### 1.2 Skopiuj i wklej SQL

1. Otwórz plik `supabase-schema.sql` (jest w katalogu głównym projektu)
2. Zaznacz CAŁĄ zawartość (Ctrl+A / Cmd+A)
3. Skopiuj (Ctrl+C / Cmd+C)
4. Wróć do Supabase SQL Editor
5. Wklej (Ctrl+V / Cmd+V)

### 1.3 Uruchom SQL

1. Kliknij **"Run"** (lub naciśnij `Ctrl+Enter` / `Cmd+Enter`)
2. Poczekaj 5-10 sekund
3. Powinieneś zobaczyć: ✅ **"Success. No rows returned"**

### 1.4 Sprawdź czy tabele są utworzone

1. Kliknij **"Table Editor"** w lewym menu
2. Powinieneś zobaczyć te tabele:
   - ✅ users
   - ✅ user_stats
   - ✅ daily_tasks
   - ✅ finance_progress
   - ✅ mental_progress
   - ✅ physical_progress
   - ✅ nutrition_progress
   - ✅ achievements
   - ✅ user_achievements

**Jeśli wszystkie są widoczne - KROK 1 GOTOWY!** ✅

---

## KROK 2: Wyłącz Email Confirmation (1 minuta)

**DLACZEGO:** Aby móc się szybko rejestrować bez czekania na email

1. Idź do: https://supabase.com/dashboard/project/bxofbbqocwnhwjgykhqd/auth/providers
2. Kliknij **"Email"** w sekcji "Auth Providers"
3. Znajdź **"Confirm email"**
4. Wyłącz (toggle na OFF)
5. Kliknij **"Save"**

**KROK 2 GOTOWY!** ✅

---

## KROK 3: Zbuduj i przetestuj aplikację

### 3.1 Build aplikacji

```bash
npm start
```

Poczekaj aż aplikacja się zbuduje (30-60 sekund)

### 3.2 Zarejestruj testowego użytkownika

1. Otwórz aplikację
2. Kliknij **"Sign Up"** (Zarejestruj się)
3. Wpisz:
   - Email: `test@example.com`
   - Password: `password123`
4. Kliknij **"Register"**

### 3.3 Sprawdź w Supabase Dashboard

1. Idź do: https://supabase.com/dashboard/project/bxofbbqocwnhwjgykhqd/auth/users
2. Powinieneś zobaczyć **test@example.com** na liście użytkowników ✅

3. Idź do: https://supabase.com/dashboard/project/bxofbbqocwnhwjgykhqd/editor
4. Kliknij tabelę **"users"**
5. Powinieneś zobaczyć wiersz z **test@example.com** ✅

6. Kliknij tabelę **"user_stats"**
7. Powinieneś zobaczyć wiersz z tym samym user_id (automatycznie utworzony!) ✅

**Jeśli wszystko działa - GOTOWE!** 🎉

---

## ❌ Co robić jeśli coś nie działa?

### Problem: "Authentication failed" podczas rejestracji

**Rozwiązanie:**
1. Sprawdź czy wykonałeś KROK 2 (wyłączenie email confirmation)
2. Sprawdź console w przeglądarce (F12) - pokaż mi błędy
3. Spróbuj innego emaila (np. `test2@example.com`)

### Problem: Tabele nie pojawiają się

**Rozwiązanie:**
1. Upewnij się że skopiowałeś CAŁY plik `supabase-schema.sql`
2. Spróbuj uruchomić SQL ponownie
3. Sprawdź "Logs" → "Postgres Logs" w Supabase czy są błędy

### Problem: "User not found" podczas logowania

**Rozwiązanie:**
1. Najpierw zarejestruj się (Sign Up)
2. Dopiero potem loguj się (Sign In)

### Problem: Biały ekran po zalogowaniu

**Rozwiązanie:**
1. Sprawdź console (F12) - pokaż mi błędy
2. Upewnij się że tabele są utworzone (KROK 1)
3. Wyloguj się i zaloguj ponownie

---

## 📊 Co się zmieniło?

### PRZED (AsyncStorage/SQLite):
- ❌ Nie działało na web
- ❌ Dane tylko na jednym urządzeniu
- ❌ Brak prawdziwej autentykacji

### TERAZ (Supabase):
- ✅ Działa na web, iOS, Android
- ✅ Synchronizacja między urządzeniami
- ✅ Prawdziwa autentykacja z JWT
- ✅ Bezpieczne hasła (bcrypt)
- ✅ Dane w chmurze z backupami

---

## 🆘 Nadal nie działa?

1. Pokaż mi logi z console (F12 → Console)
2. Powiedz mi dokładnie na którym kroku jest problem
3. Zrób screenshot błędu

Pomogę Ci natychmiast! 🚀
