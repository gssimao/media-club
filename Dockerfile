FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Toolchain for compiling better-sqlite3's native bindings (builder stage only).
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build:docker

# Drop devDependencies but keep the compiled native modules for the runner.
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV DATABASE_URL=file:/app/data/media-club.db

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/scripts/migrate.mjs ./scripts/migrate.mjs

RUN mkdir -p /app/data && chown -R node:node /app

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
	CMD node -e "fetch('http://127.0.0.1:3000/').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Migrations run on every start (no-op when up to date). The admin account is
# seeded by the app itself from ADMIN_USERNAME / ADMIN_PASSWORD on first request.
CMD ["sh", "-c", "node scripts/migrate.mjs && node build/index.js"]
