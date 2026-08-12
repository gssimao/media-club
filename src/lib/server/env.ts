import type { RequestEvent } from '@sveltejs/kit';

export type SecretKey = 'TMDB_API_KEY' | 'DISCOGS_TOKEN' | 'MCP_API_KEY';

export function getPlatformSecret(
	platform: App.Platform | undefined,
	key: SecretKey
): string | undefined {
	const env = platform?.env as Record<string, string | undefined> | undefined;
	return env?.[key] ?? process.env[key];
}

export function getSecret(
	event: RequestEvent,
	key: 'TMDB_API_KEY' | 'DISCOGS_TOKEN'
): string | undefined {
	return getPlatformSecret(event.platform, key);
}

export function requireSecret(event: RequestEvent, key: 'TMDB_API_KEY' | 'DISCOGS_TOKEN'): string {
	const value = getSecret(event, key);
	if (!value) {
		throw new Error(`${key} is not configured`);
	}
	return value;
}

/** Returns a same-origin path to redirect `/` to, or null to show the welcome page. */
export function resolveDefaultRoute(raw: string | undefined | null): string | null {
	const trimmed = raw?.trim();
	if (!trimmed || trimmed === '/') return null;

	let path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
	if (path.includes('://') || path.startsWith('//')) return null;

	const pathname = path.split(/[?#]/)[0];
	if (pathname.length > 1 && pathname.endsWith('/')) {
		return pathname.slice(0, -1);
	}

	return pathname;
}

export function getDefaultRoute(platform?: App.Platform): string | null {
	const env = platform?.env as { DEFAULT_ROUTE?: string } | undefined;
	return resolveDefaultRoute(env?.DEFAULT_ROUTE ?? process.env.DEFAULT_ROUTE);
}
