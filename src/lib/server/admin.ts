import { redirect } from '@sveltejs/kit';

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
 * With `use:enhance` this becomes a soft same-page navigation that refreshes data.
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
