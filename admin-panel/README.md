# LifeQuest Admin Panel - PWA

Progressive Web App dla zarządzania aplikacją LifeQuest.

## 🚀 Funkcje

### Progressive Web App
- ✅ **Instalowalna** - dodaj do ekranu głównego telefonu
- ✅ **Offline** - działa bez internetu (cache)
- ✅ **Responsywna** - dostosowana do mobile i desktop
- ✅ **Szybka** - Service Worker cache
- ✅ **Push notifications** - gotowa do powiadomień
- ✅ **Background sync** - synchronizacja w tle

### Responsywność
- 📱 **Mobile** (< 480px) - 1 kolumna
- 📱 **Tablet** (480-768px) - 2 kolumny
- 💻 **Desktop** (> 768px) - 4 kolumny

## 📦 Instalacja na telefonie

### Android (Chrome)
1. Otwórz admin panel w Chrome
2. Kliknij menu (3 kropki) → "Add to Home Screen"
3. Lub kliknij "Install" w bannerze na dole ekranu
4. Aplikacja pojawi się na ekranie głównym

### iOS (Safari)
1. Otwórz admin panel w Safari
2. Kliknij przycisk "Share" (ikona udostępniania)
3. Wybierz "Add to Home Screen"
4. Aplikacja pojawi się na ekranie głównym

## 🎨 Funkcje mobilne

### Touch-optimized
- Większe przyciski (min 44x44px)
- Brak zoom przy focus na input (font-size: 16px)
- Smooth scrolling
- Swipe-friendly tables

### Responsive Layout
- **Statystyki**: 4 → 2 → 1 kolumna
- **Filtry**: 4 → 1 kolumna (vertical stack)
- **Tabele**: horizontal scroll
- **Zakładki**: horizontal scroll
- **Modale**: full-screen na mobile

### Offline Mode
Service Worker cachuje:
- index.html
- manifest.json
- Wszystkie fetched resources

## 🔧 Technologie

- **Service Worker** - offline cache
- **Web App Manifest** - PWA metadata
- **CSS Media Queries** - responsywność
- **Touch Events** - mobile interactions
- **LocalStorage** - persistent data

## 📱 Testowanie

### Desktop
```bash
# Otwórz Chrome DevTools
# Application → Service Workers → sprawdź status
# Application → Manifest → sprawdź manifest.json
# Lighthouse → Run audit → PWA score
```

### Mobile
1. Otwórz na telefonie
2. Sprawdź czy pojawia się banner "Install"
3. Zainstaluj aplikację
4. Sprawdź offline mode (airplane mode)
5. Sprawdź responsywność (portrait/landscape)

## 🎯 PWA Checklist

✅ manifest.json
✅ Service Worker (sw.js)
✅ HTTPS (production)
✅ Responsive design
✅ Offline fallback
✅ Touch-optimized
✅ Fast load time
✅ App icons (192x192, 512x512)
✅ Theme color
✅ Start URL

## 📊 Performance

- **First Paint**: < 1s (cached)
- **Interactive**: < 2s (cached)
- **Offline**: ✅ Fully functional
- **Cache Strategy**: Cache-first, network fallback

## 🔐 Security

- Service Worker tylko na HTTPS
- LocalStorage dla auth token
- Secure API calls z headers
- XSS protection

## 📝 Notes

### Icon Requirements
- 192x192px - Home screen icon
- 512x512px - Splash screen
- Format: PNG
- Purpose: maskable (rounded on Android)

### Service Worker Updates
Zmień `CACHE_NAME` w `sw.js` aby wymusić update:
```javascript
const CACHE_NAME = 'lifequest-admin-v2'; // increment version
```

### Debug
```javascript
// Console logs
console.log('✅ Service Worker registered');
console.log('❌ Service Worker registration failed');
```

## 🌐 Browser Support

- ✅ Chrome (Android/Desktop)
- ✅ Safari (iOS 11.3+)
- ✅ Firefox (Android/Desktop)
- ✅ Edge (Desktop)
- ⚠️ IE11 - Brak PWA support

## 🚀 Deployment

1. Build admin panel
2. Deploy do HTTPS server
3. Service Worker auto-registers
4. Users see install prompt
5. App cachuje resources

## 📞 Support

Problemy z PWA?
- Sprawdź console errors
- Clear cache i cookies
- Unregister old service workers
- Test w incognito mode
