<script lang="ts">
	import VinylDisc from '$lib/components/VinylDisc.svelte';
	import type { Component } from 'svelte';

	export interface MediaOption {
		value: string;
		label: string;
	}

	interface Props {
		label: string;
		triggerIcon: Component<{ size?: number; weight?: 'bold' | 'regular' | 'fill' }>;
		options: MediaOption[];
		selected: string[];
		onChange: (selected: string[]) => void;
		/** Allow multiple selections; when false, picking one replaces the previous. */
		multiple?: boolean;
		ariaLabel?: string;
	}

	let {
		label,
		triggerIcon: TriggerIcon,
		options,
		selected = $bindable([]),
		onChange,
		multiple = true,
		ariaLabel = 'Filter options'
	}: Props = $props();

	let isOpen = $state(false);
	let pickFlash = $state<string | null>(null);

	let flashTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		return () => clearTimeout(flashTimer);
	});

	function isSelected(value: string): boolean {
		return selected.includes(value);
	}

	function toggleOption(value: string) {
		pickFlash = value;
		clearTimeout(flashTimer);
		flashTimer = setTimeout(() => {
			pickFlash = null;
		}, 560);

		if (multiple) {
			selected = isSelected(value)
				? selected.filter((entry) => entry !== value)
				: [...selected, value];
		} else {
			selected = isSelected(value) ? [] : [value];
		}
		onChange(selected);
	}

	function clearSelection() {
		selected = [];
		onChange(selected);
	}

	function discWrapperClass(value: string): string {
		return isSelected(value)
			? 'inline-flex shrink-0'
			: 'inline-flex shrink-0 opacity-40 saturate-50 transition-opacity duration-200';
	}
</script>

<div class="relative inline-flex flex-col items-start">
	<button
		type="button"
		onclick={() => (isOpen = !isOpen)}
		class="pill-nav {selected.length > 0 ? 'control-pill--active' : 'control-pill--accent'}"
		aria-expanded={isOpen}
		aria-haspopup="listbox"
		aria-label={ariaLabel}
	>
		<TriggerIcon size={16} weight="bold" />
		{label}
		{#if selected.length > 0}
			<span
				class="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1.5 text-xs font-bold text-amber-400 dark:bg-amber-950"
			>
				{selected.length}
			</span>
		{/if}
	</button>

	{#if isOpen}
		<div
			class="media-option-popover anim-rise absolute top-full left-4 z-20 mt-1.5"
			role="listbox"
			aria-label="{label} options"
			aria-multiselectable={multiple}
		>
			<div class="flex items-end gap-0.5">
				{#each options as option (option.value)}
					<button
						type="button"
						role="option"
						aria-selected={isSelected(option.value)}
						onclick={() => toggleOption(option.value)}
						class="group flex min-w-[4.5rem] flex-col items-center gap-1 rounded-[1.25rem] px-2 py-1.5 transition-colors {isSelected(
							option.value
						)
							? 'bg-amber-400/25 ring-2 ring-amber-400/70'
							: 'hover:bg-[rgb(var(--color-accent-light))]/60'}"
					>
						<span class={discWrapperClass(option.value)}>
							<VinylDisc
								class="size-8 {pickFlash === option.value ? 'disc-pick-spin' : ''}"
								spinning={isSelected(option.value) && pickFlash !== option.value}
								style={isSelected(option.value) ? '--spin-period: 2.8s' : undefined}
							/>
						</span>
						<span
							class="text-center text-[10px] leading-none font-black tracking-wide whitespace-nowrap uppercase {isSelected(
								option.value
							)
								? 'text-amber-800 dark:text-amber-300'
								: 'text-[rgb(var(--color-text-secondary))]'}"
						>
							{option.label}
						</span>
					</button>
				{/each}
			</div>

			{#if selected.length > 0}
				<div class="mt-1 flex justify-center border-t border-amber-400/20 pt-1">
					<button
						type="button"
						onclick={clearSelection}
						class="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-700 uppercase transition-colors hover:bg-amber-400/15 dark:text-amber-400"
					>
						Clear
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

{#if isOpen}
	<button
		type="button"
		class="fixed inset-0 z-10 cursor-default border-0 bg-transparent p-0"
		aria-label="Close {label} filter"
		onclick={() => (isOpen = false)}
	></button>
{/if}
