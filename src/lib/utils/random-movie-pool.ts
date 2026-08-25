import type { MediaItem } from '$lib/types/media';
import { getDisplayGenres, itemMatchesGenreFilter } from '$lib/utils/movie-genres';

/** Sentinel value for “include every collection” in the random pick pool. */
export const ALL_COLLECTIONS_VALUE = '__all__';

export interface RandomMoviePoolOptions {
	selectedGenres: string[];
	selectedCollections: string[];
}

export function buildRandomMoviePool(
	items: MediaItem[],
	options: RandomMoviePoolOptions
): MediaItem[] {
	const { selectedGenres, selectedCollections } = options;
	const allCollections = selectedCollections.includes(ALL_COLLECTIONS_VALUE);
	const specificCollections = selectedCollections.filter((id) => id !== ALL_COLLECTIONS_VALUE);

	let pool = items;

	if (allCollections) {
		// Keep entire owned catalog.
	} else if (specificCollections.length > 0) {
		pool = pool.filter(
			(item) => item.albumId === null || specificCollections.includes(item.albumId)
		);
	} else {
		pool = pool.filter((item) => item.albumId === null);
	}

	if (selectedGenres.length > 0) {
		pool = pool.filter((item) => itemMatchesGenreFilter(getDisplayGenres(item), selectedGenres));
	}

	return pool;
}

export function pickRandomFromPool<T>(pool: T[]): T | null {
	if (pool.length === 0) return null;
	return pool[Math.floor(Math.random() * pool.length)] ?? null;
}
