import { and, asc, count, eq, inArray, isNotNull } from 'drizzle-orm';
import type { AppDatabase } from '$lib/server/db';
import { albums, items } from '$lib/server/db/schema';
import { setItemAlbumId, listItemsByAlbum } from '$lib/server/items';
import type { Album as AlbumType, AlbumAccentColor, MediaCategory } from '$lib/types/media';

function mapAlbum(row: typeof albums.$inferSelect, itemCount: number): AlbumType {
	return {
		id: row.id,
		category: row.category,
		title: row.title,
		description: row.description,
		coverUrl: row.coverUrl,
		accentColor: (row.accentColor as AlbumAccentColor | null) ?? null,
		sortOrder: row.sortOrder,
		itemCount,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	};
}

export async function listAlbumsByCategory(db: AppDatabase, category: MediaCategory) {
	const rows = await db
		.select({
			album: albums,
			itemCount: count(items.id)
		})
		.from(albums)
		.leftJoin(items, eq(items.albumId, albums.id))
		.where(eq(albums.category, category))
		.groupBy(albums.id)
		.orderBy(asc(albums.sortOrder), asc(albums.title));

	return rows.map(({ album, itemCount }) => mapAlbum(album, itemCount));
}

export async function getAlbumById(db: AppDatabase, id: string) {
	const rows = await db
		.select({
			album: albums,
			itemCount: count(items.id)
		})
		.from(albums)
		.leftJoin(items, eq(items.albumId, albums.id))
		.where(eq(albums.id, id))
		.groupBy(albums.id)
		.limit(1);

	const row = rows[0];
	if (!row) return null;
	return mapAlbum(row.album, row.itemCount);
}

export const getAlbum = getAlbumById;

export async function listItemsInAlbum(db: AppDatabase, albumId: string) {
	return listItemsByAlbum(db, albumId);
}

export async function createAlbum(
	db: AppDatabase,
	input: {
		category: MediaCategory;
		title: string;
		description?: string | null;
		coverUrl?: string | null;
	}
) {
	const now = new Date();
	const id = crypto.randomUUID();

	await db.insert(albums).values({
		id,
		category: input.category,
		title: input.title.trim(),
		description: input.description ?? null,
		coverUrl: input.coverUrl ?? null,
		sortOrder: 0,
		createdAt: now,
		updatedAt: now
	});

	return getAlbumById(db, id);
}

export async function updateAlbum(
	db: AppDatabase,
	id: string,
	input: {
		title?: string;
		description?: string | null;
		coverUrl?: string | null;
		accentColor?: AlbumAccentColor | null;
		sortOrder?: number;
	}
) {
	const updates: Partial<typeof albums.$inferInsert> = { updatedAt: new Date() };
	if (input.title !== undefined) updates.title = input.title.trim();
	if (input.description !== undefined) updates.description = input.description;
	if (input.coverUrl !== undefined) updates.coverUrl = input.coverUrl;
	if (input.accentColor !== undefined) updates.accentColor = input.accentColor;
	if (input.sortOrder !== undefined) updates.sortOrder = input.sortOrder;

	await db.update(albums).set(updates).where(eq(albums.id, id));
	return getAlbumById(db, id);
}

export async function deleteAlbum(db: AppDatabase, id: string) {
	await db.delete(albums).where(eq(albums.id, id));
}

export async function assignItemToAlbum(
	db: AppDatabase,
	itemId: string,
	albumId: string | null
): Promise<boolean> {
	const itemRows = await db.select().from(items).where(eq(items.id, itemId)).limit(1);
	const item = itemRows[0];
	if (!item) return false;

	if (albumId) {
		const album = await getAlbumById(db, albumId);
		if (!album) return false;
		if (item.category !== album.category) return false;
		if (item.listType !== 'owned') return false;
	}

	await setItemAlbumId(db, itemId, albumId);
	return true;
}

/** Falls back to the cover of an item in the album when the album has none of its own. */
export async function resolveAlbumCoverUrl(
	db: AppDatabase,
	album: { id: string; coverUrl: string | null }
): Promise<string | null> {
	if (album.coverUrl) return album.coverUrl;

	const rows = await db
		.select({ coverUrl: items.coverUrl })
		.from(items)
		.where(and(eq(items.albumId, album.id), isNotNull(items.coverUrl)))
		.limit(1);

	return rows[0]?.coverUrl ?? null;
}

/** Batched variant of {@link resolveAlbumCoverUrl} — one query for all albums instead of one per album. */
export async function resolveAlbumCoverUrls(
	db: AppDatabase,
	albumList: AlbumType[]
): Promise<Record<string, string | null>> {
	const coverUrls: Record<string, string | null> = {};
	const missing: string[] = [];

	for (const album of albumList) {
		coverUrls[album.id] = album.coverUrl;
		if (!album.coverUrl) missing.push(album.id);
	}

	if (missing.length > 0) {
		const rows = await db
			.select({ albumId: items.albumId, coverUrl: items.coverUrl })
			.from(items)
			.where(and(inArray(items.albumId, missing), isNotNull(items.coverUrl)));

		for (const row of rows) {
			if (row.albumId && !coverUrls[row.albumId]) {
				coverUrls[row.albumId] = row.coverUrl;
			}
		}
	}

	return coverUrls;
}
