import { toast } from '$lib/stores/toast.svelte';
import type { MediaCategory, SearchApiResponse, SearchResult } from '$lib/types/media';
import { formatApiErrorMessage } from '$lib/utils/api-error';
import { appendUniqueSearchResults, buildSearchUrl } from '$lib/utils/search-filters';

export interface MetadataSearchOptions {
	category: MediaCategory;
	streamingListId?: string;
}

/** Normalize API payloads so callers always get a consistent paginated shape. */
export function parseSearchApiResponse(data: unknown): SearchApiResponse {
	if (!data || typeof data !== 'object') {
		return { results: [], page: 1, hasMore: false };
	}

	const payload = data as Partial<SearchApiResponse>;
	return {
		results: Array.isArray(payload.results) ? payload.results : [],
		page: typeof payload.page === 'number' && payload.page > 0 ? payload.page : 1,
		hasMore: Boolean(payload.hasMore),
		...(typeof payload.totalPages === 'number' ? { totalPages: payload.totalPages } : {})
	};
}

export class MetadataSearch {
	query = $state('');
	results = $state<SearchResult[]>([]);
	page = $state(1);
	hasMore = $state(false);
	loading = $state(false);
	loadingMore = $state(false);

	private debounceTimer: ReturnType<typeof setTimeout> | undefined;
	private abortController: AbortController | null = null;
	/** Tracks last filter toggle values so pagination resets only when filters change. */
	private lastFilterKey = '';

	constructor(private getOptions: () => MetadataSearchOptions) {
		$effect(() => {
			return () => {
				clearTimeout(this.debounceTimer);
				this.abortController?.abort();
			};
		});
	}

	resetState = () => {
		this.results = [];
		this.page = 1;
		this.hasMore = false;
		this.loading = false;
		this.loadingMore = false;
		this.lastFilterKey = '';
	};

	private async fetchPage(trimmed: string, targetPage: number, append: boolean) {
		this.abortController?.abort();

		const controller = new AbortController();
		this.abortController = controller;
		const { category, streamingListId } = this.getOptions();

		if (append) {
			this.loadingMore = true;
		} else {
			this.loading = true;
		}

		try {
			const response = await fetch(
				buildSearchUrl(category, trimmed, {
					streamingListId,
					page: targetPage
				}),
				{ signal: controller.signal }
			);

			if (!response.ok) {
				const text = await response.text();
				throw new Error(formatApiErrorMessage(text, `Search failed (${response.status})`));
			}

			const data = parseSearchApiResponse(await response.json());

			if (append) {
				this.results = appendUniqueSearchResults(this.results, data.results);
			} else {
				this.results = data.results;
			}

			this.page = data.page;
			this.hasMore = data.hasMore;
			this.loading = false;
			this.loadingMore = false;
		} catch (error) {
			if (controller.signal.aborted) {
				if (this.abortController === controller) {
					this.loading = false;
					this.loadingMore = false;
				}
				return;
			}
			toast.error(error instanceof Error ? error.message : 'Search failed');
			if (!append) {
				this.results = [];
				this.page = 1;
				this.hasMore = false;
			}
			this.loading = false;
			this.loadingMore = false;
		}
	}

	private runSearch = async (value: string, reset = true) => {
		const trimmed = value.trim();
		this.query = value;

		if (trimmed.length < 2) {
			this.resetState();
			return;
		}

		if (reset) {
			this.page = 1;
			this.hasMore = false;
		}

		await this.fetchPage(trimmed, reset ? 1 : this.page, !reset);
	};

	/** Arrow fn so `onInput={search.handleInput}` keeps the MetadataSearch instance as `this`. */
	handleInput = (value: string) => {
		this.query = value;
		clearTimeout(this.debounceTimer);
		this.debounceTimer = setTimeout(() => this.runSearch(value, true), 350);
	};

	loadMore = async () => {
		if (this.loading || this.loadingMore || !this.hasMore) return;

		const trimmed = this.query.trim();
		if (trimmed.length < 2) return;

		await this.fetchPage(trimmed, this.page + 1, true);
	};

	resetPaginationOnFilterChange = (hideOwned: boolean, hideOnList: boolean) => {
		const filterKey = `${hideOwned}:${hideOnList}`;
		if (filterKey === this.lastFilterKey) return;
		this.lastFilterKey = filterKey;

		if (this.page > 1 && this.query.trim().length >= 2) {
			void this.runSearch(this.query, true);
		}
	};
}

export function createMetadataSearch(getOptions: () => MetadataSearchOptions): MetadataSearch {
	return new MetadataSearch(getOptions);
}
