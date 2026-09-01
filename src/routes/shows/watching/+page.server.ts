import { fail } from '@sveltejs/kit';
import { finishAdminMutation, requireAdmin, sanitizeHttpUrl } from '$lib/server/admin';
import {
	addShowTrackerItem,
	deleteShowTrackerItem,
	listShowTrackerItems,
	promoteShowTrackerItem,
	setShowTrackerStatus,
	updateShowTrackerGenres
} from '$lib/server/show-tracker';
import { dedupeGenres, normalizeGenreName } from '$lib/utils/movie-genres';
import type { ShowTrackStatus } from '$lib/types/media';
import type { Actions, PageServerLoad } from './$types';

function parseTrackStatus(value: string): ShowTrackStatus | null {
	return value === 'watching' || value === 'upcoming' ? value : null;
}

export const load: PageServerLoad = async ({ locals }) => {
	const items = await listShowTrackerItems(locals.db);

	return {
		watchingItems: items.filter((item) => item.trackStatus === 'watching'),
		upcomingItems: items.filter((item) => item.trackStatus === 'upcoming'),
		allTrackerItems: items,
		isAdmin: Boolean(locals.user)
	};
};

export const actions: Actions = {
	addItem: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const externalId = String(form.get('externalId') ?? '');
		const title = String(form.get('title') ?? '').trim();
		const subtitle = form.get('subtitle') ? String(form.get('subtitle')) : null;
		const yearRaw = form.get('year');
		const year = yearRaw ? Number.parseInt(String(yearRaw), 10) : null;
		const coverUrl = sanitizeHttpUrl(form.get('coverUrl'));
		const metadataRaw = form.get('metadata');
		const trackStatus = parseTrackStatus(String(form.get('trackStatus') ?? 'watching'));

		if (!externalId || !title || !trackStatus) {
			return fail(400, { message: 'Invalid show payload.' });
		}

		let metadata: Record<string, unknown> | undefined;
		if (metadataRaw) {
			try {
				metadata = JSON.parse(String(metadataRaw)) as Record<string, unknown>;
			} catch {
				metadata = undefined;
			}
		}

		const result = await addShowTrackerItem(
			locals.db,
			{
				externalId,
				title,
				subtitle,
				year: Number.isNaN(year) ? null : year,
				coverUrl,
				metadata
			},
			trackStatus
		);

		if (!result.id) {
			return fail(500, { message: 'Could not add show to tracker.' });
		}
	},

	setTrackStatus: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const trackStatus = parseTrackStatus(String(form.get('trackStatus') ?? ''));

		if (!id || !trackStatus) return fail(400, { message: 'Missing item or section.' });

		await setShowTrackerStatus(locals.db, id, trackStatus);
		finishAdminMutation(request);
	},

	promoteToWishlist: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { message: 'Missing item id.' });

		const result = await promoteShowTrackerItem(locals.db, id, 'wishlist');
		if (!result.ok) return fail(400, { message: result.message ?? 'Could not add to wishlist.' });
		finishAdminMutation(request);
	},

	promoteToOwned: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { message: 'Missing item id.' });

		const result = await promoteShowTrackerItem(locals.db, id, 'owned');
		if (!result.ok) return fail(400, { message: result.message ?? 'Could not add to collection.' });
		finishAdminMutation(request);
	},

	deleteItem: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { message: 'Missing item id.' });

		await deleteShowTrackerItem(locals.db, id);
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

		await updateShowTrackerGenres(locals.db, id, genres);
		finishAdminMutation(request);
	}
};
