import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as schema from '$lib/server/db/schema';
import type { AppDatabase } from '$lib/server/db';
import { addItem, getItemById, updateItemCover } from './items';

describe('updateItemCover', () => {
	let sqlite: Database.Database;
	let db: AppDatabase;

	beforeAll(() => {
		sqlite = new Database(':memory:');
		const localDb = drizzle(sqlite, { schema });
		migrate(localDb, { migrationsFolder: join(process.cwd(), 'drizzle') });
		db = localDb as unknown as AppDatabase;
	});

	afterAll(() => {
		sqlite.close();
	});

	it('updates coverUrl on an existing item', async () => {
		const { id } = await addItem(db, 'movie', 'owned', {
			externalId: '550',
			title: 'Fight Club',
			subtitle: null,
			year: 1999,
			coverUrl: 'https://example.com/old.jpg'
		});

		await updateItemCover(db, id!, 'https://example.com/new.jpg');
		const item = await getItemById(db, id!);
		expect(item?.coverUrl).toBe('https://example.com/new.jpg');
	});

	it('clears coverUrl when set to null', async () => {
		const { id } = await addItem(db, 'movie', 'owned', {
			externalId: '551',
			title: 'Se7en',
			subtitle: null,
			year: 1995,
			coverUrl: 'https://example.com/se7en.jpg'
		});

		await updateItemCover(db, id!, null);
		const item = await getItemById(db, id!);
		expect(item?.coverUrl).toBeNull();
	});

	it('merges metadata when a patch is provided', async () => {
		const { id } = await addItem(db, 'movie', 'owned', {
			externalId: '552',
			title: 'Zodiac',
			subtitle: null,
			year: 2007,
			coverUrl: 'https://example.com/zodiac.jpg',
			metadata: { tmdbId: 552, posterPath: '/old.jpg' }
		});

		await updateItemCover(db, id!, 'https://image.tmdb.org/t/p/w342/new.jpg', {
			posterPath: '/new.jpg'
		});

		const item = await getItemById(db, id!);
		expect(item?.metadata?.posterPath).toBe('/new.jpg');
		expect(item?.metadata?.tmdbId).toBe(552);
	});
});
