// Test Supabase Connection with different API key formats
// Run with: node test-supabase-connection.js

// Load environment variables from .env file if available
let SUPABASE_URL, SUPABASE_SECRET_KEY;
try {
  const dotenv = require('dotenv');
  dotenv.config();
  SUPABASE_URL = process.env.SUPABASE_URL;
  SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
  console.log('Loaded environment variables from .env file');
} catch (error) {
  // Fallback to hardcoded values if .env loading fails
  SUPABASE_URL = "https://zfjbjfpitogfsroofggg.supabase.co";
  SUPABASE_SECRET_KEY = "sb_secret_oCDMqkI3f9cUK5IbSCBmJA_9eeLgexG";
  console.log('Using hardcoded values');
}

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection...\n');
  console.log(`SUPABASE_URL: ${SUPABASE_URL}`);
  console.log(`SUPABASE_SECRET_KEY: ${SUPABASE_SECRET_KEY.substring(0, 10)}...`);
  
  // Try different API endpoints
  const endpoints = [
    '/rest/v1/health',
    '/auth/v1/health',
    '/storage/v1/health',
    '/rest/v1/',
    '/auth/v1/',
  ];
  
  // Try different API key formats
  const keyFormats = [
    // Original format
    { apikey: SUPABASE_SECRET_KEY, auth: `Bearer ${SUPABASE_SECRET_KEY}` },
    // Try without Bearer prefix
    { apikey: SUPABASE_SECRET_KEY, auth: SUPABASE_SECRET_KEY },
    // Try with anon key format (remove sb_secret_ prefix if present)
    { 
      apikey: SUPABASE_SECRET_KEY.replace('sb_secret_', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqYmpqZnBpdG9nZnNyb29mZ2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk5NzU5NzEsImV4cCI6MjAxNTU1MTk3MX0.'), 
      auth: `Bearer ${SUPABASE_SECRET_KEY.replace('sb_secret_', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqYmpqZnBpdG9nZnNyb29mZ2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTk5NzU5NzEsImV4cCI6MjAxNTU1MTk3MX0.')}`
    },
    // Try with service_role key format
    { 
      apikey: SUPABASE_SECRET_KEY.replace('sb_secret_', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqYmpqZnBpdG9nZnNyb29mZ2dnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5OTk3NTk3MSwiZXhwIjoyMDE1NTUxOTcxfQ.'), 
      auth: `Bearer ${SUPABASE_SECRET_KEY.replace('sb_secret_', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqYmpqZnBpdG9nZnNyb29mZ2dnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5OTk3NTk3MSwiZXhwIjoyMDE1NTUxOTcxfQ.')}`
    },
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n🔍 Testing endpoint: ${endpoint}`);
    
    for (const [index, keyFormat] of keyFormats.entries()) {
      console.log(`\n  🔑 Testing key format ${index + 1}:`);
      console.log(`  apikey: ${keyFormat.apikey.substring(0, 10)}...`);
      console.log(`  Authorization: ${keyFormat.auth.substring(0, 15)}...`);
      
      try {
        const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
          headers: {
            "apikey": keyFormat.apikey,
            "Authorization": keyFormat.auth,
            "Content-Type": "application/json",
            "x-client-info": "test-connection@1.0.0",
            "Prefer": "return=minimal"
          }
        });
        
        console.log(`  Response Status: ${response.status}`);
        
        const responseText = await response.text();
        console.log(`  Response Body: ${responseText}`);
        
        if (response.ok) {
          console.log('  ✅ Connection successful!');
        } else {
          console.log('  ❌ Connection failed!');
        }
        
      } catch (error) {
        console.error('  ❌ Error:', error.message);
      }
    }
  }
}

testSupabaseConnection();