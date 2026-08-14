<script lang="ts">
	import {
		BookOpen,
		Faders,
		FilmStrip,
		Gear,
		Heart,
		House,
		Pause,
		Play,
		SignIn,
		VinylRecord
	} from 'phosphor-svelte';
	import HeaderActions from '$lib/components/HeaderActions.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import { CATEGORY_PATHS } from '$lib/types/media';
	import type { Component } from 'svelte';

	let { data } = $props();

	const icons = {
		movie: FilmStrip,
		music: VinylRecord,
		book: BookOpen
	} as const;

	const CD_CENTER = 260;
	const CD_NAV_RADIUS = 175;
	const CD_BTN_SIZE = 56;
	const CD_BTN_HALF = CD_BTN_SIZE / 2;

	const HOVER_PLAYBACK_RATE = 0.05;
	const NORMAL_PLAYBACK_RATE = 1;
	const RATE_TWEEN_MS = 1500;

	type CdNavButton = {
		href: string;
		label: string;
		icon: Component<{ size?: number; weight?: 'bold' | 'regular' | 'fill' }>;
		variant: 'primary' | 'secondary';
		angle: number;
	};

	const catalogNav = [
		{ href: '/', label: 'Home', icon: House },
		{ href: '/movies', label: 'Movies', icon: FilmStrip },
		{ href: '/music', label: 'Music', icon: VinylRecord },
		{ href: '/books', label: 'Books', icon: BookOpen },
		{ href: '/wishlist/movies', label: 'Wishlist', icon: Heart },
		{ href: '/settings', label: 'Settings', icon: Faders }
	] as const;

	const cdNavButtons = $derived.by((): CdNavButton[] => {
		const items = data.user
			? [...catalogNav, { href: '/admin', label: 'Admin', icon: Gear }]
			: [...catalogNav, { href: '/login', label: 'Log in', icon: SignIn }];
		const count = items.length;

		return items.map((item, i) => ({
			...item,
			variant: item.href === '/' ? ('primary' as const) : ('secondary' as const),
			angle: (360 / count) * i
		}));
	});

	let cdSpinEl = $state<SVGGElement | undefined>(undefined);

	let spinAnim: Animation | undefined;
	let counterAnims: Animation[] = [];
	let rateTweenFrame: number | undefined;
	let currentPlaybackRate = NORMAL_PLAYBACK_RATE;
	let slowPinned = $state(false);
	let isHovering = false;

	function applyPlaybackRate(rate: number) {
		if (spinAnim) spinAnim.playbackRate = rate;
		for (const counter of counterAnims) {
			counter.playbackRate = rate;
		}
	}

	function cdNavPosition(angleDeg: number) {
		const rad = (angleDeg * Math.PI) / 180;
		return {
			x: CD_CENTER + CD_NAV_RADIUS * Math.sin(rad),
			y: CD_CENTER - CD_NAV_RADIUS * Math.cos(rad)
		};
	}

	function easeOutCubic(t: number) {
		return 1 - (1 - t) ** 3;
	}

	function easeInCubic(t: number) {
		return t ** 3;
	}

	function cancelRateTween() {
		if (rateTweenFrame !== undefined) {
			cancelAnimationFrame(rateTweenFrame);
			rateTweenFrame = undefined;
		}
	}

	function tweenPlaybackRate(
		targetRate: number,
		durationMs: number,
		easing: (t: number) => number
	) {
		if (!spinAnim) return;

		cancelRateTween();

		const startRate = currentPlaybackRate;
		const startTime = performance.now();

		function tick(now: number) {
			const t = Math.min((now - startTime) / durationMs, 1);
			currentPlaybackRate = startRate + (targetRate - startRate) * easing(t);
			applyPlaybackRate(currentPlaybackRate);

			if (t < 1) {
				rateTweenFrame = requestAnimationFrame(tick);
			} else {
				rateTweenFrame = undefined;
			}
		}

		rateTweenFrame = requestAnimationFrame(tick);
	}

	function slowDown() {
		tweenPlaybackRate(HOVER_PLAYBACK_RATE, RATE_TWEEN_MS, easeOutCubic);
	}

	function speedUp() {
		tweenPlaybackRate(NORMAL_PLAYBACK_RATE, RATE_TWEEN_MS, easeInCubic);
	}

	function onCdMouseEnter() {
		isHovering = true;
		slowDown();
	}

	function onCdMouseLeave() {
		isHovering = false;
		if (!slowPinned) {
			speedUp();
		}
	}

	function toggleSlow() {
		slowPinned = !slowPinned;
		if (slowPinned) {
			slowDown();
		} else if (!isHovering) {
			speedUp();
		}
	}

	$effect(() => {
		const el = cdSpinEl;
		const navCount = cdNavButtons.length;
		// Settings are reactive — RPM or motion changes rebuild the animations.
		const spinPeriodMs = settings.spinPeriodMs;
		const motionReducedInApp = settings.motion === 'reduced';
		if (!el) return;

		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reducedMotion || motionReducedInApp) return;

		const timing = {
			duration: spinPeriodMs,
			iterations: Infinity,
			easing: 'linear'
		} as const;

		const anim = el.animate(
			[{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
			timing
		);

		// Counter-rotate each icon at the same rate so they stay upright while orbiting.
		// Query the live DOM instead of reactive bind:this refs — array bindings retrigger
		// this effect on every slot mount and were resetting the disc mid-spin.
		void navCount;
		const iconEls = el.querySelectorAll<HTMLSpanElement>('.cd-nav-icon');
		const counters = [...iconEls].map((icon) =>
			icon.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(-360deg)' }], timing)
		);

		// Align start times so the counter-rotation cancels the disc rotation exactly.
		void anim.ready.then(() => {
			for (const counter of counters) {
				counter.startTime = anim.startTime;
			}
		});

		spinAnim = anim;
		counterAnims = counters;
		currentPlaybackRate = NORMAL_PLAYBACK_RATE;

		return () => {
			cancelRateTween();
			anim.cancel();
			for (const counter of counters) {
				counter.cancel();
			}
			spinAnim = undefined;
			counterAnims = [];
		};
	});
</script>

<svelte:head>
	<title>Media Club</title>
	<meta name="description" content="Self-hosted media catalog for movies, vinyl, and books." />
</svelte:head>

<div class="home-actions">
	<HeaderActions showLogout={!!data.user} />
</div>

{#snippet categoryStats(compact: boolean)}
	{#each data.summary as row (row.category)}
		{@const Icon = icons[row.category]}
		<a
			href="/{CATEGORY_PATHS[row.category]}"
			class="group pointer-events-auto flex flex-col items-center gap-1.5 transition-transform hover:-translate-y-0.5"
		>
			<span
				class="flex flex-col items-center justify-center gap-0.5 rounded-full bg-amber-400/15 ring-2 ring-amber-400/60 transition-all group-hover:bg-amber-400/25 group-hover:ring-amber-500 {compact
					? 'size-12 sm:size-14'
					: 'size-14 xl:size-16'}"
			>
				<Icon size={compact ? 16 : 18} weight="bold" class="text-amber-700 dark:text-amber-400" />
				<span
					class="font-black text-amber-700 group-hover:text-amber-800 dark:text-amber-400 dark:group-hover:text-amber-300 {compact
						? 'text-xs sm:text-sm'
						: 'text-sm xl:text-base'}"
				>
					{row.owned + row.wishlist}
				</span>
			</span>
			<span
				class="font-bold tracking-wider text-stone-600 uppercase dark:text-stone-400 {compact
					? 'text-[0.6rem] sm:text-[0.65rem]'
					: 'text-[0.65rem] xl:text-xs'}"
			>
				{row.label}
			</span>
		</a>
	{/each}
{/snippet}

