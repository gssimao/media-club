import { settings } from '$lib/stores/settings.svelte';
import { pickRandomFromPool } from './random-movie-pool';
import type { MediaItem } from '$lib/types/media';

export type RandomPickItem = Pick<MediaItem, 'id' | 'title' | 'year' | 'coverUrl' | 'metadata'>;

/** Shared timing, cancellation and selection for every random-picker entry point. */
export function createRandomPick() {
	let open = $state(false);
	let phase = $state<'loading' | 'reveal'>('loading');
	let item = $state<RandomPickItem | null>(null);
	let duration = $state(3200);
	let pool: RandomPickItem[] = [];
	let timer: ReturnType<typeof setTimeout> | undefined;
	$effect(() => () => clearTimeout(timer));
	function start(nextPool = pool) {
		if (!nextPool.length) return;
		clearTimeout(timer);
		pool = [...nextPool];
		item = null;
		phase = 'loading';
		open = true;
		duration = settings.reducedMotion ? 250 : 3000 + Math.floor(Math.random() * 1200);
		timer = setTimeout(() => {
			item = pickRandomFromPool(pool);
			phase = 'reveal';
		}, duration);
	}
	function close() {
		clearTimeout(timer);
		open = false;
	}
	return {
		start,
		close,
		get open() {
			return open;
		},
		get phase() {
			return phase;
		},
		get item() {
			return item;
		},
		get duration() {
			return duration;
		}
	};
}
