<script lang="ts">
	import { Plus } from 'phosphor-svelte';
	import VinylDisc from './VinylDisc.svelte';

	interface Props {
		onclick: () => void;
	}

	let { onclick }: Props = $props();
</script>

<button
	type="button"
	{onclick}
	class="group flex w-[8.5rem] shrink-0 flex-col text-left sm:w-[9.5rem]"
	aria-label="Add new collection"
>
	<div class="relative">
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
	</div>
	<div class="mt-2.5 px-0.5">
		<h3 class="line-clamp-2 text-xs font-bold text-stone-900 dark:text-amber-50">
			Add new collection
		</h3>
	</div>
</button>

<style>
	.sleeve-assembly {
		position: relative;
		width: 100%;
		--sleeve-peek: 8px;
		--sleeve-underlap: 18px;
	}

	.sleeve-spine {
		position: absolute;
		top: 0.25rem;
		bottom: 0.125rem;
		left: 0;
		z-index: 0;
		width: calc(var(--sleeve-peek) + var(--sleeve-underlap));
		border-radius: 1.5rem 0 0 1.5rem;
		background: rgb(var(--color-border));
		box-shadow: inset 0 2px 4px rgb(0 0 0 / 0.12);
	}

	:global([data-theme='dark']) .sleeve-spine {
		background: rgb(87 83 78);
		box-shadow: inset 0 2px 5px rgb(0 0 0 / 0.28);
	}

	.sleeve-front {
		position: relative;
		z-index: 1;
		margin-left: var(--sleeve-peek);
	}
</style>
