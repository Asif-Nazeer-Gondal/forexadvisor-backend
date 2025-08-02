// Test Admin Creation Script
// Run with: node test-admin-creation.js

// This script tests if the admin creation script is working correctly
// by checking if the admin user exists in the database

// Load environment variables from .env file if available
let SUPABASE_URL, SUPABASE_SECRET_KEY;
try {
  const dotenv = require('dotenv');
  dotenv.config();
  SUPABASE_URL = process.env.SUPABASE_URL;
  SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
} catch (error) {
  // Fallback to hardcoded values if .env loading fails
  SUPABASE_URL = "https://zfjbjfpitogfsroofggg.supabase.co";
  SUPABASE_SECRET_KEY = "sb_secret_oCDMqkI3f9cUK5IbSCBmJA_9eeLgexG";
}

async function testAdminCreation() {
  console.log('🧪 Testing Admin Creation...');
  
  try {
    // Check if admin user exists
    const email = 'newadmin@example.com';
    
    console.log(`Checking if user ${email} exists...`);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&email=eq.${encodeURIComponent(email)}`, {
      headers: {
        "apikey": SUPABASE_SECRET_KEY,
        "Authorization": `Bearer ${SUPABASE_SECRET_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
        "x-client-info": "node-test-script@1.0.0"
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const users = await response.json();
    
    if (users.length === 0) {
      console.log(`❌ User ${email} does not exist. Run create-admin.js first.`);
      return;
    }
    
    const user = users[0];
    console.log('✅ Admin user exists!');
    console.log('User details:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Name:', user.name);
    console.log('- Created at:', new Date(user.created_at).toLocaleString());
    
    // Test login with this user
    console.log('\n🔑 Testing login with admin credentials...');
    
    const loginResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/login`, {
      method: 'POST',
      headers: {
        "apikey": SUPABASE_SECRET_KEY,
        "Authorization": `Bearer ${SUPABASE_SECRET_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
        "x-client-info": "node-test-script@1.0.0"
      },
      body: JSON.stringify({
        email: 'newadmin@example.com',
        password: 'admin123'
      })
    });
    
    if (loginResponse.ok) {
      console.log('✅ Login successful!');
    } else {
      const errorText = await loginResponse.text();
      console.log(`❌ Login failed: ${errorText}`);
      console.log('Note: This might be expected if Supabase RPC functions are not set up.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdminCreation();