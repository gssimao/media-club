<script lang="ts">
	import CoverImage from '$lib/components/CoverImage.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import type { RandomPickItem } from '$lib/utils/random-pick.svelte';
	import { modal } from '$lib/utils/modal';
	import { getDisplayGenres } from '$lib/utils/movie-genres';
	import { DiceSix, X } from 'phosphor-svelte';
	import { scale } from 'svelte/transition';

	interface Props {
		open: boolean;
		phase: 'loading' | 'reveal';
		item: RandomPickItem | null;
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

	const reducedMotion = $derived(settings.reducedMotion);
	const rollDurationCss = $derived(`${loadingDurationMs}ms`);
	const genres = $derived(item ? getDisplayGenres(item) : []);
</script>

{#if open}
	<div
		class="random-reveal anim-fade"
		class:random-reveal--shaking={phase === 'loading' && !reducedMotion}
		style:--roll-duration={rollDurationCss}
		role="dialog"
		aria-modal="true"
		aria-labelledby="random-reveal-title"
		aria-busy={phase === 'loading'}
		{@attach modal({ onEscape: () => onDismiss() })}
	>
		<button
			type="button"
			class="random-reveal__backdrop"
			aria-label="Close"
			tabindex="-1"
			onclick={onDismiss}
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
					<div class="mystery-stage" aria-hidden="true">
						<div class="mystery-halo"></div>
						<div class="mystery-cards"><span>?</span><span>?</span><span>?</span></div>
						<div class="mystery-crate">
							<div class="mystery-lid"></div>
							<DiceSix size={38} weight="duotone" /><span>LUCKY PICK</span>
						</div>
					</div>
					<h2 id="random-reveal-title" class="text-lg font-semibold text-[rgb(var(--color-text))]">
						{loadingPhrase}
					</h2>
					<p class="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
						A little shuffle. A little luck.
					</p>
				</div>
			{:else if item}
				<div class="flex flex-col items-center gap-4 text-center">
					<h2
						id="random-reveal-title"
						class="text-xs font-black tracking-[0.2em] text-amber-700 uppercase dark:text-amber-400"
					>
						Your pick
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
		max-height: calc(100dvh - 2.5rem);
		overflow-y: auto;
		box-shadow: 0 24px 60px rgb(0 0 0 / 0.45);
	}

	.random-reveal__close {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		display: inline-flex;
		width: 2.75rem;
		height: 2.75rem;
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

	:global([data-theme='dark']) .random-reveal__close:hover {
		background: rgb(255 255 255 / 0.1);
	}

	.mystery-stage {
		position: relative;
		width: 220px;
		height: 190px;
		margin-block: 0.5rem;
	}
	.mystery-halo {
		position: absolute;
		inset: 15px;
		border-radius: 50%;
		background: radial-gradient(circle, rgb(var(--color-accent) / 0.22), transparent 70%);
	}
	.mystery-crate {
		position: absolute;
		bottom: 12px;
		left: 42px;
		width: 136px;
		height: 105px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 7px;
		border: 1px solid rgb(var(--vinyl-edge));
		border-radius: 8px 8px 18px 18px;
		color: rgb(var(--vinyl-paper));
		background: linear-gradient(110deg, rgb(var(--vinyl-button)), rgb(var(--vinyl-base)));
		box-shadow:
			0 14px 20px rgb(0 0 0 / 0.18),
			inset 7px 0 0 rgb(255 255 255 / 0.035);
	}
	.mystery-crate > span {
		font-size: 8px;
		font-weight: 600;
		letter-spacing: 0.18em;
	}
	.mystery-lid {
		position: absolute;
		top: -10px;
		left: -5px;
		right: -5px;
		height: 18px;
		border-radius: 5px;
		background: rgb(var(--vinyl-paper));
		border-bottom: 3px solid rgb(var(--vinyl-ink) / 0.3);
		transform-origin: 10% 100%;
	}
	.mystery-cards {
		position: absolute;
		inset: 0;
	}
	.mystery-cards span {
		position: absolute;
		left: 82px;
		top: 34px;
		width: 56px;
		height: 78px;
		display: grid;
		place-items: center;
		border-radius: 7px;
		border: 2px solid rgb(var(--color-surface-raised));
		background: rgb(var(--color-coral));
		color: rgb(var(--color-bg));
		font-size: 25px;
		font-weight: 600;
		transform: rotate(-18deg) translateX(-35px);
	}
	.mystery-cards span:nth-child(2) {
		background: rgb(var(--color-lilac));
		transform: translateY(-12px);
	}
	.mystery-cards span:nth-child(3) {
		background: rgb(var(--color-mint));
		transform: rotate(18deg) translateX(35px);
	}
	.random-reveal--shaking .mystery-crate {
		animation: crate-wiggle 900ms ease-in-out infinite;
	}
	.random-reveal--shaking .mystery-lid {
		animation: lid-rattle 900ms ease-in-out infinite;
	}
	.random-reveal--shaking .mystery-cards {
		animation: cards-hop 1200ms ease-in-out infinite;
	}
	@keyframes crate-wiggle {
		0%,
		100% {
			transform: translateY(0) rotate(-3deg);
		}
		25% {
			transform: translateY(-4px) rotate(3deg);
		}
		50% {
			transform: rotate(-2deg);
		}
		75% {
			transform: translateY(-2px) rotate(2deg);
		}
	}
	@keyframes lid-rattle {
		0%,
		55%,
		100% {
			transform: rotate(0);
		}
		25% {
			transform: translateY(-3px) rotate(-4deg);
		}
		70% {
			transform: translateY(-2px) rotate(-2deg);
		}
	}
	@keyframes cards-hop {
		0%,
		100% {
			transform: translateY(10px) rotate(-3deg);
		}
		50% {
			transform: translateY(-12px) rotate(3deg);
		}
	}

	:global([data-motion='reduced']) .mystery-stage * {
		animation: none;
	}
</style>
