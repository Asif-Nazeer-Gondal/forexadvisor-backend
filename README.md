# ForexAdvisor Deno Backend

A minimal Deno backend ready for Deno Deploy.

## Features
- Health check endpoint: `/api/health`
- Forex rates endpoint (placeholder): `/api/forex`
- Ready for Supabase integration

## Local Development

1. Install [Deno](https://deno.land/)
2. Run the server:
   ```bash
   deno task dev
   ```
3. Visit [http://localhost:8000/api/health](http://localhost:8000/api/health)

## Deploy to Deno Deploy

1. Go to [Deno Deploy Dashboard](https://dash.deno.com/)
2. Create a new project and upload this folder (or connect your GitHub repo)
3. Set the entrypoint to `main.ts`
4. Deploy and get your public URL

## Project Structure
```
main.ts        # Main server code
deploy.ts      # (Optional) Re-exports main.ts
README.md      # This file
deno.json      # Deno config
```

## Next Steps
- Add Supabase logic to `/api/forex`
- Add authentication if needed
- Expand API as required
