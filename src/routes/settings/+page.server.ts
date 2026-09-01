import { fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin';
import { getItemCounts } from '$lib/server/items';
import { requireSecret } from '$lib/server/env';
import { syncTmdbGenres } from '$lib/server/sync-tmdb-genres';
import { CATEGORY_LABELS, type MediaCategory } from '$lib/types/media';
import type { TmdbGenreSyncMode } from '$lib/utils/movie-genres';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const counts = await getItemCounts(locals.db);

	const summary = (Object.keys(CATEGORY_LABELS) as MediaCategory[]).map((category) => ({
		category,
		label: CATEGORY_LABELS[category],
		owned: counts[`${category}:owned`] ?? 0,
		wishlist: counts[`${category}:wishlist`] ?? 0
	}));

	return {
		summary,
		isAdmin: Boolean(locals.user),
		tmdbCatalogCount:
			(counts['movie:owned'] ?? 0) +
			(counts['movie:wishlist'] ?? 0) +
			(counts['show:owned'] ?? 0) +
			(counts['show:wishlist'] ?? 0)
	};
};

function parseSyncMode(value: FormDataEntryValue | null): TmdbGenreSyncMode | null {
	const raw = String(value ?? '').trim();
	if (raw === 'keep' || raw === 'overwrite') return raw;
	return null;
}

export const actions: Actions = {
	syncTmdbGenres: async (event) => {
		requireAdmin(event.locals);
		const form = await event.request.formData();
		const mode = parseSyncMode(form.get('mode'));
		if (!mode) {
			return fail(400, { message: 'Choose whether to keep or replace existing genres.' });
		}

		let apiKey: string;
		try {
			apiKey = requireSecret(event, 'TMDB_API_KEY');
		} catch {
			return fail(503, { message: 'TMDB is not configured on this server.' });
		}

		try {
			return await syncTmdbGenres(event.locals.db, apiKey, mode);
		} catch (error) {
			return fail(500, {
				message: error instanceof Error ? error.message : 'Could not sync TMDB genres.'
			});
		}
	}
};
