<script lang="ts">
	import { MagnifyingGlass, X } from 'phosphor-svelte';

	interface Props {
		value: string;
		placeholder?: string;
		onInput: (value: string) => void;
	}

	let { value = $bindable(''), placeholder = 'Search catalog…', onInput }: Props = $props();
</script>

<div class="relative">
	<MagnifyingGlass
		size={16}
		weight="bold"
		class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-stone-400 dark:text-stone-500"
	/>
	<input
		type="search"
		{placeholder}
		bind:value
		oninput={() => onInput(value)}
		class="input-round w-full py-3 pr-11 pl-11 text-sm"
	/>
	{#if value}
		<button
			type="button"
			class="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-stone-700 dark:hover:text-stone-400"
			aria-label="Clear search"
			onclick={() => {
				value = '';
				onInput('');
			}}
		>
			<X size={16} weight="bold" />
		</button>
	{/if}
</div>
