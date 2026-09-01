import { desc, eq } from 'drizzle-orm';
import type { AppDatabase } from '$lib/server/db';
import { showTrackerItems } from '$lib/server/db/schema';
import { addItem } from '$lib/server/items';
import type { ListType, SearchResult, ShowTrackStatus } from '$lib/types/media';
import { dedupeGenres } from '$lib/utils/movie-genres';

function parseMetadata(value: string | null): Record<string, unknown> | null {
	if (!value) return null;
	try {
		return JSON.parse(value) as Record<string, unknown>;
	} catch {
		return null;
	}
}

export function mapShowTrackerItem(row: typeof showTrackerItems.$inferSelect) {
	return {
		id: row.id,
		externalId: row.externalId,
		title: row.title,
		subtitle: row.subtitle,
		year: row.year,
		coverUrl: row.coverUrl,
		metadata: parseMetadata(row.metadata),
		notes: row.notes,
		trackStatus: row.trackStatus,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	};
}

export type ShowTrackerItemView = ReturnType<typeof mapShowTrackerItem>;

export async function listShowTrackerItems(db: AppDatabase) {
	const rows = await db.select().from(showTrackerItems).orderBy(desc(showTrackerItems.updatedAt));

	return rows.map(mapShowTrackerItem);
}

export async function getShowTrackerItemById(db: AppDatabase, id: string) {
	const rows = await db.select().from(showTrackerItems).where(eq(showTrackerItems.id, id)).limit(1);
	const row = rows[0];
	return row ? mapShowTrackerItem(row) : null;
}

export async function addShowTrackerItem(
	db: AppDatabase,
	result: SearchResult,
	trackStatus: ShowTrackStatus
): Promise<{ inserted: boolean; id: string | null }> {
	const existing = await db
		.select({ id: showTrackerItems.id })
		.from(showTrackerItems)
		.where(eq(showTrackerItems.externalId, result.externalId))
		.limit(1);

	if (existing[0]) {
		await db
			.update(showTrackerItems)
			.set({ trackStatus, updatedAt: new Date() })
			.where(eq(showTrackerItems.id, existing[0].id));
		return { inserted: false, id: existing[0].id };
	}

	const now = new Date();
	const metadata = result.metadata ? JSON.stringify(result.metadata) : null;

	const inserted = await db
		.insert(showTrackerItems)
		.values({
			externalId: result.externalId,
			title: result.title,
			subtitle: result.subtitle,
			year: result.year,
			coverUrl: result.coverUrl,
			metadata,
			trackStatus,
			createdAt: now,
			updatedAt: now
		})
		.onConflictDoNothing()
		.returning({ id: showTrackerItems.id });

	if (!inserted[0]) {
		const existingAfterConflict = await db
			.select({ id: showTrackerItems.id })
			.from(showTrackerItems)
			.where(eq(showTrackerItems.externalId, result.externalId))
			.limit(1);
		return { inserted: false, id: existingAfterConflict[0]?.id ?? null };
	}

	return { inserted: true, id: inserted[0].id };
}

export async function setShowTrackerStatus(
	db: AppDatabase,
	id: string,
	trackStatus: ShowTrackStatus
) {
	await db
		.update(showTrackerItems)
		.set({ trackStatus, updatedAt: new Date() })
		.where(eq(showTrackerItems.id, id));
}

export async function updateShowTrackerNotes(db: AppDatabase, id: string, notes: string | null) {
	await db
		.update(showTrackerItems)
		.set({ notes, updatedAt: new Date() })
		.where(eq(showTrackerItems.id, id));
}

export async function updateShowTrackerGenres(db: AppDatabase, id: string, genres: string[]) {
	const rows = await db.select().from(showTrackerItems).where(eq(showTrackerItems.id, id)).limit(1);
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
		.update(showTrackerItems)
		.set({ metadata: JSON.stringify(metadata), updatedAt: new Date() })
		.where(eq(showTrackerItems.id, id));
}

export async function deleteShowTrackerItem(db: AppDatabase, id: string) {
	await db.delete(showTrackerItems).where(eq(showTrackerItems.id, id));
}

export async function promoteShowTrackerItem(
	db: AppDatabase,
	id: string,
	listType: ListType
): Promise<{ ok: boolean; message?: string }> {
	const item = await getShowTrackerItemById(db, id);
	if (!item) return { ok: false, message: 'Tracked show not found.' };

	await addItem(
		db,
		'show',
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

	return { ok: true };
}
