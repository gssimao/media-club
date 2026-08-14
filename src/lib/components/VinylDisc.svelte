<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
		/** Continuously rotate the disc (disabled by prefers-reduced-motion). */
		spinning?: boolean;
	}

	let { class: className, spinning = false }: Props = $props();
</script>

<svg viewBox="0 0 100 100" class={cn(spinning && 'record-spin', className)} aria-hidden="true">
	<circle cx="50" cy="50" r="49" class="fill-stone-800 dark:fill-stone-950" />
	{#each [45, 41, 37, 33, 29] as radius (radius)}
		<circle
			cx="50"
			cy="50"
			r={radius}
			fill="none"
			stroke="currentColor"
			stroke-width="0.75"
			class="text-stone-500/35 dark:text-stone-400/20"
		/>
	{/each}
	<!-- Light sheen arcs make the rotation readable -->
	<path
		d="M 50 6 A 44 44 0 0 1 81 19"
		fill="none"
		stroke="white"
		stroke-opacity="0.3"
		stroke-width="2.5"
		stroke-linecap="round"
	/>
	<path
		d="M 50 94 A 44 44 0 0 1 19 81"
		fill="none"
		stroke="white"
		stroke-opacity="0.16"
		stroke-width="2.5"
		stroke-linecap="round"
	/>
	<circle cx="50" cy="50" r="17" class="fill-amber-400 dark:fill-amber-500" />
	<circle cx="50" cy="50" r="16" fill="none" stroke="rgb(0 0 0 / 0.18)" stroke-width="0.5" />
	<circle cx="50" cy="50" r="3" class="fill-stone-100 dark:fill-stone-900" />
</svg>
