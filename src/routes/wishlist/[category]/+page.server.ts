import { error } from '@sveltejs/kit';
import { listItems } from '$lib/server/items';
import { CATEGORY_LABELS, isMediaCategory, type MediaCategory } from '$lib/types/media';
import type { PageServerLoad } from './$types';

const routeMap: Record<string, MediaCategory> = {
	movies: 'movie',
	shows: 'show',
	music: 'music',
	books: 'book'
};

export const load: PageServerLoad = async ({ locals, params }) => {
	const category = routeMap[params.category];
	if (!category || !isMediaCategory(category)) {
		error(404, 'Category not found');
	}

	const items = await listItems(locals.db, category, 'wishlist');

	return {
		items,
		category,
		label: CATEGORY_LABELS[category],
		isAdmin: Boolean(locals.user)
	};
};
