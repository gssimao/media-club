import { fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin';
import {
	createStreamingList,
	deleteStreamingList,
	listStreamingListItems,
	listStreamingLists,
	resolveStreamingListCoverUrl
} from '$lib/server/streaming-lists';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const lists = await listStreamingLists(locals.db);
	const coverUrls: Record<string, string | null> = {};
	const itemCounts: Record<string, number> = {};

	for (const list of lists) {
		coverUrls[list.id] = await resolveStreamingListCoverUrl(locals.db, list);
		const items = await listStreamingListItems(locals.db, list.id);
		itemCounts[list.id] = items.length;
	}

	return { lists, coverUrls, itemCounts, user: locals.user };
};

export const actions: Actions = {
	createList: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const title = String(form.get('title') ?? '').trim();
		const description = form.get('description') ? String(form.get('description')).trim() : null;

		if (!title) return fail(400, { message: 'List title is required.' });

		await createStreamingList(locals.db, { title, description });
	},

	deleteList: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('id') ?? '');
		if (!id) return fail(400, { message: 'Missing list id.' });

		await deleteStreamingList(locals.db, id);
	}
};
