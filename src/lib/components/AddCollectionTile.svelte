<script lang="ts">
	import type { MediaCategory } from '$lib/types/media';
	import { Plus } from 'phosphor-svelte';
	import DvdDisc from './DvdDisc.svelte';
	import VinylDisc from './VinylDisc.svelte';

	interface Props {
		onclick: () => void;
		category?: MediaCategory;
	}

	let { onclick, category = 'music' }: Props = $props();

	const isMovie = $derived(category === 'movie');
</script>

<button
	type="button"
	{onclick}
	class="group relative z-0 flex w-[8.5rem] shrink-0 flex-col text-left hover:z-10 sm:w-[9.5rem]"
	aria-label="Add new collection"
>
	<div class="card-art">
		{#if isMovie}
			<div class="dvd-case-assembly transition-transform duration-300 group-hover:-translate-y-1">
				<div class="dvd-disc-slot" aria-hidden="true">
					<DvdDisc class="size-full opacity-80" />
				</div>
				<div class="dvd-spine" aria-hidden="true"></div>
				<div
					class="dvd-front flex aspect-[7/10] flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border-2 border-dashed border-amber-400/50 bg-[rgb(var(--color-surface-raised))] shadow-md transition-all duration-300 group-hover:border-amber-400/80 group-hover:bg-[rgb(var(--color-surface))] group-hover:shadow-lg dark:border-amber-400/30 dark:bg-stone-900 dark:group-hover:bg-stone-800"
				>
					<div class="flex flex-col items-center justify-center gap-2 p-4">
						<Plus
							size={32}
							weight="bold"
							class="text-amber-600 transition-transform duration-300 group-hover:scale-110 dark:text-amber-400"
						/>
					</div>
				</div>
			</div>
		{:else}
			<div class="sleeve-assembly transition-transform duration-300 group-hover:-translate-y-1">
				<div class="sleeve-spine" aria-hidden="true"></div>
				<div
					class="sleeve-front flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border-2 border-dashed border-amber-400/50 bg-[rgb(var(--color-surface-raised))] shadow-md transition-all duration-300 group-hover:border-amber-400/80 group-hover:bg-[rgb(var(--color-surface))] group-hover:shadow-lg dark:border-amber-400/30 dark:bg-stone-900 dark:group-hover:bg-stone-800"
				>
					<div class="flex flex-col items-center justify-center gap-2 p-4">
						<Plus
							size={32}
							weight="bold"
							class="text-amber-600 transition-transform duration-300 group-hover:scale-110 dark:text-amber-400"
						/>
						<VinylDisc class="w-[55%]" />
					</div>
				</div>
			</div>
		{/if}
	</div>
	<div class="mt-2.5 px-0.5">
		<h3 class="line-clamp-2 text-xs font-bold text-stone-900 dark:text-amber-50">
			Add new collection
		</h3>
	</div>
</button>

<style>
	.card-art {
		position: relative;
		isolation: isolate;
		overflow: hidden;
	}

	.group:hover .card-art {
		overflow: visible;
	}

	.sleeve-assembly,
	.dvd-case-assembly {
		position: relative;
		width: 100%;
	}

	.sleeve-assembly {
		--sleeve-peek: 8px;
		--sleeve-underlap: 18px;
	}

	.dvd-case-assembly {
		--case-peek: 6px;
		--case-underlap: 14px;
	}

	.sleeve-spine,
	.dvd-spine {
		position: absolute;
		top: 0.25rem;
		bottom: 0.125rem;
		left: 0;
		z-index: 0;
		border-radius: 1.5rem 0 0 1.5rem;
		background: rgb(var(--color-border));
		box-shadow: inset 0 2px 4px rgb(0 0 0 / 0.12);
	}

	.sleeve-spine {
		width: calc(var(--sleeve-peek) + var(--sleeve-underlap));
	}

	.dvd-spine {
		width: calc(var(--case-peek) + var(--case-underlap));
		z-index: 1;
	}

	:global([data-theme='dark']) .sleeve-spine,
	:global([data-theme='dark']) .dvd-spine {
		background: rgb(87 83 78);
		box-shadow: inset 0 2px 5px rgb(0 0 0 / 0.28);
	}

	.sleeve-front {
		position: relative;
		z-index: 1;
		margin-left: var(--sleeve-peek);
	}

	.dvd-front {
		position: relative;
		z-index: 2;
		margin-left: var(--case-peek);
	}

	.dvd-disc-slot {
		position: absolute;
		bottom: 6%;
		right: 4%;
		z-index: 0;
		width: 56%;
		aspect-ratio: 1;
		transform: translateX(8%) translateY(4%);
		transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
	}

	button:hover .dvd-disc-slot {
		transform: translateX(42%) translateY(-12%) scale(1.06) rotate(-8deg);
	}

	@media (prefers-reduced-motion: reduce) {
		.dvd-disc-slot {
			transition: none;
		}

		button:hover .dvd-disc-slot {
			transform: translateX(8%) translateY(4%);
		}
	}

	:global([data-motion='reduced']) .dvd-disc-slot {
		transition: none;
	}

	:global([data-motion='reduced']) button:hover .dvd-disc-slot {
		transform: translateX(8%) translateY(4%);
	}
</style>
