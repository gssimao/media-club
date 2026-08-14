import { getItemCounts } from '$lib/server/items';
import { CATEGORY_LABELS, type MediaCategory } from '$lib/types/media';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const counts = await getItemCounts(locals.db);

	const summary = (Object.keys(CATEGORY_LABELS) as MediaCategory[]).map((category) => ({
		category,
		label: CATEGORY_LABELS[category],
		owned: counts[`${category}:owned`] ?? 0,
		wishlist: counts[`${category}:wishlist`] ?? 0
	}));

	return { summary };
};
