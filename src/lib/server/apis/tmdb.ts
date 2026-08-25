import type { SearchResult } from '$lib/types/media';
import { TMDB_ATTRIBUTION, type MovieWatchProviders, type WatchProvider } from '$lib/types/tmdb';
import type { SearchPageResult } from '$lib/server/apis/search-types';
import { dedupeGenres, mapGenreIdsToNames } from '$lib/utils/movie-genres';

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w342';
const TMDB_PROVIDER_LOGO_BASE = 'https://image.tmdb.org/t/p/w45';
const DEFAULT_WATCH_REGION = 'US';
const WATCH_PROVIDER_BATCH_CONCURRENCY = 5;
const MOVIE_GENRES_BATCH_CONCURRENCY = 5;

interface TmdbMovieSearchResult {
	id: number;
	title: string;
	release_date?: string;
	poster_path: string | null;
	genre_ids?: number[];
}

interface TmdbGenreListResponse {
	genres: { id: number; name: string }[];
}

let cachedMovieGenreMap: Record<number, string> | null = null;

/** Resets the in-memory TMDB genre list cache (for tests). */
export function resetMovieGenreCache(): void {
	cachedMovieGenreMap = null;
}

export async function getMovieGenreMap(apiKey: string): Promise<Record<number, string>> {
	if (cachedMovieGenreMap) return cachedMovieGenreMap;

	const params = new URLSearchParams({ api_key: apiKey });
	const response = await fetch(`${TMDB_API_BASE}/genre/movie/list?${params.toString()}`, {
		signal: AbortSignal.timeout(10_000)
	});
	if (!response.ok) {
		throw new Error(`TMDB genre list failed (${response.status})`);
	}

	const data = (await response.json()) as TmdbGenreListResponse;
	cachedMovieGenreMap = Object.fromEntries(data.genres.map((genre) => [genre.id, genre.name]));
	return cachedMovieGenreMap;
}

interface TmdbMovieDetailsResponse {
	id: number;
	genres: { id: number; name: string }[];
}

interface TmdbTvSearchResult {
	id: number;
	name: string;
	first_air_date?: string;
	poster_path: string | null;
}

interface TmdbMovieSearchResponse {
	page: number;
	results: TmdbMovieSearchResult[];
	total_pages: number;
}

interface TmdbTvSearchResponse {
	page: number;
	results: TmdbTvSearchResult[];
	total_pages: number;
}

export { TMDB_ATTRIBUTION };

export function tmdbPosterUrl(posterPath: string | null | undefined): string | null {
	if (!posterPath) return null;
	return `${TMDB_POSTER_BASE}${posterPath.startsWith('/') ? posterPath : `/${posterPath}`}`;
}

export function tmdbMovieUrl(tmdbId: number): string {
	return `https://www.themoviedb.org/movie/${tmdbId}`;
}

export function tmdbTvUrl(tmdbId: number): string {
	return `https://www.themoviedb.org/tv/${tmdbId}`;
}

interface TmdbWatchProviderRaw {
	logo_path: string | null;
	provider_id: number;
	provider_name: string;
	display_priority: number;
}

interface TmdbWatchProvidersResponse {
	id: number;
	results: Record<
		string,
		{
			link?: string;
			flatrate?: TmdbWatchProviderRaw[];
			rent?: TmdbWatchProviderRaw[];
			buy?: TmdbWatchProviderRaw[];
			ads?: TmdbWatchProviderRaw[];
		}
	>;
}

export function isTmdbMovieId(externalId: string): boolean {
	return /^\d+$/.test(externalId);
}

export function tmdbProviderLogoUrl(logoPath: string | null | undefined): string | null {
	if (!logoPath) return null;
	return `${TMDB_PROVIDER_LOGO_BASE}${logoPath.startsWith('/') ? logoPath : `/${logoPath}`}`;
}

function mapWatchProvider(raw: TmdbWatchProviderRaw): WatchProvider {
	return {
		id: raw.provider_id,
		name: raw.provider_name,
		logoUrl: tmdbProviderLogoUrl(raw.logo_path)
	};
}

function dedupeProviders(providers: WatchProvider[]): WatchProvider[] {
	const seen = new Set<number>();
	const unique: WatchProvider[] = [];
	for (const provider of providers) {
		if (seen.has(provider.id)) continue;
		seen.add(provider.id);
		unique.push(provider);
	}
	return unique;
}

export function parseMovieWatchProviders(
	data: TmdbWatchProvidersResponse,
	region = DEFAULT_WATCH_REGION
): MovieWatchProviders | null {
	const regionData = data.results[region];
	if (!regionData) {
		return { link: null, flatrate: [], free: [] };
	}

	const flatrate = dedupeProviders((regionData.flatrate ?? []).map(mapWatchProvider));
	const free = dedupeProviders((regionData.ads ?? []).map(mapWatchProvider));

	return {
		link: regionData.link ?? null,
		flatrate,
		free
	};
}

export async function getMovieWatchProviders(
	apiKey: string,
	tmdbId: string | number,
	region = DEFAULT_WATCH_REGION
): Promise<MovieWatchProviders | null> {
	const params = new URLSearchParams({ api_key: apiKey });
	const response = await fetch(
		`${TMDB_API_BASE}/movie/${tmdbId}/watch/providers?${params.toString()}`,
		{ signal: AbortSignal.timeout(10_000) }
	);
	if (!response.ok) {
		throw new Error(`TMDB watch providers failed (${response.status})`);
	}

	const data = (await response.json()) as TmdbWatchProvidersResponse;
	return parseMovieWatchProviders(data, region);
}

