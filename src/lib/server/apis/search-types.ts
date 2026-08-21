import type { SearchResult } from '$lib/types/media';

export const SEARCH_PAGE_SIZE = 12;

export interface SearchPageResult {
	results: SearchResult[];
	hasMore: boolean;
	totalPages?: number;
}
