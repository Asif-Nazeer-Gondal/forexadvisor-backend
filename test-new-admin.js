// Test New Admin Login
// Run with: node test-new-admin.js

const BASE_URL = 'http://localhost:8000';

async function testNewAdminLogin() {
  console.log('🧪 Testing New Admin Login...\n');
  
  try {
    const loginData = {
      email: 'newadmin@example.com',
      password: 'admin123'
    };
    
    console.log('Sending login request for new admin...');
    
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
        console.log('User Email:', responseJson.user.email);
        console.log('User Name:', responseJson.user.name);
        console.log('Token received:', responseJson.token ? 'Yes' : 'No');
        
        if (responseJson.token) {
          console.log('Token preview:', responseJson.token.substring(0, 50) + '...');
        }
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

testNewAdminLogin(); 