import { and, count, desc, eq, isNull } from 'drizzle-orm';
import type { AppDatabase } from '$lib/server/db';
import { albums, items } from '$lib/server/db/schema';
import { isFormatLikeNote } from '$lib/utils/format-tags';
import { dedupeGenres } from '$lib/utils/movie-genres';
import type { ListType, MediaCategory, SearchResult } from '$lib/types/media';

function parseMetadata(value: string | null): Record<string, unknown> | null {
	if (!value) return null;
	try {
		return JSON.parse(value) as Record<string, unknown>;
	} catch {
		return null;
	}
}

export function mapItem(row: typeof items.$inferSelect) {
	return {
		id: row.id,
		category: row.category,
		listType: row.listType,
		albumId: row.albumId,
		externalId: row.externalId,
		title: row.title,
		subtitle: row.subtitle,
		year: row.year,
		coverUrl: row.coverUrl,
		metadata: parseMetadata(row.metadata),
		notes: row.notes,
		albumWatchedAt: row.albumWatchedAt,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	};
}

export async function listAllItemsByCategory(db: AppDatabase, category: MediaCategory) {
	const rows = await db
		.select()
		.from(items)
		.where(eq(items.category, category))
		.orderBy(desc(items.createdAt));

	return rows.map(mapItem);
}

export async function listItems(db: AppDatabase, category: MediaCategory, listType: ListType) {
	const rows = await db
		.select()
		.from(items)
		.where(and(eq(items.category, category), eq(items.listType, listType)))
		.orderBy(desc(items.createdAt));

	return rows.map(mapItem);
}

export async function listItemsFiltered(
	db: AppDatabase,
	category: MediaCategory,
	listType: ListType,
	options?: { albumId?: string; ungrouped?: boolean }
) {
	const conditions = [eq(items.category, category), eq(items.listType, listType)];

	if (options?.ungrouped) {
		conditions.push(isNull(items.albumId));
	} else if (options?.albumId) {
		conditions.push(eq(items.albumId, options.albumId));
	}

	const rows = await db
		.select()
		.from(items)
		.where(and(...conditions))
		.orderBy(desc(items.createdAt));

	return rows.map(mapItem);
}

export async function getItemCounts(db: AppDatabase) {
	const rows = await db
		.select({
			category: items.category,
			listType: items.listType,
			count: count()
		})
		.from(items)
		.groupBy(items.category, items.listType);

	const counts: Record<string, number> = {};
	for (const row of rows) {
		counts[`${row.category}:${row.listType}`] = row.count;
	}
	return counts;
}

async function validateAlbumForItem(
	db: AppDatabase,
	category: MediaCategory,
	listType: ListType,
	albumId: string | null
) {
	if (!albumId) return;

	if (listType === 'wishlist') {
		throw new Error('Wishlist items cannot be assigned to a collection');
	}

	const albumRows = await db.select().from(albums).where(eq(albums.id, albumId)).limit(1);
	const album = albumRows[0];
	if (!album) {
		throw new Error(`Collection not found: ${albumId}`);
	}
	if (album.category !== category) {
		throw new Error('Collection category must match item category');
	}
}

export async function addItem(
	db: AppDatabase,
	category: MediaCategory,
	listType: ListType,
	result: SearchResult,
	options?: {
		notes?: string | null;
		albumId?: string | null;
	}
): Promise<{ inserted: boolean; id: string | null }> {
	const notes = options?.notes ?? null;
	const albumId = options?.albumId ?? null;

	await validateAlbumForItem(db, category, listType, albumId);

	const existing = await db
		.select({ id: items.id })
		.from(items)
		.where(
			and(
				eq(items.category, category),
				eq(items.externalId, result.externalId),
				eq(items.listType, listType)
			)
		)
		.limit(1);

	if (existing[0]) {
		return { inserted: false, id: existing[0].id };
	}

	const now = new Date();
	const metadata = result.metadata ? JSON.stringify(result.metadata) : null;

	const inserted = await db
		.insert(items)
		.values({
			category,
			listType,
			albumId,
			externalId: result.externalId,
			title: result.title,
			subtitle: result.subtitle,
			year: result.year,
			coverUrl: result.coverUrl,
			metadata,
			notes,
			createdAt: now,
			updatedAt: now
		})
		.onConflictDoNothing()
		.returning({ id: items.id });

	// A concurrent insert can win the race; report the existing row in that case.
	if (!inserted[0]) {
		const existingAfterConflict = await db
			.select({ id: items.id })
			.from(items)
			.where(
				and(
					eq(items.category, category),
					eq(items.externalId, result.externalId),
					eq(items.listType, listType)
				)
			)
			.limit(1);
		return { inserted: false, id: existingAfterConflict[0]?.id ?? null };
	}

	return { inserted: true, id: inserted[0].id };
}

