// Test Password Hashing
// Run with: node test-password.js

const bcrypt = require('bcryptjs');

async function testPassword() {
  console.log('🔐 Testing Password Hashing...\n');
  
  const plainPassword = 'password123';
  const hashedPassword = '$2b$10$FP.D1aXDHHzyG8Z2QlK0OeuDiOY3aCevyLOmBMcGHyrx9JSSJ0nVC';
  
  console.log('Plain password:', plainPassword);
  console.log('Hashed password from DB:', hashedPassword);
  
  // Test 1: Hash the plain password
  const newHash = await bcrypt.hash(plainPassword, 10);
  console.log('New hash:', newHash);
  
  // Test 2: Compare plain password with stored hash
  const isValid = await bcrypt.compare(plainPassword, hashedPassword);
  console.log('Password valid:', isValid);
  
  // Test 3: Compare with new hash
  const isValidNew = await bcrypt.compare(plainPassword, newHash);
  console.log('Password valid with new hash:', isValidNew);
  
  // Test 4: Try wrong password
  const isWrongValid = await bcrypt.compare('wrongpassword', hashedPassword);
  console.log('Wrong password valid:', isWrongValid);
}

testPassword(); 