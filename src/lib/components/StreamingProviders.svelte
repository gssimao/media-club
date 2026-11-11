<script lang="ts">
	import { DotsThree, X } from 'phosphor-svelte';
	import type { MovieWatchProviders, WatchProvider } from '$lib/types/tmdb';
	import { modal } from '$lib/utils/modal';

	interface Props {
		providers?: MovieWatchProviders | null;
		regionLabel?: string;
	}

	let { providers = null, regionLabel = 'US' }: Props = $props();

	const MAX_VISIBLE = 4;
	/** Logo size plus the gap between logos (size-8 + gap-1.5), in px. */
	const SLOT_WIDTH = 38;
	const SLOT_GAP = 6;

	/** Width of the logo row. 0 until measured in the browser. */
	let rowWidth = $state(0);

	let showAllProviders = $state(false);

	const streamProviders = $derived.by(() => {
		if (!providers) return [];
		const merged = [...providers.flatrate, ...providers.free];
		return merged.filter(
			(provider, index, array) => array.findIndex((entry) => entry.id === provider.id) === index
		);
	});

	// Show only as many logos as the card is wide enough for, so the row never gets cut off
	// mid-logo. When some are left out, the last slot becomes the "show all" button.
	const visibleCount = $derived.by(() => {
		const total = streamProviders.length;
		const slots =
			rowWidth > 0
				? Math.max(2, Math.min(MAX_VISIBLE + 1, Math.floor((rowWidth + SLOT_GAP) / SLOT_WIDTH)))
				: MAX_VISIBLE + 1;
		if (total <= Math.min(MAX_VISIBLE, slots)) return total;
		return slots - 1;
	});
	const visibleProviders = $derived(streamProviders.slice(0, visibleCount));
	const overflowCount = $derived(Math.max(0, streamProviders.length - visibleCount));
	const hasOverflow = $derived(overflowCount > 0);

	const statusMessage = $derived.by(() => {
		if (!providers) return 'Streaming info unavailable';
		if (streamProviders.length === 0) {
			return `Not on subscription or free streaming (${regionLabel})`;
		}
		return null;
	});

	function openAllProviders() {
		showAllProviders = true;
	}

	function closeAllProviders() {
		showAllProviders = false;
	}
</script>

