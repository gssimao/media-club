import { getMovieGenresBatch, getTvGenresBatch, isTmdbMovieId } from '$lib/server/apis/tmdb';
import type { AppDatabase } from '$lib/server/db';
import { listAllItemsByCategory, updateItemGenres } from '$lib/server/items';
import type { MediaCategory } from '$lib/types/media';
import {
	dedupeGenres,
	mergeTmdbGenres,
	parseGenresFromMetadata,
	type TmdbGenreSyncMode
} from '$lib/utils/movie-genres';

export interface TmdbGenreSyncResult {
	total: number;
	updated: number;
	skipped: number;
	failed: number;
}

function genresEqual(left: string[], right: string[]): boolean {
	if (left.length !== right.length) return false;
	return left.every((genre, index) => genre === right[index]);
}

async function syncTmdbGenresForCategory(
	db: AppDatabase,
	apiKey: string,
	category: Extract<MediaCategory, 'movie' | 'show'>,
	mode: TmdbGenreSyncMode
): Promise<TmdbGenreSyncResult> {
	const categoryItems = await listAllItemsByCategory(db, category);
	const tmdbItems = categoryItems.filter((item) => isTmdbMovieId(item.externalId));
	const genresByExternalId =
		category === 'movie'
			? await getMovieGenresBatch(
					apiKey,
					tmdbItems.map((item) => item.externalId)
				)
			: await getTvGenresBatch(
					apiKey,
					tmdbItems.map((item) => item.externalId)
				);

	let updated = 0;
	let skipped = 0;
	let failed = 0;

	for (const item of categoryItems) {
		if (!isTmdbMovieId(item.externalId)) {
			skipped++;
			continue;
		}

		const tmdbGenres = genresByExternalId[item.externalId];
		if (tmdbGenres === undefined) {
			skipped++;
			continue;
		}
		if (tmdbGenres === null) {
			failed++;
			continue;
		}

		const existing = parseGenresFromMetadata(item.metadata) ?? [];
		const nextGenres = mergeTmdbGenres(existing, tmdbGenres, mode);
		const currentGenres = dedupeGenres(existing);

		if (genresEqual(currentGenres, nextGenres)) {
			skipped++;
			continue;
		}

		await updateItemGenres(db, item.id, nextGenres);
		updated++;
	}

	return {
		total: categoryItems.length,
		updated,
		skipped,
		failed
	};
}

function combineSyncResults(
	left: TmdbGenreSyncResult,
	right: TmdbGenreSyncResult
): TmdbGenreSyncResult {
	return {
		total: left.total + right.total,
		updated: left.updated + right.updated,
		skipped: left.skipped + right.skipped,
		failed: left.failed + right.failed
	};
}

/** @deprecated Use syncTmdbGenres instead. */
export async function syncTmdbGenresForMovies(
	db: AppDatabase,
	apiKey: string,
	mode: TmdbGenreSyncMode
): Promise<TmdbGenreSyncResult> {
	return syncTmdbGenresForCategory(db, apiKey, 'movie', mode);
}

export async function syncTmdbGenres(
	db: AppDatabase,
	apiKey: string,
	mode: TmdbGenreSyncMode
): Promise<TmdbGenreSyncResult> {
	const movieResult = await syncTmdbGenresForCategory(db, apiKey, 'movie', mode);
	const showResult = await syncTmdbGenresForCategory(db, apiKey, 'show', mode);
	return combineSyncResults(movieResult, showResult);
}
