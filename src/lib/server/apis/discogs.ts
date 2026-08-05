import type { SearchResult } from '$lib/types/media';

const DISCOGS_API_BASE = 'https://api.discogs.com';

interface DiscogsSearchResult {
	id: number;
	title: string;
	year?: string;
	thumb?: string;
	type?: string;
}

interface DiscogsSearchResponse {
	results: DiscogsSearchResult[];
}

export function discogsReleaseUrl(releaseId: number): string {
	return `https://www.discogs.com/release/${releaseId}`;
}

export async function searchMusic(token: string, query: string): Promise<SearchResult[]> {
	const params = new URLSearchParams({
		q: query,
		type: 'release',
		format: 'Vinyl'
	});

	const response = await fetch(`${DISCOGS_API_BASE}/database/search?${params.toString()}`, {
		headers: {
			Authorization: `Discogs token=${token}`,
			'User-Agent': 'MediaClub/1.0 (self-hosted media inventory)'
		}
	});

	if (!response.ok) {
		throw new Error(`Discogs search failed (${response.status})`);
	}

	const data = (await response.json()) as DiscogsSearchResponse;

	return data.results.slice(0, 12).map((release) => {
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
}
