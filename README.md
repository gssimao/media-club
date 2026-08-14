# Media Club

Free, self-hosted catalog for **movies**, **vinyl records**, and **books** — with separate owned lists and wishlists.

- Public visitors can browse the catalog
- Only the admin can add, edit, remove, or move items
- Metadata from free APIs (TMDB, Discogs, Open Library)
- SQLite storage with two deployment paths: **Cloudflare Workers + D1** or **Docker + local SQLite**

> This app tracks titles and cover art only. It does not store or stream media files.

## Quick start (local)

```bash
cd media-club
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Default admin credentials (change in `.env` before seeding):

- Username: `admin`
- Password: `changeme`

## Features

| Feature            | Description                                               |
| ------------------ | --------------------------------------------------------- |
| Collections        | Owned movies, music (vinyl), and books                    |
| Albums             | Per-category folders for owned media (one album per item) |
| Wishlists          | Separate lists per category                               |
| API search         | Admin adds items from TMDB / Discogs / Open Library       |
| Move to collection | One-click wishlist → owned                                |
| Notes              | Optional per-item notes (edition, format, condition)      |
| Public read        | Anyone can view; mutations require admin login            |

## Deployment

| Method                  | Guide                                                |
| ----------------------- | ---------------------------------------------------- |
| Cloudflare Workers + D1 | [docs/setup-cloudflare.md](docs/setup-cloudflare.md) |
| Docker self-host        | [docs/setup-docker.md](docs/setup-docker.md)         |

API key setup: [docs/api-keys.md](docs/api-keys.md)

Architecture overview: [docs/architecture.md](docs/architecture.md)

## Scripts

| Command                     | Purpose                                     |
| --------------------------- | ------------------------------------------- |
| `npm run dev`               | Local dev server (SQLite file)              |
| `npm run build`             | Cloudflare Worker build                     |
| `npm run build:docker`      | Node adapter build for Docker               |
| `npm run deploy`            | Deploy to Cloudflare                        |
| `npm run db:migrate`        | Apply migrations locally                    |
| `npm run db:migrate:remote` | Apply migrations to D1                      |
| `npm run db:seed`           | Seed admin user + demo items                |
| `npm run theme`             | Regenerate theme CSS from the color palette |

## Customizing colors

All light and dark mode colors live in one file: [`src/lib/theme/palette.ts`](src/lib/theme/palette.ts).

1. Edit the hex values in `palette.ts` (each token is documented inline)
2. Run `npm run theme` — this regenerates `src/routes/theme.css`
3. Refresh the app (the dev server hot-reloads automatically)

The generator checks WCAG contrast for every text/background pair and warns you if a
combination will be hard to read (and exits non-zero so CI can catch it). Never edit
`src/routes/theme.css` directly — it is overwritten on every run.

## Environment variables

See [.env.example](.env.example) for the full list. Required for production:

- `ADMIN_PASSWORD` — admin login password (hashed on first boot)
- `TMDB_API_KEY` — movie search (free)
- `DISCOGS_TOKEN` — vinyl search (free)
- Open Library needs no key

Optional:

- `DEFAULT_ROUTE` — redirect `/` to this path (e.g. `/login`, `/movies`). Empty or `/` shows the welcome page.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
