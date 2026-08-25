/** TMDB API attribution — required wherever TMDB data is shown. */
export const TMDB_ATTRIBUTION =
	'This product uses the TMDB API but is not endorsed or certified by TMDB.';

/** Client-safe TMDB watch provider data for streaming list cards. */
export interface WatchProvider {
	id: number;
	name: string;
	logoUrl: string | null;
}

export interface MovieWatchProviders {
	link: string | null;
	flatrate: WatchProvider[];
	free: WatchProvider[];
}
