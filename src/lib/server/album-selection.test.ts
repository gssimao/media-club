import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as schema from './db/schema';
import type { AppDatabase } from './db';
import { assignItemsToAlbum, createAlbum } from './albums';
import { addItem, getItemById } from './items';
import type { ListType, MediaCategory } from '$lib/types/media';

describe('bulk collection selection', () => {
	let sqlite: Database.Database;
	let db: AppDatabase;
	let albumId: string;
	beforeEach(async () => {
		sqlite = new Database(':memory:');
		const local = drizzle(sqlite, { schema });
		migrate(local, { migrationsFolder: join(process.cwd(), 'drizzle') });
		db = local as unknown as AppDatabase;
		albumId = (await createAlbum(db, { category: 'movie', title: 'Selected films' }))!.id;
	});
	afterEach(() => sqlite.close());
	async function item(category: MediaCategory = 'movie', list: ListType = 'owned') {
		return (
			await addItem(db, category, list, {
				externalId: crypto.randomUUID(),
				title: 'Film',
				subtitle: null,
				year: null,
				coverUrl: null
			})
		).id!;
	}
	it('adds the entire selection and accepts duplicate IDs only once', async () => {
		const a = await item(),
			b = await item();
		expect(await assignItemsToAlbum(db, albumId, [a, b, a])).toEqual({ ok: true, count: 2 });
		expect((await getItemById(db, a))?.albumId).toBe(albumId);
		expect((await getItemById(db, b))?.albumId).toBe(albumId);
	});
	it.each(['wishlist', 'category', 'missing'] as const)(
		'rejects an entire batch containing a %s item',
		async (invalid) => {
			const valid = await item();
			const bad =
				invalid === 'wishlist'
					? await item('movie', 'wishlist')
					: invalid === 'category'
						? await item('book')
						: 'missing';
			expect((await assignItemsToAlbum(db, albumId, [valid, bad])).ok).toBe(false);
			expect((await getItemById(db, valid))?.albumId).toBeNull();
		}
	);
	it('requires explicit permission to move and resets watched state in the new collection', async () => {
		const other = (await createAlbum(db, { category: 'movie', title: 'Original' }))!.id;
		const a = await item(),
			b = await item();
		await db
			.update(schema.items)
			.set({ albumId: other, albumWatchedAt: new Date() })
			.where(eq(schema.items.id, a));
		expect((await assignItemsToAlbum(db, albumId, [a, b])).ok).toBe(false);
		expect((await getItemById(db, b))?.albumId).toBeNull();
		expect((await getItemById(db, a))?.albumId).toBe(other);
		expect(await assignItemsToAlbum(db, albumId, [a, b], true)).toEqual({ ok: true, count: 2 });
		expect((await getItemById(db, a))?.albumWatchedAt).toBeNull();
	});
	it('preserves watched state when a selection is resubmitted', async () => {
		const a = await item();
		const watched = new Date('2026-01-01T12:00:00Z');
		await db
			.update(schema.items)
			.set({ albumId, albumWatchedAt: watched })
			.where(eq(schema.items.id, a));
		expect((await assignItemsToAlbum(db, albumId, [a])).ok).toBe(true);
		expect((await getItemById(db, a))?.albumWatchedAt).toEqual(watched);
	});
	it('supports a large library without an SQL parameter per selected ID', async () => {
		const ids: string[] = [];
		for (let i = 0; i < 180; i++) ids.push(await item());
		expect(await assignItemsToAlbum(db, albumId, ids)).toEqual({ ok: true, count: 180 });
	});
	it('rejects empty, oversized, and deleted-collection requests', async () => {
		expect((await assignItemsToAlbum(db, albumId, [])).ok).toBe(false);
		expect(
			(
				await assignItemsToAlbum(
					db,
					albumId,
					Array.from({ length: 1001 }, (_, i) => String(i))
				)
			).ok
		).toBe(false);
		const a = await item();
		expect((await assignItemsToAlbum(db, 'deleted', [a])).ok).toBe(false);
		expect((await getItemById(db, a))?.albumId).toBeNull();
	});
});
