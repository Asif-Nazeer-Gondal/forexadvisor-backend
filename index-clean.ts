import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7?target=deno";

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

  // Users fetch from Supabase
  if (url.pathname === "/api/users") {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase credentials" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    try {
      const { data, error } = await supabase.from("users").select("*");

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
  }

  // 404 fallback
  return new Response(JSON.stringify({ error: "Not Found" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 404,
  });
}); 