// main.ts

import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { load } from "https://deno.land/std@0.203.0/dotenv/mod.ts";

// Load environment variables from .env file
const env = await load();

// === ENVIRONMENT CONFIG ===
const SUPABASE_URL = env.SUPABASE_URL || Deno.env.get("SUPABASE_URL");
const SUPABASE_SECRET_KEY = env.SUPABASE_SECRET_KEY || Deno.env.get("SUPABASE_SECRET_KEY");
const JWT_SECRET = env.JWT_SECRET || Deno.env.get("JWT_SECRET") || "dev-secret-key";

// Validate env vars
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY in environment.");
}

// === HELPERS ===

// Password Hashing using Web Crypto API (Deno Deploy compatible)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "salt123"); // Simple salt for demo
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hashed;
}

// JWT (basic custom version)
function createSimpleJWT(payload: any, secret: string): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  const signature = btoa(secret + body);
  return `${header}.${body}.${signature}`;
}

function verifySimpleJWT(token: string, secret: string): any {
  const [header, body, signature] = token.split(".");
  if (!header || !body || !signature) throw new Error("Invalid token format");

  const expectedSignature = btoa(secret + body);
  if (signature !== expectedSignature) throw new Error("Invalid token signature");

  return JSON.parse(atob(body));
}

// Supabase Request Helper
async function supabaseRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  // For new API key format, we use the same key for both apikey and Authorization headers
  // The secret key should be in the format sb_secret_xxxxxxxx
  const headers: Record<string, string> = {
    "apikey": SUPABASE_SECRET_KEY!,
    "Authorization": `Bearer ${SUPABASE_SECRET_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
    "x-client-info": "deno-backend@1.0.0",
    ...(options.headers as Record<string, string> || {}),
  };
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Supabase error: ${response.status} ${errorText}`);
    throw new Error(`Supabase error: ${response.status}`);
  }

  return await response.json();
}

// === ROUTES ===

const router = new Router();

// Root
router.get("/", (ctx) => {
  ctx.response.body = {
    message: "Forex Advisor API is live!",
    endpoints: {
      health: "/api/health",
      register: "/api/auth/register",
      login: "/api/auth/login",
      forex: "/api/forex",
    },
  };
});

// Health Check
router.get("/api/health", (ctx) => {
  ctx.response.body = { status: "OK", deployed: true };
});

// Register
router.post("/api/auth/register", async (ctx) => {
  try {
    const { email, password, name } = await ctx.request.body({ type: "json" }).value;

    if (!email || !password || !name) {
      ctx.throw(400, "name, email, and password required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      ctx.throw(400, "Invalid email format");
    }

    // Validate password strength
    if (password.length < 8) {
      ctx.throw(400, "Password must be at least 8 characters long");
    }

    const existing = await supabaseRequest(`users?select=email&email=eq.${encodeURIComponent(email)}`);
    if (existing.length > 0) {
      ctx.throw(409, "User already exists");
    }

    const hashed = await hashPassword(password);
    const newUser = await supabaseRequest("users", {
      method: "POST",
      body: JSON.stringify({
        email,
        password: hashed,
        name,
        created_at: new Date().toISOString(),
      }),
    });

    const token = createSimpleJWT(
      {
        userId: newUser[0].id,
        email: newUser[0].email,
        exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
      },
      JWT_SECRET
    );

    ctx.response.status = 201;
    ctx.response.body = {
      success: true,
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
      },
      token,
    };
  } catch (err) {
    console.error("Register Error:", err);
    ctx.response.status = (err as any)?.status || 500;
    ctx.response.body = { success: false, error: (err as Error)?.message || "Registration failed" };
  }
});

// Login
router.post("/api/auth/login", async (ctx) => {
  try {
    const { email, password } = await ctx.request.body({ type: "json" }).value;

    if (!email || !password) {
      ctx.throw(400, "email and password are required");
    }

    const users = await supabaseRequest(`users?select=*&email=eq.${encodeURIComponent(email)}`);
    if (users.length === 0) {
      ctx.throw(401, "Invalid credentials");
    }

    const user = users[0];
    const valid = await verifyPassword(password, user.password);

    if (!valid) {
      ctx.throw(401, "Invalid credentials");
    }

    const token = createSimpleJWT(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        exp: Math.floor(Date.now() / 1000) + 86400,
      },
      JWT_SECRET
    );

    ctx.response.body = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  } catch (err) {
    console.error("Login Error:", err);
    ctx.response.status = (err as any)?.status || 500;
    ctx.response.body = { success: false, error: (err as Error)?.message || "Login failed" };
  }
});

// Forex Rates
router.get("/api/forex", async (ctx) => {
  try {
    const rates = await supabaseRequest("forex_rates?select=*&order=created_at.desc");
    ctx.response.body = { success: true, rates, count: rates.length };
  } catch (err) {
    console.error("Forex Error:", err);
    ctx.response.status = 500;
    ctx.response.body = { success: false, error: (err as Error)?.message || "Failed to fetch forex rates" };
  }
});

// === APP SETUP ===

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

console.log("✅ Server ready on Deno Deploy");

// Use Oak's built-in server
const port = 8000;
console.log(`Starting server on http://localhost:${port}/`);
await app.listen({ port });
console.log(`Server listening on http://localhost:${port}/`);
