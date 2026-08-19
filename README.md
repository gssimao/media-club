# Media Club

![Tests](https://img.shields.io/badge/tests-63%20passing-success)
![TypeScript](https://img.shields.io/badge/typescript-100%25-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Free, self-hosted catalog for **movies**, **vinyl records**, and **books** — with separate owned lists and wishlists.

Fork it, run it on your machine, or deploy to Cloudflare or Docker. Public visitors browse the catalog; only the admin can add, edit, or remove items.

> This app tracks titles and cover art only. It does not store or stream media files.

## Features

| Feature            | Description                                                             |
| ------------------ | ----------------------------------------------------------------------- |
| Catalog            | Owned movies, music (vinyl), and books                                  |
| Collections        | Per-category folders for grouping owned media (one collection per item) |
| Wishlists          | Separate lists per category                                             |
| API search         | Admin adds items from TMDB / Discogs / Open Library                     |
| Move to collection | One-click wishlist → owned                                              |
| Notes              | Optional per-item notes (edition, format, condition)                    |
| Public read        | Anyone can view; mutations require admin login                          |

## Quick start

**Requirements:** Node.js 22+, npm

```bash
git clone https://github.com/YOUR_ORG/media-club.git
cd media-club
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Default admin login (change in `.env` before seeding):

- Username: `admin`
- Password: `changeme`

**Full walkthrough:** [docs/getting-started.md](docs/getting-started.md) — fork setup, env vars, troubleshooting, and first steps.

## Deployment

| Method                  | Guide                                                |
| ----------------------- | ---------------------------------------------------- |
| Cloudflare Workers + D1 | [docs/setup-cloudflare.md](docs/setup-cloudflare.md) |
| Docker self-host        | [docs/setup-docker.md](docs/setup-docker.md)         |

API keys: [docs/api-keys.md](docs/api-keys.md)  
Architecture: [docs/architecture.md](docs/architecture.md)

## Configuration

Copy [.env.example](.env.example) to `.env`. Common variables:

| Variable         | Required          | Purpose                                             |
| ---------------- | ----------------- | --------------------------------------------------- |
| `ADMIN_PASSWORD` | Yes\*             | Admin login (hashed on first boot)                  |
| `ADMIN_USERNAME` | No                | Default `admin`                                     |
| `TMDB_API_KEY`   | For movies search | Free key from [TMDB](https://www.themoviedb.org/)   |
| `DISCOGS_TOKEN`  | For music search  | Free token from [Discogs](https://www.discogs.com/) |
| `DEFAULT_ROUTE`  | No                | Redirect `/` (e.g. `/movies`); empty = welcome page |

\*Docker Compose refuses to start without `ADMIN_PASSWORD` set.

Books use Open Library and need no API key.

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
| `npm run db:seed:mock`      | Larger mock catalog for local testing       |
| `npm run theme`             | Regenerate theme CSS from the color palette |
| `npm run test`              | Run unit tests                              |
| `npm run lint`              | Prettier + ESLint                           |
| `npm run check`             | Svelte / TypeScript check                   |
| `npm run audit`             | Dependency security audit                   |

## Customizing colors

Edit [`src/lib/theme/palette.ts`](src/lib/theme/palette.ts), then run `npm run theme` to regenerate `src/routes/theme.css`. Never edit `theme.css` by hand.

## Contributing

Bug reports, docs improvements, and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
