// Debug Supabase Connection
// Run with: node debug-supabase.js

const SUPABASE_URL = "https://zfjbjfpitogfsroofggg.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmamJqZnBpdG9nZnNyb29mZ2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjA0MjcsImV4cCI6MjA2ODkzNjQyN30.PC1TUodgyEoBR_45AzjQrgOfIZuc4qVRT1oFnv8ahbs";

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');
  
  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
    
    // Test 2: Check if users table exists
    console.log('\n2. Testing users table access...');
    const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=count`, {
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      }
    });
    
    console.log(`Users table status: ${usersResponse.status}`);
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log(`Users data: ${JSON.stringify(usersData, null, 2)}`);
    } else {
      const errorText = await usersResponse.text();
      console.log(`Error: ${errorText}`);
    }
    
    // Test 3: Check forex_rates table
    console.log('\n3. Testing forex_rates table access...');
    const forexResponse = await fetch(`${SUPABASE_URL}/rest/v1/forex_rates?select=count`, {
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
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
    
    // Test 4: Check investments table
    console.log('\n4. Testing investments table access...');
    const investmentsResponse = await fetch(`${SUPABASE_URL}/rest/v1/investments?select=count`, {
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      }
    });
    
    console.log(`Investments table status: ${investmentsResponse.status}`);
    
    if (investmentsResponse.ok) {
      const investmentsData = await investmentsResponse.json();
      console.log(`Investments data: ${JSON.stringify(investmentsData, null, 2)}`);
    } else {
      const errorText = await investmentsResponse.text();
      console.log(`Error: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

testSupabaseConnection(); 