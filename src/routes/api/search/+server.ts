import { error, json } from '@sveltejs/kit';
import { searchMusic } from '$lib/server/apis/discogs';
import { searchBooks } from '$lib/server/apis/openlibrary';
import { searchMovies } from '$lib/server/apis/tmdb';
import { getSecret } from '$lib/server/env';
import { checkRateLimit, clientIp } from '$lib/server/rate-limit';
import { isMediaCategory } from '$lib/types/media';
import type { RequestHandler } from './$types';

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

	if (!isMediaCategory(category) || query.length < 2) {
		return json({ results: [] });
	}

	try {
		if (category === 'movie') {
			const apiKey = getSecret(event, 'TMDB_API_KEY');
			if (!apiKey) error(503, 'TMDB_API_KEY is not configured');
			return json({ results: await searchMovies(apiKey, query) });
		}

		if (category === 'music') {
			const token = getSecret(event, 'DISCOGS_TOKEN');
			if (!token) error(503, 'DISCOGS_TOKEN is not configured');
			return json({ results: await searchMusic(token, query) });
		}

		return json({ results: await searchBooks(query) });
	} catch (err) {
		console.error(err);
		error(502, 'Search provider failed');
	}
};
