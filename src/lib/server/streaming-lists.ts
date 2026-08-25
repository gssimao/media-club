import { and, asc, desc, eq } from 'drizzle-orm';
import type { AppDatabase } from '$lib/server/db';
import { streamingListItems, streamingLists } from '$lib/server/db/schema';
import { addItem } from '$lib/server/items';
import type { ListType, SearchResult } from '$lib/types/media';

function parseMetadata(value: string | null): Record<string, unknown> | null {
	if (!value) return null;
	try {
		return JSON.parse(value) as Record<string, unknown>;
	} catch {
		return null;
	}
}

export function mapStreamingList(row: typeof streamingLists.$inferSelect) {
	return {
		id: row.id,
		title: row.title,
		description: row.description,
		coverUrl: row.coverUrl,
		sortOrder: row.sortOrder,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	};
}

export function mapStreamingListItem(row: typeof streamingListItems.$inferSelect) {
	return {
		id: row.id,
		listId: row.listId,
		externalId: row.externalId,
		title: row.title,
		subtitle: row.subtitle,
		year: row.year,
		coverUrl: row.coverUrl,
		metadata: parseMetadata(row.metadata),
		watchedAt: row.watchedAt,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	};
}

export type StreamingListView = ReturnType<typeof mapStreamingList>;
export type StreamingListItemView = ReturnType<typeof mapStreamingListItem>;

export async function listStreamingLists(db: AppDatabase) {
	const rows = await db
		.select()
		.from(streamingLists)
		.orderBy(asc(streamingLists.sortOrder), desc(streamingLists.createdAt));

	return rows.map(mapStreamingList);
}

export async function getStreamingListById(db: AppDatabase, id: string) {
	const rows = await db.select().from(streamingLists).where(eq(streamingLists.id, id)).limit(1);
	const row = rows[0];
	return row ? mapStreamingList(row) : null;
}

export async function listStreamingListItems(db: AppDatabase, listId: string) {
	const rows = await db
		.select()
		.from(streamingListItems)
		.where(eq(streamingListItems.listId, listId))
		.orderBy(desc(streamingListItems.createdAt));

	return rows.map(mapStreamingListItem);
}

export async function createStreamingList(
	db: AppDatabase,
	input: { title: string; description?: string | null }
) {
	const now = new Date();
	const id = crypto.randomUUID();
	await db.insert(streamingLists).values({
		id,
		title: input.title.trim(),
		description: input.description?.trim() || null,
		createdAt: now,
		updatedAt: now
	});
	return id;
}

export async function deleteStreamingList(db: AppDatabase, id: string) {
	await db.delete(streamingLists).where(eq(streamingLists.id, id));
}

export async function addStreamingListItem(
	db: AppDatabase,
	listId: string,
	result: SearchResult
): Promise<{ inserted: boolean; id: string | null }> {
	const existing = await db
		.select({ id: streamingListItems.id })
		.from(streamingListItems)
		.where(
			and(
				eq(streamingListItems.listId, listId),
				eq(streamingListItems.externalId, result.externalId)
			)
		)
		.limit(1);

	if (existing[0]) {
		return { inserted: false, id: existing[0].id };
	}

	const now = new Date();
	const metadata = result.metadata ? JSON.stringify(result.metadata) : null;

	const inserted = await db
		.insert(streamingListItems)
		.values({
			listId,
			externalId: result.externalId,
			title: result.title,
			subtitle: result.subtitle,
			year: result.year,
			coverUrl: result.coverUrl,
			metadata,
			createdAt: now,
			updatedAt: now
		})
		.onConflictDoNothing()
		.returning({ id: streamingListItems.id });

	if (!inserted[0]) {
		const existingAfterConflict = await db
			.select({ id: streamingListItems.id })
			.from(streamingListItems)
			.where(
				and(
					eq(streamingListItems.listId, listId),
					eq(streamingListItems.externalId, result.externalId)
				)
			)
			.limit(1);
		return { inserted: false, id: existingAfterConflict[0]?.id ?? null };
	}

	await db.update(streamingLists).set({ updatedAt: now }).where(eq(streamingLists.id, listId));

	return { inserted: true, id: inserted[0].id };
}

export async function getStreamingListItemById(db: AppDatabase, id: string) {
	const rows = await db
		.select()
		.from(streamingListItems)
		.where(eq(streamingListItems.id, id))
		.limit(1);
	const row = rows[0];
	return row ? mapStreamingListItem(row) : null;
}

export async function updateStreamingItemGenres(db: AppDatabase, id: string, genres: string[]) {
	const rows = await db
		.select()
		.from(streamingListItems)
		.where(eq(streamingListItems.id, id))
		.limit(1);
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

	metadata.genres = genres;

	await db
		.update(streamingListItems)
		.set({ metadata: JSON.stringify(metadata), updatedAt: new Date() })
		.where(eq(streamingListItems.id, id));
}

export async function deleteStreamingListItem(db: AppDatabase, id: string) {
	await db.delete(streamingListItems).where(eq(streamingListItems.id, id));
}

export async function setStreamingItemWatched(db: AppDatabase, id: string, watched: boolean) {
	await db
		.update(streamingListItems)
		.set({ watchedAt: watched ? new Date() : null, updatedAt: new Date() })
		.where(eq(streamingListItems.id, id));
}

export async function promoteStreamingItem(
	db: AppDatabase,
	id: string,
	listType: ListType
): Promise<{ ok: boolean; message?: string }> {
	const item = await getStreamingListItemById(db, id);
	if (!item) return { ok: false, message: 'Streaming item not found.' };

	await addItem(
		db,
		'movie',
		listType,
		{
			externalId: item.externalId,
			title: item.title,
			subtitle: item.subtitle,
			year: item.year,
			coverUrl: item.coverUrl,
			metadata: item.metadata ?? undefined
		},
		undefined
	);

	await deleteStreamingListItem(db, id);
	return { ok: true };
}

export async function resolveStreamingListCoverUrl(
	db: AppDatabase,
	list: StreamingListView
): Promise<string | null> {
	if (list.coverUrl) return list.coverUrl;

	const rows = await db
		.select({ coverUrl: streamingListItems.coverUrl })
		.from(streamingListItems)
		.where(and(eq(streamingListItems.listId, list.id)))
		.orderBy(desc(streamingListItems.createdAt))
		.limit(1);

	return rows[0]?.coverUrl ?? null;
}

export async function getStreamingListItemCounts(db: AppDatabase) {
	const lists = await listStreamingLists(db);
	const counts: Record<string, number> = {};

	for (const list of lists) {
		const items = await listStreamingListItems(db, list.id);
		counts[list.id] = items.length;
	}

	return counts;
}
