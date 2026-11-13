<script lang="ts">
	import { Pause, Play } from 'phosphor-svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import CollectionWheel from '$lib/components/CollectionWheel.svelte';
	import HomeAmbience from '$lib/components/HomeAmbience.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import { CATEGORY_PATHS } from '$lib/types/media';
	let { data } = $props();
	let paused = $state(false);
	let hidden = $state(false);
	const motionAllowed = $derived(settings.motion !== 'reduced' && !prefersReducedMotion.current);
	const tones = { movie: 'coral', show: 'lilac', music: 'mint', book: 'sky' } as const;
	const total = $derived(data.summary.reduce((count, row) => count + row.owned, 0));
	$effect(() => {
		const update = () => {
			hidden = document.hidden;
		};
		update();
		document.addEventListener('visibilitychange', update);
		return () => document.removeEventListener('visibilitychange', update);
	});
</script>

<svelte:head
	><title>Media Club · My collection</title><meta
		name="description"
		content="My collection of movies, shows, records, and books."
	/></svelte:head
>
<HomeAmbience covers={data.ambientCovers} {paused} />
<section class="collection-room" aria-labelledby="collection-title">
	<header class="collection-heading">
		<h1 id="collection-title">Media Club<span aria-hidden="true">.</span></h1>
		<p>{total} in my collection</p>
	</header>
	<div class="wheel-stage"><CollectionWheel user={data.user} {paused} {hidden} /></div>
	<nav class="collection-counts" aria-label="Collection totals">
		{#each data.summary as row (row.category)}<a
				href="/{CATEGORY_PATHS[row.category]}"
				data-tone={tones[row.category]}
				><span class="count-disc">{row.owned}</span><span>{row.label}</span></a
			>{/each}
	</nav>
	{#if motionAllowed}<button
			class="movement-toggle"
			type="button"
			aria-pressed={paused}
			onclick={() => {
				paused = !paused;
			}}
			>{#if paused}<Play size={14} />Resume movement{:else}<Pause size={14} />Pause movement{/if}</button
		>{/if}
</section>

<style>
	.collection-room {
		min-height: calc(100svh - 2rem);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 3.75rem 0 1.5rem;
	}
	.collection-heading {
		text-align: center;
		margin-bottom: 1.75rem;
	}
	h1 {
		font-size: clamp(2rem, 4.5vw, 3.25rem);
		font-weight: 680;
		letter-spacing: -0.065em;
		line-height: 1;
	}
	h1 span {
		color: rgb(var(--color-accent));
	}
	.collection-heading p {
		margin-top: 0.7rem;
		font-size: 0.75rem;
		color: rgb(var(--color-text-tertiary));
		font-variant-numeric: tabular-nums;
	}
	.wheel-stage {
		width: min(100%, 35rem);
	}
	.collection-counts {
		display: flex;
		justify-content: center;
		gap: clamp(1.2rem, 3.5vw, 2.5rem);
		margin-top: 1.75rem;
	}
	.collection-counts a {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		min-width: 44px;
		font-size: 0.6875rem;
		color: rgb(var(--color-text-secondary));
	}
	.count-disc {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: 1px solid rgb(var(--destination-color) / 0.5);
		color: rgb(var(--destination-color));
		background: rgb(var(--color-surface) / 0.8);
		font-size: 0.875rem;
		font-variant-numeric: tabular-nums;
		transition: transform 200ms ease;
	}
	.collection-counts a:hover .count-disc {
		transform: rotate(-10deg);
	}
	.movement-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 44px;
		border: 0;
		background: none;
		color: rgb(var(--color-text-tertiary));
		font-size: 0.6875rem;
		padding: 0.5rem 1rem;
		margin-top: 0.75rem;
		cursor: pointer;
	}
	@media (max-width: 639px) {
		.collection-room {
			padding-top: 5.5rem;
			min-height: 100svh;
		}
		.collection-heading {
			margin-bottom: 2rem;
		}
		.collection-counts {
			margin-top: 2rem;
		}
	}
</style>
