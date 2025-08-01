import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
// Simple JWT implementation
function createSimpleJWT(payload: any, secret: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = btoa(secret + encodedPayload);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifySimpleJWT(token: string, secret: string): any {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error("Invalid JWT format");
  
  const payload = JSON.parse(atob(parts[1]));
  const expectedSignature = btoa(secret + parts[1]);
  
  if (parts[2] !== expectedSignature) {
    throw new Error("Invalid signature");
  }
  
  return payload;
}
import { hash, compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

// === CONFIG ===
const SUPABASE_URL = "https://zfjbjfpitogfsroofggg.supabase.co";
// Using the new secret API key from API Keys tab
const SUPABASE_SECRET_KEY = "sb_secret_oCDMqkI3f9cUK5IbSCBmJA_9eeLgexG";
const JWT_SECRET = "your-super-secret-jwt-key-change-this-in-production";
const PORT = 8000;

// === SUPABASE HELPER ===
async function supabaseRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    "apikey": SUPABASE_SECRET_KEY,
    "Authorization": `Bearer ${SUPABASE_SECRET_KEY}`,
    "Content-Type": "application/json",
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase request failed: ${response.status} ${text}`);
  }
  return response.json();
}

// === PASSWORD HELPERS ===
async function hashPassword(password: string): Promise<string> {
  return await hash(password);
}
async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  return await compare(password, hashed);
}

// === JWT MIDDLEWARE ===
async function authMiddleware(ctx: any, next: any) {
  const authHeader = ctx.request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    ctx.response.status = 401;
    ctx.response.body = { success: false, error: "Authorization header required" };
    return;
  }
  try {
    const token = authHeader.substring(7);
    const payload = verifySimpleJWT(token, JWT_SECRET);
    ctx.state.user = payload;
    await next();
  } catch (error) {
    ctx.response.status = 401;
    ctx.response.body = { success: false, error: "Invalid token" };
  }
}

// === APP & ROUTER ===
const app = new Application();
const router = new Router();

// === ROOT ===
router.get("/", (ctx) => {
  ctx.response.body = { 
    message: "Forex Advisor API is running!",
    endpoints: {
      health: "/api/health",
      register: "/api/auth/register",
      login: "/api/auth/login",
      forex: "/api/forex"
    }
  };
});

// === HEALTH ===
router.get("/api/health", (ctx) => {
  ctx.response.body = { status: "OK", deployed: true };
});

// === AUTH ===
router.post("/api/auth/register", async (ctx) => {
  try {
    const body = await ctx.request.body({ type: "json" }).value;
    const { email, password, name } = body;

    if (!email || !password || !name) {
      ctx.response.status = 400;
      ctx.response.body = { success: false, error: "name, email, and password required" };
      return;
    }

    // Check if user already exists
    const existing = await supabaseRequest(`users?select=email&email=eq.${encodeURIComponent(email)}`);
    if (existing.length > 0) {
      ctx.response.status = 409;
      ctx.response.body = { success: false, error: "User already exists" };
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert user - using the correct table structure
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_SECRET_KEY,
        "Authorization": `Bearer ${SUPABASE_SECRET_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({ 
        email, 
        password: hashedPassword, 
        name,
        created_at: new Date().toISOString()
      }),
    });

    if (!insertRes.ok) {
      const text = await insertRes.text();
      console.error("Insert failed:", text);
      throw new Error(`Insert failed: ${text}`);
    }

    const [newUser] = await insertRes.json();

    // Generate JWT
    const token = createSimpleJWT({
      userId: newUser.id,
      email: newUser.email,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24h
    }, JWT_SECRET);

    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
      token
    };
  } catch (error) {
    console.error("Registration Error:", error);
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

router.post("/api/auth/login", async (ctx) => {
  try {
    const body = await ctx.request.body({ type: "json" }).value;
    const { email, password } = body;

    if (!email || !password) {
      ctx.response.status = 400;
      ctx.response.body = { success: false, error: "email and password are required" };
      return;
    }

    const users = await supabaseRequest(`users?select=*&email=eq.${encodeURIComponent(email)}`);
    if (users.length === 0) {
      ctx.response.status = 401;
      ctx.response.body = { success: false, error: "Invalid credentials" };
      return;
    }

    const user = users[0];
    console.log("User from Supabase:", JSON.stringify(user, null, 2)); // Debug log
    console.log("User properties:", Object.keys(user)); // Debug log
    
    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      ctx.response.status = 401;
      ctx.response.body = { success: false, error: "Invalid credentials" };
      return;
    }

    let token;
    try {
      token = createSimpleJWT({
        userId: user.id,
        email: user.email,
        name: user.name,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
      }, JWT_SECRET);
    } catch (jwtError) {
      console.error("JWT Creation Error:", jwtError);
      throw jwtError;
    }

    ctx.response.body = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || "Unknown",
      },
      token
    };
  } catch (error) {
    console.error("Login Error:", error);
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: error.message };
  }
});

// === FOREX ===
router.get("/api/forex", async (ctx) => {
  try {
    const rates = await supabaseRequest("forex_rates?select=*&order=created_at.desc");
    ctx.response.body = { success: true, rates, count: rates.length };
  } catch (error) {
    console.error("Error fetching forex rates:", error);
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: "Failed to fetch forex rates", message: error.message };
  }
});

router.get("/api/forex/:pair", async (ctx) => {
  try {
    const pair = ctx.params.pair;
    const rates = await supabaseRequest(
      `forex_rates?select=*&currency_pair=eq.${encodeURIComponent(pair)}&order=created_at.desc&limit=1`
    );

    if (rates.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { success: false, error: `Currency pair ${pair} not found` };
      return;
    }

    ctx.response.body = { success: true, rate: rates[0] };
  } catch (error) {
    console.error("Error fetching currency pair:", error);
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: "Failed to fetch currency pair", message: error.message };
  }
});

router.post("/api/forex", async (ctx) => {
  try {
    const body = await ctx.request.body({ type: "json" }).value;
    const { currency_pair, rate, timestamp } = body;

    if (!currency_pair || !rate) {
      ctx.response.status = 400;
      ctx.response.body = { success: false, error: "currency_pair and rate are required" };
      return;
    }

    const newRate = await supabaseRequest("forex_rates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
        currency_pair,
        rate: parseFloat(rate),
        timestamp: timestamp || new Date().toISOString()
      })
    });

    ctx.response.body = { success: true, rate: newRate[0] };
  } catch (error) {
    console.error("Error adding forex rate:", error);
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: "Failed to add forex rate", message: error.message };
  }
});

// === APP START ===
app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Server running on http://localhost:${PORT}`);
await app.listen({ port: PORT });