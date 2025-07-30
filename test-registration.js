// Test User Registration Endpoint
// Run with: node test-registration.js

const BASE_URL = 'https://forexadvisor-backend-z3qt54xsmy2s.asif-nazeer-gondal.deno.net';

async function testRegistration() {
  console.log('🧪 Testing User Registration...\n');
  
  try {
    const userData = {
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      name: 'Test User'
    };
    
    console.log('Sending registration request with data:', userData);
    
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    console.log(`Response Status: ${response.status}`);
    console.log(`Response Headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log(`Response Body: ${responseText}`);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log(`Parsed JSON:`, JSON.stringify(responseJson, null, 2));
    } catch (e) {
      console.log('Response is not valid JSON');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRegistration(); 