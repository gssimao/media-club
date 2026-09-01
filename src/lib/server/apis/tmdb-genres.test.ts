import { describe, expect, it, vi } from 'vitest';
import { getMovieGenres, getMovieGenresBatch, getTvGenres, getTvGenresBatch } from './tmdb';

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

describe('getTvGenres', () => {
	it('fetches and dedupes genre names from TV details', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({
				id: 1396,
				genres: [
					{ id: 18, name: 'Drama' },
					{ id: 10765, name: 'Sci-Fi & Fantasy' }
				]
			})
		});
		vi.stubGlobal('fetch', fetchMock);

		const genres = await getTvGenres('test-key', 1396);
		expect(genres).toEqual(['Drama', 'Sci-Fi & Fantasy']);
		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/tv/1396?'),
			expect.objectContaining({ signal: expect.any(AbortSignal) })
		);
	});
});

describe('getTvGenresBatch', () => {
	it('skips manual ids and dedupes requests', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					id: 1396,
					genres: [{ id: 18, name: 'Drama' }]
				})
			})
			.mockResolvedValueOnce({
				ok: false,
				status: 404
			});
		vi.stubGlobal('fetch', fetchMock);

		const results = await getTvGenresBatch('test-key', ['1396', '1396', 'manual-1', '999']);
		expect(results).toEqual({
			'1396': ['Drama'],
			'999': null
		});
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});
});
