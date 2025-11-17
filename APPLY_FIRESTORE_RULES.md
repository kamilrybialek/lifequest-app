# 🔐 Apply Firestore Security Rules - 2 MINUTE SETUP

## Your Current Problem

Your Firestore rules are set to block ALL access:
```javascript
allow read, write: if false; // ❌ This blocks everything!
```

This is why your app can't read or write data. Let's fix it! 🚀

---

## Option 1: Copy & Paste in Firebase Console (RECOMMENDED - 2 minutes)

### Step 1: Open Firestore Rules Editor

👉 **Click this link**: https://console.firebase.google.com/project/lifequest-app-331d9/firestore/rules

### Step 2: Delete Everything

Select all the text in the editor (Ctrl+A / Cmd+A) and delete it.

### Step 3: Copy These Rules

Open the `firestore.rules` file in your project and copy ALL the content.

Or copy directly from here:

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
      allow write: if false; // Only admins can modify achievements
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

### Step 4: Paste into Firebase Console

Paste the rules into the Firestore Rules editor.

### Step 5: Click "Publish"

Click the blue **"Publish"** button at the top right.

You should see: ✅ **"Rules published successfully"**

---

## Option 2: Deploy Using Firebase CLI (Advanced - 5 minutes)

If you have Firebase CLI installed:

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firestore in your project
firebase init firestore

# When asked "What file should be used for Firestore Rules?"
# Press Enter to use the default: firestore.rules

# Deploy the rules
firebase deploy --only firestore:rules
```

---

## ✅ Verify Rules Are Applied

1. Go to: https://console.firebase.google.com/project/lifequest-app-331d9/firestore/rules

2. You should see your new rules (not the old `allow read, write: if false;`)

3. Check that it says **"Published"** at the top

---

## 🧪 Test Your App

After publishing the rules:

```bash
npm start
```

1. **Register a new user**:
   - Email: `test@example.com`
   - Password: `password123`

2. **Check Firestore Data**:
   - Go to: https://console.firebase.google.com/project/lifequest-app-331d9/firestore/data
   - You should see `users` and `user_stats` collections created! ✅

3. **Complete a task**:
   - Complete any daily task in the app
   - Check Firestore - XP and level should update! ✅

---

## 🔐 What These Rules Do

✅ **Users can only access their own data** - `isOwner(userId)` checks user_id matches
✅ **Must be logged in** - `isAuthenticated()` requires valid Firebase Auth token
✅ **Daily tasks are protected** - Can only read/write tasks with your user_id
✅ **Achievements are read-only** - Users can't modify achievements directly

**Example**: User A (uid: "abc123") can ONLY access:
- `/users/abc123` ✅
- `/user_stats/abc123` ✅
- `/daily_tasks/xyz` where `user_id == "abc123"` ✅

User A CANNOT access:
- `/users/def456` ❌ (different user)
- `/user_stats/def456` ❌ (different user)

---

## 🆘 Troubleshooting

### Error: "Missing or insufficient permissions"

**Cause**: Rules not published yet
**Solution**: Make sure you clicked "Publish" in Firebase Console

---

### Error: "PERMISSION_DENIED"

**Cause**: User not authenticated
**Solution**:
1. Check Firebase Auth is enabled: https://console.firebase.google.com/project/lifequest-app-331d9/authentication/providers
2. Make sure Email/Password is **Enabled**
3. Try logging out and back in

---

### Rules show as "Published" but app still fails

**Solution**:
1. Clear browser cache
2. Hard reload (Ctrl+Shift+R / Cmd+Shift+R)
3. Check browser console for specific error messages
4. Verify you're using the correct Firebase project ID in `firebase.ts`

---

## 📊 Monitor Rules Usage

Check if your rules are working:

1. Go to: https://console.firebase.google.com/project/lifequest-app-331d9/firestore/usage

2. You should see:
   - **Reads**: Increasing when users load data ✅
   - **Writes**: Increasing when users complete tasks ✅
   - **Denied requests**: Should be 0 (or very low) ✅

---

## 🎯 Next Steps After Rules Are Applied

1. ✅ Rules published
2. ✅ Test registration and login
3. ✅ Complete a task and verify XP updates
4. ✅ Check Firestore Console to see your data
5. 🚀 Deploy your app!

---

**That's it!** Once you publish these rules, your app will work perfectly with Firebase! 🎉
