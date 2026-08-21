import { describe, expect, it } from 'vitest';
import { appendUniqueSearchResults, buildSearchUrl } from '$lib/utils/search-filters';
import type { SearchResult } from '$lib/types/media';

describe('buildSearchUrl', () => {
	it('builds a base search URL', () => {
		expect(buildSearchUrl('movie', 'inception')).toBe('/api/search?category=movie&q=inception');
	});

	it('includes streamingListId when provided', () => {
		expect(buildSearchUrl('movie', 'inception', { streamingListId: 'list-1' })).toBe(
			'/api/search?category=movie&q=inception&streamingListId=list-1'
		);
	});

	it('includes page when greater than 1', () => {
		expect(buildSearchUrl('book', 'dune', { page: 3 })).toBe(
			'/api/search?category=book&q=dune&page=3'
		);
	});

	it('omits page 1 from the URL', () => {
		expect(buildSearchUrl('music', 'beatles', { page: 1 })).toBe(
			'/api/search?category=music&q=beatles'
		);
	});
});

describe('appendUniqueSearchResults', () => {
	const base: SearchResult[] = [
		{ externalId: '1', title: 'First', subtitle: null, year: null, coverUrl: null },
		{ externalId: '2', title: 'Second', subtitle: null, year: null, coverUrl: null }
	];

	it('appends new results', () => {
		const incoming: SearchResult[] = [
			{ externalId: '3', title: 'Third', subtitle: null, year: null, coverUrl: null }
		];

		expect(appendUniqueSearchResults(base, incoming)).toHaveLength(3);
	});

	it('dedupes by externalId', () => {
		const incoming: SearchResult[] = [
			{ externalId: '2', title: 'Duplicate', subtitle: null, year: null, coverUrl: null },
			{ externalId: '3', title: 'Third', subtitle: null, year: null, coverUrl: null }
		];

		const merged = appendUniqueSearchResults(base, incoming);
		expect(merged).toHaveLength(3);
		expect(merged[1].title).toBe('Second');
	});
});
