import { describe, expect, it, vi } from 'vitest';
import { getMovieGenres, getMovieGenresBatch } from './tmdb';

describe('getMovieGenres', () => {
	it('fetches and dedupes genre names from movie details', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				id: 27205,
				genres: [
					{ id: 28, name: 'Action' },
					{ id: 878, name: 'Science Fiction' }
				]
			})
		});
		vi.stubGlobal('fetch', fetchMock);

		const genres = await getMovieGenres('test-key', 27205);
		expect(genres).toEqual(['Action', 'Science Fiction']);
		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/movie/27205?'),
			expect.objectContaining({ signal: expect.any(AbortSignal) })
		);
	});
});

describe('getMovieGenresBatch', () => {
	it('skips manual ids and dedupes requests', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					id: 27205,
					genres: [{ id: 28, name: 'Action' }]
				})
			})
			.mockResolvedValueOnce({
				ok: false,
				status: 404
			});
		vi.stubGlobal('fetch', fetchMock);

		const results = await getMovieGenresBatch('test-key', ['27205', '27205', 'manual-1', '999']);
		expect(results).toEqual({
			'27205': ['Action'],
			'999': null
		});
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});
});
