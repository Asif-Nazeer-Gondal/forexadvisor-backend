// Test Oak Framework Body Parsing
// Run with: node test-oak.js

const BASE_URL = 'https://forexadvisor-backend-z3qt54xsmy2s.asif-nazeer-gondal.deno.net';

async function testDebugEndpoint() {
  console.log('🧪 Testing Debug Endpoint...\n');
  
  try {
    const testData = {
      test: "data",
      number: 123
    };
    
    console.log('Sending test data:', testData);
    
    const response = await fetch(`${BASE_URL}/api/debug`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`Response Status: ${response.status}`);
    
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

testDebugEndpoint(); 