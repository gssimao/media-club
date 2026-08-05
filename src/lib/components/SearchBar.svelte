<script lang="ts">
	import { Search, X } from '@lucide/svelte';

	interface Props {
		value: string;
		placeholder?: string;
		onInput: (value: string) => void;
	}

	let { value = $bindable(''), placeholder = 'Search your collection…', onInput }: Props = $props();
</script>

<div class="relative">
	<Search
		class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
	/>
	<input
		type="search"
		{placeholder}
		bind:value
		oninput={() => onInput(value)}
		class="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-2.5 pr-10 pl-10 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 focus:outline-none"
	/>
	{#if value}
		<button
			type="button"
			class="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-white"
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
