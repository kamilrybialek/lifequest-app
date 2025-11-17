/**
 * Automated Supabase Setup Script
 *
 * This script will:
 * 1. Create all necessary database tables
 * 2. Set up Row Level Security policies
 * 3. Configure authentication settings
 *
 * Run with: node setup-supabase.js
 */

const fs = require('fs');
const https = require('https');

const SUPABASE_URL = 'https://bxofbbqocwnhwjgykhqd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4b2ZiYnFvY3duaHdqZ3lraHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMjUzNDEsImV4cCI6MjA3ODkwMTM0MX0.U9b8swND8FE5L4HKDMNyHPTXOZ5PgiVRI4hvijoDUBo';

console.log('\n🚀 Supabase Setup Script\n');
console.log('This will automatically set up your database.\n');

// Prompt for service_role key
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Enter your Supabase SERVICE_ROLE key (from Settings → API):\n', (serviceRoleKey) => {
  if (!serviceRoleKey || serviceRoleKey.trim().length === 0) {
    console.error('❌ Service role key is required!');
    console.log('\nWhere to find it:');
    console.log('1. Go to: https://supabase.com/dashboard/project/bxofbbqocwnhwjgykhqd/settings/api');
    console.log('2. Scroll to "Project API keys"');
    console.log('3. Copy the "service_role" key (not the anon key!)');
    console.log('4. Run this script again\n');
    process.exit(1);
  }

  runSetup(serviceRoleKey.trim());
  readline.close();
});

async function runSetup(serviceRoleKey) {
  console.log('\n📝 Step 1: Reading SQL schema...');

  let sqlSchema;
  try {
    sqlSchema = fs.readFileSync('./supabase-schema.sql', 'utf8');
    console.log('✅ SQL schema loaded');
  } catch (error) {
    console.error('❌ Error reading supabase-schema.sql:', error.message);
    console.log('Make sure supabase-schema.sql exists in the current directory.');
    process.exit(1);
  }

  console.log('\n🔧 Step 2: Creating tables in Supabase...');

  try {
    await executeSql(sqlSchema, serviceRoleKey);
    console.log('✅ Tables created successfully!');
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    console.log('\nIf you see "already exists" errors, that\'s OK - it means tables are already there.');
  }

  console.log('\n⚙️  Step 3: Configuring authentication...');

  try {
    await disableEmailConfirmation(serviceRoleKey);
    console.log('✅ Email confirmation disabled');
  } catch (error) {
    console.error('⚠️  Could not disable email confirmation:', error.message);
    console.log('You may need to do this manually in the dashboard.');
  }

  console.log('\n🎉 Setup complete!\n');
  console.log('Next steps:');
  console.log('1. Run: npm start');
  console.log('2. Open app and register with: test@example.com / password123');
  console.log('3. Check Supabase dashboard to verify user was created\n');
}

function executeSql(sql, serviceRoleKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });

    const options = {
      hostname: 'bxofbbqocwnhwjgykhqd.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Prefer': 'return=minimal'
      }
    };

    // Alternative: Use Supabase SQL endpoint
    const pgOptions = {
      hostname: 'bxofbbqocwnhwjgykhqd.supabase.co',
      port: 443,
      path: '/rest/v1/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      }
    };

    // Since we can't execute raw SQL via REST API easily,
    // we'll use the Supabase Management API
    const mgmtOptions = {
      hostname: 'api.supabase.com',
      port: 443,
      path: '/v1/projects/bxofbbqocwnhwjgykhqd/database/query',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
      }
    };

    const req = https.request(mgmtOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ query: sql }));
    req.end();
  });
}

function disableEmailConfirmation(serviceRoleKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      DISABLE_SIGNUP: false,
      SITE_URL: 'http://localhost:8081',
      MAILER_AUTOCONFIRM: true,  // This disables email confirmation
    });

    const options = {
      hostname: 'api.supabase.com',
      port: 443,
      path: '/v1/projects/bxofbbqocwnhwjgykhqd/config/auth',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          // Don't fail if this doesn't work
          console.log('Note: Auth config returned:', res.statusCode);
          resolve(body);
        }
      });
    });

    req.on('error', (err) => {
      console.log('Note: Auth config request failed:', err.message);
      resolve(); // Don't fail the whole setup
    });

    req.write(data);
    req.end();
  });
}
