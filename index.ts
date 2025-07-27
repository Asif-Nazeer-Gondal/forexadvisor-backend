import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

// CORS Headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  const url = new URL(req.url);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Root health check
  if (url.pathname === "/") {
    return new Response(
      JSON.stringify({ 
        message: "ForexAdvisor Backend is running!", 
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: "Deno Deploy"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }

  // API health check
  if (url.pathname === "/api/health") {
    return new Response(
      JSON.stringify({ 
        status: "OK", 
        timestamp: new Date().toISOString(),
        environment: "Deno Deploy"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }

  // Forex rates (mocked for now)
  if (url.pathname === "/api/forex") {
    const forexData = {
      EUR: { USD: 1.08, GBP: 0.86 },
      USD: { EUR: 0.93, GBP: 0.79 },
      GBP: { EUR: 1.16, USD: 1.27 },
    };

    return new Response(JSON.stringify(forexData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  // Users endpoint (mocked for now)
  if (url.pathname === "/api/users") {
    const mockUsers = [
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Smith", email: "jane@example.com" },
    ];

    return new Response(JSON.stringify(mockUsers), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  // 404 fallback
  return new Response(JSON.stringify({ error: "Not Found" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 404,
  });
}, { port: 8002 }); 