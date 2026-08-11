#!/usr/bin/env node
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { hashPassword } from '../src/lib/server/auth/password.ts';
import { items, adminUser } from '../src/lib/server/db/schema.ts';

const dbPath = process.env.DATABASE_URL?.replace(/^file:/, '') ?? './data/media-club.db';
const dir = dirname(dbPath);

if (!existsSync(dir)) {
	mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

migrate(db, { migrationsFolder: './drizzle' });

const password = process.env.ADMIN_PASSWORD ?? 'changeme';
const username = process.env.ADMIN_USERNAME ?? 'admin';

const existingAdmin = sqlite.prepare('SELECT id FROM admin_user LIMIT 1').get();
if (!existingAdmin) {
	await db.insert(adminUser).values({
		username,
		passwordHash: await hashPassword(password)
	});
}

const existingItems = sqlite.prepare('SELECT COUNT(*) as count FROM items').get() as {
	count: number;
};
if (existingItems.count === 0) {
	await db.insert(items).values([
		{
			category: 'movie',
			listType: 'owned',
			externalId: '550',
			title: 'Fight Club',
			subtitle: null,
			year: 1999,
			coverUrl: 'https://image.tmdb.org/t/p/w342/pB8BM7pd15eBHgkQ5P/mk3m65IVh.jpg',
			metadata: JSON.stringify({ tmdbId: 550, tags: ['DVD'] }),
			notes: null
		},
		{
			category: 'movie',
			listType: 'wishlist',
			externalId: '687163',
			title: 'Project Hail Mary',
			subtitle: null,
			year: 2026,
			coverUrl: 'https://image.tmdb.org/t/p/w342/yihdXomYb5kTeSivtFndMy5iDmf.jpg',
			metadata: JSON.stringify({ tmdbId: 687163 }),
			notes: null
		},
		{
			category: 'book',
			listType: 'owned',
			externalId: '/works/OL45804W',
			title: 'The Hobbit',
			subtitle: 'J.R.R. Tolkien',
			year: 1937,
			coverUrl: 'https://covers.openlibrary.org/b/id/14627567-M.jpg',
			metadata: JSON.stringify({ workKey: '/works/OL45804W', tags: ['Hardcover'] }),
			notes: null
		},
		{
			category: 'music',
			listType: 'wishlist',
			externalId: '249504',
			title: 'Daft Punk - Discovery',
			subtitle: null,
			year: 2001,
			coverUrl: null,
			metadata: JSON.stringify({ discogsId: 249504, tags: ['Vinyl'] }),
			notes: null
		}
	]);
}

console.log(`Seeded media-club database at ${dbPath}`);
