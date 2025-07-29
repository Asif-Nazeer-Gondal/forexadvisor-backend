import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const router = new Router();

router.get("/api/health", (ctx) => {
  ctx.response.body = { status: "OK" };
});

router.get("/api/forex", async (ctx) => {
  // TODO: Add your Supabase or business logic here
  ctx.response.body = { rates: [] };
});

app.use(router.routes());
app.use(router.allowedMethods());

const port = Deno.env.get("PORT") || 8000;
console.log(`Server running on http://localhost:${port}`);
await app.listen({ port: +port });
