import { dev } from '$app/environment';
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import * as schema from './schema';

export type AppDatabase = ReturnType<typeof createD1Db>;

function createD1Db(d1: D1Database) {
	return drizzleD1(d1, { schema });
}

// Reuse one connection per database file — opening a new better-sqlite3
// handle on every request leaks file descriptors and defeats WAL caching.
const localDbCache = new Map<string, ReturnType<typeof drizzleSqlite>>();

function createLocalDb(url: string) {
	const cached = localDbCache.get(url);
	if (cached) return cached;

	const filePath = url.replace(/^file:/, '');
	const dir = dirname(filePath);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}

	const sqlite = new Database(filePath);
	sqlite.pragma('journal_mode = WAL');
	const db = drizzleSqlite(sqlite, { schema });
	localDbCache.set(url, db);
	return db;
}

export function getDb(platform: App.Platform | undefined): AppDatabase {
	if (!dev && platform?.env?.DB) {
		return createD1Db(platform.env.DB);
	}

	const localUrl = process.env.DATABASE_URL ?? 'file:./data/media-club.db';
	return createLocalDb(localUrl) as unknown as AppDatabase;
}

export { schema };
