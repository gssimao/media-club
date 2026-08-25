import { getMovieGenresBatch, isTmdbMovieId } from '$lib/server/apis/tmdb';
import type { AppDatabase } from '$lib/server/db';
import { listAllItemsByCategory, updateItemGenres } from '$lib/server/items';
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

export async function syncTmdbGenresForMovies(
	db: AppDatabase,
	apiKey: string,
	mode: TmdbGenreSyncMode
): Promise<TmdbGenreSyncResult> {
	const movieItems = await listAllItemsByCategory(db, 'movie');
	const tmdbItems = movieItems.filter((item) => isTmdbMovieId(item.externalId));
	const genresByExternalId = await getMovieGenresBatch(
		apiKey,
		tmdbItems.map((item) => item.externalId)
	);

	let updated = 0;
	let skipped = 0;
	let failed = 0;

	for (const item of movieItems) {
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
		total: movieItems.length,
		updated,
		skipped,
		failed
	};
}
