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

export function itemMatchesGenreFilter(itemGenres: string[], selectedGenres: string[]): boolean {
	if (selectedGenres.length === 0) return true;
	const normalizedItem = itemGenres.map((g) => g.toLowerCase());
	return selectedGenres.some((selected) => normalizedItem.includes(selected.toLowerCase()));
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
