#!/usr/bin/env node
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { hashPassword } from '../src/lib/server/auth/password.ts';
import { albums, items, adminUser } from '../src/lib/server/db/schema.ts';

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
			listType: 'owned',
			externalId: '120467',
			title: 'The Grand Budapest Hotel',
			subtitle: null,
			year: 2014,
			coverUrl: 'https://image.tmdb.org/t/p/w342/eNpj8uHn1EI2i9G2aBOa2iX1hFx.jpg',
			metadata: JSON.stringify({ tmdbId: 120467, tags: ['Blu-ray'] }),
			notes: null
		},
		{
			category: 'movie',
			listType: 'owned',
			externalId: '9428',
			title: 'The Royal Tenenbaums',
			subtitle: null,
			year: 2001,
			coverUrl: 'https://image.tmdb.org/t/p/w342/6JHKPq1c8X2i2f0d0Y4s4s4s4s4s.jpg',
			metadata: JSON.stringify({ tmdbId: 9428, tags: ['DVD'] }),
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

const wesAndersonTitles = ['The Grand Budapest Hotel', 'The Royal Tenenbaums'];
let wesAlbum = sqlite
	.prepare("SELECT id FROM albums WHERE category = 'movie' AND title = 'Wes Anderson' LIMIT 1")
	.get() as { id: string } | undefined;

if (!wesAlbum) {
	const inserted = await db
		.insert(albums)
		.values({
			category: 'movie',
			title: 'Wes Anderson',
			description: 'Owned Wes Anderson films in the collection.',
			sortOrder: 0
		})
		.returning({ id: albums.id });
	wesAlbum = inserted[0];
}

if (wesAlbum) {
	const ownedMovies = await db
		.select({ id: items.id, title: items.title })
		.from(items)
		.where(eq(items.category, 'movie'));

	for (const movie of ownedMovies) {
		if (wesAndersonTitles.includes(movie.title)) {
			await db.update(items).set({ albumId: wesAlbum.id }).where(eq(items.id, movie.id));
		}
	}
}

console.log(`Seeded media-club database at ${dbPath}`);
