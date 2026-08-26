import { describe, expect, it } from 'vitest';
import type { MediaItem } from '$lib/types/media';
import { buildRandomMoviePool, pickRandomFromPool } from './random-movie-pool';

function movie(overrides: Partial<MediaItem> & Pick<MediaItem, 'id' | 'albumId'>): MediaItem {
	return {
		category: 'movie',
		listType: 'owned',
		externalId: overrides.id,
		title: overrides.title ?? 'Test Movie',
		subtitle: null,
		year: null,
		coverUrl: null,
		metadata: overrides.metadata ?? null,
		notes: null,
		albumWatchedAt: null,
		createdAt: new Date(),
		updatedAt: new Date(),
		...overrides
	};
}

describe('buildRandomMoviePool', () => {
	const items = [
		movie({ id: '1', albumId: null, title: 'Ungrouped', metadata: { genres: ['Drama'] } }),
		movie({ id: '2', albumId: 'album-a', title: 'In A', metadata: { genres: ['Comedy'] } }),
		movie({ id: '3', albumId: 'album-b', title: 'In B', metadata: { genres: ['Drama', 'Comedy'] } })
	];

	it('returns ungrouped items when no collections are included or excluded', () => {
		expect(
			buildRandomMoviePool(items, {
				selectedGenres: [],
				includedCollectionIds: [],
				excludedCollectionIds: []
			})
		).toEqual([items[0]]);
	});

	it('includes specific collections plus ungrouped', () => {
		const pool = buildRandomMoviePool(items, {
			selectedGenres: [],
			includedCollectionIds: ['album-a'],
			excludedCollectionIds: []
		});
		expect(pool.map((item) => item.id).sort()).toEqual(['1', '2']);
	});

	it('includes all collection items when all are included', () => {
		const pool = buildRandomMoviePool(items, {
			selectedGenres: [],
			includedCollectionIds: ['album-a', 'album-b'],
			excludedCollectionIds: []
		});
		expect(pool).toHaveLength(3);
	});

	it('removes excluded collection items even when other collections are included', () => {
		const pool = buildRandomMoviePool(items, {
			selectedGenres: [],
			includedCollectionIds: ['album-a', 'album-b'],
			excludedCollectionIds: ['album-b']
		});
		expect(pool.map((item) => item.id).sort()).toEqual(['1', '2']);
	});

	it('exclude alone does not add collection items when include is empty', () => {
		const pool = buildRandomMoviePool(items, {
			selectedGenres: [],
			includedCollectionIds: [],
			excludedCollectionIds: ['album-a']
		});
		expect(pool).toEqual([items[0]]);
	});

	it('exclude wins when a collection is in both include and exclude lists', () => {
		const pool = buildRandomMoviePool(items, {
			selectedGenres: [],
			includedCollectionIds: ['album-a'],
			excludedCollectionIds: ['album-a']
		});
		expect(pool).toEqual([items[0]]);
	});

	it('filters by genre with any mode', () => {
		const pool = buildRandomMoviePool(items, {
			selectedGenres: ['Comedy'],
			genreFilterMode: 'any',
			includedCollectionIds: ['album-a', 'album-b'],
			excludedCollectionIds: []
		});
		expect(pool.map((item) => item.id).sort()).toEqual(['2', '3']);
	});

	it('filters by genre with all mode', () => {
		const pool = buildRandomMoviePool(items, {
			selectedGenres: ['Drama', 'Comedy'],
			genreFilterMode: 'all',
			includedCollectionIds: ['album-a', 'album-b'],
			excludedCollectionIds: []
		});
		expect(pool.map((item) => item.id)).toEqual(['3']);
	});
});

describe('pickRandomFromPool', () => {
	it('returns null for empty pool', () => {
		expect(pickRandomFromPool([])).toBeNull();
	});

	it('returns an item from a non-empty pool', () => {
		const pool = [1, 2, 3];
		expect(pool).toContain(pickRandomFromPool(pool));
	});
});
