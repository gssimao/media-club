export type MediaCategory = 'movie' | 'music' | 'book';
export type ListType = 'owned' | 'wishlist';

export interface MediaItem {
	id: string;
	category: MediaCategory;
	listType: ListType;
	externalId: string;
	title: string;
	subtitle: string | null;
	year: number | null;
	coverUrl: string | null;
	metadata: Record<string, unknown> | null;
	notes: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface SearchResult {
	externalId: string;
	title: string;
	subtitle: string | null;
	year: number | null;
	coverUrl: string | null;
	metadata?: Record<string, unknown>;
}

export const CATEGORY_LABELS: Record<MediaCategory, string> = {
	movie: 'Movies',
	music: 'Music',
	book: 'Books'
};

export const LIST_TYPE_LABELS: Record<ListType, string> = {
	owned: 'Collection',
	wishlist: 'Wishlist'
};

export function isMediaCategory(value: string): value is MediaCategory {
	return value === 'movie' || value === 'music' || value === 'book';
}

export function isListType(value: string): value is ListType {
	return value === 'owned' || value === 'wishlist';
}
