<script lang="ts">
	import { Funnel } from 'phosphor-svelte';

	interface Props {
		selectedFormats: string[];
		onFilterChange: (formats: string[]) => void;
	}

	let { selectedFormats = $bindable([]), onFilterChange }: Props = $props();

	let isOpen = $state(false);

	const formats = ['DVD', 'BLU-RAY', '4K'];

	function toggleFormat(format: string) {
		if (selectedFormats.includes(format)) {
			selectedFormats = selectedFormats.filter((f) => f !== format);
		} else {
			selectedFormats = [...selectedFormats, format];
		}
		onFilterChange(selectedFormats);
	}

	function clearFilters() {
		selectedFormats = [];
		onFilterChange(selectedFormats);
	}
</script>

<div class="relative">
	<button
		onclick={() => (isOpen = !isOpen)}
		class="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-colors {selectedFormats.length >
		0
			? 'bg-amber-400 text-stone-900'
			: 'border border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-surface))] text-[rgb(var(--color-text))] hover:bg-[rgb(var(--color-accent-light))]'}"
		aria-expanded={isOpen}
		aria-label="Filter by format"
	>
		<Funnel size={16} weight="bold" />
		Filter
		{#if selectedFormats.length > 0}
			<span
				class="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1.5 text-xs font-bold text-amber-400"
			>
				{selectedFormats.length}
			</span>
		{/if}
	</button>

	{#if isOpen}
		<div
			class="surface-round absolute top-full left-0 z-10 mt-2 w-48 overflow-hidden p-2 shadow-lg"
		>
			<div class="mb-2 flex items-center justify-between px-2 py-1">
				<span class="text-xs font-bold tracking-wide text-stone-600 uppercase dark:text-stone-400">
					Format
				</span>
				{#if selectedFormats.length > 0}
					<button
						onclick={clearFilters}
						class="text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
					>
						Clear
					</button>
				{/if}
			</div>
			{#each formats as format (format)}
				<label
					class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-stone-100 dark:hover:bg-stone-700"
				>
					<input
						type="checkbox"
						checked={selectedFormats.includes(format)}
						onchange={() => toggleFormat(format)}
						class="h-4 w-4 rounded accent-amber-500"
					/>
					<span class="text-sm font-medium text-stone-900 dark:text-amber-50">{format}</span>
				</label>
			{/each}
		</div>
	{/if}
</div>

<!-- Click outside to close -->
{#if isOpen}
	<button
		class="fixed inset-0 z-0"
		onclick={() => (isOpen = false)}
		aria-label="Close filter"
		tabindex="-1"
	></button>
{/if}
