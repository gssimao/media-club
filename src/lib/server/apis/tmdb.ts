import type { SearchResult } from '$lib/types/media';
import type { SearchPageResult } from '$lib/server/apis/search-types';

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

interface TmdbSearchResult {
	id: number;
	title: string;
	release_date?: string;
	poster_path: string | null;
}

interface TmdbSearchResponse {
	page: number;
	results: TmdbSearchResult[];
	total_pages: number;
}

export const TMDB_ATTRIBUTION =
	'This product uses the TMDB API but is not endorsed or certified by TMDB.';

export function tmdbPosterUrl(posterPath: string | null | undefined): string | null {
	if (!posterPath) return null;
	return `${TMDB_POSTER_BASE}${posterPath.startsWith('/') ? posterPath : `/${posterPath}`}`;
}

export function tmdbMovieUrl(tmdbId: number): string {
	return `https://www.themoviedb.org/movie/${tmdbId}`;
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

	const data = (await response.json()) as TmdbSearchResponse;

	const results: SearchResult[] = data.results.map((movie) => {
		const year = movie.release_date ? Number.parseInt(movie.release_date.slice(0, 4), 10) : null;
		return {
			externalId: String(movie.id),
			title: movie.title,
			subtitle: null,
			year: Number.isNaN(year) ? null : year,
			coverUrl: tmdbPosterUrl(movie.poster_path),
			metadata: { tmdbId: movie.id, posterPath: movie.poster_path }
		};
	});

	return {
		results,
		hasMore: data.page < data.total_pages,
		totalPages: data.total_pages
	};
}
