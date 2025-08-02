// Create New User with Current Hashing Method
// Run with: node create-new-user.js

// Load environment variables from .env file if available
let SUPABASE_URL, SUPABASE_SECRET_KEY;
try {
  const dotenv = require('dotenv');
  dotenv.config();
  SUPABASE_URL = process.env.SUPABASE_URL;
  SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
} catch (error) {
  // Fallback to hardcoded values if .env loading fails
  SUPABASE_URL = "https://zfjbjfpitogfsroofggg.supabase.co";
  SUPABASE_SECRET_KEY = "sb_secret_oCDMqkI3f9cUK5IbSCBmJA_9eeLgexG";
}

async function createNewUser() {
  console.log('👤 Creating New User with Current Hashing...\n');
  
  try {
    const email = 'testuser@example.com';
    const password = 'password123';
    const name = 'Test User';
    
    // Hash the password using bcrypt (same as server)
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed:', hashedPassword);
    
    // Check if user already exists
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=email&email=eq.${encodeURIComponent(email)}`, {
      headers: {
        "apikey": SUPABASE_SECRET_KEY,
        "Authorization": `Bearer ${SUPABASE_SECRET_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
        "x-client-info": "node-user-script@1.0.0"
      }
    });
    
    if (checkResponse.ok) {
      const existingUsers = await checkResponse.json();
      if (existingUsers.length > 0) {
        console.log('❌ User already exists');
        return;
      }
    }
    
    // Create new user
    const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_SECRET_KEY,
        "Authorization": `Bearer ${SUPABASE_SECRET_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
        "x-client-info": "node-user-script@1.0.0"
      },
      body: JSON.stringify({
        email,
        password: hashedPassword,
        name,
        created_at: new Date().toISOString()
      })
    });
    
    if (createResponse.ok) {
      const newUser = await createResponse.json();
      console.log('✅ New user created successfully!');
      console.log('User ID:', newUser[0].id);
      console.log('Email:', newUser[0].email);
      console.log('Name:', newUser[0].name);
      console.log('\n📝 Login Credentials:');
      console.log('Email: testuser@example.com');
      console.log('Password: password123');
    } else {
      const errorText = await createResponse.text();
      console.log('❌ Failed to create user:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createNewUser();