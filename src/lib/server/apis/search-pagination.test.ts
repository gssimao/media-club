import { afterEach, describe, expect, it, vi } from 'vitest';
import { SEARCH_PAGE_SIZE } from '$lib/server/apis/search-types';
import { searchBooks } from '$lib/server/apis/openlibrary';
import { searchMusic } from '$lib/server/apis/discogs';
import { resetMovieGenreCache, searchMovies, searchTv } from '$lib/server/apis/tmdb';

function mockTmdbFetch(moviePayload: unknown) {
	return vi.fn().mockImplementation((url: string | URL) => {
		const href = String(url);
		if (href.includes('/genre/movie/list')) {
			return Promise.resolve({
				ok: true,
				json: async () => ({
					genres: [
						{ id: 28, name: 'Action' },
						{ id: 878, name: 'Science Fiction' }
					]
				})
			});
		}
		return Promise.resolve({
			ok: true,
			json: async () => moviePayload
		});
	});
}

function mockTmdbTvFetch(tvPayload: unknown) {
	return vi.fn().mockImplementation((url: string | URL) => {
		const href = String(url);
		if (href.includes('/genre/tv/list')) {
			return Promise.resolve({
				ok: true,
				json: async () => ({
					genres: [
						{ id: 18, name: 'Drama' },
						{ id: 10765, name: 'Sci-Fi & Fantasy' }
					]
				})
			});
		}
		return Promise.resolve({
			ok: true,
			json: async () => tvPayload
		});
	});
}

describe('search provider pagination', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		resetMovieGenreCache();
	});

	it('searchMovies uses page param and computes hasMore from total_pages', async () => {
		const fetchMock = mockTmdbFetch({
			page: 2,
			total_pages: 5,
			results: Array.from({ length: SEARCH_PAGE_SIZE }, (_, index) => ({
				id: index + 1,
				title: `Movie ${index + 1}`,
				poster_path: null
			}))
		});
		vi.stubGlobal('fetch', fetchMock);

		const page = await searchMovies('test-key', 'star', 2);

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(String(fetchMock.mock.calls[0][0])).toContain('page=2');
		expect(String(fetchMock.mock.calls[1][0])).toContain('/genre/movie/list');
		expect(page.results).toHaveLength(SEARCH_PAGE_SIZE);
		expect(page.hasMore).toBe(true);
		expect(page.totalPages).toBe(5);
	});

	it('searchMovies sets hasMore false on the last page', async () => {
		vi.stubGlobal(
			'fetch',
			mockTmdbFetch({
				page: 3,
				total_pages: 3,
				results: [{ id: 99, title: 'Last', poster_path: null }]
			})
		);

		const page = await searchMovies('test-key', 'star', 3);

		expect(page.hasMore).toBe(false);
		expect(page.results).toHaveLength(1);
	});

	it('searchMovies maps genre_ids to genre names in metadata', async () => {
		vi.stubGlobal(
			'fetch',
			mockTmdbFetch({
				page: 1,
				total_pages: 1,
				results: [{ id: 27205, title: 'Inception', poster_path: null, genre_ids: [28, 878] }]
			})
		);

		const page = await searchMovies('test-key', 'inception', 1);

		expect(page.results[0]?.metadata).toMatchObject({
			tmdbId: 27205,
			genres: ['Action', 'Science Fiction']
		});
	});

	it('searchTv uses page param and maps name and first_air_date', async () => {
		const fetchMock = mockTmdbTvFetch({
			page: 1,
			total_pages: 2,
			results: [
				{
					id: 42,
					name: 'Breaking Bad',
					first_air_date: '2008-01-20',
					poster_path: '/poster.jpg',
					genre_ids: [18, 10765]
				}
			]
		});
		vi.stubGlobal('fetch', fetchMock);

		const page = await searchTv('test-key', 'breaking', 1);

		expect(String(fetchMock.mock.calls[0][0])).toContain('/search/tv');
		expect(String(fetchMock.mock.calls[0][0])).toContain('page=1');
		expect(String(fetchMock.mock.calls[1][0])).toContain('/genre/tv/list');
		expect(page.results).toHaveLength(1);
		expect(page.results[0]).toMatchObject({
			externalId: '42',
			title: 'Breaking Bad',
			year: 2008,
			coverUrl: 'https://image.tmdb.org/t/p/w342/poster.jpg',
			metadata: {
				tmdbId: 42,
				genres: ['Drama', 'Sci-Fi & Fantasy']
			}
		});
		expect(page.hasMore).toBe(true);
	});

	it('searchTv sets hasMore false on the last page', async () => {
		vi.stubGlobal(
			'fetch',
			mockTmdbTvFetch({
				page: 2,
				total_pages: 2,
				results: [{ id: 99, name: 'Finale', poster_path: null }]
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
