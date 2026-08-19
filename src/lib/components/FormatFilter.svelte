<script lang="ts">
	import { FilmSlate, Disc, Circle } from 'phosphor-svelte';

	interface Props {
		selectedFormats: string[];
		onFilterChange: (formats: string[]) => void;
	}

	let { selectedFormats = $bindable([]), onFilterChange }: Props = $props();

	let isOpen = $state(false);

	const formats = [
		{ value: 'DVD', label: 'DVD', icon: Disc },
		{ value: 'Blu-ray', label: 'Blu-ray', icon: Disc },
		{ value: '4K', label: '4K', icon: Circle }
	];

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

	function isSelected(format: string): boolean {
		return selectedFormats.includes(format);
	}
</script>

<div class="relative">
	<button
		onclick={() => (isOpen = !isOpen)}
		class="pill-nav {selectedFormats.length > 0
			? 'bg-amber-400 text-stone-900'
			: 'bg-amber-400/15 text-amber-700 hover:bg-amber-400/25 dark:text-amber-400'}"
		aria-expanded={isOpen}
		aria-label="Filter by format"
	>
		<FilmSlate size={16} weight="bold" />
		Format
		{#if selectedFormats.length > 0}
			<span
				class="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1.5 text-xs font-bold text-amber-400 dark:bg-amber-950"
			>
				{selectedFormats.length}
			</span>
		{/if}
	</button>

	{#if isOpen}
		<div
			class="surface-round anim-rise absolute top-full left-0 z-10 mt-2 min-w-[13rem] overflow-hidden p-3 shadow-xl"
		>
			<div class="mb-3 flex items-center justify-between">
				<span
					class="text-[10px] font-black tracking-wider text-stone-600 uppercase dark:text-stone-400"
				>
					Filter Format
				</span>
				{#if selectedFormats.length > 0}
					<button
						onclick={clearFilters}
						class="text-xs font-bold text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
					>
						Clear All
					</button>
				{/if}
			</div>
			<div class="space-y-1.5">
				{#each formats as format (format.value)}
					{@const Icon = format.icon}
					<button
						onclick={() => toggleFormat(format.value)}
						class="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all {isSelected(
							format.value
						)
							? 'bg-amber-400 text-stone-900 shadow-sm'
							: 'hover:bg-stone-100 dark:hover:bg-stone-700/50'}"
					>
						<div
							class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all {isSelected(
								format.value
							)
								? 'scale-110 border-stone-900 bg-stone-900'
								: 'border-stone-300 dark:border-stone-600'}"
						>
							{#if isSelected(format.value)}
								<div class="h-2 w-2 rounded-full bg-amber-400"></div>
							{/if}
						</div>
						<Icon
							size={16}
							weight="bold"
							class="shrink-0 {isSelected(format.value)
								? 'text-stone-900'
								: 'text-amber-600 dark:text-amber-400'}"
						/>
						<span class="text-sm font-bold">{format.label}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<!-- Click outside to close -->
{#if isOpen}
	<div
		class="fixed inset-0 z-0"
		onclick={() => (isOpen = false)}
		onkeydown={(event) => {
			if (event.key === 'Escape') isOpen = false;
		}}
		role="presentation"
		tabindex="-1"
	></div>
{/if}

<style>
	.anim-rise {
		--rise-delay: 0ms;
	}
</style>
