import { fail } from '@sveltejs/kit';
import {
	backToReferer,
	MAX_NOTES_LENGTH,
	MAX_TITLE_LENGTH,
	requireAdmin,
	sanitizeHttpUrl
} from '$lib/server/admin';
import {
	addItem,
	deleteItem,
	moveToOwned,
	setAlbumWatched,
	updateItemNotes,
	updateItemTags,
	updateItemCover
} from '$lib/server/items';
import { isListType, isMediaCategory } from '$lib/types/media';
import type { Actions } from './$types';

export const actions: Actions = {
	add: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();

		const category = String(form.get('category') ?? '');
		const listType = String(form.get('listType') ?? '');
		const externalId = String(form.get('externalId') ?? '');
		const title = String(form.get('title') ?? '').trim();
		const subtitle = form.get('subtitle') ? String(form.get('subtitle')) : null;
		const yearRaw = form.get('year');
		const year = yearRaw ? Number.parseInt(String(yearRaw), 10) : null;
		const coverUrl = sanitizeHttpUrl(form.get('coverUrl'));
		const metadataRaw = form.get('metadata');
		const notes = form.get('notes') ? String(form.get('notes')).slice(0, MAX_NOTES_LENGTH) : null;

		if (!isMediaCategory(category) || !isListType(listType) || !externalId || !title) {
			return fail(400, { message: 'Invalid item payload.' });
		}
		if (title.length > MAX_TITLE_LENGTH) {
			return fail(400, { message: 'Title is too long.' });
		}

		let metadata: Record<string, unknown> | undefined;
		if (metadataRaw) {
			try {
				metadata = JSON.parse(String(metadataRaw)) as Record<string, unknown>;
			} catch {
				metadata = undefined;
			}
		}

		await addItem(
			locals.db,
			category,
			listType,
			{
				externalId,
				title,
				subtitle,
				year: Number.isNaN(year) ? null : year,
				coverUrl,
				metadata
			},
			{ notes }
		);

		backToReferer(request, '/admin/search');
	},

	delete: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { message: 'Missing item id.' });

		await deleteItem(locals.db, id);
		backToReferer(request);
	},

	moveToOwned: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { message: 'Missing item id.' });

		await moveToOwned(locals.db, id);
		backToReferer(request);
	},

	updateNotes: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const notes = String(form.get('notes') ?? '')
			.trim()
			.slice(0, MAX_NOTES_LENGTH);
		if (!id) return fail(400, { message: 'Missing item id.' });

		await updateItemNotes(locals.db, id, notes || null);
		backToReferer(request);
	},

	updateTags: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const tagsRaw = String(form.get('tags') ?? '[]');
		if (!id) return fail(400, { message: 'Missing item id.' });

		let tags: string[] = [];
		try {
			const parsed = JSON.parse(tagsRaw) as unknown;
			if (Array.isArray(parsed)) {
				tags = parsed.filter((t): t is string => typeof t === 'string');
			}
		} catch {
			return fail(400, { message: 'Invalid tags payload.' });
		}

		await updateItemTags(locals.db, id, tags);
		backToReferer(request);
	},

	updateCover: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const coverUrl = sanitizeHttpUrl(form.get('coverUrl'));
		const metadataRaw = form.get('metadata');
		if (!id) return fail(400, { message: 'Missing item id.' });

		let metadataPatch: Record<string, unknown> | undefined;
		if (metadataRaw) {
			try {
				metadataPatch = JSON.parse(String(metadataRaw)) as Record<string, unknown>;
			} catch {
				metadataPatch = undefined;
			}
		}

		await updateItemCover(locals.db, id, coverUrl, metadataPatch);
		backToReferer(request);
	},

	toggleAlbumWatched: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const watchedRaw = String(form.get('watched') ?? '');
		if (!id) return fail(400, { message: 'Missing item id.' });

		const watched = watchedRaw === 'true' || watchedRaw === '1';
		await setAlbumWatched(locals.db, id, watched);
		backToReferer(request);
	}
};
