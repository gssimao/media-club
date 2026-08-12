import { fail, redirect } from '@sveltejs/kit';
import { assignItemToAlbum, createAlbum, deleteAlbum } from '$lib/server/albums';
import { addItem, deleteItem, moveToOwned, updateItemNotes, updateItemTags } from '$lib/server/items';
import { isListType, isMediaCategory } from '$lib/types/media';
import type { Actions } from './$types';

function requireAdmin(locals: App.Locals) {
	if (!locals.user) {
		redirect(303, '/login');
	}
}

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
		const coverUrl = form.get('coverUrl') ? String(form.get('coverUrl')) : null;
		const metadataRaw = form.get('metadata');
		const notes = form.get('notes') ? String(form.get('notes')) : null;

		if (!isMediaCategory(category) || !isListType(listType) || !externalId || !title) {
			return fail(400, { message: 'Invalid item payload.' });
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

		return { success: true };
	},

	delete: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { message: 'Missing item id.' });

		await deleteItem(locals.db, id);
		return { success: true };
	},

	moveToOwned: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { message: 'Missing item id.' });

		await moveToOwned(locals.db, id);
		return { success: true };
	},

	updateNotes: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		const notes = String(form.get('notes') ?? '').trim();
		if (!id) return fail(400, { message: 'Missing item id.' });

		await updateItemNotes(locals.db, id, notes || null);
		return { success: true };
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
		return { success: true };
	},

	createAlbum: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const category = String(form.get('category') ?? '');
		const title = String(form.get('title') ?? '').trim();
		const description = form.get('description') ? String(form.get('description')) : null;

		if (!isMediaCategory(category) || !title) {
			return fail(400, { message: 'Invalid album payload.' });
		}

		await createAlbum(locals.db, { category, title, description });
		return { success: true };
	},

	assignAlbum: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const itemId = String(form.get('itemId') ?? '');
		const albumIdRaw = form.get('albumId');
		const albumId = albumIdRaw ? String(albumIdRaw) : null;

		if (!itemId) return fail(400, { message: 'Missing item id.' });

		const ok = await assignItemToAlbum(locals.db, itemId, albumId);
		if (!ok) return fail(400, { message: 'Could not assign item to album.' });

		return { success: true };
	},

	deleteAlbum: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { message: 'Missing album id.' });

		await deleteAlbum(locals.db, id);
		return { success: true };
	}
};
