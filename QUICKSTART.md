# ⚡ Quick Start - Deploy in 5 Minutes

## 1. Push to GitHub

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/lifequest-app.git
git push -u origin main
```

## 2. Deploy to Vercel (Fastest)

```bash
# Install Vercel
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

✅ **Done!** You'll get a URL like: `https://lifequest-app.vercel.app`

## 3. Share with Testers

Send them the URL with instructions:

**Mobile:**
- Open link → Add to Home Screen → Use like a native app!

**Desktop:**
- Open link → Click Install → App on desktop!

---

## Alternative: Test Locally First

```bash
# Run as PWA locally
npx expo start --web

# Opens at http://localhost:8081
# Test PWA features in Chrome
```

---

## That's it! 🎉

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
