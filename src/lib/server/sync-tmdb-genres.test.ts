import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as schema from './db/schema';
import type { AppDatabase } from './db';
import { getItemById, updateItemGenres } from './items';
import { getMovieGenresBatch, getTvGenresBatch } from './apis/tmdb';
import {
	getEmptyGenreMovieSummary,
	syncTmdbGenres,
	syncTmdbGenresForEmptyMovies
} from './sync-tmdb-genres';
import { actions } from '../../routes/settings/+page.server';

vi.mock('./apis/tmdb', async (importOriginal) => ({
	...(await importOriginal<typeof import('./apis/tmdb')>()),
	getMovieGenresBatch: vi.fn(),
	getTvGenresBatch: vi.fn()
}));

describe('empty movie genre sync', () => {
	let sqlite: Database.Database;
	let db: AppDatabase;
	beforeEach(async () => {
		vi.resetAllMocks();
		sqlite = new Database(':memory:');
		const local = drizzle(sqlite, { schema });
		migrate(local, { migrationsFolder: join(process.cwd(), 'drizzle') });
		db = local as unknown as AppDatabase;
		await db.insert(schema.items).values([
			{
				id: 'missing',
				category: 'movie',
				listType: 'owned',
				externalId: '101',
				title: 'Missing genres',
				metadata: JSON.stringify({ runtime: 110 })
			},
			{
				id: 'empty',
				category: 'movie',
				listType: 'wishlist',
				externalId: '102',
				title: 'Empty genres',
				metadata: JSON.stringify({ genres: [] })
			},
			{
				id: 'tagged',
				category: 'movie',
				listType: 'owned',
				externalId: '103',
				title: 'Custom genres',
				metadata: JSON.stringify({ genres: ['My favorite'] })
			},
			{
				id: 'blank',
				category: 'movie',
				listType: 'owned',
				externalId: '104',
				title: 'Whitespace genres',
				metadata: JSON.stringify({ genres: ['  '] })
			},
			{
				id: 'manual',
				category: 'movie',
				listType: 'owned',
				externalId: 'manual:1',
				title: 'Manual movie'
			},
			{
				id: 'show',
				category: 'show',
				listType: 'owned',
				externalId: '201',
				title: 'Show without genres'
			},
			{
				id: 'book',
				category: 'book',
				listType: 'owned',
				externalId: '202',
				title: 'Book without genres'
			}
		]);
		vi.mocked(getMovieGenresBatch).mockResolvedValue({
			'101': ['Drama'],
			'102': ['Comedy'],
			'104': []
		});
		vi.mocked(getTvGenresBatch).mockResolvedValue({ '201': ['Adventure'] });
	});
	afterEach(() => sqlite.close());

	it('counts empty owned and wishlist movies, separating those without a TMDB ID', async () => {
		expect(await getEmptyGenreMovieSummary(db)).toEqual({
			total: 4,
			eligible: 3,
			withoutTmdbId: 1
		});
		expect(getMovieGenresBatch).not.toHaveBeenCalled();
	});

	it('only fetches and updates empty movies, preserving custom tags, shows, and other metadata', async () => {
		expect(await syncTmdbGenresForEmptyMovies(db, 'test-key')).toEqual({
			total: 4,
			updated: 2,
			skipped: 2,
			failed: 0
		});
		const requestedIds = vi.mocked(getMovieGenresBatch).mock.calls[0][1];
		expect(requestedIds.sort()).toEqual(['101', '102', '104']);
		expect(getTvGenresBatch).not.toHaveBeenCalled();
		expect((await getItemById(db, 'missing'))?.metadata).toEqual({
			runtime: 110,
			genres: ['Drama']
		});
		expect((await getItemById(db, 'tagged'))?.metadata).toEqual({ genres: ['My favorite'] });
		expect((await getItemById(db, 'show'))?.metadata).toBeNull();
		expect((await getItemById(db, 'book'))?.metadata).toBeNull();
		expect(await getEmptyGenreMovieSummary(db)).toEqual({
			total: 2,
			eligible: 1,
			withoutTmdbId: 1
		});
	});

	it('preserves genres added while TMDB requests are in flight', async () => {
		vi.mocked(getMovieGenresBatch).mockImplementationOnce(async () => {
			await updateItemGenres(db, 'missing', ['Just added']);
			return { '101': ['Drama'], '102': ['Comedy'], '104': [] };
		});
		expect(await syncTmdbGenresForEmptyMovies(db, 'test-key')).toEqual({
			total: 4,
			updated: 1,
			skipped: 3,
			failed: 0
		});
		expect((await getItemById(db, 'missing'))?.metadata).toEqual({
			runtime: 110,
			genres: ['Just added']
		});
	});

	it('reports failed lookups and leaves empty genres available for retry', async () => {
		vi.mocked(getMovieGenresBatch).mockResolvedValueOnce({ '101': null, '104': [] });
		expect(await syncTmdbGenresForEmptyMovies(db, 'test-key')).toEqual({
			total: 4,
			updated: 0,
			skipped: 3,
			failed: 1
		});
		expect(await getEmptyGenreMovieSummary(db)).toEqual({
			total: 4,
			eligible: 3,
			withoutTmdbId: 1
		});
	});

	it('keeps the existing full-catalog sync behavior for movies and shows', async () => {
		vi.mocked(getMovieGenresBatch).mockResolvedValueOnce({
			'101': ['Drama'],
			'102': ['Comedy'],
			'103': ['Action'],
			'104': []
		});
		await syncTmdbGenres(db, 'test-key', 'keep');
		expect((await getItemById(db, 'tagged'))?.metadata).toEqual({
			genres: ['My favorite', 'Action']
		});
		expect((await getItemById(db, 'show'))?.metadata).toEqual({ genres: ['Adventure'] });
	});

	it('handles a catalog with no empty movie genres', async () => {
		await db.delete(schema.items);
		expect(await getEmptyGenreMovieSummary(db)).toEqual({
			total: 0,
			eligible: 0,
			withoutTmdbId: 0
		});
		expect(await syncTmdbGenresForEmptyMovies(db, 'test-key')).toEqual({
			total: 0,
			updated: 0,
			skipped: 0,
			failed: 0
		});
	});

	it('requires an admin before the new sync can access data or secrets', async () => {
		const action = actions.syncEmptyMovieGenres!;
		const event = { locals: { user: null, db } } as unknown as Parameters<typeof action>[0];
		await expect(action(event)).rejects.toMatchObject({ status: 303, location: '/login' });
		expect(getMovieGenresBatch).not.toHaveBeenCalled();
	});
});
