# Contributing to Media Club

Thanks for helping improve Media Club!

## Development setup

```bash
cd media-club
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

## Code style

- TypeScript strict mode
- Svelte 5 runes
- Tailwind CSS 4 for styling
- Run `npm run format` before committing
- Run `npm run check` and `npm run lint`

## Pull requests

1. Create a feature branch from the main branch
2. Keep changes focused — one feature or fix per PR
3. Update docs if you change setup, env vars, or architecture
4. Describe how you tested the change

## Reporting issues

Include:

- Deployment method (local, Cloudflare, Docker)
- Steps to reproduce
- Expected vs actual behavior
- Relevant logs (redact secrets)

## Project goals

Media Club should stay:

- **Simple** — title lists, not a full media server
- **Easy to self-host** — minimal moving parts
- **Safe by default** — public read, authenticated write

Avoid scope creep into streaming, file storage, or multi-tenant SaaS unless discussed first in an issue.
