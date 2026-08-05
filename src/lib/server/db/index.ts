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

function createLocalDb(url: string) {
	const filePath = url.replace(/^file:/, '');
	const dir = dirname(filePath);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}

	const sqlite = new Database(filePath);
	sqlite.pragma('journal_mode = WAL');
	return drizzleSqlite(sqlite, { schema });
}

export function getDb(platform: App.Platform | undefined): AppDatabase {
	const localUrl = process.env.DATABASE_URL ?? 'file:./data/media-club.db';

	if (!dev && platform?.env?.DB) {
		return createD1Db(platform.env.DB);
	}

	return createLocalDb(localUrl) as unknown as AppDatabase;
}

export { schema };
