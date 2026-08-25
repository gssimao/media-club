import { describe, expect, it } from 'vitest';
import type { MediaItem } from '$lib/types/media';
import {
	ALL_COLLECTIONS_VALUE,
	buildRandomMoviePool,
	pickRandomFromPool
} from './random-movie-pool';

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

	it('returns ungrouped items by default', () => {
		expect(buildRandomMoviePool(items, { selectedGenres: [], selectedCollections: [] })).toEqual([
			items[0]
		]);
	});

	it('includes specific collections plus ungrouped', () => {
		const pool = buildRandomMoviePool(items, {
			selectedGenres: [],
			selectedCollections: ['album-a']
		});
		expect(pool.map((item) => item.id).sort()).toEqual(['1', '2']);
	});

	it('includes all items when all collections is selected', () => {
		const pool = buildRandomMoviePool(items, {
			selectedGenres: [],
			selectedCollections: [ALL_COLLECTIONS_VALUE]
		});
		expect(pool).toHaveLength(3);
	});

	it('filters by genre', () => {
		const pool = buildRandomMoviePool(items, {
			selectedGenres: ['Comedy'],
			selectedCollections: [ALL_COLLECTIONS_VALUE]
		});
		expect(pool.map((item) => item.id).sort()).toEqual(['2', '3']);
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
