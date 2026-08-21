import type { AlbumAccentColor } from '$lib/theme/album-colors';

export type MediaCategory = 'movie' | 'music' | 'book';
export type ListType = 'owned' | 'wishlist';

export type { AlbumAccentColor };

export interface MediaItem {
	id: string;
	category: MediaCategory;
	listType: ListType;
	albumId: string | null;
	externalId: string;
	title: string;
	subtitle: string | null;
	year: number | null;
	coverUrl: string | null;
	metadata: Record<string, unknown> | null;
	notes: string | null;
	albumWatchedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface Album {
	id: string;
	category: MediaCategory;
	title: string;
	description: string | null;
	coverUrl: string | null;
	accentColor: AlbumAccentColor | null;
	sortOrder: number;
	itemCount: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface CatalogStatus {
	owned: boolean;
	wishlist: boolean;
	onStreamingList?: boolean;
}

export interface SearchResult {
	externalId: string;
	title: string;
	subtitle: string | null;
	year: number | null;
	coverUrl: string | null;
	metadata?: Record<string, unknown>;
	catalogStatus?: CatalogStatus;
}

export interface SearchApiResponse {
	results: SearchResult[];
	page: number;
	hasMore: boolean;
	totalPages?: number;
}

/** Where search is shown — drives filter toggle labels and hide-on-list semantics. */
export type SearchPanelContext = 'admin' | 'wishlist' | 'owned-add' | 'streaming';

/** URL path segment for each category (e.g. /movies, /music, /books). */
export const CATEGORY_PATHS: Record<MediaCategory, string> = {
	movie: 'movies',
	music: 'music',
	book: 'books'
};

export const CATEGORY_LABELS: Record<MediaCategory, string> = {
	movie: 'Movies',
	music: 'Music',
	book: 'Books'
};

export interface CategoryActionWording {
	/** Infinitive, e.g. "watch" in "To watch" */
	verb: string;
	/** Past participle, e.g. "watched" in "Mark watched" */
	done: string;
	/** Negated past participle, e.g. "unwatched" in "Mark unwatched" */
	notDone: string;
}

/** Category-appropriate consumption wording — movies are watched, records played, books read. */
export const CATEGORY_ACTION_WORDING: Record<MediaCategory, CategoryActionWording> = {
	movie: { verb: 'watch', done: 'watched', notDone: 'unwatched' },
	music: { verb: 'play', done: 'played', notDone: 'unplayed' },
	book: { verb: 'read', done: 'read', notDone: 'unread' }
};

export function isMediaCategory(value: string): value is MediaCategory {
	return value === 'movie' || value === 'music' || value === 'book';
}

export function isListType(value: string): value is ListType {
	return value === 'owned' || value === 'wishlist';
}
