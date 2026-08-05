<script lang="ts">
	import { Search, X } from '@lucide/svelte';

	interface Props {
		value: string;
		placeholder?: string;
		onInput: (value: string) => void;
	}

	let { value = $bindable(''), placeholder = 'Search catalog…', onInput }: Props = $props();
</script>

<div class="relative">
	<Search
		class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-stone-400 dark:text-stone-500"
		strokeWidth={2.5}
	/>
	<input
		type="search"
		{placeholder}
		bind:value
		oninput={() => onInput(value)}
		class="w-full rounded border-2 border-stone-300 bg-white py-2.5 pr-10 pl-10 text-sm font-medium text-stone-900 transition-all placeholder:text-stone-400 focus:border-amber-400 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-white dark:placeholder:text-stone-500 dark:focus:border-amber-500"
	/>
	{#if value}
		<button
			type="button"
			class="absolute top-1/2 right-3 -translate-y-1/2 rounded p-0.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-stone-700 dark:hover:text-stone-400"
			aria-label="Clear search"
			onclick={() => {
				value = '';
				onInput('');
			}}
		>
			<X class="size-4" strokeWidth={2.5} />
		</button>
	{/if}
</div>
