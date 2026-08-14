import type { SearchResult } from '$lib/types/media';

const OPEN_LIBRARY_SEARCH = 'https://openlibrary.org/search.json';

interface OpenLibraryDoc {
	key?: string;
	title?: string;
	author_name?: string[];
	first_publish_year?: number;
	cover_i?: number;
}

interface OpenLibrarySearchResponse {
	docs: OpenLibraryDoc[];
}

export function openLibraryCoverUrl(coverId: number | undefined): string | null {
	if (!coverId) return null;
	return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}

export function openLibraryWorkUrl(workKey: string): string {
	return `https://openlibrary.org${workKey}`;
}

export async function searchBooks(query: string): Promise<SearchResult[]> {
	const params = new URLSearchParams({
		q: query,
		limit: '12',
		fields: 'key,title,author_name,first_publish_year,cover_i'
	});

	const response = await fetch(`${OPEN_LIBRARY_SEARCH}?${params.toString()}`, {
		signal: AbortSignal.timeout(10_000)
	});
	if (!response.ok) {
		throw new Error(`Open Library search failed (${response.status})`);
	}

	const data = (await response.json()) as OpenLibrarySearchResponse;

	return data.docs
		.filter((doc) => doc.key && doc.title)
		.map((doc) => ({
			externalId: doc.key!,
			title: doc.title!,
			subtitle: doc.author_name?.join(', ') ?? null,
			year: doc.first_publish_year ?? null,
			coverUrl: openLibraryCoverUrl(doc.cover_i),
			metadata: { workKey: doc.key, coverId: doc.cover_i }
		}));
}
