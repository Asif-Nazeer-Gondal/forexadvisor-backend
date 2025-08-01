// Create New Admin User
// Run with: node create-admin.js

const SUPABASE_URL = "https://zfjbjfpitogfsroofggg.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmamJqZnBpdG9nZnNyb29mZ2dnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzM2MDQyNywiZXhwIjoyMDY4OTM2NDI3fQ.jURJmFD-_TRsstgJVT0LJ4I-DrS8o6jrYeMfHS7H8LE";
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  console.log('👤 Creating New Admin User...\n');
  
  try {
    const email = 'newadmin@example.com';
    const password = 'admin123';
    const name = 'New Admin User';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    
    // Check if user already exists
    const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=email&email=eq.${encodeURIComponent(email)}`, {
      headers: {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
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
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
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
      console.log('✅ New admin user created successfully!');
      console.log('User ID:', newUser[0].id);
      console.log('Email:', newUser[0].email);
      console.log('Name:', newUser[0].name);
      console.log('\n📝 Login Credentials:');
      console.log('Email: newadmin@example.com');
      console.log('Password: admin123');
    } else {
      const errorText = await createResponse.text();
      console.log('❌ Failed to create user:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdminUser(); 