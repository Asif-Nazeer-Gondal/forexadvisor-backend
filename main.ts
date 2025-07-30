import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { create, verify } from "https://deno.land/x/djwt@v2.8/mod.ts";

const app = new Application();
const router = new Router();

// Supabase configuration
const SUPABASE_URL = "https://zfjbjfpitogfsroofggg.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmamJqZnBpdG9nZnNyb29mZ2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjA0MjcsImV4cCI6MjA2ODkzNjQyN30.PC1TUodgyEoBR_45AzjQrgOfIZuc4qVRT1oFnv8ahbs";

// JWT Secret (in production, use environment variable)
const JWT_SECRET = "your-super-secret-jwt-key-change-this-in-production";

// Helper function to make Supabase API calls
async function supabaseRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    "apikey": SUPABASE_SERVICE_ROLE_KEY,
    "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.statusText}`);
  }

  return response.json();
}

// Middleware to verify JWT token
async function authMiddleware(ctx: any, next: any) {
  const authHeader = ctx.request.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    ctx.response.status = 401;
    ctx.response.body = { 
      success: false, 
      error: "Authorization header required" 
    };
    return;
  }

  try {
    const token = authHeader.substring(7);
    const payload = await verify(token, JWT_SECRET);
    ctx.state.user = payload;
    await next();
  } catch (error) {
    ctx.response.status = 401;
    ctx.response.body = { 
      success: false, 
      error: "Invalid token" 
    };
  }
}

// Helper function to hash password (simple implementation)
function hashPassword(password: string): string {
  // In production, use proper bcrypt or similar
  return btoa(password + "salt");
}

// Helper function to verify password
function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword;
}

router.get("/api/health", (ctx) => {
  ctx.response.body = { status: "OK", deployed: true };
});

// ===== AUTHENTICATION ENDPOINTS =====

// User registration
router.post("/api/auth/register", async (ctx) => {
  try {
    const body = await ctx.request.body().value;
    const { email, password, name } = body;

    if (!email || !password || !name) {
      ctx.response.status = 400;
      ctx.response.body = { 
        success: false, 
        error: "email, password, and name are required" 
      };
      return;
    }

    // Check if user already exists
    const existingUsers = await supabaseRequest(`users?select=id&email=eq.${email}`);
    
    if (existingUsers.length > 0) {
      ctx.response.status = 409;
      ctx.response.body = { 
        success: false, 
        error: "User already exists" 
      };
      return;
    }

    // Create new user
    const hashedPassword = hashPassword(password);
    const newUser = await supabaseRequest("users", {
      method: "POST",
      body: JSON.stringify({
        email,
        password: hashedPassword,
        name,
        created_at: new Date().toISOString()
      })
    });

    // Generate JWT token
    const token = await create(
      { alg: "HS256", typ: "JWT" },
      { 
        userId: newUser[0].id, 
        email: newUser[0].email,
        name: newUser[0].name,
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      },
      JWT_SECRET
    );

    ctx.response.body = { 
      success: true, 
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name
      },
      token 
    };
  } catch (error) {
    console.error("Error registering user:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: "Failed to register user",
      message: error.message 
    };
  }
});

// User login
router.post("/api/auth/login", async (ctx) => {
  try {
    const body = await ctx.request.body().value;
    const { email, password } = body;

    if (!email || !password) {
      ctx.response.status = 400;
      ctx.response.body = { 
        success: false, 
        error: "email and password are required" 
      };
      return;
    }

    // Find user by email
    const users = await supabaseRequest(`users?select=*&email=eq.${email}`);
    
    if (users.length === 0) {
      ctx.response.status = 401;
      ctx.response.body = { 
        success: false, 
        error: "Invalid credentials" 
      };
      return;
    }

    const user = users[0];

    // Verify password
    if (!verifyPassword(password, user.password)) {
      ctx.response.status = 401;
      ctx.response.body = { 
        success: false, 
        error: "Invalid credentials" 
      };
      return;
    }

    // Generate JWT token
    const token = await create(
      { alg: "HS256", typ: "JWT" },
      { 
        userId: user.id, 
        email: user.email,
        name: user.name,
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      },
      JWT_SECRET
    );

    ctx.response.body = { 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token 
    };
  } catch (error) {
    console.error("Error logging in:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: "Failed to login",
      message: error.message 
    };
  }
});

