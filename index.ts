export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Health check
  if (url.pathname === '/') {
    return new Response(
      JSON.stringify({
        message: 'ForexAdvisor Backend is running!',
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: 'Deno Deploy',
        endpoints: ['/api/health', '/api/forex', '/api/users']
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  }

  // API health endpoint
  if (url.pathname === '/api/health') {
    return new Response(
      JSON.stringify({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: 'Deno Deploy'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  }

  // Forex endpoint (mock data for now)
  if (url.pathname === '/api/forex') {
    const forexData = {
      EUR: { USD: 1.08, GBP: 0.86 },
      USD: { EUR: 0.93, GBP: 0.79 },
      GBP: { EUR: 1.16, USD: 1.27 }
    }

    return new Response(
      JSON.stringify(forexData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  }

  // 404 for unknown routes
  return new Response(
    JSON.stringify({ error: 'Not Found' }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404
    }
  )
} 