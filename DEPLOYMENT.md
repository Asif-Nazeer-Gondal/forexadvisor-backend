# Deno Deploy Deployment Guide

## Root Causes of Previous Issues

1. **Import Resolution Problems**: Direct HTTPS imports were causing npm package resolution issues
2. **Mixed Configuration**: Multiple deno.json files were causing conflicts
3. **Environment Variable Access**: Inconsistent environment variable handling
4. **Supabase Client Issues**: npm package resolution for Supabase client

## Fixed Configuration

### deno.json
- Uses import map for Supabase client
- Removed problematic compiler options
- Proper task configuration

### index.ts
- Uses proper Deno imports
- Simplified environment variable access
- Added Supabase functionality
- Proper CORS handling

## Deployment Steps

1. **Connect to Deno Deploy**:
   - Go to https://deno.com/deploy
   - Connect your GitHub repository

2. **Set Environment Variables**:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

3. **Deploy**:
   - Deno Deploy will automatically detect the `deno-deploy` directory
   - It will use `index.ts` as the entry point

## Testing Locally

```bash
cd deno-deploy
deno run --allow-net --allow-env index.ts
```

## API Endpoints

- `GET /` - Health check
- `GET /api/health` - API health status
- `GET /api/users` - Users from Supabase (requires env vars)
- `GET /api/forex` - Mock forex data

## Troubleshooting

If you still encounter issues:

1. **Check Environment Variables**: Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
2. **Clear Cache**: Delete deno.lock if it exists
3. **Update Imports**: Make sure all imports use HTTPS URLs
4. **Test Locally**: Always test locally before deploying

## Manual Fixes

If the automatic deployment fails:

1. **Remove npm dependencies**: Use only Deno-compatible packages
2. **Use import maps**: Map npm packages to ESM.sh URLs
3. **Simplify imports**: Use direct HTTPS imports when possible
4. **Test incrementally**: Add features one by one to isolate issues 