import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { join } from 'node:path';
import * as schema from '$lib/server/db/schema';
import type { AppDatabase } from '$lib/server/db';
import {
	addItem,
	getItemById,
	getItemCounts,
	listItemsFiltered,
	updateItemNotes,
	deleteItem
} from '$lib/server/items';
import { assignItemToAlbum, createAlbum, listAlbumsByCategory } from '$lib/server/albums';
import { runWithMcpContext, type McpContext } from '../context';
import { mcpAddMediaItem } from './add';
import { toolSuccess, toolFailure } from '../response';

function parseToolResult(result: ReturnType<typeof toolSuccess>) {
	return JSON.parse(result.content[0]?.text ?? '{}') as {
		success: boolean;
		data?: unknown;
		error?: string;
	};
}

describe('MCP item workflow', () => {
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

	it('adds, notes, assigns to album, and removes an item', async () => {
		const album = await createAlbum(db, {
			category: 'movie',
			title: 'Sci-Fi Shelf'
		});
		expect(album).not.toBeNull();

		const { id, inserted } = await addItem(
			db,
			'movie',
			'owned',
			{
				externalId: '603',
				title: 'The Matrix',
				subtitle: null,
				year: 1999,
				coverUrl: null
			},
			{ albumId: album!.id }
		);
		expect(inserted).toBe(true);
		expect(id).toBeTruthy();

		const item = await getItemById(db, id!);
		expect(item?.title).toBe('The Matrix');
		expect(item?.albumId).toBe(album!.id);

		await updateItemNotes(db, id!, '4K UHD edition');
		expect((await getItemById(db, id!))?.notes).toBe('4K UHD edition');

		await assignItemToAlbum(db, id!, null);
		expect((await getItemById(db, id!))?.albumId).toBeNull();

		const albums = await listAlbumsByCategory(db, 'movie');
		expect(albums).toHaveLength(1);
		expect(albums[0]?.itemCount).toBe(0);

		await deleteItem(db, id!);
		expect(await getItemById(db, id!)).toBeNull();
	});

	it('returns inserted false for duplicate adds', async () => {
		const payload = {
			externalId: '27205',
			title: 'Inception',
			subtitle: null,
			year: 2010,
			coverUrl: null
		};

		const first = await addItem(db, 'movie', 'owned', payload);
		const second = await addItem(db, 'movie', 'owned', payload);

		expect(first.inserted).toBe(true);
		expect(second.inserted).toBe(false);
		expect(second.id).toBe(first.id);
	});

	it('rejects wishlist items with albumId', async () => {
		const album = await createAlbum(db, { category: 'movie', title: 'Shelf' });
		await expect(
			addItem(
				db,
				'movie',
				'wishlist',
				{ externalId: '1', title: 'Test', subtitle: null, year: null, coverUrl: null },
				{ albumId: album!.id }
			)
		).rejects.toThrow(/wishlist/i);
	});

	it('rejects assigning wishlist items to albums', async () => {
		const { id } = await addItem(db, 'movie', 'wishlist', {
			externalId: '99',
			title: 'Wishlist Movie',
			subtitle: null,
			year: null,
			coverUrl: null
		});
		const album = await createAlbum(db, { category: 'movie', title: 'Shelf 2' });
		const ok = await assignItemToAlbum(db, id!, album!.id);
		expect(ok).toBe(false);
	});

	it('listItemsFiltered defaults to ungrouped semantics', async () => {
		const album = await createAlbum(db, { category: 'music', title: 'Jazz' });
		await addItem(
			db,
			'music',
			'owned',
			{ externalId: 'a', title: 'Grouped', subtitle: null, year: null, coverUrl: null },
			{ albumId: album!.id }
		);
		await addItem(db, 'music', 'owned', {
			externalId: 'b',
			title: 'Ungrouped',
			subtitle: null,
			year: null,
			coverUrl: null
		});

		const ungrouped = await listItemsFiltered(db, 'music', 'owned', { ungrouped: true });
		expect(ungrouped).toHaveLength(1);
		expect(ungrouped[0]?.title).toBe('Ungrouped');
	});

	it('getItemCounts uses grouped query', async () => {
		const counts = await getItemCounts(db);
		expect(counts['movie:owned']).toBeGreaterThan(0);
	});
});

describe('mcpAddMediaItem', () => {
	let sqlite: Database.Database;
	let db: AppDatabase;
	let ctx: McpContext;

	beforeAll(() => {
		sqlite = new Database(':memory:');
		const localDb = drizzle(sqlite, { schema });
		migrate(localDb, { migrationsFolder: join(process.cwd(), 'drizzle') });
		db = localDb as unknown as AppDatabase;
		ctx = {
			db,
			platform: undefined,
			clientIp: 'test',
			rateLimitKey: 'mcp-key:test'
		};
	});

	afterAll(() => {
		sqlite.close();
	});

	it('reports duplicate adds clearly', async () => {
		const input = {
			category: 'book' as const,
			listType: 'owned' as const,
			externalId: 'OL123',
			title: 'Dune',
			subtitle: null,
			year: 1965,
			coverUrl: null
		};

		await runWithMcpContext(ctx, () => mcpAddMediaItem(input, 'add_media_item'));
		const duplicate = await runWithMcpContext(ctx, () => mcpAddMediaItem(input, 'add_media_item'));
		const parsed = parseToolResult(duplicate);
		expect(parsed.success).toBe(true);
		expect(parsed.data).toMatchObject({
			inserted: false,
			message: 'Item already exists in catalog'
		});
	});

	it('rejects invalid album on add', async () => {
		const result = await runWithMcpContext(ctx, () =>
			mcpAddMediaItem(
				{
					category: 'movie',
					listType: 'owned',
					externalId: '404',
					title: 'Missing Album',
					albumId: 'nonexistent-album-id'
				},
				'add_media_item'
			)
		);
		const parsed = parseToolResult(result);
		expect(parsed.success).toBe(false);
		expect(parsed.error).toMatch(/collection not found/i);
	});
});

describe('MCP response helpers', () => {
	it('toolSuccess wraps data', () => {
		const result = toolSuccess({ ok: true });
		expect(result.content[0]?.type).toBe('text');
		const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
			success: boolean;
			data: { ok: boolean };
		};
		expect(parsed.success).toBe(true);
		expect(parsed.data.ok).toBe(true);
	});

	it('toolFailure marks error', () => {
		const result = toolFailure('nope');
		expect(result.isError).toBe(true);
		const parsed = JSON.parse(result.content[0]?.text ?? '{}') as {
			success: boolean;
			error: string;
		};
		expect(parsed.success).toBe(false);
		expect(parsed.error).toBe('nope');
	});
});