// Get current user profile
router.get("/api/auth/profile", authMiddleware, async (ctx) => {
  try {
    const userId = ctx.state.user.userId;
    const users = await supabaseRequest(`users?select=id,email,name,created_at&id=eq.${userId}`);
    
    if (users.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { 
        success: false, 
        error: "User not found" 
      };
      return;
    }

    ctx.response.body = { 
      success: true, 
      user: users[0] 
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: "Failed to fetch profile",
      message: error.message 
    };
  }
});

// ===== FOREX ENDPOINTS =====

// Get all forex rates
router.get("/api/forex", async (ctx) => {
  try {
    const rates = await supabaseRequest("forex_rates?select=*&order=created_at.desc");
    ctx.response.body = { 
      success: true, 
      rates,
      count: rates.length 
    };
  } catch (error) {
    console.error("Error fetching forex rates:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: "Failed to fetch forex rates",
      message: error.message 
    };
  }
});

// Get specific currency pair
router.get("/api/forex/:pair", async (ctx) => {
  try {
    const pair = ctx.params.pair;
    const rates = await supabaseRequest(`forex_rates?select=*&currency_pair=eq.${pair}&order=created_at.desc&limit=1`);
    
    if (rates.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { 
        success: false, 
        error: `Currency pair ${pair} not found` 
      };
      return;
    }

    ctx.response.body = { 
      success: true, 
      rate: rates[0] 
    };
  } catch (error) {
    console.error("Error fetching currency pair:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: "Failed to fetch currency pair",
      message: error.message 
    };
  }
});

// Add new forex rate (for testing/admin purposes)
router.post("/api/forex", async (ctx) => {
  try {
    const body = await ctx.request.body().value;
    const { currency_pair, rate, timestamp } = body;

    if (!currency_pair || !rate) {
      ctx.response.status = 400;
      ctx.response.body = { 
        success: false, 
        error: "currency_pair and rate are required" 
      };
      return;
    }

    const newRate = await supabaseRequest("forex_rates", {
      method: "POST",
      body: JSON.stringify({
        currency_pair,
        rate: parseFloat(rate),
        timestamp: timestamp || new Date().toISOString()
      })
    });

    ctx.response.body = { 
      success: true, 
      rate: newRate[0] 
    };
  } catch (error) {
    console.error("Error adding forex rate:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: "Failed to add forex rate",
      message: error.message 
    };
  }
});

// ===== PROTECTED INVESTMENT ENDPOINTS =====

// Get all investments for current user
router.get("/api/investments", authMiddleware, async (ctx) => {
  try {
    const userId = ctx.state.user.userId;
    const investments = await supabaseRequest(`investments?select=*&user_id=eq.${userId}&order=date.desc`);
    
    ctx.response.body = { 
      success: true, 
      investments,
      count: investments.length 
    };
  } catch (error) {
    console.error("Error fetching investments:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: "Failed to fetch investments",
      message: error.message 
    };
  }
});

// Get active investments for current user
router.get("/api/investments/active", authMiddleware, async (ctx) => {
  try {
    const userId = ctx.state.user.userId;
    const investments = await supabaseRequest(`investments?select=*&user_id=eq.${userId}&closed=eq.false&order=date.desc`);
    
    ctx.response.body = { 
      success: true, 
      investments,
      count: investments.length 
    };
  } catch (error) {
    console.error("Error fetching active investments:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: "Failed to fetch active investments",
      message: error.message 
    };
  }
});

