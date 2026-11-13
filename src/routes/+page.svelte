<script lang="ts">
	import {
		ArrowRight,
		BookOpen,
		FilmStrip,
		Heart,
		MonitorPlay,
		Pause,
		Play,
		VinylRecord
	} from 'phosphor-svelte';
	import HomeAmbience from '$lib/components/HomeAmbience.svelte';
	import VinylDisc from '$lib/components/VinylDisc.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { CATEGORY_PATHS } from '$lib/types/media';
	let { data } = $props();
	let paused = $state(false);
	const motionAllowed = $derived(settings.motion !== 'reduced' && !prefersReducedMotion.current);
	const icons = {
		movie: FilmStrip,
		show: MonitorPlay,
		music: VinylRecord,
		book: BookOpen
	} as const;
</script>

<svelte:head
	><title>Media Club</title><meta
		name="description"
		content="A home for your favorite movies, TV shows, vinyl, and books. Browse the collection and find your next favorite."
	/></svelte:head
>
<HomeAmbience covers={data.ambientCovers} {paused} />
<section class="home-hero" aria-labelledby="home-title">
	<div class="hero-record" class:is-paused={paused} style:--spin-period="{settings.spinPeriodMs}ms">
		<VinylDisc spinning={motionAllowed} class="size-full" />
	</div>
	<p class="eyebrow">The personal collection</p>
	<h1 id="home-title">Your collection.<br /><span>A world of stories.</span></h1>
	<p class="hero-description">
		Movies, shows, records, and books.<br class="mobile-break" /> All the things worth keeping.
	</p>
	<a class="btn-primary hero-cta" href="/movies">Explore the collection <ArrowRight size={18} /></a>
	<nav class="category-grid" aria-label="Browse your collection">
		{#each data.summary as row (row.category)}
			{@const Icon = icons[row.category]}
			<a class="category-link" href="/{CATEGORY_PATHS[row.category]}">
				<span class="category-icon"><Icon size={24} weight="regular" /></span>
				<span class="category-name">{row.label}</span>
				<span class="category-count"
					>{row.owned} owned <span aria-hidden="true">·</span> {row.wishlist} wished</span
				>
				<ArrowRight size={17} class="category-arrow" />
			</a>
		{/each}
	</nav>
	<div class="home-secondary">
		<a href="/wishlist/movies"><Heart size={16} />Browse wishlists</a>
		{#if motionAllowed}<button
				type="button"
				aria-pressed={paused}
				onclick={() => {
					paused = !paused;
				}}
				>{#if paused}<Play size={15} />Resume ambience{:else}<Pause size={15} />Pause ambience{/if}</button
			>{/if}
	</div>
</section>

<style>
	.home-hero {
		position: relative;
		width: 100%;
		max-width: 60rem;
		margin-inline: auto;
		padding: clamp(2.5rem, 6vh, 5rem) 0 3rem;
		text-align: center;
	}
	.hero-record {
		width: 6rem;
		height: 6rem;
		margin: 0 auto 1.75rem;
		border-radius: 50%;
		box-shadow: 0 12px 32px rgb(0 0 0 / 0.18);
	}
	.hero-record.is-paused :global(.record-spin) {
		animation-play-state: paused;
	}
	.eyebrow {
		color: rgb(var(--color-text-secondary));
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
	}
	h1 {
		margin: 1.25rem 0;
		font-size: clamp(2.6rem, 6.6vw, 5.25rem);
		line-height: 1.02;
		letter-spacing: -0.065em;
		font-weight: 650;
	}
	h1 span {
		color: rgb(var(--color-text-secondary));
	}
	.hero-description {
		font-size: 1rem;
		line-height: 1.65;
		color: rgb(var(--color-text-secondary));
		text-wrap: balance;
	}
	.mobile-break {
		display: none;
	}
	.hero-cta {
		margin-top: 1.75rem;
	}
	.category-grid {
		margin-top: clamp(2.5rem, 6vw, 4rem);
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.75rem;
		text-align: left;
	}
	.category-link {
		position: relative;
		display: flex;
		flex-direction: column;
		padding: 1.5rem;
		gap: 0.4rem;
		border-radius: 1.25rem;
		border: 1px solid rgb(var(--color-border) / 0.8);
		background: rgb(var(--color-surface-raised) / 0.84);
		transition:
			background-color 200ms ease,
			border-color 200ms ease,
			transform 250ms var(--ease-out);
	}
	.category-icon {
		color: rgb(var(--color-accent-hover));
		margin-bottom: 1rem;
	}
	.category-name {
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: -0.02em;
	}
	.category-count {
		color: rgb(var(--color-text-tertiary));
		font-size: 0.75rem;
		font-variant-numeric: tabular-nums;
	}
	.category-link :global(.category-arrow) {
		position: absolute;
		top: 1.5rem;
		right: 1.5rem;
		color: rgb(var(--color-text-tertiary));
	}
	.home-secondary {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.25rem 1.5rem;
		margin-top: 1.5rem;
	}
	.home-secondary a,
	.home-secondary button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 44px;
		padding: 0.5rem;
		border: 0;
		background: transparent;
		color: rgb(var(--color-text-secondary));
		font-size: 0.8125rem;
		cursor: pointer;
	}
	.home-secondary :is(a, button):hover {
		color: rgb(var(--color-text));
	}
	@media (hover: hover) and (prefers-reduced-motion: no-preference) {
		.category-link:hover {
			transform: translateY(-3px);
			background: rgb(var(--color-surface-raised));
			border-color: rgb(var(--color-accent) / 0.6);
		}
	}
	@media (max-width: 639px) {
		.home-hero {
			padding-top: 2rem;
		}
		.hero-record {
			width: 4.25rem;
			height: 4.25rem;
			margin-bottom: 1.5rem;
		}
		h1 {
			font-size: clamp(2.35rem, 10.5vw, 3.6rem);
		}
		.hero-description {
			font-size: 0.9375rem;
		}
		.mobile-break {
			display: initial;
		}
		.category-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 0.65rem;
			margin-top: 2.5rem;
		}
		.category-link {
			padding: 1.1rem;
		}
		.category-icon {
			margin-bottom: 0.65rem;
		}
		.category-link :global(.category-arrow) {
			top: 1.2rem;
			right: 1.1rem;
		}
	}
	:global([data-motion='reduced']) .category-link {
		transition: none;
		transform: none;
	}
</style>
