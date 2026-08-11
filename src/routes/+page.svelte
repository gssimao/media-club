<script lang="ts">
	import {
		BookOpen,
		FilmStrip,
		Gear,
		Heart,
		House,
		Moon,
		SignIn,
		SignOut,
		Sun,
		VinylRecord
	} from 'phosphor-svelte';
	import { theme } from '$lib/stores/theme.svelte';
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

	const SPIN_PERIOD_MS = 24_000;
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
		{ href: '/wishlist/movies', label: 'Wishlist', icon: Heart }
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
	let rateTweenFrame: number | undefined;
	let currentPlaybackRate = NORMAL_PLAYBACK_RATE;
	let slowPinned = $state(false);
	let isHovering = false;

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
			spinAnim!.playbackRate = currentPlaybackRate;

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

	function isNavClickTarget(target: EventTarget | null) {
		if (!(target instanceof Element)) return false;
		return target.closest('.cd-nav-btn, a') !== null;
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

	function onCdClick(e: MouseEvent) {
		if (isNavClickTarget(e.target)) return;

		slowPinned = !slowPinned;
		if (slowPinned) {
			slowDown();
		} else if (!isHovering) {
			speedUp();
		}
	}

	$effect(() => {
		const el = cdSpinEl;
		if (!el) return;

		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reducedMotion) return;

		const anim = el.animate(
			[{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
			{ duration: SPIN_PERIOD_MS, iterations: Infinity, easing: 'linear' }
		);

		spinAnim = anim;
		currentPlaybackRate = NORMAL_PLAYBACK_RATE;

		return () => {
			cancelRateTween();
			anim.cancel();
			spinAnim = undefined;
		};
	});
</script>

<svelte:head>
	<title>Media Club</title>
	<meta name="description" content="Self-hosted media catalog for movies, vinyl, and books." />
</svelte:head>

<div class="home-actions">
	<button
		type="button"
		class="home-action-btn"
		onclick={() => theme.toggle()}
		aria-label="Toggle theme"
	>
		{#if theme.current === 'dark'}
			<Sun size={16} weight="bold" />
		{:else}
			<Moon size={16} weight="bold" />
		{/if}
	</button>

	{#if data.user}
		<form method="POST" action="/logout">
			<button type="submit" class="home-action-btn" aria-label="Log out">
				<SignOut size={16} weight="bold" />
			</button>
		</form>
	{/if}
</div>

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
		<p class="mb-5 text-sm font-semibold tracking-wide text-stone-500 uppercase dark:text-stone-400">
			Hover or click to slow disc
		</p>

		<div class="relative flex shrink-0 flex-col items-center">
			<!-- Desktop: decorative overlay left of disc — does not affect CD centering -->
			<div
				class="pointer-events-none absolute top-1/2 right-full hidden -translate-y-1/2 pr-5 lg:flex lg:flex-col lg:gap-3.5 xl:pr-7"
			>
				{#each data.summary as row (row.category)}
					{@const Icon = icons[row.category]}
					<a
						href="/{row.category === 'movie' ? 'movies' : row.category === 'music' ? 'music' : 'books'}"
						class="group pointer-events-auto flex flex-col items-center gap-1.5 transition-transform hover:-translate-y-0.5"
					>
						<span
							class="flex size-14 flex-col items-center justify-center gap-0.5 rounded-full bg-amber-400/15 ring-2 ring-amber-400/60 transition-all group-hover:bg-amber-400/25 group-hover:ring-amber-500 xl:size-16"
						>
							<Icon size={18} weight="bold" class="text-amber-600 dark:text-amber-400" />
							<span
								class="text-sm font-black text-amber-500 group-hover:text-amber-600 xl:text-base"
							>
								{row.owned + row.wishlist}
							</span>
						</span>
						<span
							class="text-[0.65rem] font-bold tracking-wider text-stone-600 uppercase dark:text-stone-400 xl:text-xs"
						>
							{row.label}
						</span>
					</a>
				{/each}
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
				onclick={onCdClick}
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

					{#each cdNavButtons as btn (btn.href)}
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
								<Icon size={22} weight="bold" />
							</a>
						</foreignObject>
					{/each}
				</g>
			</svg>

			<!-- Mobile: compact row below disc -->
			<div class="mt-6 flex flex-wrap items-center justify-center gap-5 sm:gap-6 lg:hidden">
				{#each data.summary as row (row.category)}
					{@const Icon = icons[row.category]}
					<a
						href="/{row.category === 'movie' ? 'movies' : row.category === 'music' ? 'music' : 'books'}"
						class="group flex flex-col items-center gap-1 transition-transform hover:-translate-y-0.5"
					>
						<span
							class="flex size-12 flex-col items-center justify-center gap-0.5 rounded-full bg-amber-400/15 ring-2 ring-amber-400/60 transition-all group-hover:bg-amber-400/25 group-hover:ring-amber-500 sm:size-14"
						>
							<Icon size={16} weight="bold" class="text-amber-600 dark:text-amber-400" />
							<span class="text-xs font-black text-amber-500 group-hover:text-amber-600 sm:text-sm">
								{row.owned + row.wishlist}
							</span>
						</span>
						<span
							class="text-[0.6rem] font-bold tracking-wider text-stone-600 uppercase sm:text-[0.65rem] dark:text-stone-400"
						>
							{row.label}
						</span>
					</a>
				{/each}
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
		display: flex;
		gap: 0.35rem;
	}

	.home-action-btn {
		display: inline-flex;
		width: 2.25rem;
		height: 2.25rem;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		border: 1px solid rgb(var(--color-border));
		background: rgb(var(--color-surface-raised) / 0.92);
		color: rgb(var(--color-text-secondary));
		cursor: pointer;
		backdrop-filter: blur(6px);
	}

	.home-action-btn:hover {
		border-color: rgb(var(--color-accent));
		color: rgb(var(--color-text));
	}

	.cd-disc {
		width: min(720px, 88vw);
		height: min(720px, 88vw);
		flex-shrink: 0;
		opacity: 0.48;
		cursor: pointer;
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

	.cd-nav-btn--primary {
		border-color: rgb(245 158 11);
		background-color: rgb(251 191 36);
		color: rgb(28 25 23);
	}

	.cd-nav-btn--primary:hover {
		background-color: rgb(245 158 11);
	}

	.cd-nav-btn--secondary {
		border-color: rgb(214 211 209);
		background-color: rgb(255 255 255);
		color: rgb(68 64 60);
	}

	.cd-nav-btn--secondary:hover {
		background-color: rgb(250 250 249);
	}

	:global([data-theme='dark']) .cd-nav-btn--secondary {
		border-color: rgb(87 83 78);
		background-color: rgb(41 37 36);
		color: rgb(214 211 209);
	}

	:global([data-theme='dark']) .cd-nav-btn--secondary:hover {
		background-color: rgb(68 64 60);
	}
</style>
