<script lang="ts">
	import CoverImage from '$lib/components/CoverImage.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import type { MediaItem } from '$lib/types/media';
	import { getDisplayGenres } from '$lib/utils/movie-genres';
	import { DiceSix, X } from 'phosphor-svelte';
	import { scale } from 'svelte/transition';

	interface Props {
		open: boolean;
		phase: 'loading' | 'reveal';
		item: MediaItem | null;
		loadingPhrase: string;
		dismissLabel: string;
		loadingDurationMs?: number;
		onRollAgain: () => void;
		onDismiss: () => void;
	}

	let {
		open,
		phase,
		item,
		loadingPhrase,
		dismissLabel,
		loadingDurationMs = 4000,
		onRollAgain,
		onDismiss
	}: Props = $props();

	const reducedMotion = $derived(settings.motion === 'reduced');
	const rollDurationCss = $derived(`${loadingDurationMs}ms`);
	const genres = $derived(item ? getDisplayGenres(item) : []);

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') onDismiss();
	}
</script>

<svelte:window onkeydown={open ? onKeydown : undefined} />

{#if open}
	<div
		class="random-reveal anim-fade"
		class:random-reveal--shaking={phase === 'loading' && !reducedMotion}
		style:--roll-duration={rollDurationCss}
		role="dialog"
		aria-modal="true"
		aria-labelledby="random-reveal-title"
		aria-busy={phase === 'loading'}
	>
		<button type="button" class="random-reveal__backdrop" aria-label="Close" onclick={onDismiss}
		></button>

		<div class="random-reveal__panel surface-round anim-rise">
			<button
				type="button"
				class="random-reveal__close"
				aria-label="Close dialog"
				onclick={onDismiss}
			>
				<X size={16} weight="bold" />
			</button>

			{#if phase === 'loading'}
				<div class="flex flex-col items-center gap-4 py-6 text-center">
					<span class="random-reveal__dice" aria-hidden="true">
						<DiceSix size={48} weight="bold" />
					</span>
					<h2
						id="random-reveal-title"
						class="text-lg font-black tracking-wide text-stone-900 uppercase dark:text-amber-50"
					>
						{loadingPhrase}
					</h2>
					<p class="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
						One moment, your movie is coming up.
					</p>
				</div>
			{:else if item}
				<div class="flex flex-col items-center gap-4 text-center">
					<h2
						id="random-reveal-title"
						class="text-xs font-black tracking-[0.2em] text-amber-700 uppercase dark:text-amber-400"
					>
						Tonight's pick
					</h2>

					{#key item.id}
						<div in:scale={{ duration: reducedMotion ? 150 : 420, start: 0.88 }} class="w-full">
							<div
								class="mx-auto aspect-[2/3] w-full max-w-[11rem] overflow-hidden rounded-[1.5rem] ring-2 ring-amber-400/50"
							>
								{#if item.coverUrl}
									<CoverImage
										src={item.coverUrl}
										alt="{item.title} cover"
										class="size-full object-cover"
										loading="eager"
									/>
								{:else}
									<div
										class="flex size-full items-center justify-center bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
									>
										<span class="text-xs font-bold uppercase">No cover</span>
									</div>
								{/if}
							</div>

							<h3 class="mt-4 text-xl font-black text-stone-900 dark:text-amber-50">
								{item.title}
							</h3>
							{#if item.year}
								<p class="mt-1 text-sm font-semibold text-[rgb(var(--color-text-secondary))]">
									{item.year}
								</p>
							{/if}
							{#if genres.length > 0}
								<div class="mt-3 flex flex-wrap justify-center gap-1.5">
									{#each genres as genre (genre)}
										<span
											class="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-black tracking-wide text-amber-800 uppercase dark:text-amber-300"
										>
											{genre}
										</span>
									{/each}
								</div>
							{/if}
						</div>
					{/key}

					<div class="mt-2 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
						<button type="button" class="btn-secondary px-5 py-2 text-xs" onclick={onRollAgain}>
							<DiceSix size={14} weight="bold" />
							Roll again
						</button>
						<button type="button" class="btn-primary px-5 py-2 text-xs" onclick={onDismiss}>
							{dismissLabel}
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.random-reveal {
		position: fixed;
		inset: 0;
		z-index: 96;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.25rem;
	}

	.random-reveal__backdrop {
		position: absolute;
		inset: 0;
		border: none;
		background: rgb(0 0 0 / 0.62);
		backdrop-filter: blur(5px);
		cursor: pointer;
	}

	.random-reveal__panel {
		position: relative;
		z-index: 1;
		width: min(100%, 24rem);
		padding: 1.5rem;
		box-shadow: 0 24px 60px rgb(0 0 0 / 0.45);
	}

	.random-reveal__close {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		display: inline-flex;
		width: 2rem;
		height: 2rem;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		color: rgb(var(--color-text-tertiary));
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
	}

	.random-reveal__close:hover {
		background: rgb(0 0 0 / 0.06);
		color: rgb(var(--color-text));
	}

	:global(.dark) .random-reveal__close:hover {
		background: rgb(255 255 255 / 0.1);
	}

	@keyframes dice-shake-spin {
		0% {
			transform: rotate(0deg) scale(1);
		}
		25% {
			transform: rotate(90deg) scale(1.06);
		}
		50% {
			transform: rotate(180deg) scale(0.98);
		}
		75% {
			transform: rotate(270deg) scale(1.04);
		}
		100% {
			transform: rotate(360deg) scale(1);
		}
	}

	@keyframes screen-shake-burst {
		0%,
		7%,
		38%,
		45%,
		68%,
		75%,
		100% {
			transform: translate(0, 0) rotate(0deg);
		}
		1% {
			transform: translate(-2px, 1px) rotate(-0.2deg);
		}
		2.5% {
			transform: translate(2px, -1px) rotate(0.15deg);
		}
		4% {
			transform: translate(-1px, 1px) rotate(-0.1deg);
		}
		5.5% {
			transform: translate(1px, -1px) rotate(0.1deg);
		}
		39% {
			transform: translate(-2px, 1px) rotate(-0.2deg);
		}
		40.5% {
			transform: translate(2px, -1px) rotate(0.15deg);
		}
		42% {
			transform: translate(-1px, 1px) rotate(-0.1deg);
		}
		43.5% {
			transform: translate(1px, -1px) rotate(0.1deg);
		}
		69% {
			transform: translate(-2px, 1px) rotate(-0.2deg);
		}
		70.5% {
			transform: translate(2px, -1px) rotate(0.15deg);
		}
		72% {
			transform: translate(-1px, 1px) rotate(-0.1deg);
		}
		73.5% {
			transform: translate(1px, -1px) rotate(0.1deg);
		}
	}

	.random-reveal--shaking .random-reveal__panel {
		animation: screen-shake-burst var(--roll-duration, 4s) ease-in-out forwards;
	}

	.random-reveal__dice {
		display: inline-flex;
		color: rgb(180 83 9);
		animation: dice-shake-spin 0.85s cubic-bezier(0.34, 1.1, 0.64, 1) infinite;
	}

	:global(.dark) .random-reveal__dice {
		color: rgb(251 191 36);
	}

	@media (prefers-reduced-motion: reduce) {
		.random-reveal--shaking .random-reveal__panel,
		.random-reveal__dice {
			animation: none;
		}
	}

	:global([data-motion='reduced']) .random-reveal--shaking .random-reveal__panel,
	:global([data-motion='reduced']) .random-reveal__dice {
		animation: none;
	}
</style>
