import { and, eq, inArray } from 'drizzle-orm';
import type { AppDatabase } from '$lib/server/db';
import { items, streamingListItems } from '$lib/server/db/schema';
import type { CatalogStatus, MediaCategory } from '$lib/types/media';

const EMPTY_STATUS: CatalogStatus = { owned: false, wishlist: false };

export async function getCatalogStatusForExternalIds(
	db: AppDatabase,
	category: MediaCategory,
	externalIds: string[],
	options?: { streamingListId?: string }
): Promise<Record<string, CatalogStatus>> {
	if (externalIds.length === 0) return {};

	const uniqueIds = [...new Set(externalIds)];

	const [ownedRows, wishlistRows, streamingRows] = await Promise.all([
		db
			.select({ externalId: items.externalId })
			.from(items)
			.where(
				and(
					eq(items.category, category),
					eq(items.listType, 'owned'),
					inArray(items.externalId, uniqueIds)
				)
			),
		db
			.select({ externalId: items.externalId })
			.from(items)
			.where(
				and(
					eq(items.category, category),
					eq(items.listType, 'wishlist'),
					inArray(items.externalId, uniqueIds)
				)
			),
		options?.streamingListId
			? db
					.select({ externalId: streamingListItems.externalId })
					.from(streamingListItems)
					.where(
						and(
							eq(streamingListItems.listId, options.streamingListId),
							inArray(streamingListItems.externalId, uniqueIds)
						)
					)
			: Promise.resolve([])
	]);

	const ownedSet = new Set(ownedRows.map((row) => row.externalId));
	const wishlistSet = new Set(wishlistRows.map((row) => row.externalId));
	const streamingSet = new Set(streamingRows.map((row) => row.externalId));

	const result: Record<string, CatalogStatus> = {};
	for (const externalId of uniqueIds) {
		result[externalId] = {
			owned: ownedSet.has(externalId),
			wishlist: wishlistSet.has(externalId),
			...(options?.streamingListId ? { onStreamingList: streamingSet.has(externalId) } : {})
		};
	}

	return result;
}

export function attachCatalogStatus<T extends { externalId: string }>(
	results: T[],
	statusById: Record<string, CatalogStatus>
): Array<T & { catalogStatus: CatalogStatus }> {
	return results.map((result) => ({
		...result,
		catalogStatus: statusById[result.externalId] ?? { ...EMPTY_STATUS }
	}));
}
