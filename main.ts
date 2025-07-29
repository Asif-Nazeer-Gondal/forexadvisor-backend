import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const router = new Router();

// Supabase configuration
const SUPABASE_URL = "https://zfjbjfpitogfsroofggg.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmamJqZnBpdG9nZnNyb29mZ2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNjA0MjcsImV4cCI6MjA2ODkzNjQyN30.PC1TUodgyEoBR_45AzjQrgOfIZuc4qVRT1oFnv8ahbs";

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

router.get("/api/health", (ctx) => {
  ctx.response.body = { status: "OK", deployed: true };
});

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

app.use(router.routes());
app.use(router.allowedMethods());

const port = Deno.env.get("PORT") || 8000;
console.log(`Server running on http://localhost:${port}`);
await app.listen({ port: +port });
