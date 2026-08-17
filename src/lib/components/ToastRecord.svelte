<script lang="ts">
	import type { ToastKind } from '$lib/stores/toast.svelte';
	import { cn } from '$lib/utils/cn';

	interface Props {
		kind: ToastKind;
		class?: string;
	}

	let { kind, class: className }: Props = $props();

	const tintClass = $derived(
		kind === 'success'
			? 'text-emerald-500 dark:text-emerald-400'
			: kind === 'error'
				? 'text-red-500 dark:text-red-400'
				: 'text-amber-400 dark:text-amber-300'
	);
</script>

<svg
	viewBox="0 0 100 100"
	class={cn('record-spin shrink-0', tintClass, className)}
	aria-hidden="true"
	style="--spin-period: 4s;"
>
	<circle cx="50" cy="50" r="49" fill="currentColor" fill-opacity="0.14" />
	{#each [45, 41, 37, 33, 29] as radius (radius)}
		<circle
			cx="50"
			cy="50"
			r={radius}
			fill="none"
			stroke="currentColor"
			stroke-width="0.85"
			stroke-opacity="0.45"
		/>
	{/each}
	<path
		d="M 50 6 A 44 44 0 0 1 81 19"
		fill="none"
		stroke="currentColor"
		stroke-opacity="0.55"
		stroke-width="2.5"
		stroke-linecap="round"
	/>
	<path
		d="M 50 94 A 44 44 0 0 1 19 81"
		fill="none"
		stroke="currentColor"
		stroke-opacity="0.3"
		stroke-width="2.5"
		stroke-linecap="round"
	/>
	<circle cx="50" cy="50" r="17" fill="currentColor" fill-opacity="0.88" />
	<circle cx="50" cy="50" r="16" fill="none" stroke="rgb(0 0 0 / 0.2)" stroke-width="0.6" />
	<circle cx="50" cy="50" r="3" fill="rgb(var(--color-surface-raised))" fill-opacity="0.95" />
</svg>