// Get closed investments for current user
router.get("/api/investments/closed", authMiddleware, async (ctx) => {
  try {
    const userId = ctx.state.user.userId;
    const investments = await supabaseRequest(`investments?select=*&user_id=eq.${userId}&closed=eq.true&order=closedDate.desc`);
    
    ctx.response.body = { 
      success: true, 
      investments,
      count: investments.length 
    };
  } catch (error) {
    console.error("Error fetching closed investments:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: "Failed to fetch closed investments",
      message: error.message 
    };
  }
});

// Add new investment (protected)
router.post("/api/investments", authMiddleware, async (ctx) => {
  try {
    const userId = ctx.state.user.userId;
    const body = await ctx.request.body().value;
    const { pair, amount, investedRate } = body;

    if (!pair || !amount || !investedRate) {
      ctx.response.status = 400;
      ctx.response.body = { 
        success: false, 
        error: "pair, amount, and investedRate are required" 
      };
      return;
    }

    const newInvestment = await supabaseRequest("investments", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        pair,
        amount: parseFloat(amount),
        investedRate: parseFloat(investedRate),
        date: new Date().toISOString(),
        closed: false
      })
    });

    ctx.response.body = { 
      success: true, 
      investment: newInvestment[0] 
    };
  } catch (error) {
    console.error("Error adding investment:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: "Failed to add investment",
      message: error.message 
    };
  }
});

// Close an investment (protected)
router.put("/api/investments/:id/close", authMiddleware, async (ctx) => {
  try {
    const userId = ctx.state.user.userId;
    const investmentId = ctx.params.id;
    const body = await ctx.request.body().value;
    const { closedRate } = body;

    if (!closedRate) {
      ctx.response.status = 400;
      ctx.response.body = { 
        success: false, 
        error: "closedRate is required" 
      };
      return;
    }

    // Verify the investment belongs to the user
    const investments = await supabaseRequest(`investments?select=*&id=eq.${investmentId}&user_id=eq.${userId}`);
    
    if (investments.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { 
        success: false, 
        error: "Investment not found" 
      };
      return;
    }

    const updatedInvestment = await supabaseRequest(`investments?id=eq.${investmentId}`, {
      method: "PATCH",
      body: JSON.stringify({
        closed: true,
        closedRate: parseFloat(closedRate),
        closedDate: new Date().toISOString()
      })
    });

    ctx.response.body = { 
      success: true, 
      investment: updatedInvestment[0] 
    };
  } catch (error) {
    console.error("Error closing investment:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: "Failed to close investment",
      message: error.message 
    };
  }
});

// Get investment portfolio summary (protected)
router.get("/api/investments/summary", authMiddleware, async (ctx) => {
  try {
    const userId = ctx.state.user.userId;
    const allInvestments = await supabaseRequest(`investments?select=*&user_id=eq.${userId}`);
    
    const activeInvestments = allInvestments.filter(inv => !inv.closed);
    const closedInvestments = allInvestments.filter(inv => inv.closed);
    
    // Calculate total invested
    const totalInvested = allInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    
    // Calculate total profit/loss from closed investments
    const totalPnL = closedInvestments.reduce((sum, inv) => {
      const investedValue = parseFloat(inv.amount);
      const closedValue = investedValue * (parseFloat(inv.closedRate) / parseFloat(inv.investedRate));
      return sum + (closedValue - investedValue);
    }, 0);
    
    ctx.response.body = { 
      success: true, 
      summary: {
        totalInvested,
        totalPnL,
        activeCount: activeInvestments.length,
        closedCount: closedInvestments.length,
        totalCount: allInvestments.length
      }
    };
  } catch (error) {
    console.error("Error fetching investment summary:", error);
    ctx.response.status = 500;
    ctx.response.body = { 
      success: false, 
      error: "Failed to fetch investment summary",
      message: error.message 
    };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

const port = Deno.env.get("PORT") || 8000;
console.log(`Server running on http://localhost:${port}`);
await app.listen({ port: +port });
