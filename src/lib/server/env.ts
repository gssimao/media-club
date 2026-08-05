import type { RequestEvent } from '@sveltejs/kit';

export function getSecret(
	event: RequestEvent,
	key: 'TMDB_API_KEY' | 'DISCOGS_TOKEN'
): string | undefined {
	return event.platform?.env?.[key] ?? process.env[key];
}

export function requireSecret(event: RequestEvent, key: 'TMDB_API_KEY' | 'DISCOGS_TOKEN'): string {
	const value = getSecret(event, key);
	if (!value) {
		throw new Error(`${key} is not configured`);
	}
	return value;
}
