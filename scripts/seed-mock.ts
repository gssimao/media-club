#!/usr/bin/env node
/**
 * Idempotent mock catalog — safe to run multiple times.
 * Adds movies, music, books, albums, and sample watched states.
 */
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { and, eq } from 'drizzle-orm';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { albums, items } from '../src/lib/server/db/schema.ts';

const dbPath = process.env.DATABASE_URL?.replace(/^file:/, '') ?? './data/media-club.db';
const dir = dirname(dbPath);

if (!existsSync(dir)) {
	mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

migrate(db, { migrationsFolder: './drizzle' });

type MockItem = {
	category: 'movie' | 'music' | 'book';
	listType: 'owned' | 'wishlist';
	externalId: string;
	title: string;
	subtitle?: string | null;
	year?: number | null;
	coverUrl?: string | null;
	metadata?: Record<string, unknown>;
	notes?: string | null;
	watched?: boolean;
};

type MockAlbum = {
	category: 'movie' | 'music' | 'book';
	title: string;
	description: string;
	sortOrder: number;
	itemExternalIds: string[];
	watchedExternalIds?: string[];
};

const MOCK_ITEMS: MockItem[] = [
	{
		category: 'movie',
		listType: 'owned',
		externalId: '120467',
		title: 'The Grand Budapest Hotel',
		year: 2014,
		coverUrl: 'https://image.tmdb.org/t/p/w342/eNpj8uHn1EI2i9G2aBOa2iX1hFx.jpg',
		metadata: { tmdbId: 120467, tags: ['Blu-ray'] }
	},
	{
		category: 'movie',
		listType: 'owned',
		externalId: '9428',
		title: 'The Royal Tenenbaums',
		year: 2001,
		coverUrl: 'https://image.tmdb.org/t/p/w342/4O4FRQ4q1x5B0f7n6H9Q8Q8Q8Q8Q.jpg',
		metadata: { tmdbId: 9428, tags: ['DVD'] }
	},
	{
		category: 'movie',
		listType: 'owned',
		externalId: '550',
		title: 'Fight Club',
		year: 1999,
		coverUrl: 'https://image.tmdb.org/t/p/w342/pB8BM7pd15eBHgkQ5P/mk3m65IVh.jpg',
		metadata: { tmdbId: 550, tags: ['Blu-ray'] },
		notes: 'Ungrouped, lives on the main Movies shelf.'
	},
	// —— Movies (owned) ——
	{
		category: 'movie',
		listType: 'owned',
		externalId: '78',
		title: 'Blade Runner',
		year: 1982,
		coverUrl: 'https://image.tmdb.org/t/p/w342/63wfKattMYMk8x7TJcb0QtSc1i.jpg',
		metadata: { tmdbId: 78, tags: ['Blu-ray'] }
	},
	{
		category: 'movie',
		listType: 'owned',
		externalId: '348',
		title: 'Alien',
		year: 1979,
		coverUrl: 'https://image.tmdb.org/t/p/w342/vfrQk5IPloGg1v9RzbL2q0kRp2M.jpg',
		metadata: { tmdbId: 348, tags: ['Blu-ray'] },
		watched: true
	},
	{
		category: 'movie',
		listType: 'owned',
		externalId: '62',
		title: '2001: A Space Odyssey',
		year: 1968,
		coverUrl: 'https://image.tmdb.org/t/p/w342/ve72VxNqjGM69UkyWRWdhrtOmJM.jpg',
		metadata: { tmdbId: 62, tags: ['4K UHD'] }
	},
	{
		category: 'movie',
		listType: 'owned',
		externalId: '157336',
		title: 'Interstellar',
		year: 2014,
		coverUrl: 'https://image.tmdb.org/t/p/w342/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
		metadata: { tmdbId: 157336, tags: ['Blu-ray'] }
	},
	{
		category: 'movie',
		listType: 'owned',
		externalId: '329865',
		title: 'Arrival',
		year: 2016,
		coverUrl: 'https://image.tmdb.org/t/p/w342/x2FJsf1ElAgr63Y3PNPtZrcYIh.jpg',
		metadata: { tmdbId: 329865, tags: ['Blu-ray'] },
		watched: true
	},
	{
		category: 'movie',
		listType: 'owned',
		externalId: '438631',
		title: 'Dune',
		subtitle: 'Part One',
		year: 2021,
		coverUrl: 'https://image.tmdb.org/t/p/w342/d5NXSklXo0qyIYclV28CkJzVFr6.jpg',
		metadata: { tmdbId: 438631, tags: ['4K UHD'] }
	},
	{
		category: 'movie',
		listType: 'owned',
		externalId: '27205',
		title: 'Inception',
		year: 2010,
		coverUrl: 'https://image.tmdb.org/t/p/w342/oovIQ70HL44Qq9oN6i7qW5jFGAo',
		metadata: { tmdbId: 27205, tags: ['Blu-ray'] }
	},
	{
		category: 'movie',
		listType: 'owned',
		externalId: '603',
		title: 'The Matrix',
		year: 1999,
		coverUrl: 'https://image.tmdb.org/t/p/w342/f89U3ADr1oiB1s9GpdPQia3oc2.jpg',
		metadata: { tmdbId: 603, tags: ['4K UHD'] }
	},
	{
		category: 'movie',
		listType: 'owned',
		externalId: '194',
		title: 'Amélie',
		year: 2001,
		coverUrl: 'https://image.tmdb.org/t/p/w342/zogWnCSztU8YePZ5bAdCfPJ3FJQ.jpg',
		metadata: { tmdbId: 194, tags: ['DVD'] }
	},
	{
		category: 'movie',
		listType: 'owned',
		externalId: '153',
		title: 'Lost in Translation',
		year: 2003,
		coverUrl: 'https://image.tmdb.org/t/p/w342/yY4zDFvW8bhkrvZBDjG1kiyXAn',
		metadata: { tmdbId: 153, tags: ['Blu-ray'] },
		watched: true
	},
	{
		category: 'movie',
		listType: 'owned',
		externalId: '152601',
		title: 'Her',
		year: 2013,
		coverUrl: 'https://image.tmdb.org/t/p/w342/7C90CQkG8XgHaC0dZ7Fe3KFL9z.jpg',
		metadata: { tmdbId: 152601, tags: ['Blu-ray'] }
	},
	{
		category: 'movie',
		listType: 'owned',
		externalId: '76',
		title: 'Before Sunrise',
		year: 1995,
		coverUrl: 'https://image.tmdb.org/t/p/w342/3r0wSynK6H8f4b8b8b8b8b8b8b8b.jpg',
		metadata: { tmdbId: 76, tags: ['DVD'] }
	},
	{
		category: 'movie',
		listType: 'owned',
		externalId: '11544',
		title: 'Rushmore',
		year: 1998,
		coverUrl: 'https://image.tmdb.org/t/p/w342/4O4FRQ4q1x5B0f7n6H9Q8Q8Q8Q8Q.jpg',
		metadata: { tmdbId: 11544, tags: ['Criterion', 'Blu-ray'] }
	},
	{
		category: 'movie',
		listType: 'owned',
		externalId: '8358',
		title: 'Moonrise Kingdom',
		year: 2012,
		coverUrl: 'https://image.tmdb.org/t/p/w342/y4z081g2470qolp9ewp1b5tt7.jpg',
		metadata: { tmdbId: 8358, tags: ['Blu-ray'] },
		watched: true
	},
	{
		category: 'movie',
		listType: 'owned',
		externalId: '106646',
		title: 'The Life Aquatic with Steve Zissou',
		year: 2004,
		coverUrl: 'https://image.tmdb.org/t/p/w342/4O4FRQ4q1x5B0f7n6H9Q8Q8Q8Q8Q.jpg',
		metadata: { tmdbId: 106646, tags: ['DVD'] }
	},
	{
		category: 'movie',
		listType: 'owned',
		externalId: '694',
		title: 'The Shining',
		year: 1980,
		coverUrl: 'https://image.tmdb.org/t/p/w342/9fgh3Rs1onRHOxoE6PjqhWeNmFm.jpg',
		metadata: { tmdbId: 694, tags: ['Blu-ray'] }
	},
	{
		category: 'movie',
		listType: 'owned',
		externalId: '493922',
		title: 'Hereditary',
		year: 2018,
		coverUrl: 'https://image.tmdb.org/t/p/w342/6Lthz5o0o4o0o4o0o4o0o4o0o4o0.jpg',
		metadata: { tmdbId: 493922, tags: ['Blu-ray'] }
	},
	{
		category: 'movie',
		listType: 'owned',
		externalId: '419430',
		title: 'Get Out',
		year: 2017,
		coverUrl: 'https://image.tmdb.org/t/p/w342/tFXcEccSQMf3lfhfXKSU77W2yF.jpg',
		metadata: { tmdbId: 419430, tags: ['Blu-ray'] },
		watched: true
	},
	{
		category: 'movie',
		listType: 'owned',
		externalId: '530385',
		title: 'Midsommar',
		year: 2019,
		coverUrl: 'https://image.tmdb.org/t/p/w342/7LE66mfZk2kX4s5b6X5X5X5X5X5.jpg',
		metadata: { tmdbId: 530385, tags: ['Blu-ray'] }
	},
	{
		category: 'movie',
		listType: 'wishlist',
		externalId: '693134',
		title: 'Dune: Part Two',
		year: 2024,
		coverUrl: 'https://image.tmdb.org/t/p/w342/1pdfLvkbY9ohJlYj2hZGiYdSs6.jpg',
		metadata: { tmdbId: 693134 }
	},
	{
		category: 'movie',
		listType: 'wishlist',
		externalId: '872585',
		title: 'Oppenheimer',
		year: 2023,
		coverUrl: 'https://image.tmdb.org/t/p/w342/8Gxv8gSfc6azYRXtvDxk6Cp0c7X.jpg',
		metadata: { tmdbId: 872585 }
	},

	// —— Music (owned) ——
	{
		category: 'music',
		listType: 'owned',
		externalId: '116060',
		title: 'Kind of Blue',
		subtitle: 'Miles Davis',
		year: 1959,
		coverUrl: 'https://coverartarchive.org/release/116060/front-500',
		metadata: { discogsId: 116060, tags: ['Vinyl'] }
	},
	{
		category: 'music',
		listType: 'owned',
		externalId: '37384',
		title: 'Blue Train',
		subtitle: 'John Coltrane',
		year: 1958,
		coverUrl: 'https://coverartarchive.org/release/37384/front-500',
		metadata: { discogsId: 37384, tags: ['Vinyl'] },
		watched: true
	},
	{
		category: 'music',
		listType: 'owned',
		externalId: '135963',
		title: 'A Love Supreme',
		subtitle: 'John Coltrane',
		year: 1965,
		coverUrl: 'https://coverartarchive.org/release/135963/front-500',
		metadata: { discogsId: 135963, tags: ['Vinyl'] }
	},
	{
		category: 'music',
		listType: 'owned',
		externalId: '249504',
		title: 'Discovery',
		subtitle: 'Daft Punk',
		year: 2001,
		coverUrl: 'https://coverartarchive.org/release/249504/front-500',
		metadata: { discogsId: 249504, tags: ['CD'] }
	},
	{
		category: 'music',
		listType: 'owned',
		externalId: '129060',
		title: 'OK Computer',
		subtitle: 'Radiohead',
		year: 1997,
		coverUrl: 'https://coverartarchive.org/release/129060/front-500',
		metadata: { discogsId: 129060, tags: ['Vinyl'] },
		watched: true
	},
	{
		category: 'music',
		listType: 'owned',
		externalId: '2495042',
		title: 'Nevermind',
		subtitle: 'Nirvana',
		year: 1991,
		coverUrl: 'https://coverartarchive.org/release/2495042/front-500',
		metadata: { discogsId: 2495042, tags: ['CD'] }
	},
	{
		category: 'music',
		listType: 'owned',
		externalId: '87456',
		title: 'In the Court of the Crimson King',
		subtitle: 'King Crimson',
		year: 1969,
		coverUrl: 'https://coverartarchive.org/release/87456/front-500',
		metadata: { discogsId: 87456, tags: ['Vinyl'] }
	},
	{
		category: 'music',
		listType: 'owned',
		externalId: '4420',
		title: 'Rumours',
		subtitle: 'Fleetwood Mac',
		year: 1977,
		coverUrl: 'https://coverartarchive.org/release/4420/front-500',
		metadata: { discogsId: 4420, tags: ['Vinyl'] }
	},
	{
		category: 'music',
		listType: 'wishlist',
		externalId: '888888',
		title: 'Random Access Memories',
		subtitle: 'Daft Punk',
		year: 2013,
		coverUrl: 'https://coverartarchive.org/release/888888/front-500',
		metadata: { discogsId: 888888, tags: ['Vinyl'] }
	},

	// —— Books (owned) ——
	{
		category: 'book',
		listType: 'owned',
		externalId: '/works/OL45804W',
		title: 'The Hobbit',
		subtitle: 'J.R.R. Tolkien',
		year: 1937,
		coverUrl: 'https://covers.openlibrary.org/b/id/14627567-M.jpg',
		metadata: { workKey: '/works/OL45804W', tags: ['Hardcover'] }
	},
	{
		category: 'book',
		listType: 'owned',
		externalId: '/works/OL893415W',
		title: 'The Name of the Wind',
		subtitle: 'Patrick Rothfuss',
		year: 2007,
		coverUrl: 'https://covers.openlibrary.org/b/id/8228691-M.jpg',
		metadata: { workKey: '/works/OL893415W', tags: ['Paperback'] },
		watched: true
	},
	{
		category: 'book',
		listType: 'owned',
		externalId: '/works/OL893415X',
		title: 'Dune',
		subtitle: 'Frank Herbert',
		year: 1965,
		coverUrl: 'https://covers.openlibrary.org/b/id/7222246-M.jpg',
		metadata: { workKey: '/works/OL893415X', tags: ['Hardcover'] }
	},
	{
		category: 'book',
		listType: 'owned',
		externalId: '/works/OL763409W',
		title: 'Neuromancer',
		subtitle: 'William Gibson',
		year: 1984,
		coverUrl: 'https://covers.openlibrary.org/b/id/7228691-M.jpg',
		metadata: { workKey: '/works/OL763409W', tags: ['Paperback'] }
	},
	{
		category: 'book',
		listType: 'owned',
		externalId: '/works/OL1168007W',
		title: 'The Old Man and the Sea',
		subtitle: 'Ernest Hemingway',
		year: 1952,
		coverUrl: 'https://covers.openlibrary.org/b/id/8222246-M.jpg',
		metadata: { workKey: '/works/OL1168007W', tags: ['Paperback'] },
		watched: true
	},
	{
		category: 'book',
		listType: 'owned',
		externalId: '/works/OL1167993W',
		title: 'Animal Farm',
		subtitle: 'George Orwell',
		year: 1945,
		coverUrl: 'https://covers.openlibrary.org/b/id/7222246-M.jpg',
		metadata: { workKey: '/works/OL1167993W', tags: ['Paperback'] }
	},
	{
		category: 'book',
		listType: 'owned',
		externalId: '/works/OL1167994W',
		title: 'Of Mice and Men',
		subtitle: 'John Steinbeck',
		year: 1937,
		coverUrl: 'https://covers.openlibrary.org/b/id/7222246-M.jpg',
		metadata: { workKey: '/works/OL1167994W', tags: ['Paperback'] }
	},
	{
		category: 'book',
		listType: 'owned',
		externalId: '/works/OL82563W',
		title: 'The Left Hand of Darkness',
		subtitle: 'Ursula K. Le Guin',
		year: 1969,
		coverUrl: 'https://covers.openlibrary.org/b/id/7222246-M.jpg',
		metadata: { workKey: '/works/OL82563W', tags: ['Paperback'] }
	},
	{
		category: 'book',
		listType: 'wishlist',
		externalId: '/works/OL82564W',
		title: 'Project Hail Mary',
		subtitle: 'Andy Weir',
		year: 2021,
		coverUrl: 'https://covers.openlibrary.org/b/id/10683427-M.jpg',
		metadata: { workKey: '/works/OL82564W' }
	}
];

const MOCK_ALBUMS: MockAlbum[] = [
	{
		category: 'movie',
		title: 'Sci-Fi Marathon',
		description: 'Space, time, and existential dread: pick one tonight.',
		sortOrder: 0,
		itemExternalIds: ['78', '348', '62', '157336', '329865', '438631', '27205', '603'],
		watchedExternalIds: ['348', '329865']
	},
	{
		category: 'movie',
		title: 'Cozy Rainy Day',
		description: 'Soft light, quiet longing, and a cup of tea.',
		sortOrder: 1,
		itemExternalIds: ['194', '153', '152601', '76'],
		watchedExternalIds: ['153']
	},
	{
		category: 'movie',
		title: 'Wes Anderson',
		description: 'Symmetrical frames and deadpan hearts.',
		sortOrder: 2,
		itemExternalIds: ['120467', '9428', '11544', '8358', '106646'],
		watchedExternalIds: ['8358']
	},
	{
		category: 'movie',
		title: 'Horror Night',
		description: 'Sleep is overrated anyway.',
		sortOrder: 3,
		itemExternalIds: ['694', '493922', '419430', '530385'],
		watchedExternalIds: ['419430']
	},
	{
		category: 'music',
		title: 'Late Night Vinyl',
		description: 'Jazz and prog for after midnight.',
		sortOrder: 0,
		itemExternalIds: ['116060', '37384', '135963', '87456'],
		watchedExternalIds: ['37384']
	},
	{
		category: 'music',
		title: '90s Essentials',
		description: 'Grunge, electronica, and the end of the century.',
		sortOrder: 1,
		itemExternalIds: ['249504', '129060', '2495042', '4420'],
		watchedExternalIds: ['129060']
	},
	{
		category: 'book',
		title: 'Fantasy Shelf',
		description: 'Worlds bigger than the room you are sitting in.',
		sortOrder: 0,
		itemExternalIds: [
			'/works/OL45804W',
			'/works/OL893415W',
			'/works/OL893415X',
			'/works/OL763409W',
			'/works/OL82563W'
		],
		watchedExternalIds: ['/works/OL893415W']
	},
	{
		category: 'book',
		title: 'Short Reads',
		description: 'Finish one before the kettle boils.',
		sortOrder: 1,
		itemExternalIds: ['/works/OL1168007W', '/works/OL1167993W', '/works/OL1167994W'],
		watchedExternalIds: ['/works/OL1168007W']
	}
];

async function upsertItem(mock: MockItem): Promise<string> {
	const existing = await db
		.select({ id: items.id })
		.from(items)
		.where(
			and(
				eq(items.category, mock.category),
				eq(items.externalId, mock.externalId),
				eq(items.listType, mock.listType)
			)
		)
		.limit(1);

	const now = new Date();
	const watchedAt = mock.watched ? now : null;

	if (existing[0]) {
		await db
			.update(items)
			.set({
				title: mock.title,
				subtitle: mock.subtitle ?? null,
				year: mock.year ?? null,
				coverUrl: mock.coverUrl ?? null,
				metadata: mock.metadata ? JSON.stringify(mock.metadata) : null,
				notes: mock.notes ?? null,
				albumWatchedAt: watchedAt,
				updatedAt: now
			})
			.where(eq(items.id, existing[0].id));
		return existing[0].id;
	}

	const id = crypto.randomUUID();
	await db.insert(items).values({
		id,
		category: mock.category,
		listType: mock.listType,
		externalId: mock.externalId,
		title: mock.title,
		subtitle: mock.subtitle ?? null,
		year: mock.year ?? null,
		coverUrl: mock.coverUrl ?? null,
		metadata: mock.metadata ? JSON.stringify(mock.metadata) : null,
		notes: mock.notes ?? null,
		albumWatchedAt: watchedAt,
		createdAt: now,
		updatedAt: now
	});
	return id;
}

async function upsertAlbum(mock: MockAlbum): Promise<string> {
	const existing = await db
		.select({ id: albums.id })
		.from(albums)
		.where(and(eq(albums.category, mock.category), eq(albums.title, mock.title)))
		.limit(1);

	const now = new Date();
	let albumId: string;

	if (existing[0]) {
		albumId = existing[0].id;
		await db
			.update(albums)
			.set({
				description: mock.description,
				sortOrder: mock.sortOrder,
				updatedAt: now
			})
			.where(eq(albums.id, albumId));
	} else {
		albumId = crypto.randomUUID();
		await db.insert(albums).values({
			id: albumId,
			category: mock.category,
			title: mock.title,
			description: mock.description,
			sortOrder: mock.sortOrder,
			createdAt: now,
			updatedAt: now
		});
	}

	for (const externalId of mock.itemExternalIds) {
		const rows = await db
			.select({ id: items.id })
			.from(items)
			.where(and(eq(items.externalId, externalId), eq(items.listType, 'owned')))
			.limit(1);

		const item = rows[0];
		if (!item) continue;

		const watched = mock.watchedExternalIds?.includes(externalId) ?? false;

		await db
			.update(items)
			.set({
				albumId,
				albumWatchedAt: watched ? now : null,
				updatedAt: now
			})
			.where(eq(items.id, item.id));
	}

	return albumId;
}

let itemsAdded = 0;
let itemsUpdated = 0;

for (const mock of MOCK_ITEMS) {
	const existing = await db
		.select({ id: items.id })
		.from(items)
		.where(
			and(
				eq(items.category, mock.category),
				eq(items.externalId, mock.externalId),
				eq(items.listType, mock.listType)
			)
		)
		.limit(1);

	await upsertItem(mock);
	if (existing[0]) itemsUpdated++;
	else itemsAdded++;
}

const albumIds: string[] = [];
for (const mock of MOCK_ALBUMS) {
	albumIds.push(await upsertAlbum(mock));
}

const counts = sqlite
	.prepare(
		`
	SELECT
		(SELECT COUNT(*) FROM items) AS items,
		(SELECT COUNT(*) FROM albums) AS albums,
		(SELECT COUNT(*) FROM items WHERE album_id IS NOT NULL) AS in_albums,
		(SELECT COUNT(*) FROM items WHERE album_watched_at IS NOT NULL) AS watched
`
	)
	.get() as { items: number; albums: number; in_albums: number; watched: number };

console.log(`Mock seed complete → ${dbPath}`);
console.log(`  Items: ${counts.items} (${itemsAdded} new, ${itemsUpdated} updated)`);
console.log(`  Collections: ${counts.albums} (${MOCK_ALBUMS.length} configured)`);
console.log(`  In collections: ${counts.in_albums} · Watched in collection: ${counts.watched}`);
console.log('');
console.log('Browse:');
console.log('  /movies          /music          /books');
console.log('  /albums/movie    /albums/music   /albums/book');

sqlite.close();
