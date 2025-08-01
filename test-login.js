// Test User Login Endpoint
// Run with: node test-login.js

const BASE_URL = 'https://forexadvisor-backend-z3qt54xsmy2s.asif-nazeer-gondal.deno.net';

async function testLogin() {
  console.log('🧪 Testing User Login...\n');
  
  try {
    // Test with the existing user data
    const loginData = {
      email: 'admin@example.com',
      password: 'password123' // This should match the original password before hashing
    };
    
    console.log('Sending login request with data:', { ...loginData, password: '***' });
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    console.log(`Response Status: ${response.status}`);
    console.log(`Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log(`Response Body: ${responseText}`);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log(`Parsed JSON:`, JSON.stringify(responseJson, null, 2));
      
      if (responseJson.success) {
        console.log('✅ Login successful!');
        console.log('User ID:', responseJson.user.id);
        console.log('Token received:', responseJson.token ? 'Yes' : 'No');
      } else {
        console.log('❌ Login failed:', responseJson.error);
      }
    } catch (e) {
      console.log('Response is not valid JSON');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin(); 