<section class="flex min-h-[80vh] flex-col items-center px-4 pt-10 pb-16">
	<div class="w-full max-w-2xl space-y-3 text-center">
		<h1
			class="text-5xl font-black tracking-tight text-stone-900 uppercase sm:text-6xl lg:text-7xl dark:text-amber-50"
		>
			Media Club
		</h1>
		<p class="text-lg font-medium text-stone-700 sm:text-xl dark:text-stone-300">
			Catalog your movies, vinyl, and books
		</p>
	</div>

	<div class="relative mx-auto my-10 flex w-full max-w-6xl flex-col items-center px-2">
		<button
			type="button"
			class="mb-5 inline-flex items-center gap-2 rounded-full border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-raised)/0.7)] px-4 py-1.5 text-xs font-bold tracking-wide text-[rgb(var(--color-text-secondary))] uppercase transition-colors hover:border-amber-500 hover:text-amber-700 dark:hover:border-amber-500 dark:hover:text-amber-400"
			onclick={toggleSlow}
			aria-pressed={slowPinned}
		>
			{#if slowPinned}
				<Play size={13} weight="bold" />
				Spin the disc
			{:else}
				<Pause size={13} weight="bold" />
				Slow the disc
			{/if}
		</button>

		<div class="relative flex shrink-0 flex-col items-center">
			<!-- Desktop: decorative overlay left of disc — does not affect CD centering -->
			<div
				class="pointer-events-none absolute top-1/2 right-full hidden -translate-y-1/2 pr-5 lg:flex lg:flex-col lg:gap-3.5 xl:pr-7"
			>
				{@render categoryStats(false)}
			</div>

			<svg
				class="cd-disc"
				width="720"
				height="720"
				viewBox="0 0 520 520"
				role="img"
				aria-label="Media Club disc navigation"
				onmouseenter={onCdMouseEnter}
				onmouseleave={onCdMouseLeave}
			>
				<defs>
					<radialGradient id="cdSurface" cx="50%" cy="50%" r="50%">
						<stop offset="0%" stop-color="rgb(252, 185, 0)" stop-opacity="0.12" />
						<stop offset="55%" stop-color="rgb(252, 185, 0)" stop-opacity="0.22" />
						<stop offset="100%" stop-color="rgb(252, 185, 0)" stop-opacity="0.32" />
					</radialGradient>
				</defs>

				<g class="cd-spin" bind:this={cdSpinEl}>
					<circle cx="260" cy="260" r="250" fill="url(#cdSurface)" pointer-events="none" />
					{#each [230, 210, 190, 170, 150, 130, 110, 90] as radius, i (radius)}
						<circle
							cx="260"
							cy="260"
							r={radius}
							fill="none"
							stroke="currentColor"
							stroke-width="0.75"
							class="text-amber-500"
							opacity={0.32 - i * 0.02}
							pointer-events="none"
						/>
					{/each}
					{#each Array.from({ length: 12 }, (_, i) => i * 30) as angle (angle)}
						<line
							x1="260"
							y1="48"
							x2="260"
							y2="72"
							stroke="currentColor"
							stroke-width="1.5"
							class="text-amber-500"
							opacity="0.4"
							transform="rotate({angle} 260 260)"
							pointer-events="none"
						/>
					{/each}
					<circle cx="260" cy="260" r="44" fill="rgb(var(--color-bg))" pointer-events="none" />
					<circle
						cx="260"
						cy="260"
						r="44"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						class="text-amber-500"
						opacity="0.6"
						pointer-events="none"
					/>
					<circle
						cx="260"
						cy="260"
						r="24"
						fill="currentColor"
						class="text-amber-400"
						opacity="0.9"
						pointer-events="none"
					/>

					{#each cdNavButtons as btn, i (btn.href)}
						{@const Icon = btn.icon}
						{@const pos = cdNavPosition(btn.angle)}
						<foreignObject
							x={pos.x - CD_BTN_HALF}
							y={pos.y - CD_BTN_HALF}
							width={CD_BTN_SIZE}
							height={CD_BTN_SIZE}
							class="cd-nav-slot"
						>
							<a
								href={btn.href}
								class="cd-nav-btn cd-nav-btn--{btn.variant}"
								aria-label={btn.label}
								title={btn.label}
								xmlns="http://www.w3.org/1999/xhtml"
							>
								<span class="cd-nav-icon">
									<Icon size={22} weight="bold" />
								</span>
							</a>
						</foreignObject>
					{/each}
				</g>
			</svg>

			<!-- Mobile: compact row below disc -->
			<div class="mt-6 flex flex-wrap items-center justify-center gap-5 sm:gap-6 lg:hidden">
				{@render categoryStats(true)}
			</div>
		</div>
	</div>
</section>

<style>
	.home-actions {
		position: fixed;
		top: 0.75rem;
		right: 0.75rem;
		z-index: 50;
	}

	.cd-disc {
		width: min(720px, 88vw);
		height: min(720px, 88vw);
		flex-shrink: 0;
		opacity: 0.48;
	}

	:global([data-theme='dark']) .cd-disc {
		opacity: 0.4;
	}

	.cd-spin {
		transform-box: fill-box;
		transform-origin: center;
	}

	.cd-nav-slot {
		overflow: visible;
	}

	.cd-nav-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 9999px;
		border-width: 2px;
		border-style: solid;
		transition:
			transform 0.2s ease,
			background-color 0.2s ease,
			border-color 0.2s ease;
	}

	.cd-nav-btn:hover {
		transform: scale(1.08);
	}

	/* Counter-rotated by WAAPI so icons stay upright while orbiting */
	.cd-nav-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.cd-nav-btn--primary {
		border-color: rgb(245 158 11);
		background-color: rgb(251 191 36);
		color: rgb(28 25 23);
	}

	.cd-nav-btn--primary:hover {
		background-color: rgb(245 158 11);
	}

	/* Theme tokens keep the orbiting buttons in tune with both themes */
	.cd-nav-btn--secondary {
		border-color: rgb(var(--color-border));
		background-color: rgb(var(--color-surface-raised));
		color: rgb(var(--color-text-secondary));
	}

	.cd-nav-btn--secondary:hover {
		border-color: rgb(var(--color-accent) / 0.6);
		background-color: rgb(var(--color-accent-light));
		color: rgb(var(--color-text));
	}
</style>
