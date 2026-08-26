import type { MediaItem } from '$lib/types/media';
import {
	DEFAULT_GENRE_FILTER_MODE,
	getDisplayGenres,
	itemMatchesGenreFilter,
	type GenreFilterMode
} from '$lib/utils/movie-genres';

export interface RandomMoviePoolOptions {
	selectedGenres: string[];
	genreFilterMode?: GenreFilterMode;
	/** Collection IDs explicitly included in the pool (plus ungrouped items). */
	includedCollectionIds: string[];
	/** Collection IDs explicitly excluded; their movies are removed even when included elsewhere. */
	excludedCollectionIds: string[];
}

/**
 * Builds the random-pick movie pool from owned items and filter options.
 *
 * Collection rules:
 * - Ungrouped items (`albumId === null`) are always eligible unless removed by genre filter.
 * - When no collections are included or excluded, only ungrouped items are in the pool.
 * - Included collections add their movies to the pool (in addition to ungrouped).
 * - Excluded collections remove their movies from the pool, even if that collection is also listed
 *   in `includedCollectionIds` (exclude wins).
 * - Neutral collections (neither included nor excluded) do not contribute movies.
 */
export function buildRandomMoviePool(
	items: MediaItem[],
	options: RandomMoviePoolOptions
): MediaItem[] {
	const {
		selectedGenres,
		genreFilterMode = DEFAULT_GENRE_FILTER_MODE,
		includedCollectionIds,
		excludedCollectionIds
	} = options;
	const included = new Set(includedCollectionIds);
	const excluded = new Set(excludedCollectionIds);

	let pool = items.filter((item) => {
		if (item.albumId === null) {
			return true;
		}

		if (excluded.has(item.albumId)) {
			return false;
		}

		if (included.size === 0) {
			return false;
		}

		return included.has(item.albumId);
	});

	if (selectedGenres.length > 0) {
		pool = pool.filter((item) =>
			itemMatchesGenreFilter(getDisplayGenres(item), selectedGenres, genreFilterMode)
		);
	}

	return pool;
}

export function pickRandomFromPool<T>(pool: T[]): T | null {
	if (pool.length === 0) return null;
	return pool[Math.floor(Math.random() * pool.length)] ?? null;
}
