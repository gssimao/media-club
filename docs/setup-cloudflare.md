# Cloudflare Workers + D1 Setup

This is the recommended deployment path: free tier hosting, global CDN, and a managed SQLite-compatible database.

## Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free)
- [Node.js](https://nodejs.org/) 20+
- Wrangler CLI (included as a dev dependency)

## 1. Create the D1 database

```bash
npx wrangler d1 create media-club-db
```

Copy the `database_id` from the output into `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "media-club-db",
    "database_id": "YOUR_DATABASE_ID_HERE",
    "migrations_dir": "drizzle"
  }
]
```

## 2. Configure secrets

Set production secrets via Wrangler (never commit these):

```bash
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET
npx wrangler secret put TMDB_API_KEY
npx wrangler secret put DISCOGS_TOKEN
```

Optional — redirect `/` away from the welcome page (not a secret):

```bash
npx wrangler secret put DEFAULT_ROUTE
# e.g. /login or /movies
```

Or add to `wrangler.jsonc` under `"vars": { "DEFAULT_ROUTE": "/movies" }`.

Optional:

```bash
npx wrangler secret put ADMIN_USERNAME
```

## 3. Remote migrations

Add your Cloudflare credentials to `.env` for Drizzle remote migrations:

```env
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_DATABASE_ID=your-d1-database-id
CLOUDFLARE_D1_TOKEN=your-api-token
```

Create an API token at **My Profile → API Tokens** with **D1 Edit** permissions.

Apply migrations:

```bash
npm run db:migrate:remote
```

For local Cloudflare preview (`npm run preview`), migrations are applied to local D1 automatically. Preview uses D1; `npm run dev` uses the SQLite file at `./data/media-club.db`.

## 4. Deploy

```bash
npm run deploy
```

Your app will be live at `https://media-club.<your-subdomain>.workers.dev` unless you configure a custom domain.

## 5. Custom domain (optional)

In the Cloudflare dashboard:

1. Go to **Workers & Pages → media-club → Settings → Domains & Routes**
2. Add your domain or subdomain

## Local development with D1

For day-to-day development, use the SQLite file (default):

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

To preview the Cloudflare Worker build with local D1:

```bash
npx wrangler d1 migrations apply media-club-db --local
USE_D1=1 npm run preview
```

## Admin bootstrap

On first request, the app seeds an admin user if none exists and `ADMIN_PASSWORD` is set. Change the password in Wrangler secrets before first deploy in production.

## Cost

Cloudflare free tier includes:

- Workers requests
- D1 reads/writes within generous daily limits
- SSL and CDN

Typical personal use stays at **$0/month**.
