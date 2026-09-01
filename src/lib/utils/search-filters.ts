import type { CatalogStatus, SearchPanelContext, SearchResult } from '$lib/types/media';

export const DEFAULT_CATALOG_STATUS: CatalogStatus = { owned: false, wishlist: false };

export function getSearchFilterLabels(context: SearchPanelContext): {
	hideOwned: string;
	hideOnList: string;
} {
	switch (context) {
		case 'streaming':
			return {
				hideOwned: 'Hide items in my collection',
				hideOnList: 'Hide items already on this list'
			};
		case 'show-tracker':
			return {
				hideOwned: 'Hide items in my collection',
				hideOnList: 'Hide items already on tracker'
			};
		case 'wishlist':
			return {
				hideOwned: 'Hide items in my collection',
				hideOnList: 'Hide items already on wishlist'
			};
		default:
			return {
				hideOwned: 'Hide items in my collection',
				hideOnList: 'Hide items on my wishlist'
			};
	}
}

export function isOnContextList(status: CatalogStatus, context: SearchPanelContext): boolean {
	switch (context) {
		case 'streaming':
			return status.onStreamingList === true;
		case 'show-tracker':
			return status.onShowTracker === true;
		case 'wishlist':
			return status.wishlist;
		default:
			return status.wishlist;
	}
}

export function shouldShowSearchResult(
	status: CatalogStatus,
	hideOwned: boolean,
	hideOnList: boolean,
	context: SearchPanelContext
): boolean {
	if (hideOwned && status.owned) return false;
	if (hideOnList && isOnContextList(status, context)) return false;
	return true;
}

export function mergeCatalogStatus(
	base: CatalogStatus | undefined,
	local: Partial<CatalogStatus> | undefined
): CatalogStatus {
	return {
		owned: local?.owned ?? base?.owned ?? false,
		wishlist: local?.wishlist ?? base?.wishlist ?? false,
		onStreamingList: local?.onStreamingList ?? base?.onStreamingList,
		onShowTracker: local?.onShowTracker ?? base?.onShowTracker
	};
}

export function effectiveCatalogStatus(
	result: SearchResult,
	localStatus: Record<string, Partial<CatalogStatus>>
): CatalogStatus {
	return mergeCatalogStatus(result.catalogStatus, localStatus[result.externalId]);
}

export function filterSearchResults(
	results: SearchResult[],
	options: {
		hideOwned: boolean;
		hideOnList: boolean;
		context: SearchPanelContext;
		localStatus: Record<string, Partial<CatalogStatus>>;
	}
): SearchResult[] {
	return results.filter((result) =>
		shouldShowSearchResult(
			effectiveCatalogStatus(result, options.localStatus),
			options.hideOwned,
			options.hideOnList,
			options.context
		)
	);
}

export function buildSearchUrl(
	category: string,
	query: string,
	options?: { streamingListId?: string; showTracker?: boolean; page?: number }
): string {
	const params = new URLSearchParams({
		category,
		q: query
	});
	if (options?.streamingListId) {
		params.set('streamingListId', options.streamingListId);
	}
	if (options?.showTracker) {
		params.set('showTracker', '1');
	}
	if (options?.page && options.page > 1) {
		params.set('page', String(options.page));
	}
	return `/api/search?${params.toString()}`;
}

export function appendUniqueSearchResults(
	existing: SearchResult[],
	incoming: SearchResult[]
): SearchResult[] {
	if (incoming.length === 0) return existing;

	const seen = new Set(existing.map((result) => result.externalId));
	const merged = [...existing];

	for (const result of incoming) {
		if (seen.has(result.externalId)) continue;
		seen.add(result.externalId);
		merged.push(result);
	}

	return merged;
}
