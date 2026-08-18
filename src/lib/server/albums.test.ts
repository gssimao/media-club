import Database from 'better-sqlite3';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as schema from '$lib/server/db/schema';
import type { AppDatabase } from '$lib/server/db';
import { createAlbum, deleteAlbum, resolveAlbumCoverUrl, resolveAlbumCoverUrls } from './albums';
import { addItem } from './items';

describe('album covers', () => {
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

	it('uses the album cover when set', async () => {
		const album = await createAlbum(db, {
			category: 'movie',
			title: 'Own Cover',
			coverUrl: 'https://example.com/own.jpg'
		});
		expect(await resolveAlbumCoverUrl(db, album!)).toBe('https://example.com/own.jpg');
	});

	it('falls back to an item cover when the album has none', async () => {
		const album = await createAlbum(db, { category: 'movie', title: 'Fallback Cover' });
		await addItem(
			db,
			'movie',
			'owned',
			{
				externalId: 'cover-1',
				title: 'With Cover',
				subtitle: null,
				year: null,
				coverUrl: 'https://example.com/item.jpg'
			},
			{ albumId: album!.id }
		);

		expect(await resolveAlbumCoverUrl(db, album!)).toBe('https://example.com/item.jpg');
	});

	it('returns null when neither album nor items have covers', async () => {
		const album = await createAlbum(db, { category: 'movie', title: 'No Cover' });
		expect(await resolveAlbumCoverUrl(db, album!)).toBeNull();
	});

	it('resolves covers for many albums in a single pass', async () => {
		const withOwn = await createAlbum(db, {
			category: 'music',
			title: 'A',
			coverUrl: 'https://example.com/a.jpg'
		});
		const withItem = await createAlbum(db, { category: 'music', title: 'B' });
		const bare = await createAlbum(db, { category: 'music', title: 'C' });

		await addItem(
			db,
			'music',
			'owned',
			{
				externalId: 'vinyl-1',
				title: 'Vinyl',
				subtitle: null,
				year: null,
				coverUrl: 'https://example.com/b.jpg'
			},
			{ albumId: withItem!.id }
		);

		const covers = await resolveAlbumCoverUrls(db, [withOwn!, withItem!, bare!]);
		expect(covers[withOwn!.id]).toBe('https://example.com/a.jpg');
		expect(covers[withItem!.id]).toBe('https://example.com/b.jpg');
		expect(covers[bare!.id]).toBeNull();
	});
});

describe('deleteAlbum', () => {
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

	it('returns assigned items to the ungrouped collection', async () => {
		const album = await createAlbum(db, { category: 'movie', title: 'To Delete' });
		const { id } = await addItem(
			db,
			'movie',
			'owned',
			{
				externalId: 'ungroup-1',
				title: 'In Album',
				subtitle: null,
				year: null,
				coverUrl: null
			},
			{ albumId: album!.id }
		);
		expect(id).toBeTruthy();

		await deleteAlbum(db, album!.id);

		const rows = await db.select().from(schema.items).where(eq(schema.items.id, id!));
		expect(rows[0]?.albumId).toBeNull();
	});
});
