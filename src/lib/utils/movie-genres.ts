import type { MediaItem } from '$lib/types/media';

export const MAX_GENRE_LENGTH = 50;
export const MAX_GENRES_PER_ITEM = 20;

/** Returns null when metadata has no explicit genres field. */
export function parseGenresFromMetadata(
	metadata: Record<string, unknown> | null | undefined
): string[] | null {
	if (!metadata || !('genres' in metadata)) return null;
	const genres = metadata.genres;
	if (Array.isArray(genres)) {
		return genres.filter((g): g is string => typeof g === 'string');
	}
	return [];
}

export function getDisplayGenres(item: Pick<MediaItem, 'metadata'>): string[] {
	return parseGenresFromMetadata(item.metadata) ?? [];
}

export function normalizeGenreName(raw: string): string | null {
	const trimmed = raw.trim().slice(0, MAX_GENRE_LENGTH);
	return trimmed.length > 0 ? trimmed : null;
}

/** Case-insensitive dedupe while preserving first-seen casing. */
export function dedupeGenres(genres: string[]): string[] {
	const seen = new Set<string>();
	const unique: string[] = [];
	for (const genre of genres) {
		const normalized = normalizeGenreName(genre);
		if (!normalized) continue;
		const key = normalized.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		unique.push(normalized);
	}
	return unique.slice(0, MAX_GENRES_PER_ITEM);
}

export function removeGenre(current: string[], genre: string): string[] {
	const key = genre.toLowerCase();
	return current.filter((g) => g.toLowerCase() !== key);
}

export function addGenre(current: string[], raw: string): string[] {
	const normalized = normalizeGenreName(raw);
	if (!normalized) return current;
	return dedupeGenres([...current, normalized]);
}

export type GenreFilterMode = 'all' | 'any';

export const DEFAULT_GENRE_FILTER_MODE: GenreFilterMode = 'any';

export function itemMatchesGenreFilter(
	itemGenres: string[],
	selectedGenres: string[],
	mode: GenreFilterMode = DEFAULT_GENRE_FILTER_MODE
): boolean {
	if (selectedGenres.length === 0) return true;
	const normalizedItem = itemGenres.map((g) => g.toLowerCase());
	const matches = (selected: string) => normalizedItem.includes(selected.toLowerCase());
	if (mode === 'all') {
		return selectedGenres.every(matches);
	}
	return selectedGenres.some(matches);
}

export function collectUniqueGenres(
	items: { metadata: Record<string, unknown> | null }[]
): string[] {
	const seen = new Set<string>();
	const result: string[] = [];

	for (const item of items) {
		const genres = parseGenresFromMetadata(item.metadata) ?? [];
		for (const genre of genres) {
			const normalized = normalizeGenreName(genre);
			if (!normalized) continue;
			const key = normalized.toLowerCase();
			if (seen.has(key)) continue;
			seen.add(key);
			result.push(normalized);
		}
	}

	return result.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

export function mapGenreIdsToNames(genreIds: number[], genreMap: Record<number, string>): string[] {
	return dedupeGenres(
		genreIds.map((id) => genreMap[id]).filter((name): name is string => Boolean(name))
	);
}

export type TmdbGenreSyncMode = 'keep' | 'overwrite';

/** Merge TMDB genres into existing catalog genres, or replace them entirely. */
export function mergeTmdbGenres(
	existing: string[],
	tmdbGenres: string[],
	mode: TmdbGenreSyncMode
): string[] {
	if (mode === 'overwrite') {
		return dedupeGenres(tmdbGenres);
	}
	return dedupeGenres([...existing, ...tmdbGenres]);
}

/** Official TMDB movie genre names (English). */
export const TMDB_MOVIE_GENRE_NAMES = [
	'Action',
	'Adventure',
	'Animation',
	'Comedy',
	'Crime',
	'Documentary',
	'Drama',
	'Family',
	'Fantasy',
	'History',
	'Horror',
	'Music',
	'Mystery',
	'Romance',
	'Science Fiction',
	'TV Movie',
	'Thriller',
	'War',
	'Western'
] as const;

/** Official TMDB TV genre names (English). */
export const TMDB_TV_GENRE_NAMES = [
	'Action & Adventure',
	'Animation',
	'Comedy',
	'Crime',
	'Documentary',
	'Drama',
	'Family',
	'Kids',
	'Mystery',
	'News',
	'Reality',
	'Sci-Fi & Fantasy',
	'Soap',
	'Talk',
	'War & Politics',
	'Western'
] as const;

export type TmdbGenreCategory = 'movie' | 'show';

const TMDB_MOVIE_GENRE_LOOKUP = new Set(TMDB_MOVIE_GENRE_NAMES.map((genre) => genre.toLowerCase()));
const TMDB_TV_GENRE_LOOKUP = new Set(TMDB_TV_GENRE_NAMES.map((genre) => genre.toLowerCase()));
const TMDB_GENRE_LOOKUP = new Set([...TMDB_MOVIE_GENRE_LOOKUP, ...TMDB_TV_GENRE_LOOKUP]);

export function getClassicTmdbGenreNames(category: TmdbGenreCategory): readonly string[] {
	return category === 'show' ? TMDB_TV_GENRE_NAMES : TMDB_MOVIE_GENRE_NAMES;
}

export function isTmdbGenreName(name: string, category?: TmdbGenreCategory): boolean {
	const key = name.trim().toLowerCase();
	if (category === 'movie') return TMDB_MOVIE_GENRE_LOOKUP.has(key);
	if (category === 'show') return TMDB_TV_GENRE_LOOKUP.has(key);
	return TMDB_GENRE_LOOKUP.has(key);
}

export function categorySupportsGenres(category: string): category is TmdbGenreCategory {
	return category === 'movie' || category === 'show';
}

export interface GenreCatalog {
	customGenres: string[];
	catalogTmdbGenres: string[];
	classicTmdbGenres: string[];
}

/** Split catalog genres into custom, in-use TMDB, and unused TMDB picks. */
export function buildGenreCatalog(
	catalogItems: { metadata: Record<string, unknown> | null }[],
	category: TmdbGenreCategory = 'movie'
): GenreCatalog {
	const allGenres = collectUniqueGenres(catalogItems);
	const customGenres = allGenres.filter((genre) => !isTmdbGenreName(genre, category));
	const catalogTmdbGenres = allGenres.filter((genre) => isTmdbGenreName(genre, category));
	const catalogTmdbKeys = new Set(catalogTmdbGenres.map((genre) => genre.toLowerCase()));
	const classicTmdbGenres = getClassicTmdbGenreNames(category).filter(
		(genre) => !catalogTmdbKeys.has(genre.toLowerCase())
	);

	return { customGenres, catalogTmdbGenres, classicTmdbGenres: [...classicTmdbGenres] };
}

export function genreIsSelected(current: string[], genre: string): boolean {
	const key = genre.toLowerCase();
	return current.some((value) => value.toLowerCase() === key);
}

export function toggleGenreSelection(current: string[], genre: string): string[] {
	if (genreIsSelected(current, genre)) {
		return removeGenre(current, genre);
	}
	return addGenre(current, genre);
}
