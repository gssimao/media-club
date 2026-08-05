# Docker Self-Host Setup

Run Media Club on your own server, NAS, or home lab with a single container and a SQLite file on a volume.

## Prerequisites

- Docker and Docker Compose
- Optional: reverse proxy (Caddy, nginx) for HTTPS

## 1. Copy and configure

```bash
cd media-club
cp .env.example .env
```

Edit `.env` or set variables in `docker-compose.yml`:

- `ADMIN_PASSWORD` — **change this**
- `SESSION_SECRET` — long random string
- `DEFAULT_ROUTE` — optional; e.g. `/login` or `/movies` instead of the welcome page at `/`
- `TMDB_API_KEY` — for movie search
- `DISCOGS_TOKEN` — for vinyl search

## 2. Start the stack

```bash
docker compose up -d --build
```

Open [http://localhost:3000](http://localhost:3000).

The container runs migrations + seed on startup, then serves the app with the Node adapter.

## 3. Data persistence

SQLite data is stored in `./data/media-club.db` on the host (mounted volume). Back up this directory:

```bash
tar -czf media-club-backup.tar.gz data/
```

## 4. Reverse proxy (recommended)

Put Caddy or nginx in front for HTTPS. Example Caddy snippet:

```caddy
media.example.com {
  reverse_proxy localhost:3000
}
```

Set `SESSION_COOKIE_SECURE=true` behavior automatically when served over HTTPS (cookies use `Secure` when the request protocol is HTTPS).

## 5. Updates

```bash
git pull
docker compose up -d --build
```

Your `./data` volume preserves the database across rebuilds.

## Troubleshooting

| Issue              | Fix                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------- |
| Cannot log in      | Check `ADMIN_PASSWORD`; delete `data/media-club.db` and restart to re-seed (loses data) |
| Movie search empty | Set `TMDB_API_KEY`                                                                      |
| Music search empty | Set `DISCOGS_TOKEN`                                                                     |
| Port conflict      | Change `3000:3000` in `docker-compose.yml`                                              |
