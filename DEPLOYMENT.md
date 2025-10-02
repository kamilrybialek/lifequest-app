# 🚀 LifeQuest - Deployment Instructions

## GitHub Setup

### 1. Create New Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `lifequest-app` (or your preferred name)
3. Description: "Personal growth app - Finance, Mental, Physical, Nutrition tracking"
4. Visibility: **Public** (required for free PWA hosting)
5. **DO NOT** initialize with README, .gitignore, or license (we already have them)
6. Click "Create repository"

### 2. Push to GitHub

```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/lifequest-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## PWA Deployment (Choose One)

### Option 1: Vercel (Recommended - Easiest) ⭐

**Why Vercel:**
- ✅ Instant deployment (1 command)
- ✅ Auto HTTPS
- ✅ Unlimited deployments
- ✅ Auto-deploys on git push
- ✅ Custom domains free

**Steps:**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```
   - Choose GitHub login
   - Authorize in browser

3. **Deploy:**
   ```bash
   vercel --prod
   ```
   - Follow prompts:
     - Set up and deploy? **Y**
     - Which scope? (choose your account)
     - Link to existing project? **N**
     - Project name: `lifequest-app`
     - Directory: **/** (root)
     - Override settings? **N**

4. **Done!**
   - Vercel will give you a URL: `https://lifequest-app.vercel.app`
   - Share this with testers!

**Future updates:**
```bash
git add .
git commit -m "Update message"
git push
# Vercel auto-deploys!
```

---

### Option 2: Netlify

**Steps:**

1. **Build the app:**
   ```bash
   npx expo export:web
   ```

2. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

3. **Login:**
   ```bash
   netlify login
   ```

4. **Deploy:**
   ```bash
   netlify deploy --prod --dir dist
   ```

5. **URL:** `https://lifequest-xxx.netlify.app`

---

### Option 3: GitHub Pages (Free, but slower setup)

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json:**
   ```json
   {
     "scripts": {
       "deploy": "expo export:web && gh-pages -d dist"
     }
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages:**
   - Go to repo Settings → Pages
   - Source: `gh-pages` branch
   - Save

5. **URL:** `https://YOUR_USERNAME.github.io/lifequest-app`

---

## Testing the PWA

### Desktop (Chrome/Edge)

1. Open deployed URL
2. Click the **Install** icon in address bar
3. App installs as standalone app
4. Launch from desktop/start menu

### Mobile (iOS Safari)

1. Open deployed URL in Safari
2. Tap **Share** button
3. Tap **Add to Home Screen**
4. App appears on home screen like native app

### Mobile (Android Chrome)

1. Open deployed URL in Chrome
2. Tap **menu (3 dots)**
3. Tap **Install app** or **Add to Home Screen**
4. App appears in app drawer

---

## Sharing with Testers

### Quick Share Message Template:

```
🎉 LifeQuest App - Test Link

Try the app: https://lifequest-app.vercel.app

📱 Mobile:
1. Open link in browser
2. Add to Home Screen (iOS) or Install (Android)
3. Launch like a normal app!

💻 Desktop:
1. Open link in Chrome/Edge
2. Click "Install" in address bar
3. Use like a native app!

Features to test:
- ✅ Login & onboarding
- ✅ Finance path with Baby Steps
- ✅ Mental Health path with dopamine lessons
- ✅ Morning Routine & Dopamine Detox tools
- ✅ Lesson completion and progression

Let me know what you think!
```

---

## Monitoring & Analytics

### Vercel Analytics (Free)

1. Go to Vercel dashboard
2. Select your project
3. Click **Analytics** tab
4. See visitors, page views, etc.

### Google Analytics (Optional)

Add to `App.tsx`:
```typescript
// Add Google Analytics tracking ID
```

---

## Troubleshooting

### Build fails?

```bash
# Clear cache and rebuild
rm -rf node_modules
npm install
npx expo export:web
```

### PWA not installing?

- Check HTTPS (required for PWA)
- Verify `app.json` has correct web config
- Check browser console for errors

### Database not persisting?

- IndexedDB is used for web
- Data cleared when user clears browser data
- Add cloud sync in future

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Share with testers
3. ✅ Collect feedback
4. 🔄 Iterate and improve
5. 🚀 Launch publicly!

---

## Custom Domain (Optional)

### Vercel Custom Domain (Free)

1. Buy domain (Namecheap, GoDaddy, etc.)
2. Go to Vercel project settings
3. Add custom domain
4. Update DNS records (Vercel provides instructions)
5. HTTPS auto-configured!

Example: `https://lifequest.app`

---

## Support

- Vercel docs: https://vercel.com/docs
- Expo docs: https://docs.expo.dev/guides/progressive-web-apps/
- GitHub: https://github.com/YOUR_USERNAME/lifequest-app/issues

---

**Ready to deploy? Start with Vercel - it's the fastest!** 🚀
