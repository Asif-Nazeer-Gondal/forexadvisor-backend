// Backend Proficiency Testing Script
// Run with: node test-backend.js

const BASE_URL = 'https://forexadvisor-backend-z3qt54xsmy2s.asif-nazeer-gondal.deno.net'; // Updated to deployed URL
let authToken = '';

// Test utilities
const test = async (name, testFn) => {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    await testFn();
    console.log(`✅ PASS: ${name}`);
  } catch (error) {
    console.log(`❌ FAIL: ${name} - ${error.message}`);
  }
};

const makeRequest = async (method, endpoint, body = null, headers = {}) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();
  
  return { status: response.status, data };
};

// Test Suite
const runTests = async () => {
  console.log('🚀 Starting Backend Proficiency Assessment\n');
  
  // 1. Health Check
  await test('Health Check Endpoint', async () => {
    const { status, data } = await makeRequest('GET', '/api/health');
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.status || data.status !== 'OK') throw new Error('Invalid health response');
  });
  
  // 2. User Registration
  await test('User Registration', async () => {
    const userData = {
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      name: 'Test User'
    };
    
    const { status, data } = await makeRequest('POST', '/api/auth/register', userData);
    if (status !== 201 && status !== 200) throw new Error(`Expected 201/200, got ${status}`);
    if (!data.success) throw new Error('Registration failed');
  });
  
  // 3. User Login
  await test('User Login', async () => {
    const loginData = {
      email: 'test@example.com', // Use existing test user
      password: 'password123'
    };
    
    const { status, data } = await makeRequest('POST', '/api/auth/login', loginData);
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.token) throw new Error('No token received');
    
    authToken = data.token;
  });
  
  // 4. Protected Endpoint Access
  await test('Protected Endpoint Access', async () => {
    if (!authToken) throw new Error('No auth token available');
    
    const { status, data } = await makeRequest('GET', '/api/users/profile', null, {
      'Authorization': `Bearer ${authToken}`
    });
    
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
  });
  
  // 5. Unauthorized Access
  await test('Unauthorized Access Prevention', async () => {
    const { status } = await makeRequest('GET', '/api/users/profile');
    if (status !== 401) throw new Error(`Expected 401, got ${status}`);
  });
  
  // 6. Invalid Token
  await test('Invalid Token Rejection', async () => {
    const { status } = await makeRequest('GET', '/api/users/profile', null, {
      'Authorization': 'Bearer invalid-token'
    });
    if (status !== 401) throw new Error(`Expected 401, got ${status}`);
  });
  
  // 7. Input Validation
  await test('Input Validation', async () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'short'
    };
    
    const { status } = await makeRequest('POST', '/api/auth/register', invalidData);
    if (status !== 400) throw new Error(`Expected 400, got ${status}`);
  });
  
  // 8. Forex Endpoints (if implemented)
  await test('Forex Data Endpoint', async () => {
    const { status, data } = await makeRequest('GET', '/api/forex');
    if (status !== 200 && status !== 404) throw new Error(`Unexpected status: ${status}`);
    // If 404, endpoint not implemented yet
  });
  
  console.log('\n📊 Assessment Complete!');
  console.log('\nNext Steps:');
  console.log('1. Review failed tests and implement fixes');
  console.log('2. Add more comprehensive error handling');
  console.log('3. Implement proper password hashing');
  console.log('4. Add input validation middleware');
  console.log('5. Create unit tests');
};

// Run the tests
runTests().catch(console.error); 