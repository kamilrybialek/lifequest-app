# 🔥 FIREBASE SETUP - 5 MINUT

## KROK 1: Utwórz projekt Firebase (2 minuty)

### 1.1 Otwórz Firebase Console
👉 **Kliknij:** https://console.firebase.google.com

### 1.2 Dodaj projekt
1. Kliknij **"Add project"** (lub "Dodaj projekt")
2. Nazwa projektu: `lifequest-app` (lub dowolna)
3. Kliknij **"Continue"**
4. **Wyłącz** Google Analytics (nie potrzebujemy)
5. Kliknij **"Create project"**
6. Poczekaj ~30 sekund
7. Kliknij **"Continue"**

✅ **Projekt utworzony!**

---

## KROK 2: Zarejestruj Web App (1 minuta)

### 2.1 Dodaj aplikację
1. Na głównym ekranie projektu, kliknij ikonę **`</>`** (Web)
2. App nickname: `lifequest-web`
3. **NIE zaznaczaj** "Firebase Hosting" (nie potrzebujemy)
4. Kliknij **"Register app"**

### 2.2 Skopiuj konfigurację
Zobaczysz kod podobny do tego:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "lifequest-app.firebaseapp.com",
  projectId: "lifequest-app",
  storageBucket: "lifequest-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

**SKOPIUJ TEN CAŁY OBIEKT** (zaznacz wszystko między { i })

### 2.3 Wklej mi go tutaj
Po skopiowaniu kliknij **"Continue to console"**

**WKLEJ MI firebaseConfig W ODPOWIEDZI** - zintegruję go automatycznie!

---

## KROK 3: Włącz Email Authentication (30 sekund)

1. W lewym menu kliknij **"Authentication"**
2. Kliknij **"Get started"**
3. Kliknij **"Email/Password"** w liście providerów
4. Włącz pierwszy toggle **(Email/Password)**
5. Kliknij **"Save"**

✅ **Authentication gotowy!**

---

## KROK 4: Włącz Firestore Database (1 minuta)

1. W lewym menu kliknij **"Firestore Database"**
2. Kliknij **"Create database"**
3. Wybierz **"Start in test mode"** (będzie prostsze na start)
4. Kliknij **"Next"**
5. Location: **eur3 (europe-west)** (najbliżej Polski)
6. Kliknij **"Enable"**
7. Poczekaj ~20 sekund

✅ **Firestore gotowy!**

---

## ✅ GOTOWE! Teraz wklej mi firebaseConfig

Po wykonaniu wszystkich kroków, **wklej mi obiekt firebaseConfig**.

Będzie wyglądać tak:
```javascript
{
  apiKey: "AIza...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}
```

**Jak go znaleźć jeśli nie skopiowałeś:**
1. W Firebase Console, kliknij ikonę ⚙️ (Settings) → Project settings
2. Scroll w dół do "Your apps"
3. Znajdź swoją web app
4. Skopiuj `firebaseConfig`

**WKLEJ TO TUTAJ** → resztę zrobię automatycznie! 🚀
