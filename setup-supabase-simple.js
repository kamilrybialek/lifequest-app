#!/usr/bin/env node

/**
 * Simple Supabase Setup using @supabase/supabase-js
 *
 * This creates tables directly using Supabase client.
 * Much simpler than trying to use REST API!
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bxofbbqocwnhwjgykhqd.supabase.co';

console.log('\n🚀 Supabase Setup Script\n');

// Check if we're running this with service_role key as argument
const serviceRoleKey = process.argv[2];

if (!serviceRoleKey) {
  console.log('❌ Please provide your SERVICE_ROLE key as an argument:\n');
  console.log('Usage: node setup-supabase-simple.js YOUR_SERVICE_ROLE_KEY\n');
  console.log('Where to find your service_role key:');
  console.log('1. Go to: https://supabase.com/dashboard/project/bxofbbqocwnhwjgykhqd/settings/api');
  console.log('2. Scroll down to "Project API keys"');
  console.log('3. Click "Reveal" next to "service_role" (NOT the anon key!)');
  console.log('4. Copy the key\n');
  console.log('Then run:');
  console.log('  node setup-supabase-simple.js <paste-key-here>\n');
  process.exit(1);
}

async function setup() {
  console.log('📝 Reading SQL schema...');

  const sql = fs.readFileSync('./supabase-schema.sql', 'utf8');
  console.log('✅ Schema loaded\n');

  console.log('🔌 Connecting to Supabase...');
  const supabase = createClient(SUPABASE_URL, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('✅ Connected\n');

  console.log('🔧 Creating database tables...');
  console.log('This may take 10-15 seconds...\n');

  try {
    // Execute the SQL schema
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: sql
    });

    if (error) {
      // If exec_sql function doesn't exist, try alternative approach
      console.log('⚠️  Standard SQL execution not available');
      console.log('📋 Trying alternative method...\n');

      // Split SQL into individual statements and execute each
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        if (stmt.includes('CREATE TABLE') || stmt.includes('CREATE POLICY') || stmt.includes('INSERT INTO')) {
          try {
            // This won't work with regular client, need service role
            console.log(`Executing statement ${i + 1}/${statements.length}...`);

            // We can't execute raw SQL via JS client with service_role easily
            // So we'll print instructions instead
            throw new Error('Cannot execute raw SQL via JS client');
          } catch (err) {
            errorCount++;
          }
        }
      }

      throw new Error('Please run SQL manually - see instructions below');
    }

    console.log('✅ Tables created successfully!\n');

  } catch (error) {
    console.log('\n❌ Could not execute SQL automatically\n');
    console.log('📋 Please run the SQL manually instead:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/bxofbbqocwnhwjgykhqd/sql/new');
    console.log('2. Copy ALL content from supabase-schema.sql');
    console.log('3. Paste into the SQL editor');
    console.log('4. Click "Run" (or press Ctrl+Enter)\n');
    console.log('Expected result: "Success. No rows returned"\n');
    process.exit(1);
  }

  console.log('🎉 Setup complete!\n');
  console.log('✅ Database is ready');
  console.log('✅ You can now run: npm start\n');
  console.log('Test with:');
  console.log('  Email: test@example.com');
  console.log('  Password: password123\n');
}

setup().catch(error => {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
});
