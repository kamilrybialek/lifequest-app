# 🔥 WAŻNE - Włącz Firestore Database!

## ❌ Błąd który widzisz:

```
WebChannelConnection RPC 'Listen' stream errored
AbortError: Fetch is aborted
```

**To oznacza że Firestore Database NIE JEST WŁĄCZONY w Twoim projekcie Firebase!**

---

## ✅ KROK 1: Włącz Firestore Database (2 minuty)

### 1.1 Otwórz Firestore

👉 **Kliknij ten link:**
```
https://console.firebase.google.com/project/lifequest-app-331d9/firestore
```

### 1.2 Sprawdź czy widzisz "Create database"

Jeśli widzisz przycisk **"Create database"** lub **"Get started"** - kliknij go!

### 1.3 Wybierz tryb

Gdy zapyta "Start in production mode or test mode?":

**WYBIERZ: "Start in production mode"** (będziemy dodawać security rules ręcznie)

Kliknij **"Next"**

### 1.4 Wybierz lokalizację

**WYBIERZ: "europe-west3 (Frankfurt)"** lub najbliższą Ci lokalizację w Europie

Kliknij **"Enable"**

⏱️ **Poczekaj 30-60 sekund** aż Firestore się utworzy.

---

## ✅ KROK 2: Dodaj Security Rules

Po utworzeniu Firestore:

### 2.1 Przejdź do Rules

Kliknij zakładkę **"Rules"** (na górze)

Lub otwórz:
```
https://console.firebase.google.com/project/lifequest-app-331d9/firestore/rules
```

### 2.2 Usuń domyślne reguły

Zaznacz wszystko (Ctrl+A) i usuń.

### 2.3 Wklej te reguły:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user owns the document
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if isAuthenticated() && isOwner(userId);
    }

    // User stats - users can only access their own stats
    match /user_stats/{userId} {
      allow read, write: if isAuthenticated() && isOwner(userId);
    }

    // Daily tasks - users can only access their own tasks
    match /daily_tasks/{taskId} {
      allow read, write: if isAuthenticated() &&
                            resource.data.user_id == request.auth.uid;
      allow create: if isAuthenticated() &&
                       request.resource.data.user_id == request.auth.uid;
    }

    // Achievements - read-only for all authenticated users
    match /achievements/{achievementId} {
      allow read: if isAuthenticated();
      allow write: if false;
    }

    // User achievements - users can only access their own
    match /user_achievements/{achievementId} {
      allow read, write: if isAuthenticated() &&
                            resource.data.user_id == request.auth.uid;
      allow create: if isAuthenticated() &&
                       request.resource.data.user_id == request.auth.uid;
    }
  }
}
```

### 2.4 Kliknij "Publish"

---

## ✅ GOTOWE!

Teraz odśwież aplikację (Ctrl+Shift+R) i spróbuj ponownie.

Błąd "WebChannelConnection" powinien zniknąć! ✅

---

## 🧪 Testuj z kontem demo

Po naprawieniu, możesz zalogować się jako:

**Email:** `demo@demo.com`
**Hasło:** `demodemo`

(Zostanie automatycznie utworzone przy pierwszym logowaniu)

---

## 🆘 Jeśli nadal nie działa

1. **Sprawdź czy Email/Password auth jest włączony:**
   ```
   https://console.firebase.google.com/project/lifequest-app-331d9/authentication/providers
   ```
   - Kliknij "Email/Password"
   - Upewnij się że pierwszy przełącznik (Email/Password) jest **Enabled**
   - Kliknij "Save"

2. **Wyczyść cache przeglądarki:**
   - Ctrl+Shift+Delete
   - Zaznacz "Cached images and files"
   - Kliknij "Clear data"

3. **Pokaż mi błędy z konsoli:**
   - Naciśnij F12
   - Zakładka "Console"
   - Skopiuj wszystkie czerwone błędy
