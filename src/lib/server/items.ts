import { and, desc, eq } from 'drizzle-orm';
import type { AppDatabase } from '$lib/server/db';
import { items } from '$lib/server/db/schema';
import { isFormatLikeNote } from '$lib/utils/format-tags';
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
		externalId: row.externalId,
		title: row.title,
		subtitle: row.subtitle,
		year: row.year,
		coverUrl: row.coverUrl,
		metadata: parseMetadata(row.metadata),
		notes: row.notes,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	};
}

export async function listItems(db: AppDatabase, category: MediaCategory, listType: ListType) {
	const rows = await db
		.select()
		.from(items)
		.where(and(eq(items.category, category), eq(items.listType, listType)))
		.orderBy(desc(items.createdAt));

	return rows.map(mapItem);
}

export async function getItemCounts(db: AppDatabase) {
	const rows = await db.select().from(items);
	const counts: Record<string, number> = {};

	for (const row of rows) {
		const key = `${row.category}:${row.listType}`;
		counts[key] = (counts[key] ?? 0) + 1;
	}

	return counts;
}

export async function addItem(
	db: AppDatabase,
	category: MediaCategory,
	listType: ListType,
	result: SearchResult,
	notes?: string | null
) {
	const now = new Date();
	const metadata = result.metadata ? JSON.stringify(result.metadata) : null;

	await db
		.insert(items)
		.values({
			category,
			listType,
			externalId: result.externalId,
			title: result.title,
			subtitle: result.subtitle,
			year: result.year,
			coverUrl: result.coverUrl,
			metadata,
			notes: notes ?? null,
			createdAt: now,
			updatedAt: now
		})
		.onConflictDoNothing();
}

export async function updateItemNotes(db: AppDatabase, id: string, notes: string | null) {
	await db.update(items).set({ notes, updatedAt: new Date() }).where(eq(items.id, id));
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

export async function deleteItem(db: AppDatabase, id: string) {
	await db.delete(items).where(eq(items.id, id));
}

export async function moveToOwned(db: AppDatabase, id: string) {
	const rows = await db.select().from(items).where(eq(items.id, id)).limit(1);
	const item = rows[0];
	if (!item || item.listType !== 'wishlist') return false;

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
		return true;
	}

	await db.update(items).set({ listType: 'owned', updatedAt: new Date() }).where(eq(items.id, id));

	return true;
}

export async function getRecentItems(db: AppDatabase, limit = 8) {
	const rows = await db.select().from(items).orderBy(desc(items.updatedAt)).limit(limit);
	return rows.map(mapItem);
}