export async function getItemById(db: AppDatabase, id: string) {
	const rows = await db.select().from(items).where(eq(items.id, id)).limit(1);
	const row = rows[0];
	return row ? mapItem(row) : null;
}

export async function listItemsByAlbum(db: AppDatabase, albumId: string) {
	const rows = await db
		.select()
		.from(items)
		.where(eq(items.albumId, albumId))
		.orderBy(desc(items.createdAt));

	return rows.map(mapItem);
}

export async function setItemAlbumId(db: AppDatabase, itemId: string, albumId: string | null) {
	const rows = await db.select().from(items).where(eq(items.id, itemId)).limit(1);
	const item = rows[0];
	if (!item) return;

	const albumChanged = item.albumId !== albumId;

	await db
		.update(items)
		.set({
			albumId,
			albumWatchedAt: albumChanged ? null : item.albumWatchedAt,
			updatedAt: new Date()
		})
		.where(eq(items.id, itemId));
}

export async function updateItemNotes(db: AppDatabase, id: string, notes: string | null) {
	await db.update(items).set({ notes, updatedAt: new Date() }).where(eq(items.id, id));
}

export async function updateItemCover(
	db: AppDatabase,
	id: string,
	coverUrl: string | null,
	metadataPatch?: Record<string, unknown>
) {
	const rows = await db.select().from(items).where(eq(items.id, id)).limit(1);
	const item = rows[0];
	if (!item) return;

	let metadata: Record<string, unknown> = {};
	if (item.metadata) {
		try {
			metadata = JSON.parse(item.metadata) as Record<string, unknown>;
		} catch {
			metadata = {};
		}
	}

	if (metadataPatch) {
		Object.assign(metadata, metadataPatch);
	}

	await db
		.update(items)
		.set({
			coverUrl,
			metadata: Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : null,
			updatedAt: new Date()
		})
		.where(eq(items.id, id));
}

export async function setAlbumWatched(db: AppDatabase, id: string, watched: boolean) {
	await db
		.update(items)
		.set({ albumWatchedAt: watched ? new Date() : null, updatedAt: new Date() })
		.where(eq(items.id, id));
}

export async function updateItemTags(db: AppDatabase, id: string, tags: string[]) {
	const rows = await db.select().from(items).where(eq(items.id, id)).limit(1);
	const item = rows[0];
	if (!item) return;

	let metadata: Record<string, unknown> = {};
	if (item.metadata) {
		try {
			metadata = JSON.parse(item.metadata) as Record<string, unknown>;
		} catch {
			metadata = {};
		}
	}

	metadata.tags = tags;

	const notes = isFormatLikeNote(item.notes) ? null : item.notes;

	await db
		.update(items)
		.set({ metadata: JSON.stringify(metadata), notes, updatedAt: new Date() })
		.where(eq(items.id, id));
}

export async function updateItemGenres(db: AppDatabase, id: string, genres: string[]) {
	const rows = await db.select().from(items).where(eq(items.id, id)).limit(1);
	const item = rows[0];
	if (!item) return;

	let metadata: Record<string, unknown> = {};
	if (item.metadata) {
		try {
			metadata = JSON.parse(item.metadata) as Record<string, unknown>;
		} catch {
			metadata = {};
		}
	}

	metadata.genres = dedupeGenres(genres);

	await db
		.update(items)
		.set({ metadata: JSON.stringify(metadata), updatedAt: new Date() })
		.where(eq(items.id, id));
}

export async function deleteItem(db: AppDatabase, id: string) {
	await db.delete(items).where(eq(items.id, id));
}

export async function moveToOwned(
	db: AppDatabase,
	id: string
): Promise<{ ok: boolean; itemId: string | null }> {
	const rows = await db.select().from(items).where(eq(items.id, id)).limit(1);
	const item = rows[0];
	if (!item || item.listType !== 'wishlist') return { ok: false, itemId: null };

	const ownedRows = await db
		.select()
		.from(items)
		.where(
			and(
				eq(items.category, item.category),
				eq(items.externalId, item.externalId),
				eq(items.listType, 'owned')
			)
		)
		.limit(1);

	if (ownedRows[0]) {
		await db.delete(items).where(eq(items.id, id));
		return { ok: true, itemId: ownedRows[0].id };
	}

	await db.update(items).set({ listType: 'owned', updatedAt: new Date() }).where(eq(items.id, id));

	return { ok: true, itemId: id };
}

export async function getRecentItems(db: AppDatabase, limit = 8) {
	const rows = await db.select().from(items).orderBy(desc(items.updatedAt)).limit(limit);
	return rows.map(mapItem);
}
