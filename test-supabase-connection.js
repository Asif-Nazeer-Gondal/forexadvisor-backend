// Test Supabase Connection with correct service role key
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
  SUPABASE_SECRET_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmamJqZnBpdG9nZnNyb29mZ2dnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzM2MDQyNywiZXhwIjoyMDY4OTM2NDI3fQ.jURJmFD-_TRsstgJVT0LJ4I-DrS8o6jrYeMfHS7H8LE";
  console.log('Using hardcoded values');
}

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection...\n');
  console.log(`SUPABASE_URL: ${SUPABASE_URL}`);
  console.log(`SUPABASE_SECRET_KEY: ${SUPABASE_SECRET_KEY.substring(0, 20)}...`);
  
  try {
    // Test connection by making a simple request to the users table
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&limit=1`, {
      headers: {
        "apikey": SUPABASE_SECRET_KEY,
        "Authorization": `Bearer ${SUPABASE_SECRET_KEY}`,
        "Content-Type": "application/json",
        "x-client-info": "test-connection@1.0.0"
      }
    });
    
    console.log(`Response Status: ${response.status}`);
    
    const responseText = await response.text();
    console.log(`Response Body: ${responseText}`);
    
    if (response.ok) {
      console.log('✅ Connection successful!');
      console.log('✅ Supabase is properly configured!');
    } else {
      console.log('❌ Connection failed!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSupabaseConnection();