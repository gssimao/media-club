<script lang="ts">
	import { Sun, Moon } from 'phosphor-svelte';
	import { theme } from '$lib/stores/theme.svelte';
</script>

<button
	type="button"
	onclick={() => theme.toggle()}
	class="inline-flex items-center justify-center rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
	aria-label="Toggle theme"
>
	{#if theme.current === 'dark'}
		<Sun size={20} weight="bold" />
	{:else}
		<Moon size={20} weight="bold" />
	{/if}
</button>
