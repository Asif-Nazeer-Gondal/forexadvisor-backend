// Test Database Connection and Structure
// Run with: node test-database.js

const SUPABASE_URL = "https://zfjbjfpitogfsroofggg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmamJqZnBpdG9nZnNyb29mZ2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjA0MjcsImV4cCI6MjA2ODkzNjQyN30.PC1TUodgyEoBR_45AzjQrgOfIZuc4qVRT1oFnv8ahbs";

async function testDatabase() {
  console.log('🔍 Testing Database Connection and Structure...\n');
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('1. Testing basic connection...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
    
    // Test 2: Check users table structure
    console.log('\n2. Testing users table...');
    const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&limit=1`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      }
    });
    
    console.log(`Users table status: ${usersResponse.status}`);
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log(`Users data: ${JSON.stringify(usersData, null, 2)}`);
      
      if (usersData.length > 0) {
        console.log('User table structure:');
        console.log(Object.keys(usersData[0]));
      }
    } else {
      const errorText = await usersResponse.text();
      console.log(`Error: ${errorText}`);
    }
    
    // Test 3: Check specific user
    console.log('\n3. Testing specific user lookup...');
    const specificUserResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&email=eq.admin@example.com`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      }
    });
    
    console.log(`Specific user status: ${specificUserResponse.status}`);
    
    if (specificUserResponse.ok) {
      const specificUserData = await specificUserResponse.json();
      console.log(`Specific user data: ${JSON.stringify(specificUserData, null, 2)}`);
    } else {
      const errorText = await specificUserResponse.text();
      console.log(`Error: ${errorText}`);
    }
    
    // Test 4: Check forex_rates table
    console.log('\n4. Testing forex_rates table...');
    const forexResponse = await fetch(`${SUPABASE_URL}/rest/v1/forex_rates?select=*&limit=1`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      }
    });
    
    console.log(`Forex table status: ${forexResponse.status}`);
    
    if (forexResponse.ok) {
      const forexData = await forexResponse.json();
      console.log(`Forex data: ${JSON.stringify(forexData, null, 2)}`);
    } else {
      const errorText = await forexResponse.text();
      console.log(`Error: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

testDatabase(); 