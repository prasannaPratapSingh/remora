# Remora backend

To install dependencies:

```bash
bun install
```

Development:

```bash
bun run dev
```

Production:

```bash
bun run build
bun run start
```

Production requires:

```text
NODE_ENV=production
DATABASE_URL=...
DIRECT_URL=...
REDIS_URL=...
CLERK_SECRET_KEY=...
CORS_ORIGINS=https://app.example.com
REQUIRE_REDIS_FOR_RATE_LIMITS=true
```

The service exposes `/health` for liveness and `/ready` for PostgreSQL/Redis readiness. Dashboard APIs require a valid Clerk session and organization ownership. Memory APIs require a Remora API key and record request usage in Redis for the dashboard usage view.
