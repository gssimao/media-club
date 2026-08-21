import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import * as schema from '$lib/server/db/schema';
import type { AppDatabase } from '$lib/server/db';
import { addItem } from '$lib/server/items';
import { addStreamingListItem, createStreamingList } from '$lib/server/streaming-lists';
import { attachCatalogStatus, getCatalogStatusForExternalIds } from '$lib/server/search-catalog';

describe('search catalog status', () => {
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

	it('returns owned and wishlist flags for external ids', async () => {
		await addItem(db, 'movie', 'owned', {
			externalId: '100',
			title: 'Owned Movie',
			subtitle: null,
			year: 2020,
			coverUrl: null
		});
		await addItem(db, 'movie', 'wishlist', {
			externalId: '200',
			title: 'Wishlist Movie',
			subtitle: null,
			year: 2021,
			coverUrl: null
		});

		const status = await getCatalogStatusForExternalIds(db, 'movie', ['100', '200', '300']);

		expect(status['100']).toEqual({ owned: true, wishlist: false });
		expect(status['200']).toEqual({ owned: false, wishlist: true });
		expect(status['300']).toEqual({ owned: false, wishlist: false });
	});

	it('includes onStreamingList when a streaming list id is provided', async () => {
		const listId = await createStreamingList(db, { title: 'Friday night' });
		await addStreamingListItem(db, listId, {
			externalId: '550',
			title: 'Fight Club',
			subtitle: null,
			year: 1999,
			coverUrl: null
		});

		const status = await getCatalogStatusForExternalIds(db, 'movie', ['550', '551'], {
			streamingListId: listId
		});

		expect(status['550']?.onStreamingList).toBe(true);
		expect(status['551']?.onStreamingList).toBe(false);
	});

	it('attaches catalog status to search results', () => {
		const enriched = attachCatalogStatus(
			[{ externalId: '1', title: 'A', subtitle: null, year: null, coverUrl: null }],
			{ '1': { owned: true, wishlist: false } }
		);

		expect(enriched[0].catalogStatus).toEqual({ owned: true, wishlist: false });
	});
});
