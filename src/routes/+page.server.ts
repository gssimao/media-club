import { redirect } from '@sveltejs/kit';
import { getDefaultRoute } from '$lib/server/env';
import { getItemCounts } from '$lib/server/items';
import { CATEGORY_LABELS, type ListType, type MediaCategory } from '$lib/types/media';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const defaultRoute = getDefaultRoute(platform);
	if (defaultRoute) {
		redirect(303, defaultRoute);
	}

	const counts = await getItemCounts(locals.db);

	const summary = (Object.keys(CATEGORY_LABELS) as MediaCategory[]).map((category) => ({
		category,
		label: CATEGORY_LABELS[category],
		owned: counts[`${category}:owned`] ?? 0,
		wishlist: counts[`${category}:wishlist`] ?? 0
	}));

	return { summary };
};

export type CategorySummary = {
	category: MediaCategory;
	label: string;
	owned: number;
	wishlist: number;
};

export type { ListType, MediaCategory };
