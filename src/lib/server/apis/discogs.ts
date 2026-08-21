import type { SearchResult } from '$lib/types/media';
import { SEARCH_PAGE_SIZE, type SearchPageResult } from '$lib/server/apis/search-types';

const DISCOGS_API_BASE = 'https://api.discogs.com';

interface DiscogsSearchResult {
	id: number;
	title: string;
	year?: string;
	thumb?: string;
	type?: string;
}

interface DiscogsSearchResponse {
	pagination: {
		page: number;
		pages: number;
		per_page: number;
	};
	results: DiscogsSearchResult[];
}

export function discogsReleaseUrl(releaseId: number): string {
	return `https://www.discogs.com/release/${releaseId}`;
}

export async function searchMusic(
	token: string,
	query: string,
	page = 1
): Promise<SearchPageResult> {
	const params = new URLSearchParams({
		q: query,
		type: 'release',
		format: 'Vinyl',
		per_page: String(SEARCH_PAGE_SIZE),
		page: String(page)
	});

	const response = await fetch(`${DISCOGS_API_BASE}/database/search?${params.toString()}`, {
		headers: {
			Authorization: `Discogs token=${token}`,
			'User-Agent': 'MediaClub/1.0 (self-hosted media inventory)'
		},
		signal: AbortSignal.timeout(10_000)
	});

	if (!response.ok) {
		throw new Error(`Discogs search failed (${response.status})`);
	}

	const data = (await response.json()) as DiscogsSearchResponse;

	const results: SearchResult[] = data.results.map((release) => {
		const year = release.year ? Number.parseInt(release.year, 10) : null;
		return {
			externalId: String(release.id),
			title: release.title,
			subtitle: null,
			year: Number.isNaN(year) ? null : year,
			coverUrl: release.thumb ?? null,
			metadata: { discogsId: release.id, type: release.type }
		};
	});

	return {
		results,
		hasMore: data.pagination.page < data.pagination.pages,
		totalPages: data.pagination.pages
	};
}
