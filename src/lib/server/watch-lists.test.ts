import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as schema from './db/schema';
import type { AppDatabase } from './db';
import {
	addShowTrackerItem,
	getShowTrackerItemById,
	listShowTrackerItems,
	setShowTrackerStatus
} from './show-tracker';
import { parseTrackStatus, showTrackerActions } from './show-tracker-page';
import {
	addStreamingListItem,
	createStreamingList,
	listStreamingListItems,
	setStreamingItemWatched
} from './streaming-lists';
import { getCatalogStatusForExternalIds } from './search-catalog';
import { actions as listActions } from '../../routes/movies/streaming/+page.server';
import { actions as movieActions } from '../../routes/movies/streaming/[listId]/+page.server';

describe('unowned watch lists', () => {
	let sqlite: Database.Database;
	let db: AppDatabase;
	const show = {
		externalId: 'tmdb:tv:qa',
		title: 'Tracked show',
		subtitle: null,
		year: 2024,
		coverUrl: null
	};
	beforeEach(() => {
		sqlite = new Database(':memory:');
		const local = drizzle(sqlite, { schema });
		migrate(local, { migrationsFolder: join(process.cwd(), 'drizzle') });
		db = local as unknown as AppDatabase;
	});
	afterEach(() => sqlite.close());
	it('moves a show to completed and back without adding owned content or losing metadata', async () => {
		const { id } = await addShowTrackerItem(
			db,
			{ ...show, metadata: { genres: ['Drama'] } },
			'watching'
		);
		await setShowTrackerStatus(db, id!, 'completed');
		expect(await getShowTrackerItemById(db, id!)).toMatchObject({
			trackStatus: 'completed',
			metadata: { genres: ['Drama'] }
		});
		expect(
			(await listShowTrackerItems(db)).filter((item) => item.trackStatus === 'completed')
		).toHaveLength(1);
		expect(await db.select().from(schema.items)).toEqual([]);
		const status = await getCatalogStatusForExternalIds(db, 'show', [show.externalId], {
			showTracker: true
		});
		expect(status[show.externalId]).toMatchObject({ owned: false, onShowTracker: true });
		await setShowTrackerStatus(db, id!, 'watching');
		expect((await getShowTrackerItemById(db, id!))?.trackStatus).toBe('watching');
	});
	it('adds a previously watched show once and keeps it out of owned counts', async () => {
		await addShowTrackerItem(db, show, 'completed');
		await addShowTrackerItem(db, show, 'completed');
		expect(await listShowTrackerItems(db)).toHaveLength(1);
		expect(await db.select().from(schema.items)).toHaveLength(0);
	});
	it('keeps streamed movies and watched state separate from owned content', async () => {
		const listId = await createStreamingList(db, { title: 'Subscription movies' });
		const { id } = await addStreamingListItem(db, listId, {
			...show,
			externalId: 'tmdb:movie:qa',
			title: 'Streamed film'
		});
		await setStreamingItemWatched(db, id!, true);
		expect((await listStreamingListItems(db, listId))[0].watchedAt).toBeInstanceOf(Date);
		expect(await db.select().from(schema.items)).toEqual([]);
		await setStreamingItemWatched(db, id!, false);
		expect((await listStreamingListItems(db, listId))[0].watchedAt).toBeNull();
	});
	it('accepts completed and rejects unsupported tracker sections', () => {
		expect(parseTrackStatus('completed')).toBe('completed');
		expect(parseTrackStatus('owned')).toBeNull();
		expect(parseTrackStatus('')).toBeNull();
	});
	for (const [area, actions] of Object.entries({
		lists: listActions,
		movies: movieActions,
		shows: showTrackerActions
	})) {
		for (const [name, action] of Object.entries(actions)) {
			it(`guards anonymous ${area}/${name} before reading or writing data`, async () => {
				const event = { locals: { user: null, db } } as unknown as Parameters<typeof action>[0];
				await expect(action(event)).rejects.toMatchObject({ status: 303, location: '/login' });
			});
		}
	}
});
