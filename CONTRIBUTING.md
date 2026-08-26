# Contributing to Media Club

Thanks for helping improve Media Club! This project is meant to be easy to fork, self-host, and extend.

## First-time setup

```bash
git clone https://github.com/YOUR_USERNAME/media-club.git
cd media-club
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

See [docs/getting-started.md](docs/getting-started.md) for details, API keys, and troubleshooting.

## Development workflow

After cloning, `npm install` enables **Husky** pre-commit hooks that run:

- `npm run lint` (Prettier + ESLint)
- `npm run check` (Svelte / TypeScript)

Run these yourself before pushing if you skip hooks:

```bash
npm run format   # auto-fix formatting
npm run lint
npm run check
npm test
```

**CI** (GitHub Actions on push/PR) runs lint, check, tests, and `npm audit`.

## Code style

- TypeScript strict mode
- Svelte 5 runes (`$props`, `$state`, `$derived`)
- Tailwind CSS 4 for styling
- Rounded UI chrome per project conventions (see `.cursor/rules/` if present locally)
- Match existing patterns in `src/lib/server/` and `src/routes/`

## Pull requests

1. Fork the repo and create a feature branch from `main`
2. Keep changes focused: one feature or fix per PR
3. Update docs if you change setup, env vars, or architecture
4. Describe how you tested (local dev, Docker, or Cloudflare if relevant)

## Reporting issues

Please include:

- How you run the app (local dev, Cloudflare, Docker)
- Node.js version (`node -v`)
- Steps to reproduce
- Expected vs actual behavior
- Relevant logs (**redact secrets**: never paste API keys or passwords)

## Project goals

Media Club should stay:

- **Simple**: title lists, not a full media server
- **Easy to self-host**: minimal moving parts, clear docs
- **Safe by default**: public read, authenticated write

Avoid scope creep into streaming, file storage, or multi-user accounts unless discussed in an issue first.

## Database changes

1. Edit `src/lib/server/db/schema.ts`
2. Run `npm run db:generate`
3. Commit the new SQL under `drizzle/`
4. Apply locally with `npm run db:migrate`
