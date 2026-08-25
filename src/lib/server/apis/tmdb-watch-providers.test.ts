import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	getMovieWatchProviders,
	getMovieWatchProvidersBatch,
	isTmdbMovieId,
	parseMovieWatchProviders
} from '$lib/server/apis/tmdb';

describe('TMDB watch providers', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('isTmdbMovieId accepts numeric TMDB ids only', () => {
		expect(isTmdbMovieId('27205')).toBe(true);
		expect(isTmdbMovieId('manual-123')).toBe(false);
		expect(isTmdbMovieId('')).toBe(false);
	});

	it('parseMovieWatchProviders maps flatrate and free ads for a region', () => {
		const parsed = parseMovieWatchProviders({
			id: 27205,
			results: {
				US: {
					link: 'https://www.themoviedb.org/movie/27205-inception/watch?locale=US',
					flatrate: [
						{
							logo_path: '/netflix.jpg',
							provider_id: 8,
							provider_name: 'Netflix',
							display_priority: 2
						}
					],
					ads: [
						{
							logo_path: '/tubi.jpg',
							provider_id: 73,
							provider_name: 'Tubi',
							display_priority: 15
						}
					]
				}
			}
		});

		expect(parsed).toEqual({
			link: 'https://www.themoviedb.org/movie/27205-inception/watch?locale=US',
			flatrate: [
				{
					id: 8,
					name: 'Netflix',
					logoUrl: 'https://image.tmdb.org/t/p/w45/netflix.jpg'
				}
			],
			free: [
				{
					id: 73,
					name: 'Tubi',
					logoUrl: 'https://image.tmdb.org/t/p/w45/tubi.jpg'
				}
			]
		});
	});

	it('parseMovieWatchProviders returns empty lists when region is missing', () => {
		expect(parseMovieWatchProviders({ id: 1, results: {} })).toEqual({
			link: null,
			flatrate: [],
			free: []
		});
	});

	it('getMovieWatchProviders fetches and parses a movie response', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				id: 27205,
				results: {
					US: {
						link: 'https://example.com/watch',
						flatrate: [
							{
								logo_path: '/netflix.jpg',
								provider_id: 8,
								provider_name: 'Netflix',
								display_priority: 2
							}
						]
					}
				}
			})
		});
		vi.stubGlobal('fetch', fetchMock);

		const providers = await getMovieWatchProviders('test-key', 27205);

		expect(String(fetchMock.mock.calls[0][0])).toContain('/movie/27205/watch/providers');
		expect(providers?.flatrate).toHaveLength(1);
		expect(providers?.flatrate[0]?.name).toBe('Netflix');
	});

	it('getMovieWatchProvidersBatch skips manual ids and dedupes requests', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				id: 27205,
				results: {
					US: {
						flatrate: [
							{
								logo_path: '/netflix.jpg',
								provider_id: 8,
								provider_name: 'Netflix',
								display_priority: 2
							}
						]
					}
				}
			})
		});
		vi.stubGlobal('fetch', fetchMock);

		const results = await getMovieWatchProvidersBatch('test-key', ['27205', '27205', 'manual-1']);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(results['27205']?.flatrate[0]?.name).toBe('Netflix');
		expect(results['manual-1']).toBeUndefined();
	});
});