export async function getMovieGenres(
	apiKey: string,
	tmdbId: string | number
): Promise<string[] | null> {
	const params = new URLSearchParams({ api_key: apiKey });
	const response = await fetch(`${TMDB_API_BASE}/movie/${tmdbId}?${params.toString()}`, {
		signal: AbortSignal.timeout(10_000)
	});
	if (!response.ok) {
		throw new Error(`TMDB movie details failed (${response.status})`);
	}

	const data = (await response.json()) as TmdbMovieDetailsResponse;
	return dedupeGenres(data.genres.map((genre) => genre.name));
}

export async function getMovieGenresBatch(
	apiKey: string,
	tmdbIds: string[]
): Promise<Record<string, string[] | null>> {
	const uniqueIds = [...new Set(tmdbIds.filter(isTmdbMovieId))];
	const results: Record<string, string[] | null> = {};

	for (let index = 0; index < uniqueIds.length; index += MOVIE_GENRES_BATCH_CONCURRENCY) {
		const chunk = uniqueIds.slice(index, index + MOVIE_GENRES_BATCH_CONCURRENCY);
		const settled = await Promise.allSettled(
			chunk.map(async (id) => {
				try {
					const genres = await getMovieGenres(apiKey, id);
					return { id, genres };
				} catch {
					return { id, genres: null };
				}
			})
		);

		for (const result of settled) {
			if (result.status === 'fulfilled') {
				results[result.value.id] = result.value.genres;
			}
		}
	}

	return results;
}

export async function getMovieWatchProvidersBatch(
	apiKey: string,
	tmdbIds: string[],
	region = DEFAULT_WATCH_REGION
): Promise<Record<string, MovieWatchProviders | null>> {
	const uniqueIds = [...new Set(tmdbIds.filter(isTmdbMovieId))];
	const results: Record<string, MovieWatchProviders | null> = {};

	for (let index = 0; index < uniqueIds.length; index += WATCH_PROVIDER_BATCH_CONCURRENCY) {
		const chunk = uniqueIds.slice(index, index + WATCH_PROVIDER_BATCH_CONCURRENCY);
		const settled = await Promise.allSettled(
			chunk.map(async (id) => {
				const providers = await getMovieWatchProviders(apiKey, id, region);
				return { id, providers };
			})
		);

		for (const result of settled) {
			if (result.status === 'fulfilled') {
				results[result.value.id] = result.value.providers;
			}
		}
	}

	return results;
}

export async function searchMovies(
	apiKey: string,
	query: string,
	page = 1
): Promise<SearchPageResult> {
	const params = new URLSearchParams({
		api_key: apiKey,
		query,
		include_adult: 'false',
		page: String(page)
	});

	const response = await fetch(`${TMDB_API_BASE}/search/movie?${params.toString()}`, {
		signal: AbortSignal.timeout(10_000)
	});
	if (!response.ok) {
		throw new Error(`TMDB search failed (${response.status})`);
	}

	const data = (await response.json()) as TmdbMovieSearchResponse;

	let genreMap: Record<number, string> = {};
	try {
		genreMap = await getMovieGenreMap(apiKey);
	} catch (err) {
		console.error('Failed to load TMDB movie genre list', err);
	}

	const results: SearchResult[] = data.results.map((movie) => {
		const year = movie.release_date ? Number.parseInt(movie.release_date.slice(0, 4), 10) : null;
		const genres = mapGenreIdsToNames(movie.genre_ids ?? [], genreMap);
		return {
			externalId: String(movie.id),
			title: movie.title,
			subtitle: null,
			year: Number.isNaN(year) ? null : year,
			coverUrl: tmdbPosterUrl(movie.poster_path),
			metadata: {
				tmdbId: movie.id,
				posterPath: movie.poster_path,
				...(genres.length > 0 ? { genres } : {})
			}
		};
	});

	return {
		results,
		hasMore: data.page < data.total_pages,
		totalPages: data.total_pages
	};
}

export async function searchTv(apiKey: string, query: string, page = 1): Promise<SearchPageResult> {
	const params = new URLSearchParams({
		api_key: apiKey,
		query,
		include_adult: 'false',
		page: String(page)
	});

	const response = await fetch(`${TMDB_API_BASE}/search/tv?${params.toString()}`, {
		signal: AbortSignal.timeout(10_000)
	});
	if (!response.ok) {
		throw new Error(`TMDB TV search failed (${response.status})`);
	}

	const data = (await response.json()) as TmdbTvSearchResponse;

	const results: SearchResult[] = data.results.map((show) => {
		const year = show.first_air_date ? Number.parseInt(show.first_air_date.slice(0, 4), 10) : null;
		return {
			externalId: String(show.id),
			title: show.name,
			subtitle: null,
			year: Number.isNaN(year) ? null : year,
			coverUrl: tmdbPosterUrl(show.poster_path),
			metadata: { tmdbId: show.id, posterPath: show.poster_path }
		};
	});

	return {
		results,
		hasMore: data.page < data.total_pages,
		totalPages: data.total_pages
	};
}
