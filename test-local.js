// Test Local Server
// Run with: node test-local.js

const BASE_URL = 'http://localhost:8000';

async function testLocalLogin() {
  console.log('🧪 Testing Local Server Login...\n');
  
  try {
    const loginData = {
      email: 'admin@example.com',
      password: 'password123'
    };
    
    console.log('Sending login request to local server...');
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    console.log(`Response Status: ${response.status}`);
    
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

testLocalLogin(); 