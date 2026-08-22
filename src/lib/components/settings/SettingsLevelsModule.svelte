<script lang="ts">
	import { BookOpen, FilmStrip, MonitorPlay, VinylRecord } from 'phosphor-svelte';
	import type { MediaCategory } from '$lib/types/media';

	interface SummaryRow {
		category: MediaCategory;
		label: string;
		owned: number;
		wishlist: number;
	}

	interface Props {
		summary: SummaryRow[];
	}

	let { summary }: Props = $props();

	const icons = {
		movie: FilmStrip,
		show: MonitorPlay,
		music: VinylRecord,
		book: BookOpen
	} as const;

	const maxTotal = $derived(Math.max(1, ...summary.map((row) => row.owned + row.wishlist)));
</script>

<section class="module module--wide" aria-labelledby="module-levels">
	<h2 id="module-levels" class="module-title">
		<span class="led" aria-hidden="true"></span>
		Levels
	</h2>

	<div class="meters">
		{#each summary as row (row.category)}
			{@const Icon = icons[row.category]}
			{@const total = row.owned + row.wishlist}
			{@const pct = Math.max(8, (total / maxTotal) * 100)}
			<div class="meter">
				<div class="meter-track">
					<div class="meter-fill" style:height="{pct}%"></div>
				</div>
				<span class="meter-icon">
					<Icon size={14} weight="bold" />
				</span>
				<span class="meter-label">{row.label}</span>
				<span class="meter-count">{row.owned} owned · {row.wishlist} wished</span>
			</div>
		{/each}
	</div>

	<p class="hint">Live signal from the collection — not a knob, just bragging rights.</p>
</section>

<style>
	.meters {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 0.5rem;
		width: 100%;
		padding: 0.5rem 0 0.25rem;
	}

	@media (min-width: 480px) {
		.meters {
			justify-content: center;
			gap: 1.25rem;
		}
	}

	@media (min-width: 640px) {
		.meters {
			gap: 2.25rem;
		}
	}

	.meter {
		display: flex;
		flex: 1 1 0;
		min-width: 0;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
	}

	.meter-track {
		position: relative;
		width: 1.6rem;
		height: 8.5rem;
		border-radius: 9999px;
		border: 1px solid rgb(var(--color-border));
		background: rgb(var(--color-bg));
		box-shadow: inset 0 2px 6px rgb(0 0 0 / 0.12);
		overflow: hidden;
	}

	@keyframes meter-rise {
		from {
			height: 0%;
		}
	}

	.meter-fill {
		position: absolute;
		bottom: 0;
		left: 0.2rem;
		right: 0.2rem;
		border-radius: 9999px;
		background: linear-gradient(
			0deg,
			rgb(var(--color-accent)) 0%,
			rgb(var(--color-accent)) 70%,
			rgb(239 68 68) 100%
		);
		box-shadow: 0 0 8px rgb(var(--color-accent) / 0.5);
		animation: meter-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.meter-icon {
		display: inline-flex;
		color: rgb(var(--color-accent-hover));
	}

	.meter-label {
		font-size: 0.62rem;
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: rgb(var(--color-text-secondary));
	}

	.meter-count {
		font-size: 0.55rem;
		font-weight: 600;
		line-height: 1.25;
		text-align: center;
		color: rgb(var(--color-text-tertiary));
	}

	@media (min-width: 480px) {
		.meter-count {
			font-size: 0.6rem;
			white-space: nowrap;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.meter-fill {
			animation: none;
		}
	}

	:global([data-motion='reduced']) .meter-fill {
		animation: none;
	}
</style>
