import { error, isHttpError, json } from '@sveltejs/kit';
import { searchMusic } from '$lib/server/apis/discogs';
import { searchBooks } from '$lib/server/apis/openlibrary';
import { searchMovies, searchTv } from '$lib/server/apis/tmdb';
import { getSecret } from '$lib/server/env';
import { checkRateLimit, clientIp } from '$lib/server/rate-limit';
import { attachCatalogStatus, getCatalogStatusForExternalIds } from '$lib/server/search-catalog';
import { isMediaCategory } from '$lib/types/media';
import type { RequestHandler } from './$types';

function parsePageParam(value: string | null): number {
	const parsed = Number.parseInt(value ?? '1', 10);
	if (!Number.isFinite(parsed) || parsed < 1) return 1;
	return parsed;
}

export const GET: RequestHandler = async (event) => {
	if (!event.locals.user) {
		error(401, 'Unauthorized');
	}

	const ip = clientIp(event.request);
	if (!checkRateLimit(`search:${ip}`)) {
		error(429, 'Too many search requests. Try again in a minute.');
	}

	const category = event.url.searchParams.get('category') ?? '';
	const query = event.url.searchParams.get('q')?.trim() ?? '';
	const page = parsePageParam(event.url.searchParams.get('page'));
	const streamingListId = event.url.searchParams.get('streamingListId')?.trim() || undefined;

	if (!isMediaCategory(category) || query.length < 2) {
		return json({ results: [], page: 1, hasMore: false });
	}

	let searchPage;
	if (category === 'movie' || category === 'show') {
		const apiKey = getSecret(event, 'TMDB_API_KEY');
		if (!apiKey) error(503, 'TMDB_API_KEY is not configured');
		try {
			searchPage =
				category === 'movie'
					? await searchMovies(apiKey, query, page)
					: await searchTv(apiKey, query, page);
		} catch (err) {
			console.error(err);
			error(502, 'Search provider failed');
		}
	} else if (category === 'music') {
		const token = getSecret(event, 'DISCOGS_TOKEN');
		if (!token) error(503, 'DISCOGS_TOKEN is not configured');
		try {
			searchPage = await searchMusic(token, query, page);
		} catch (err) {
			console.error(err);
			error(502, 'Search provider failed');
		}
	} else {
		try {
			searchPage = await searchBooks(query, page);
		} catch (err) {
			if (isHttpError(err)) throw err;
			console.error(err);
			error(502, 'Search provider failed');
		}
	}

	const { results, hasMore, totalPages } = searchPage;

	if (results.length === 0) {
		return json({ results: [], page, hasMore: false, ...(totalPages ? { totalPages } : {}) });
	}

	const statusById = await getCatalogStatusForExternalIds(
		event.locals.db,
		category,
		results.map((result) => result.externalId),
		streamingListId ? { streamingListId } : undefined
	);

	return json({
		results: attachCatalogStatus(results, statusById),
		page,
		hasMore,
		...(totalPages ? { totalPages } : {})
	});
};
