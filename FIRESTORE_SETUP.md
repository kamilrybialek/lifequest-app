# Firestore Configuration for LifeQuest App

## 🔥 Critical Issues to Fix

Your app is experiencing Firestore permission and index errors. Follow these steps to fix them.

---

## 1. Security Rules (Missing Permissions)

### Current Error:
```
FirebaseError: Missing or insufficient permissions
```

### Solution:

Go to Firebase Console → Firestore Database → Rules and update your security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection - authenticated users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Financial profiles - authenticated users can read/write their own
    match /financial_profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Expenses - authenticated users can read/write their own
    match /expenses/{expenseId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.user_id;
    }

    // Income - authenticated users can read/write their own
    match /income/{incomeId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.user_id;
    }

    // Health metrics - authenticated users can read/write their own
    match /health_metrics/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Weekly health quizzes - authenticated users can read/write their own
    match /weekly_health_quizzes/{quizId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.user_id;
    }

    // User stats - authenticated users can read/write their own
    match /user_stats/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Streaks - authenticated users can read/write their own
    match /streaks/{streakId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.user_id;
    }

    // Daily tasks - authenticated users can read/write their own
    match /daily_tasks/{taskId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.user_id;
    }
  }
}
```

Click **"Publish"** to apply the rules.

---

## 2. Composite Indexes (Missing Indexes)

### Current Errors:
```
The query requires an index. You can create it here: https://console.firebase.google.com/...
```

### Solution:

Click on each of these links (from your console errors) to create the indexes:

#### For `expenses` collection:
**Index Fields:**
- `user_id` (Ascending)
- `date` (Descending)
- `__name__` (Descending)

**Direct Link (from your error):**
```
https://console.firebase.google.com/v1/r/project/lifequest-app-331d9/firestore/indexes?create_composite=ClRwcm9qZWN0cy9saWZlcXVlc3QtYXBwLTMzMWQ5L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9leHBlbnNlcy9pbmRleGVzL18QARoLCgd1c2VyX2lkEAEaCAoEZGF0ZRACGgwKCF9fbmFtZV9fEAI
```

#### For `income` collection:
**Index Fields:**
- `user_id` (Ascending)
- `date` (Descending)
- `__name__` (Descending)

**Direct Link (from your error):**
```
https://console.firebase.google.com/v1/r/project/lifequest-app-331d9/firestore/indexes?create_composite=ClJwcm9qZWN0cy9saWZlcXVlc3QtYXBwLTMzMWQ5L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9pbmNvbWUvaW5kZXhlcy9fEAEaCwoHdXNlcl9pZBABGggKBGRhdGUQAhoMCghfX25hbWVfXxAI
```

#### For `weekly_health_quizzes` collection:
**Index Fields:**
- `user_id` (Ascending)
- `quiz_date` (Descending)
- `__name__` (Descending)

You may need to create this manually:
1. Go to Firebase Console → Firestore → Indexes
2. Click **"Create Index"**
3. Collection: `weekly_health_quizzes`
4. Add fields: `user_id` (Ascending), `quiz_date` (Descending)
5. Click **"Create"**

**Note:** Indexes take a few minutes to build. You'll see "Building..." status.

---

## 3. Testing After Setup

After applying security rules and creating indexes:

1. **Clear browser cache** or open in incognito
2. **Refresh your app**
3. Try completing the weekly health quiz
4. Check Life Score loads correctly

---

## ✅ Checklist

- [ ] Security rules updated and published
- [ ] Expenses index created
- [ ] Income index created
- [ ] Weekly health quizzes index created
- [ ] All indexes show "Enabled" status (not "Building...")
- [ ] App tested and working

---

## 🆘 If Issues Persist

Check the browser console for specific error messages and share them. Common issues:

- **Still getting permissions errors?** → Double-check security rules were published
- **Index errors?** → Wait 2-3 minutes for indexes to finish building
- **Auth errors?** → Make sure you're logged in with a valid Firebase account

---

## 📝 Notes

- These security rules ensure users can only access their own data
- Indexes are required for efficient querying with multiple filters
- The app queries expenses/income filtered by `user_id` and `date` range
