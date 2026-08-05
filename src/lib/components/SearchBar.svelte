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
		class="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
	/>
	<input
		type="search"
		{placeholder}
		bind:value
		oninput={() => onInput(value)}
		class="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-10 pl-10 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-blue-500"
	/>
	{#if value}
		<button
			type="button"
			class="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-400"
			aria-label="Clear search"
			onclick={() => {
				value = '';
				onInput('');
			}}
		>
			<X class="size-4" />
		</button>
	{/if}
</div>
