# Media Club

A simple, self-hosted catalog of **movies**, **vinyl records**, and **books** you own at home — plus wishlists for what you want to buy next.

- Public visitors can browse your collections and wishlists
- Only the admin can add, edit, remove, or move items
- Metadata comes from free APIs (TMDB, Discogs, Open Library)
- SQLite storage with two deployment paths: **Cloudflare Workers + D1** (primary) or **Docker + local SQLite**

> This app tracks titles and cover art only. It does not store or stream actual media files.

## Why this repo exists

Projects like [Wishflix](https://github.com/Navihdz/wishflix) and [Taster](https://github.com/qiaeru/taster) inspired parts of the idea, but none matched the full scope (movies + vinyl + books, owned/wishlist split, public-read/admin-write, SvelteKit stack). Media Club is a focused greenfield build for that use case.

## Quick start (local)

```bash
git clone https://github.com/your-username/media-club.git
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

| Feature            | Description                                          |
| ------------------ | ---------------------------------------------------- |
| Collections        | Owned movies, music (vinyl), and books               |
| Wishlists          | Separate lists per category                          |
| API search         | Admin adds items from TMDB / Discogs / Open Library  |
| Move to collection | One-click wishlist → owned                           |
| Notes              | Optional per-item notes (edition, format, condition) |
| Public read        | Anyone can view; mutations require admin login       |

## Deployment

| Method                  | Guide                                                |
| ----------------------- | ---------------------------------------------------- |
| Cloudflare Workers + D1 | [docs/setup-cloudflare.md](docs/setup-cloudflare.md) |
| Docker self-host        | [docs/setup-docker.md](docs/setup-docker.md)         |

API key setup: [docs/api-keys.md](docs/api-keys.md)

Architecture overview: [docs/architecture.md](docs/architecture.md)

## Scripts

| Command                     | Purpose                        |
| --------------------------- | ------------------------------ |
| `npm run dev`               | Local dev server (SQLite file) |
| `npm run build`             | Cloudflare Worker build        |
| `npm run build:docker`      | Node adapter build for Docker  |
| `npm run deploy`            | Deploy to Cloudflare           |
| `npm run db:migrate`        | Apply migrations locally       |
| `npm run db:migrate:remote` | Apply migrations to D1         |
| `npm run db:seed`           | Seed admin user + demo items   |

## Environment variables

See [.env.example](.env.example) for the full list. Required for production:

- `ADMIN_PASSWORD` — admin login password (hashed on first boot)
- `TMDB_API_KEY` — movie search (free)
- `DISCOGS_TOKEN` — vinyl search (free)
- Open Library needs no key

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
