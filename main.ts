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

// ===== INVESTMENT ENDPOINTS =====

// Get all investments for a user
router.get("/api/investments/:userId", async (ctx) => {
  try {
    const userId = ctx.params.userId;
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

// Get active investments for a user
router.get("/api/investments/:userId/active", async (ctx) => {
  try {
    const userId = ctx.params.userId;
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

// Get closed investments for a user
router.get("/api/investments/:userId/closed", async (ctx) => {
  try {
    const userId = ctx.params.userId;
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

// Add new investment
router.post("/api/investments", async (ctx) => {
  try {
    const body = await ctx.request.body().value;
    const { user_id, pair, amount, investedRate } = body;

    if (!user_id || !pair || !amount || !investedRate) {
      ctx.response.status = 400;
      ctx.response.body = { 
        success: false, 
        error: "user_id, pair, amount, and investedRate are required" 
      };
      return;
    }

    const newInvestment = await supabaseRequest("investments", {
      method: "POST",
      body: JSON.stringify({
        user_id,
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

// Close an investment
router.put("/api/investments/:id/close", async (ctx) => {
  try {
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

// Get investment portfolio summary
router.get("/api/investments/:userId/summary", async (ctx) => {
  try {
    const userId = ctx.params.userId;
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
