# 🚀 Supabase Setup Instructions

## Step 1: Run SQL Schema in Supabase

1. Go to your Supabase project: https://supabase.com/dashboard/project/bxofbbqocwnhwjgykhqd
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase-schema.sql` file
5. Paste it into the SQL editor
6. Click **Run** (or press Ctrl+Enter)

You should see: `Success. No rows returned`

## Step 2: Verify Tables Were Created

1. Click on **Table Editor** in the left sidebar
2. You should see these tables:
   - `users`
   - `user_stats`
   - `daily_tasks`
   - `finance_progress`
   - `mental_progress`
   - `physical_progress`
   - `nutrition_progress`
   - `achievements`
   - `user_achievements`

## Step 3: Configure Email Authentication (Optional but Recommended)

1. Go to **Authentication** → **Providers** in the left sidebar
2. Click on **Email**
3. Configure settings:
   - **Enable Email provider**: ON
   - **Confirm email**: OFF (for faster testing, enable later for production)
   - **Secure email change**: ON (recommended)
4. Click **Save**

## Step 4: Test the Integration

### Register a New User

1. Clear your app storage/cache
2. Open the app
3. Click "Sign Up"
4. Enter email: `test@example.com`
5. Enter password: `password123`
6. Click Register

### Verify in Supabase Dashboard

1. Go to **Authentication** → **Users**
2. You should see your new user
3. Go to **Table Editor** → **users**
4. You should see a row with your user's email
5. Go to **Table Editor** → **user_stats**
6. You should see stats automatically created (thanks to the trigger!)

## 📊 What Changed

### Before (Local SQLite/AsyncStorage)
- ❌ Data only on one device
- ❌ No synchronization
- ❌ Doesn't work on web
- ❌ Manual auth management

### After (Supabase)
- ✅ Data syncs across all devices
- ✅ Works on web, iOS, Android
- ✅ Secure authentication with JWT
- ✅ Row Level Security (RLS) - users can only see their own data
- ✅ Real-time updates (can be enabled)
- ✅ Automatic backups

## 🔧 Files Modified

- `src/config/supabase.ts` - Supabase client configuration
- `src/store/authStore.ts` - Now uses Supabase Auth instead of local storage
- `src/services/supabaseUserService.ts` - Helper functions for user data
- `supabase-schema.sql` - Database schema

## 🔐 Security

All tables have Row Level Security (RLS) enabled. This means:
- Users can only read/write their own data
- No user can access another user's data
- Even if someone gets your API key, they can't access other users' data

## 🐛 Troubleshooting

### "User already exists" error
- The email is already registered. Try logging in instead.

### "Invalid login credentials" error
- Check email and password are correct
- Make sure you registered first

### Tables not appearing
- Re-run the SQL schema
- Check Supabase logs in **Logs** → **Postgres Logs**

### App not connecting to Supabase
- Check your internet connection
- Verify the Supabase URL and key in `src/config/supabase.ts`
- Check browser console for errors

## 📱 Next Steps (Future Enhancements)

1. **Migrate More Data**: Finance, Mental, Physical, Nutrition progress tables
2. **Real-time Sync**: Enable Supabase Realtime for instant updates
3. **Offline Support**: Add offline-first with local cache + sync
4. **Social Features**: Add sharing, leaderboards, friend system
5. **Email Verification**: Enable email confirmation for production
6. **Password Reset**: Add forgot password flow
7. **OAuth**: Add Google/Apple sign-in

## 🆘 Need Help?

Check the Supabase docs: https://supabase.com/docs

Or ask me to help integrate more features!
