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
		class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[rgb(var(--color-text-tertiary))]"
	/>
	<input
		type="search"
		{placeholder}
		aria-label={placeholder}
		bind:value
		oninput={() => onInput(value)}
		class="input-round w-full py-3 pr-11 pl-11 text-sm"
	/>
	{#if value}
		<button
			type="button"
			class="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-[rgb(var(--color-text-tertiary))] transition-colors hover:bg-[rgb(var(--color-accent-light))] hover:text-[rgb(var(--color-text))]"
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
