import { afterEach, describe, expect, it, vi } from 'vitest';
import { SEARCH_PAGE_SIZE } from '$lib/server/apis/search-types';
import { searchBooks } from '$lib/server/apis/openlibrary';
import { searchMusic } from '$lib/server/apis/discogs';
import { searchMovies, searchTv } from '$lib/server/apis/tmdb';

describe('search provider pagination', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('searchMovies uses page param and computes hasMore from total_pages', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				page: 2,
				total_pages: 5,
				results: Array.from({ length: SEARCH_PAGE_SIZE }, (_, index) => ({
					id: index + 1,
					title: `Movie ${index + 1}`,
					poster_path: null
				}))
			})
		});
		vi.stubGlobal('fetch', fetchMock);

		const page = await searchMovies('test-key', 'star', 2);

		expect(fetchMock).toHaveBeenCalledOnce();
		expect(String(fetchMock.mock.calls[0][0])).toContain('page=2');
		expect(page.results).toHaveLength(SEARCH_PAGE_SIZE);
		expect(page.hasMore).toBe(true);
		expect(page.totalPages).toBe(5);
	});

	it('searchMovies sets hasMore false on the last page', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({
					page: 3,
					total_pages: 3,
					results: [{ id: 99, title: 'Last', poster_path: null }]
				})
			})
		);

		const page = await searchMovies('test-key', 'star', 3);

		expect(page.hasMore).toBe(false);
		expect(page.results).toHaveLength(1);
	});

	it('searchTv uses page param and maps name and first_air_date', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				page: 1,
				total_pages: 2,
				results: [
					{
						id: 42,
						name: 'Breaking Bad',
						first_air_date: '2008-01-20',
						poster_path: '/poster.jpg'
					}
				]
			})
		});
		vi.stubGlobal('fetch', fetchMock);

		const page = await searchTv('test-key', 'breaking', 1);

		expect(String(fetchMock.mock.calls[0][0])).toContain('/search/tv');
		expect(String(fetchMock.mock.calls[0][0])).toContain('page=1');
		expect(page.results).toHaveLength(1);
		expect(page.results[0]).toMatchObject({
			externalId: '42',
			title: 'Breaking Bad',
			year: 2008,
			coverUrl: 'https://image.tmdb.org/t/p/w342/poster.jpg'
		});
		expect(page.hasMore).toBe(true);
	});

	it('searchTv sets hasMore false on the last page', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({
					page: 2,
					total_pages: 2,
					results: [{ id: 99, name: 'Finale', poster_path: null }]
				})
			})
		);

		const page = await searchTv('test-key', 'show', 2);

		expect(page.hasMore).toBe(false);
		expect(page.results[0]?.title).toBe('Finale');
	});

	it('searchMusic uses Discogs pagination metadata', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				pagination: { page: 1, pages: 4, per_page: SEARCH_PAGE_SIZE },
				results: [{ id: 10, title: 'Album', thumb: null }]
			})
		});
		vi.stubGlobal('fetch', fetchMock);

		const page = await searchMusic('token', 'album');

		expect(String(fetchMock.mock.calls[0][0])).toContain('page=1');
		expect(page.hasMore).toBe(true);
		expect(page.totalPages).toBe(4);
	});

	it('searchBooks computes hasMore from numFound', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({
					numFound: SEARCH_PAGE_SIZE + 1,
					docs: [{ key: '/works/OL1W', title: 'Book One' }]
				})
			})
		);

		const page = await searchBooks('book', 1);

		expect(page.hasMore).toBe(true);
		expect(page.results[0]?.externalId).toBe('/works/OL1W');
	});
});
