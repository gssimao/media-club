# Getting started

This guide walks you from a fresh clone (or fork) to a running Media Club instance on your machine.

## Prerequisites

| Requirement     | Notes                           |
| --------------- | ------------------------------- |
| **Node.js 20+** | Check with `node -v`            |
| **npm**         | Comes with Node                 |
| **Git**         | To clone or fork the repository |

Optional for production:

- **Docker** — see [setup-docker.md](setup-docker.md)
- **Cloudflare account** — see [setup-cloudflare.md](setup-cloudflare.md)

## 1. Get the code

**Fork** the repository on GitHub, then clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/media-club.git
cd media-club
```

Or clone upstream directly:

```bash
git clone https://github.com/YOUR_ORG/media-club.git
cd media-club
```

## 2. Configure environment

Copy the example env file and edit it:

```bash
cp .env.example .env
```

At minimum for local development:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme   # change before any real deployment
```

Load API keys when you want admin search to work (see [api-keys.md](api-keys.md)):

- `TMDB_API_KEY` — movies
- `DISCOGS_TOKEN` — vinyl / music
- Books use Open Library and need **no key**

Browse-only mode works without API keys; you just cannot search for new titles in admin until keys are set.

## 3. Install and initialize

```bash
npm install
npm run db:migrate
npm run db:seed
```

What this does:

- **`npm install`** — installs dependencies and sets up git hooks (lint + typecheck on commit)
- **`db:migrate`** — creates `./data/media-club.db` and applies schema migrations
- **`db:seed`** — creates the admin user (if missing) and a few demo catalog items

## 4. Run the dev server

```bash
npm run dev
```

Open the URL shown in the terminal (usually [http://localhost:5173](http://localhost:5173)).

**Default login** (from `.env` at seed time):

- Username: `admin`
- Password: `changeme`

Change `ADMIN_PASSWORD` in `.env` **before** running `db:seed` if you want a different password on a fresh database. If the admin already exists, update the password by changing `.env` and resetting the database (see troubleshooting).

## 5. What to try first

1. Browse **Movies**, **Music**, and **Books** on the public catalog
2. Log in at `/login` as admin
3. Open **Admin → Search** to add items from external APIs (requires keys)
4. Visit **Settings** to toggle theme and layout preferences

## Deploy to production

| Method                  | Guide                                      | Best for              |
| ----------------------- | ------------------------------------------ | --------------------- |
| Docker                  | [setup-docker.md](setup-docker.md)         | Home server, NAS, VPS |
| Cloudflare Workers + D1 | [setup-cloudflare.md](setup-cloudflare.md) | Free global hosting   |

Always set a strong `ADMIN_PASSWORD` before deploying.

## Troubleshooting

| Problem                            | Likely cause                                             | Fix                                                                           |
| ---------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Unstyled page                      | Global CSS not loading                                   | Ensure you use `npm run dev`, not a stale build                               |
| `Cannot find module` after pull    | Dependencies out of date                                 | `npm install`                                                                 |
| Login fails                        | Wrong password or admin already seeded with old password | Reset DB: `rm -f data/media-club.db && npm run db:migrate && npm run db:seed` |
| Movie/music search empty           | Missing API keys                                         | Add keys to `.env` and restart the dev server                                 |
| Port 5173 in use                   | Another Vite app running                                 | Vite picks the next free port — read the terminal URL                         |
| `ADMIN_PASSWORD` required (Docker) | Compose enforces a real password                         | Set `ADMIN_PASSWORD` in `.env` next to `docker-compose.yml`                   |

## Development commands

```bash
npm run dev          # Dev server (local SQLite)
npm run check        # TypeScript / Svelte check
npm run lint         # Prettier + ESLint
npm run format       # Auto-format
npm run test         # Unit tests
npm run db:studio    # Drizzle Studio (inspect DB)
```

See [CONTRIBUTING.md](../CONTRIBUTING.md) for pull request guidelines.
