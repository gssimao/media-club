<script lang="ts">
	import { ArrowCounterClockwise } from 'phosphor-svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="console surface-round">
	<div class="console-head">
		<span class="console-brand">
			<span class="led led--pulse" aria-hidden="true"></span>
			Media Club · Control Booth
		</span>
		<button type="button" class="reset-btn" onclick={() => settings.reset()}>
			<ArrowCounterClockwise size={13} weight="bold" />
			Reset booth
		</button>
	</div>

	<div class="console-grid">
		{@render children()}
	</div>
</div>

<style>
	.console {
		max-width: 56rem;
		padding: 1.25rem 1.25rem 1.75rem;
		background:
			radial-gradient(120% 80% at 50% 0%, rgb(var(--color-accent) / 0.06) 0%, transparent 60%),
			rgb(var(--color-surface));
	}

	@media (min-width: 640px) {
		.console {
			padding: 1.5rem 1.75rem 2rem;
		}
	}

	.console-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.25rem 0.5rem 1rem;
	}

	.console-brand {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.65rem;
		font-weight: 900;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: rgb(var(--color-text-secondary));
	}

	.reset-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.4rem 0.9rem;
		border-radius: 9999px;
		border: 1px solid rgb(var(--color-border));
		background: rgb(var(--color-bg) / 0.6);
		font-size: 0.65rem;
		font-weight: 800;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: rgb(var(--color-text-secondary));
		cursor: pointer;
		transition:
			border-color 0.2s ease,
			color 0.2s ease;
	}

	.reset-btn:hover {
		border-color: rgb(var(--color-accent));
		color: rgb(var(--color-text));
	}

	.console-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: 1fr;
	}

	@media (min-width: 768px) {
		.console-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.console-grid :global(.module--wide) {
			grid-column: span 2;
		}
	}

	.console-grid :global(.module) {
		border-radius: 1.75rem;
		border: 1px solid rgb(var(--color-border));
		background: rgb(var(--color-bg) / 0.55);
		box-shadow: inset 0 1px 4px rgb(0 0 0 / 0.06);
		padding: 1.1rem 1.25rem 1.25rem;
	}

	.console-grid :global(.module-title) {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0 0 1rem;
		font-size: 0.7rem;
		font-weight: 900;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: rgb(var(--color-text-secondary));
	}

	.console-grid :global(.led) {
		display: inline-block;
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 9999px;
		background: rgb(var(--color-accent));
		box-shadow: 0 0 6px rgb(var(--color-accent) / 0.8);
	}

	@keyframes led-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.35;
		}
	}

	.console-grid :global(.led--pulse) {
		animation: led-pulse 2.4s ease-in-out infinite;
	}

	.console-grid :global(.hint) {
		margin: 0.9rem 0 0;
		font-size: 0.72rem;
		font-weight: 500;
		line-height: 1.4;
		color: rgb(var(--color-text-tertiary));
	}

	@media (prefers-reduced-motion: reduce) {
		.console-grid :global(.led--pulse) {
			animation: none;
		}
	}

	:global([data-motion='reduced']) .console-grid :global(.led--pulse) {
		animation: none;
	}
</style>
