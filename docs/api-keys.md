# API Keys

Media Club proxies all metadata API calls server-side. Keys never reach the browser.

## TMDB (movies)

Required for movie search.

1. Create a free account at [themoviedb.org](https://www.themoviedb.org/)
2. Go to **Settings → API**
3. Request an API key (Developer / personal use)
4. Copy the **API Key (v3 auth)**

Set as `TMDB_API_KEY` in `.env`, Docker Compose, or Cloudflare secrets.

Attribution: this product uses the TMDB API but is not endorsed or certified by TMDB.

## Discogs (vinyl / records)

Required for music search.

1. Create an account at [discogs.com](https://www.discogs.com/)
2. Go to **Settings → Developers**
3. Generate a **Personal Access Token**
4. Copy the token

Set as `DISCOGS_TOKEN`.

The app sends a `User-Agent` header identifying Media Club, as required by Discogs.

## Open Library (books)

No API key required.

Search uses the public [Open Library Search API](https://openlibrary.org/dev/docs/api/search). Please use reasonable search debouncing (built into the admin UI) and do not bulk-scrape.

## Security notes

- Never commit `.env` or paste keys into public issues
- Rotate keys if exposed
- Use Cloudflare **Secrets** or Docker env files with restricted permissions in production
