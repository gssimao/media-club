import { redirect } from '@sveltejs/kit';
import { isAlbumAccentColor, type AlbumAccentColor } from '$lib/theme/album-colors';

/** Field length caps — protects the DB from unbounded form input. */
export const MAX_TITLE_LENGTH = 500;
export const MAX_NOTES_LENGTH = 2000;
export const MAX_DESCRIPTION_LENGTH = 2000;

export function requireAdmin(locals: App.Locals) {
	if (!locals.user) {
		redirect(303, '/login');
	}
}

/**
 * Admin mutations are posted cross-route (e.g. a MediaCard on /movies posts to
 * /admin/items?/delete). Without JavaScript the browser would land on the bare
 * action route, so successful actions redirect back to the same-origin referrer.
 * Enhanced (`use:enhance`) submissions should call {@link finishAdminMutation} instead
 * so the page keeps its scroll position.
 */
export function backToReferer(request: Request, fallback = '/admin'): never {
	const referer = request.headers.get('referer');
	let target: URL | null = null;
	if (referer) {
		try {
			target = new URL(referer);
		} catch {
			target = null;
		}
	}

	if (target && target.origin === new URL(request.url).origin) {
		redirect(303, target.pathname + target.search);
	}
	redirect(303, fallback);
}

/** True when the form was submitted via SvelteKit `use:enhance`. */
export function isEnhancedFormRequest(request: Request): boolean {
	return request.headers.get('x-sveltekit-action') === 'true';
}

/**
 * Completes an admin mutation without scrolling the page: enhanced submissions
 * return silently; plain form posts still redirect to the referer.
 */
export function finishAdminMutation(request: Request, fallback = '/admin'): void {
	if (isEnhancedFormRequest(request)) return;
	backToReferer(request, fallback);
}

/** Accepts only absolute http(s) URLs; anything else becomes null. */
export function sanitizeHttpUrl(value: FormDataEntryValue | null): string | null {
	if (!value) return null;
	const raw = String(value).trim();
	if (!raw) return null;

	try {
		const url = new URL(raw);
		if (url.protocol === 'http:' || url.protocol === 'https:') return raw;
	} catch {
		// Not a valid absolute URL.
	}
	return null;
}

/** Accepts only whitelisted album accent color slugs; anything else becomes null. */
export function sanitizeAlbumAccentColor(
	value: FormDataEntryValue | null
): AlbumAccentColor | null {
	if (!value) return null;
	const raw = String(value).trim();
	if (!raw) return null;
	return isAlbumAccentColor(raw) ? raw : null;
}
