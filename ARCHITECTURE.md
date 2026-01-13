# Structura PWA Architecture

## Overview
Progressive Web App with offline-first architecture and server synchronization.

## Technology Stack

### Frontend (Current)
- **Framework**: React Native Web + Expo
- **State Management**: Zustand
- **Local Storage**: AsyncStorage (IndexedDB on web)
- **UI**: React Native Paper
- **Navigation**: React Navigation

### Backend (Planned)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (via Neon/Supabase)
- **ORM**: Prisma
- **Authentication**: JWT tokens
- **API**: RESTful + WebSockets (for real-time sync)
- **Deployment**: Vercel Serverless Functions or Railway

### Admin Panel (Planned)
- **Framework**: Next.js 14
- **UI**: Shadcn/ui + Tailwind
- **Authentication**: Separate admin JWT
- **Features**: User management, content management, analytics

## Data Architecture

### Offline-First Strategy
```
┌─────────────────┐
│   React App     │
│  (PWA Client)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  Local Storage  │◄────►│  Sync Queue  │
│  (IndexedDB)    │      │  (Pending)   │
└─────────────────┘      └──────┬───────┘
         │                      │
         │                      │
         ▼                      ▼
┌─────────────────────────────────┐
│      Sync Service               │
│  - Conflict Resolution          │
│  - Retry Logic                  │
│  - Background Sync API          │
└───────────────┬─────────────────┘
                │
                ▼
        ┌───────────────┐
        │   Backend API │
        │  (PostgreSQL) │
        └───────────────┘
```

### Database Schema (PostgreSQL)

#### Core Tables

**users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  age INTEGER,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  gender VARCHAR(50),
  onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_sync_at TIMESTAMP
);
```

**user_stats**
```sql
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  finance_streak INTEGER DEFAULT 0,
  mental_streak INTEGER DEFAULT 0,
  physical_streak INTEGER DEFAULT 0,
  nutrition_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**sync_log**
```sql
CREATE TABLE sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  entity_type VARCHAR(50), -- 'task', 'progress', 'achievement', etc.
  entity_id VARCHAR(255),
  action VARCHAR(20), -- 'create', 'update', 'delete'
  data JSONB,
  client_timestamp TIMESTAMP,
  server_timestamp TIMESTAMP DEFAULT NOW(),
  synced BOOLEAN DEFAULT TRUE
);
```

**tasks**
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  pillar VARCHAR(50), -- 'finance', 'mental', 'physical', 'nutrition'
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  due_date DATE,
  xp_reward INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP -- Soft delete
);
```

**achievements**
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(100) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

## API Endpoints

### Authentication
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login (returns JWT)
POST   /api/auth/refresh        - Refresh JWT token
POST   /api/auth/logout         - Logout (invalidate token)
GET    /api/auth/me             - Get current user
```

### User Data
```
GET    /api/user/profile        - Get user profile
PUT    /api/user/profile        - Update profile
GET    /api/user/stats          - Get user stats
```

### Tasks
```
GET    /api/tasks               - Get all tasks
POST   /api/tasks               - Create task
PUT    /api/tasks/:id           - Update task
DELETE /api/tasks/:id           - Delete task
POST   /api/tasks/:id/complete  - Mark task complete
```

### Sync
```
POST   /api/sync/push           - Push local changes to server
POST   /api/sync/pull           - Pull server changes
GET    /api/sync/status         - Get sync status
```

### Admin
```
GET    /api/admin/users         - List all users
GET    /api/admin/stats         - Platform statistics
POST   /api/admin/content       - Manage content
```

## Sync Strategy

### Conflict Resolution Rules
1. **Last-Write-Wins**: For simple fields (name, settings)
2. **Operational Transform**: For collaborative data
3. **Server Authority**: For XP, levels (prevent cheating)
4. **Client Priority**: For local preferences

### Sync Flow
```javascript
// Client-side pseudo-code
async function syncWithServer() {
  // 1. Get pending changes from local queue
  const pendingChanges = await getSyncQueue();

  // 2. Push to server
  const pushResult = await fetch('/api/sync/push', {
    method: 'POST',
    body: JSON.stringify(pendingChanges)
  });

  // 3. Get server timestamp
  const lastSync = await getLastSyncTimestamp();

  // 4. Pull changes since last sync
  const serverChanges = await fetch(`/api/sync/pull?since=${lastSync}`);

  // 5. Apply changes to local storage
  await applyServerChanges(serverChanges);

  // 6. Clear sync queue
  await clearSyncQueue();

  // 7. Update last sync timestamp
  await setLastSyncTimestamp(Date.now());
}
```

## PWA Features

### Service Worker
- Cache app shell
- Background sync
- Offline queue for API calls
- Push notifications

### Manifest
```json
{
  "name": "Structura",
  "short_name": "Structura",
  "description": "Gamified life improvement app",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#58CC02",
  "icons": [...]
}
```

## Security

### Authentication Flow
1. User registers/logs in
2. Server returns JWT access token (15 min) + refresh token (7 days)
3. Client stores tokens in secure storage
4. All API calls include: `Authorization: Bearer <token>`
5. Refresh token used to get new access token

### Data Protection
- HTTPS only
- JWT tokens with expiration
- Password hashing: bcrypt (10 rounds)
- Rate limiting on API
- CORS configuration
- SQL injection protection (Prisma ORM)

## Deployment Plan

### Phase 1: Basic Backend (Week 1)
- [ ] Set up PostgreSQL database (Neon/Supabase)
- [ ] Create Express API with Prisma
- [ ] Implement auth endpoints
- [ ] Deploy to Vercel/Railway

### Phase 2: Data Sync (Week 2)
- [ ] Implement sync endpoints
- [ ] Add conflict resolution
- [ ] Create sync queue on client
- [ ] Test offline-online scenarios

### Phase 3: Admin Panel (Week 3)
- [ ] Build Next.js admin dashboard
- [ ] User management interface
- [ ] Analytics and reporting
- [ ] Content management

### Phase 4: Production Ready (Week 4)
- [ ] PWA optimizations
- [ ] Performance testing
- [ ] Security audit
- [ ] Beta testing with users

## File Structure (Backend)

```
lifequest-backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── env.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimit.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── tasks.routes.ts
│   │   ├── sync.routes.ts
│   │   └── admin.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── tasks.controller.ts
│   │   └── sync.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── sync.service.ts
│   │   └── email.service.ts
│   ├── models/
│   │   └── (Prisma models)
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── validation.ts
│   └── app.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
├── package.json
└── tsconfig.json
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/lifequest"

# JWT
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_SECRET="refresh-secret"
REFRESH_TOKEN_EXPIRES_IN="7d"

# App
NODE_ENV="production"
PORT=3000
CLIENT_URL="https://lifequest.app"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="app-password"
```

## Next Steps

1. ✅ Fix PWA white screen issue
2. 🔄 Set up backend repository
3. 📝 Implement auth API
4. 🔄 Create sync service
5. 🎨 Build admin panel
6. 🚀 Deploy to production
