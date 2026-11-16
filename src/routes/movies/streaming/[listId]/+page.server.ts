import { error, fail } from '@sveltejs/kit';
import { requireAdmin, sanitizeHttpUrl, finishAdminMutation } from '$lib/server/admin';
import { getMovieWatchProvidersBatch } from '$lib/server/apis/tmdb';
import { getSecret } from '$lib/server/env';
import {
	addStreamingListItem,
	deleteStreamingListItem,
	getStreamingListById,
	listStreamingListItems,
	promoteStreamingItem,
	setStreamingItemWatched,
	updateStreamingItemGenres
} from '$lib/server/streaming-lists';
import { dedupeGenres, normalizeGenreName } from '$lib/utils/movie-genres';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { locals, params } = event;
	const list = await getStreamingListById(locals.db, params.listId);
	if (!list) error(404, 'Streaming list not found');

	const items = await listStreamingListItems(locals.db, params.listId);

	const apiKey = getSecret(event, 'TMDB_API_KEY');
	let watchProvidersByExternalId: Record<
		string,
		Awaited<ReturnType<typeof getMovieWatchProvidersBatch>>[string]
	> = {};

	if (apiKey && items.length > 0) {
		try {
			watchProvidersByExternalId = await getMovieWatchProvidersBatch(
				apiKey,
				items.map((item) => item.externalId)
			);
		} catch (err) {
			console.error('Failed to load TMDB watch providers for streaming list', err);
		}
	}

	return { list, items, isAdmin: Boolean(locals.user), watchProvidersByExternalId };
};

export const actions: Actions = {
	addItem: async ({ request, locals, params }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const listId = String(form.get('listId') ?? params.listId);
		const externalId = String(form.get('externalId') ?? '');
		const title = String(form.get('title') ?? '').trim();
		const subtitle = form.get('subtitle') ? String(form.get('subtitle')) : null;
		const yearRaw = form.get('year');
		const year = yearRaw ? Number.parseInt(String(yearRaw), 10) : null;
		const coverUrl = sanitizeHttpUrl(form.get('coverUrl'));
		const metadataRaw = form.get('metadata');

		if (!externalId || !title) return fail(400, { message: 'Invalid movie payload.' });

		let metadata: Record<string, unknown> | undefined;
		if (metadataRaw) {
			try {
				metadata = JSON.parse(String(metadataRaw)) as Record<string, unknown>;
			} catch {
				metadata = undefined;
			}
		}

		const result = await addStreamingListItem(locals.db, listId, {
			externalId,
			title,
			subtitle,
			year: Number.isNaN(year) ? null : year,
			coverUrl,
			metadata
		});

		if (!result.inserted) {
			return fail(409, { message: `"${title}" is already on this streaming list.` });
		}
	},

	toggleWatched: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const watchedRaw = String(form.get('watched') ?? '');
		if (!id) return fail(400, { message: 'Missing item id.' });

		const watched = watchedRaw === 'true' || watchedRaw === '1';
		await setStreamingItemWatched(locals.db, id, watched);
		finishAdminMutation(request);
	},

	updateGenres: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const genresRaw = String(form.get('genres') ?? '[]');
		if (!id) return fail(400, { message: 'Missing item id.' });

		let genres: string[] = [];
		try {
			const parsed = JSON.parse(genresRaw) as unknown;
			if (Array.isArray(parsed)) {
				genres = dedupeGenres(parsed.filter((g): g is string => typeof g === 'string'));
			}
		} catch {
			return fail(400, { message: 'Invalid genres payload.' });
		}

		const newGenre = normalizeGenreName(String(form.get('newGenre') ?? ''));
		if (newGenre) {
			genres = dedupeGenres([...genres, newGenre]);
		}

		await updateStreamingItemGenres(locals.db, id, genres);
		finishAdminMutation(request);
	},

	promoteToWishlist: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { message: 'Missing item id.' });

		const result = await promoteStreamingItem(locals.db, id, 'wishlist');
		if (!result.ok) return fail(400, { message: result.message ?? 'Could not add to wishlist.' });
	},

	promoteToOwned: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { message: 'Missing item id.' });

		const result = await promoteStreamingItem(locals.db, id, 'owned');
		if (!result.ok) return fail(400, { message: result.message ?? 'Could not add to collection.' });
	},

	deleteItem: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { message: 'Missing item id.' });

		await deleteStreamingListItem(locals.db, id);
	}
};
