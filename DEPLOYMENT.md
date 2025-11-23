# 🚀 LifeQuest Deployment Guide

## ✅ Build Status

**Last Build:** November 23, 2025  
**Build Output:** `dist/` directory  
**Bundle Size:** 3.19 MB (minified)  
**Status:** ✅ Ready for deployment

---

## 📦 Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest)

#### Method A: Vercel CLI (Local)

```bash
# 1. Login to Vercel
vercel login

# 2. Deploy to production
vercel --prod

# 3. Your app will be live at: https://lifequest-*.vercel.app
```

#### Method B: GitHub Integration (Automatic)

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Project"
3. Select your GitHub repository: `kamilrybialek/lifequest-app`
4. Configure:
   - **Framework Preset:** Other
   - **Build Command:** `npx expo export --platform web`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Click "Deploy"

**Environment Variables (if needed):**
```
NODE_ENV=production
```

**Result:** Automatic deployments on every push to main branch! 🎉

---

### Option 2: Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Build project (already done!)
# npx expo export --platform web

# 3. Deploy to Netlify
netlify deploy --prod --dir=dist
```

---

## 🎯 Recommended: Vercel GitHub Integration

**Setup Steps:**

1. ✅ Push your code to GitHub (Already done!)
2. Go to [vercel.com](https://vercel.com)
3. Sign in with GitHub
4. Click "Import Project"
5. Select `lifequest-app` repository
6. Click "Deploy"

**Your app will be live in ~2 minutes at:**
```
https://lifequest-app.vercel.app
```

---

## 📱 PWA Features

After deployment, your app will have:

✅ **Install to Home Screen** (iOS & Android)  
✅ **Offline Support** (Service Worker)  
✅ **Push Notifications** (Firebase)  
✅ **Full-Screen Mode** (Standalone app)  
✅ **App Icon & Splash Screen**

---

## 🔧 Firebase Configuration

**Firebase is already configured!**

- **Project ID:** lifequest-app-331d9
- **Auth Domain:** lifequest-app-331d9.firebaseapp.com
- No additional environment variables needed!

**After deployment:** Add your Vercel domain to Firebase authorized domains:
- Firebase Console → Authentication → Settings → Authorized domains
- Add: `your-app.vercel.app`

---

## 🧪 Testing Deployment Locally

```bash
# 1. Build
npx expo export --platform web

# 2. Serve locally
npx serve dist

# 3. Open http://localhost:3000
```

---

## 🔄 Continuous Deployment

Once connected to Vercel:

```bash
git add .
git commit -m "feat: Add new feature"
git push origin main

# ✨ Automatic deployment triggered!
```

---

**Built with ❤️ using React Native, Expo & Firebase**

**Version:** 2.1.3-pwa-fix  
**Last Updated:** November 23, 2025
