#!/usr/bin/env node
/**
 * Runtime migration runner for Docker / bare-Node deployments.
 *
 * Uses drizzle-orm's programmatic migrator (a production dependency) instead
 * of drizzle-kit (a dev tool), so it works in a pruned production image.
 */
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const dbPath = (process.env.DATABASE_URL ?? 'file:./data/media-club.db').replace(/^file:/, '');
const dir = dirname(dbPath);

if (!existsSync(dir)) {
	mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');

migrate(drizzle(sqlite), { migrationsFolder: './drizzle' });
sqlite.close();

console.log(`[media-club] migrations applied to ${dbPath}`);
