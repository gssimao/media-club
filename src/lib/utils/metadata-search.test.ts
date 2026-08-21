import { describe, expect, it, vi } from 'vitest';
import { createMetadataSearch, parseSearchApiResponse } from '$lib/utils/metadata-search.svelte';

describe('parseSearchApiResponse', () => {
	it('returns paginated defaults for invalid payloads', () => {
		expect(parseSearchApiResponse(null)).toEqual({ results: [], page: 1, hasMore: false });
		expect(parseSearchApiResponse({})).toEqual({ results: [], page: 1, hasMore: false });
	});

	it('normalizes paginated search responses', () => {
		expect(
			parseSearchApiResponse({
				results: [{ externalId: '1', title: 'Friday', subtitle: null, year: 1995, coverUrl: null }],
				page: 2,
				hasMore: true,
				totalPages: 5
			})
		).toEqual({
			results: [{ externalId: '1', title: 'Friday', subtitle: null, year: 1995, coverUrl: null }],
			page: 2,
			hasMore: true,
			totalPages: 5
		});
	});

	it('accepts legacy responses that only include results', () => {
		expect(
			parseSearchApiResponse({
				results: [{ externalId: '1', title: 'Friday', subtitle: null, year: null, coverUrl: null }]
			})
		).toEqual({
			results: [{ externalId: '1', title: 'Friday', subtitle: null, year: null, coverUrl: null }],
			page: 1,
			hasMore: false
		});
	});
});

describe('createMetadataSearch', () => {
	it('keeps handleInput bound when passed as a callback', () => {
		const search = createMetadataSearch(() => ({ category: 'movie' }));
		const handleInput = search.handleInput;

		expect(() => handleInput('friday')).not.toThrow();
		expect(search.query).toBe('friday');
	});

	it('fetches and stores paginated API results', async () => {
		vi.useFakeTimers();
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				results: [{ externalId: '1', title: 'Friday', subtitle: null, year: 1995, coverUrl: null }],
				page: 1,
				hasMore: true
			})
		});
		vi.stubGlobal('fetch', fetchMock);

		const search = createMetadataSearch(() => ({ category: 'movie' }));
		search.handleInput('friday');

		await vi.advanceTimersByTimeAsync(350);
		await Promise.resolve();

		expect(fetchMock).toHaveBeenCalledOnce();
		expect(search.results).toHaveLength(1);
		expect(search.results[0]?.title).toBe('Friday');
		expect(search.hasMore).toBe(true);
		expect(search.loading).toBe(false);

		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	it('loadMore appends the next page without resetting when filters are unchanged', async () => {
		vi.useFakeTimers();
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					results: [
						{ externalId: '1', title: 'First', subtitle: null, year: null, coverUrl: null }
					],
					page: 1,
					hasMore: true
				})
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					results: [
						{ externalId: '2', title: 'Second', subtitle: null, year: null, coverUrl: null }
					],
					page: 2,
					hasMore: false
				})
			});
		vi.stubGlobal('fetch', fetchMock);

		const search = createMetadataSearch(() => ({ category: 'movie' }));
		search.handleInput('star');
		await vi.advanceTimersByTimeAsync(350);
		await Promise.resolve();

		expect(search.results).toHaveLength(1);
		expect(search.page).toBe(1);
		expect(search.hasMore).toBe(true);

		// Simulate filter effect registration (same as search panels on mount).
		search.resetPaginationOnFilterChange(true, true);

		await search.loadMore();
		await Promise.resolve();

		// Simulates $effect re-firing after page increments — must not reset pagination.
		search.resetPaginationOnFilterChange(true, true);

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(String(fetchMock.mock.calls[1][0])).toContain('page=2');
		expect(search.results).toHaveLength(2);
		expect(search.results[1]?.title).toBe('Second');
		expect(search.page).toBe(2);
		expect(search.hasMore).toBe(false);

		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	it('resetPaginationOnFilterChange refetches page 1 when filters change after load more', async () => {
		vi.useFakeTimers();
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					results: [
						{ externalId: '1', title: 'First', subtitle: null, year: null, coverUrl: null }
					],
					page: 1,
					hasMore: true
				})
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					results: [
						{ externalId: '2', title: 'Second', subtitle: null, year: null, coverUrl: null }
					],
					page: 2,
					hasMore: false
				})
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					results: [
						{ externalId: '1', title: 'First', subtitle: null, year: null, coverUrl: null }
					],
					page: 1,
					hasMore: true
				})
			});
		vi.stubGlobal('fetch', fetchMock);

		const search = createMetadataSearch(() => ({ category: 'movie' }));
		search.handleInput('star');
		await vi.advanceTimersByTimeAsync(350);
		await Promise.resolve();

		search.resetPaginationOnFilterChange(true, true);
		await search.loadMore();
		await Promise.resolve();

		expect(search.page).toBe(2);

		search.resetPaginationOnFilterChange(false, true);
		await vi.advanceTimersByTimeAsync(0);
		await Promise.resolve();

		expect(fetchMock).toHaveBeenCalledTimes(3);
		expect(search.page).toBe(1);
		expect(search.results).toHaveLength(1);

		vi.unstubAllGlobals();
		vi.useRealTimers();
	});
});