{#snippet providerLogo(provider: WatchProvider, linked: boolean)}
	{#if linked && providers?.link}
		<a
			href={providers.link}
			target="_blank"
			rel="noopener noreferrer"
			class="inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-raised))] transition-colors hover:border-sky-500"
			title="{provider.name} on TMDB"
			aria-label="{provider.name}, view on TMDB"
		>
			{#if provider.logoUrl}
				<img
					src={provider.logoUrl}
					alt=""
					class="size-6 rounded-full object-contain"
					loading="lazy"
				/>
			{:else}
				<span class="px-1 text-[8px] font-bold text-stone-600 dark:text-stone-300">
					{provider.name.slice(0, 2)}
				</span>
			{/if}
		</a>
	{:else}
		<span
			class="inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-raised))]"
			title={provider.name}
		>
			{#if provider.logoUrl}
				<img
					src={provider.logoUrl}
					alt=""
					class="size-6 rounded-full object-contain"
					loading="lazy"
				/>
			{:else}
				<span class="px-1 text-[8px] font-bold text-stone-600 dark:text-stone-300">
					{provider.name.slice(0, 2)}
				</span>
			{/if}
		</span>
	{/if}
{/snippet}

<div class="mt-2 w-full shrink-0 px-1">
	<p
		class="mb-1 min-h-[0.875rem] text-center text-[9px] font-bold tracking-wide text-stone-500 uppercase dark:text-stone-400"
	>
		{#if streamProviders.length > 0}
			Stream on ({regionLabel})
		{:else}
			<span aria-hidden="true">&nbsp;</span>
		{/if}
	</p>

	<div class="flex min-h-8 items-center justify-center" bind:clientWidth={rowWidth}>
		{#if streamProviders.length > 0}
			<ul class="flex flex-nowrap items-center justify-center gap-1.5 overflow-hidden">
				{#each visibleProviders as provider (provider.id)}
					<li class="shrink-0">
						{@render providerLogo(provider, true)}
					</li>
				{/each}
				{#if hasOverflow}
					<li class="shrink-0">
						<button
							type="button"
							class="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-raised))] text-[rgb(var(--color-text-secondary))] transition-colors hover:border-sky-500 hover:text-sky-700 dark:hover:text-sky-400"
							aria-label="Show {overflowCount} more streaming {overflowCount === 1
								? 'provider'
								: 'providers'}"
							onclick={openAllProviders}
						>
							<DotsThree size={16} weight="bold" />
						</button>
					</li>
				{/if}
			</ul>
		{:else if statusMessage}
			<p
				class="px-1 text-center text-[9px] leading-tight font-medium text-stone-500 dark:text-stone-400"
			>
				{statusMessage}
			</p>
		{/if}
	</div>
</div>

{#if showAllProviders}
	<div
		class="streaming-providers-dialog anim-fade"
		role="dialog"
		aria-modal="true"
		aria-labelledby="streaming-providers-title"
		{@attach modal({ onEscape: () => closeAllProviders() })}
	>
		<button
			type="button"
			class="streaming-providers-dialog__backdrop"
			aria-label="Close streaming providers"
			tabindex="-1"
			onclick={closeAllProviders}
		></button>

		<div class="streaming-providers-dialog__panel surface-round anim-rise">
			<div class="flex items-start justify-between gap-2">
				<h2
					id="streaming-providers-title"
					class="text-xs font-black tracking-wide text-stone-900 uppercase dark:text-amber-50"
				>
					Stream on ({regionLabel})
				</h2>
				<button
					type="button"
					class="inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[rgb(var(--color-text-tertiary))] transition-colors hover:bg-black/5 hover:text-[rgb(var(--color-text))] dark:hover:bg-white/10"
					aria-label="Close streaming providers"
					onclick={closeAllProviders}
				>
					<X size={16} weight="bold" />
				</button>
			</div>

			<ul class="mt-3 flex flex-wrap justify-center gap-2">
				{#each streamProviders as provider (provider.id)}
					<li class="flex max-w-[5.5rem] min-w-[4.5rem] flex-col items-center gap-1">
						{#if providers?.link}
							<a
								href={providers.link}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex size-10 items-center justify-center overflow-hidden rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-raised))] transition-colors hover:border-sky-500"
								title="{provider.name} on TMDB"
								aria-label="{provider.name}, view on TMDB"
							>
								{#if provider.logoUrl}
									<img
										src={provider.logoUrl}
										alt=""
										class="size-7 rounded-full object-contain"
										loading="lazy"
									/>
								{:else}
									<span class="px-1 text-[9px] font-bold text-stone-600 dark:text-stone-300">
										{provider.name.slice(0, 2)}
									</span>
								{/if}
							</a>
						{:else}
							<span
								class="inline-flex size-10 items-center justify-center overflow-hidden rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-raised))]"
								title={provider.name}
							>
								{#if provider.logoUrl}
									<img
										src={provider.logoUrl}
										alt=""
										class="size-7 rounded-full object-contain"
										loading="lazy"
									/>
								{:else}
									<span class="px-1 text-[9px] font-bold text-stone-600 dark:text-stone-300">
										{provider.name.slice(0, 2)}
									</span>
								{/if}
							</span>
						{/if}
						<span
							class="line-clamp-2 text-center text-[9px] leading-tight font-bold text-[rgb(var(--color-text-secondary))]"
						>
							{provider.name}
						</span>
					</li>
				{/each}
			</ul>

			{#if providers?.link}
				<a
					href={providers.link}
					target="_blank"
					rel="noopener noreferrer"
					class="btn-secondary mt-4 inline-flex w-full justify-center px-4 py-2 text-[10px]"
				>
					View on TMDB
				</a>
			{/if}
		</div>
	</div>
{/if}

<style>
	.streaming-providers-dialog {
		position: fixed;
		inset: 0;
		z-index: 95;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.25rem;
	}

	.streaming-providers-dialog__backdrop {
		position: absolute;
		inset: 0;
		border: none;
		background: rgb(0 0 0 / 0.45);
		backdrop-filter: blur(3px);
		cursor: pointer;
	}

	.streaming-providers-dialog__panel {
		position: relative;
		z-index: 1;
		width: min(100%, 18rem);
		max-height: min(80vh, 24rem);
		overflow-y: auto;
		padding: 1rem;
		border: 2px solid rgb(14 165 233 / 0.45);
		box-shadow: 0 20px 50px rgb(0 0 0 / 0.35);
	}
</style>
