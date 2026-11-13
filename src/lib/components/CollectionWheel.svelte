<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import { settings } from '$lib/stores/settings.svelte';
	import { buildNavItems } from './nav-dial/nav-dial';
	import type { SessionUser } from '$lib/types/auth';
	let {
		user,
		paused = false,
		hidden = false
	}: { user: SessionUser | null; paused?: boolean; hidden?: boolean } = $props();
	const items = $derived(buildNavItems(user));
	const reduced = $derived(settings.motion === 'reduced' || prefersReducedMotion.current);
	let touching = $state(false);
</script>

<nav
	class="collection-wheel"
	class:is-paused={paused || hidden || touching}
	class:is-still={reduced}
	style:--orbit-period="{Math.max(60_000, settings.spinPeriodMs * 5)}ms"
	aria-label="Collection wheel"
	onpointerdown={(event) => {
		if (event.pointerType === 'touch') touching = true;
	}}
	onpointerup={() => {
		touching = false;
	}}
	onpointercancel={() => {
		touching = false;
	}}
>
	<div class="platter" aria-hidden="true">
		<svg viewBox="0 0 520 520">
			{#each [248, 237, 221, 201, 181, 161, 141, 121, 101] as radius (radius)}<circle
					cx="260"
					cy="260"
					r={radius}
					fill="none"
					stroke="currentColor"
					stroke-width="0.7"
				/>{/each}
			{#each Array.from({ length: 48 }, (_, i) => i * 7.5) as angle (angle)}<line
					x1="260"
					y1="17"
					x2="260"
					y2={angle % 45 === 0 ? 30 : 22}
					stroke="currentColor"
					stroke-width="1"
					transform="rotate({angle} 260 260)"
				/>{/each}
		</svg>
	</div>
	<div class="orbit">
		{#each items as item, index (item.href)}
			{@const Icon = item.icon}{@const angle = (index / items.length) * Math.PI * 2}
			<div
				class="orbit-position"
				style:left="{50 + Math.sin(angle) * 34}%"
				style:top="{50 - Math.cos(angle) * 34}%"
			>
				<div class="counter-turn">
					<a
						href={item.href}
						class="wheel-link"
						data-tone={item.tone}
						aria-label={item.label}
						aria-current={item.href === '/' ? 'page' : undefined}
					>
						<span class="wheel-button"><Icon size={25} weight="regular" /></span><span
							class="wheel-label">{item.label}</span
						>
					</a>
				</div>
			</div>
		{/each}
	</div>
	<div class="record-label" aria-hidden="true">
		<span class="spindle"></span><span class="label-name">My<br />collection</span><span
			class="label-side">SIDE A</span
		>
	</div>
</nav>

<style>
	.collection-wheel {
		position: relative;
		/* The rotating square must never enlarge the page outside the circular disc. */
		overflow: clip;
		width: min(100%, 35rem);
		aspect-ratio: 1;
		margin-inline: auto;
		isolation: isolate;
		border-radius: 50%;
	}
	.platter {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		pointer-events: none;
		background: conic-gradient(
			from 25deg,
			rgb(var(--color-surface) / 0.96),
			rgb(var(--color-sky) / 0.14) 17%,
			rgb(var(--color-surface) / 0.98) 33%,
			rgb(var(--color-coral) / 0.13) 56%,
			rgb(var(--color-surface) / 0.96) 73%,
			rgb(var(--color-mint) / 0.12) 91%,
			rgb(var(--color-surface) / 0.96)
		);
		border: 1px solid rgb(var(--color-accent) / 0.38);
		box-shadow:
			inset 0 0 0 5px rgb(var(--color-bg) / 0.6),
			0 18px 55px rgb(0 0 0/0.12);
	}
	.platter svg {
		width: 100%;
		height: 100%;
		color: rgb(var(--color-accent) / 0.32);
	}
	.orbit {
		position: absolute;
		inset: 0;
		animation: orbit var(--orbit-period) linear infinite;
	}
	.orbit-position {
		position: absolute;
		width: 0;
		height: 0;
	}
	.counter-turn {
		width: 0;
		height: 0;
		animation: counter-orbit var(--orbit-period) linear infinite;
	}
	.wheel-link {
		position: absolute;
		width: 72px;
		min-height: 74px;
		left: -36px;
		top: -29px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		border-radius: 12px;
	}
	.wheel-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 58px;
		height: 58px;
		border-radius: 50%;
		color: rgb(var(--destination-color));
		border: 1px solid rgb(var(--destination-color) / 0.5);
		background: rgb(var(--color-surface-raised));
		box-shadow:
			0 4px 12px rgb(0 0 0/0.08),
			inset 0 0 0 4px rgb(var(--destination-color) / 0.05);
		transition:
			transform 220ms ease,
			background-color 220ms ease,
			box-shadow 220ms ease;
	}
	.wheel-link:is(:hover, :focus-visible) .wheel-button {
		transform: scale(1.08);
		background: rgb(var(--color-surface));
		box-shadow: 0 0 22px rgb(var(--destination-color) / 0.24);
	}
	.wheel-label {
		color: rgb(var(--color-text-secondary));
		font-size: 0.75rem;
		font-weight: 550;
		line-height: 1;
		white-space: nowrap;
	}
	.record-label {
		position: absolute;
		inset: 35%;
		border: 1px solid rgb(var(--color-accent) / 0.45);
		border-radius: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		background: rgb(var(--color-accent-light));
		box-shadow:
			0 0 0 5px rgb(var(--color-bg) / 0.6),
			0 0 0 6px rgb(var(--color-accent) / 0.15);
		pointer-events: none;
	}
	.spindle {
		width: 8px;
		height: 8px;
		border: 1px solid rgb(var(--color-accent));
		background: rgb(var(--color-bg));
		border-radius: 50%;
	}
	.label-name {
		text-align: center;
		font-size: clamp(0.75rem, 1.6vw, 1.125rem);
		line-height: 1.12;
		font-weight: 650;
		letter-spacing: -0.025em;
		color: rgb(var(--color-accent-hover));
	}
	.label-side {
		font-size: 0.5rem;
		letter-spacing: 0.2em;
		color: rgb(var(--color-text-tertiary));
	}
	.is-paused .orbit,
	.is-paused .counter-turn,
	.collection-wheel:focus-within .orbit,
	.collection-wheel:focus-within .counter-turn {
		animation-play-state: paused;
	}
	.is-still .orbit,
	.is-still .counter-turn {
		animation: none;
	}
	@media (hover: hover) {
		.collection-wheel:hover .orbit,
		.collection-wheel:hover .counter-turn {
			animation-play-state: paused;
		}
	}
	@media (max-width: 639px) {
		.wheel-link {
			width: 60px;
			min-height: 60px;
			left: -30px;
			top: -22px;
			gap: 5px;
		}
		.wheel-button {
			width: 44px;
			height: 44px;
		}
		.wheel-button :global(svg) {
			width: 21px;
			height: 21px;
		}
		.wheel-label {
			font-size: 0.625rem;
		}
		.record-label {
			gap: 0.35rem;
		}
	}
	@keyframes orbit {
		to {
			transform: rotate(360deg);
		}
	}
	@keyframes counter-orbit {
		to {
			transform: rotate(-360deg);
		}
	}
</style>
