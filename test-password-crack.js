// Test Common Password Variations
// Run with: node test-password-crack.js

const bcrypt = require('bcryptjs');

async function testPasswordVariations() {
  console.log('🔍 Testing Password Variations...\n');
  
  const hashedPassword = '$2b$10$FP.D1aXDHHzyG8Z2QlK0OeuDiOY3aCevyLOmBMcGHyrx9JSSJ0nVC';
  
  const commonPasswords = [
    'password123',
    'password',
    'admin',
    'admin123',
    '123456',
    'password1',
    'admin@example.com',
    'test',
    'test123',
    'user',
    'user123',
    'demo',
    'demo123',
    'forex',
    'forex123',
    'advisor',
    'advisor123'
  ];
  
  console.log('Testing common passwords...');
  
  for (const password of commonPasswords) {
    const isValid = await bcrypt.compare(password, hashedPassword);
    if (isValid) {
      console.log(`✅ FOUND MATCH: "${password}"`);
      return password;
    } else {
      console.log(`❌ "${password}" - not a match`);
    }
  }
  
  console.log('\n❌ No common password matched. The password might be:');
  console.log('- A custom password not in our list');
  console.log('- Hashed with different parameters');
  console.log('- Corrupted in the database');
  
  return null;
}

testPasswordVariations(); 