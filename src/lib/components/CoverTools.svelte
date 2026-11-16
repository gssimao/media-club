<script lang="ts">
	import type { Snippet } from 'svelte';
	let { open, children }: { open: boolean; children: Snippet } = $props();
</script>

<div class="cover-tools" class:is-open={open} data-open={open ? 'true' : 'false'}>
	{@render children()}
</div>

<style>
	.cover-tools {
		position: absolute;
		inset: 0;
		z-index: 15;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: safe center;
		gap: 0.4rem;
		overflow-y: auto;
		padding: 0.75rem;
		border-radius: inherit;
		background: rgb(12 10 9 / 0.84);
		text-align: center;
		opacity: 0;
		pointer-events: none;
		transition: opacity 180ms ease;
	}
	.cover-tools.is-open {
		opacity: 1;
		pointer-events: auto;
	}
	.cover-tools :global(.cover-tools__genres button) {
		border-color: rgb(255 255 255 / 0.4);
		background: transparent;
		color: white;
		min-height: 36px;
	}
</style>
