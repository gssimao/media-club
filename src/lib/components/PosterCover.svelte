<script lang="ts">
	import type { Snippet } from 'svelte';
	import CoverImage from './CoverImage.svelte';
	import { bindCoverReveal } from '$lib/utils/cover-reveal';
	let {
		title,
		coverUrl,
		hovered = false,
		highlighted = false,
		wishlist = false,
		format = null,
		children
	}: {
		title: string;
		coverUrl: string | null;
		hovered?: boolean;
		highlighted?: boolean;
		wishlist?: boolean;
		format?: string | null;
		children?: Snippet<[boolean]>;
	} = $props();
	let coverEl = $state<HTMLDivElement>();
	let toolsHover = $state(false);
	let toolsPinned = $state(false);
	let toolsKeyboard = $state(false);
	const toolsOpen = $derived(toolsHover || toolsPinned || toolsKeyboard);
	const reveal = bindCoverReveal({
		setHover: (value) => (toolsHover = value),
		togglePin: () => (toolsPinned = !toolsPinned),
		setKeyboard: (value) => (toolsKeyboard = value)
	});
	$effect(() => {
		if (!toolsPinned) return;
		function outside(event: PointerEvent) {
			if (event.target instanceof Node && !coverEl?.contains(event.target)) toolsPinned = false;
		}
		document.addEventListener('pointerdown', outside, true);
		return () => document.removeEventListener('pointerdown', outside, true);
	});
</script>

<div
	bind:this={coverEl}
	class="poster-cover"
	class:is-highlighted={highlighted}
	class:is-wishlist={wishlist}
	role="group"
	aria-label="Details for {title}"
	{@attach reveal}
>
	{#if coverUrl}<CoverImage
			src={coverUrl}
			alt="{title} cover"
			class="size-full object-cover"
			{hovered}
		/>{:else}<span class="no-cover">No cover</span>{/if}
	{#if format}<span class="format-strip" data-format={format}
			>{format === '4K' ? '4K Ultra HD' : format}</span
		>{/if}
	{#if wishlist}<span class="wishlist-label">Wishlist</span>{/if}
	{#if children}{@render children(toolsOpen)}{/if}
</div>

<style>
	.poster-cover {
		position: relative;
		aspect-ratio: 2 / 3;
		width: 100%;
		max-width: 15rem;
		overflow: hidden;
		border-radius: 0.75rem;
		background: rgb(var(--color-surface-raised));
		box-shadow:
			0 2px 4px rgb(0 0 0 / 0.1),
			0 4px 8px rgb(0 0 0 / 0.15);
		transition:
			transform 220ms ease,
			box-shadow 220ms ease;
	}
	.poster-cover::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		border: 1px solid rgb(255 255 255 / 0.12);
		box-shadow:
			inset 3px 0 0 rgb(255 255 255 / 0.08),
			inset -2px 0 0 rgb(0 0 0 / 0.12);
		pointer-events: none;
	}
	.poster-cover:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 16px rgb(0 0 0 / 0.2);
	}
	.is-highlighted {
		outline: 3px solid rgb(var(--color-accent));
		outline-offset: 3px;
	}
	.is-wishlist {
		border: 2px dashed rgb(var(--color-accent));
	}
	.no-cover {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: rgb(var(--color-text-tertiary));
		font-size: 0.75rem;
	}
	.format-strip {
		position: absolute;
		top: 0;
		inset-inline: 0;
		padding: 4px;
		background: #34383f;
		color: white;
		text-align: center;
		font-size: 10px;
		font-weight: 600;
	}
	.format-strip[data-format='4K'] {
		background: #17181b;
	}
	.format-strip[data-format='Blu-ray'] {
		background: #24547e;
	}
	.format-strip[data-format='DVD'] {
		background: #8d3935;
	}
	.format-strip[data-format='Streaming'] {
		background: #5c4b78;
	}
	.wishlist-label {
		position: absolute;
		top: 2rem;
		left: 50%;
		transform: translateX(-50%);
		border-radius: 1rem;
		padding: 3px 10px;
		background: rgb(var(--vinyl-paper));
		color: rgb(var(--vinyl-ink));
		font-size: 10px;
		font-weight: 600;
	}
</style>
