<script lang="ts">
	import { grooveRadii, NODE_R_RATIO, tickAngles, type NavItem } from './nav-dial';

	interface Props {
		instanceId: string;
		navItems: NavItem[];
		itemAngles: number[];
		pathname: string;
		rotation: number;
		previewIndex: number;
		dragging: boolean;
		animating: boolean;
		onNodeClick: (event: MouseEvent, index: number) => void;
		onCenterClick: () => void;
	}

	let {
		instanceId,
		navItems,
		itemAngles,
		pathname,
		rotation,
		previewIndex,
		dragging,
		animating,
		onNodeClick,
		onCenterClick
	}: Props = $props();

	const shineGradientId = $derived(`mc-disc-shine-${instanceId}`);
	const previewItem = $derived(navItems[previewIndex] ?? navItems[0]);
	const activeIndex = $derived(
		Math.max(
			0,
			navItems.findIndex((item) => item.match(pathname))
		)
	);
	const activeItem = $derived(navItems[activeIndex] ?? navItems[0]);
	const PreviewIcon = $derived(previewItem.icon);
	const ActiveIcon = $derived(activeItem.icon);
</script>

<div class="disc-wrap" aria-hidden="true">
	<div class="disc-circle">
		<svg class="disc-grooves" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
			<defs>
				<radialGradient id={shineGradientId} cx="50%" cy="18%" r="55%">
					<stop offset="0%" stop-color="#ffe066" stop-opacity="0.18" />
					<stop offset="100%" stop-color="#ffe066" stop-opacity="0" />
				</radialGradient>
			</defs>
			<circle cx="100" cy="100" r="99" fill="url(#{shineGradientId})" />
			{#each grooveRadii as ratio, i (ratio)}
				<circle
					cx="100"
					cy="100"
					r={99 * ratio}
					fill="none"
					stroke="#fcb900"
					stroke-opacity={0.22 - i * 0.04}
					stroke-width="1"
				/>
			{/each}
			{#each tickAngles as angle (angle)}
				<line
					x1="100"
					y1="100"
					x2="100"
					y2="72"
					stroke="#fcb900"
					stroke-opacity="0.18"
					stroke-width="1"
					transform="rotate({angle} 100 100)"
				/>
			{/each}
		</svg>
	</div>
</div>

<div class="selector-arm" aria-hidden="true">
	<span class="selector-line"></span>
</div>

<div class="dial-rotator" style="transform: rotate({rotation}deg)">
	{#each navItems as item, i (item.href)}
		{@const Icon = item.icon}
		{@const angle = itemAngles[i]}
		{@const active = item.match(pathname)}
		{@const preview = i === previewIndex}
		<button
			type="button"
			data-dial-node
			class="dial-node"
			class:is-active={active}
			class:is-preview={preview && (dragging || animating)}
			style="transform: rotate({angle}deg) translateY(calc(var(--dial-r) * {NODE_R_RATIO}))"
			aria-current={active ? 'page' : undefined}
			aria-label={item.label}
			disabled={animating}
			onclick={(event) => onNodeClick(event, i)}
		>
			<span class="dial-node-inner" style="transform: rotate({-angle - rotation}deg)">
				<span class="dial-node-button">
					<Icon size={22} weight="bold" />
				</span>
				{#if active || (preview && (dragging || animating))}
					<span class="dial-node-label">{item.label}</span>
				{/if}
			</span>
		</button>
	{/each}
</div>

<div class="dial-center" data-dial-hub>
	<a
		href={previewItem.href}
		class="dial-center-slot"
		aria-current={!dragging && !animating && previewItem.match(pathname) ? 'page' : undefined}
		onclick={onCenterClick}
	>
		<span class="dial-center-disc" class:is-preview={dragging || animating}>
			{#if dragging || animating}
				<PreviewIcon size={28} weight="bold" />
			{:else}
				<ActiveIcon size={28} weight="bold" />
			{/if}
		</span>
		<span class="dial-center-label">
			{dragging || animating ? previewItem.label : activeItem.label}
		</span>
	</a>
</div>

<style>
	.disc-wrap {
		position: absolute;
		inset: 0;
		z-index: 1;
		pointer-events: none;
	}

	.disc-circle {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		border: 2px solid rgb(252 185 0 / 0.32);
		background: radial-gradient(
			circle at 50% 18%,
			rgb(255 224 102 / 0.28) 0%,
			rgb(232 168 0 / 0.2) 24%,
			rgb(146 96 10 / 0.16) 58%,
			rgb(41 37 36 / 0.22) 100%
		);
		box-shadow:
			inset 0 0 18px rgb(0 0 0 / 0.1),
			0 4px 14px rgb(252 185 0 / 0.08);
	}

	.disc-grooves {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		opacity: 0.42;
	}

	.selector-arm {
		position: absolute;
		left: var(--dial-r);
		bottom: 0;
		z-index: 5;
		display: flex;
		flex-direction: column-reverse;
		align-items: center;
		transform: translateX(-50%);
		pointer-events: none;
	}

	.selector-line {
		display: block;
		width: 3px;
		height: 1.75rem;
		border-radius: 9999px;
		background: linear-gradient(
			0deg,
			rgb(var(--color-accent)) 0%,
			rgb(var(--color-accent) / 0.12) 100%
		);
		box-shadow: 0 0 8px rgb(var(--color-accent) / 0.45);
	}

	.dial-rotator {
		position: absolute;
		inset: 0;
		z-index: 2;
		transform-origin: var(--dial-r) var(--dial-r);
		transition: transform var(--dial-snap-duration) var(--dial-snap-easing);
	}

	:global(.nav-dial.is-dragging) .dial-rotator,
	:global(.nav-dial.is-dragging) .dial-node-inner {
		transition: none;
	}

	.dial-node {
		position: absolute;
		left: var(--dial-r);
		top: var(--dial-r);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
		width: 0;
		height: 0;
		padding: 0;
		border: none;
		background: none;
		text-align: center;
		transform-origin: 0 0;
		cursor: pointer;
		font: inherit;
		color: inherit;
	}

	.dial-node-inner {
		position: relative;
		display: block;
		width: 0;
		height: 0;
		transform-origin: 0 0;
		transition: transform var(--dial-snap-duration) var(--dial-snap-easing);
	}

	.dial-node.is-active .dial-node-button {
		opacity: 0.38;
		border-color: rgb(var(--color-accent) / 0.45);
		background: rgb(var(--color-surface-raised) / 0.65);
		transform: scale(0.92);
		box-shadow: none;
	}

	.dial-node.is-preview:not(.is-active) .dial-node-button {
		border-color: rgb(var(--color-accent));
		background: rgb(var(--color-accent) / 0.25);
		color: rgb(var(--color-accent-hover));
		transform: scale(1.1);
		box-shadow: 0 0 14px rgb(var(--color-accent) / 0.5);
	}

	.dial-node-button {
		position: absolute;
		left: -1.5rem;
		top: -1.5rem;
		display: inline-flex;
		width: 3rem;
		height: 3rem;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		border: 2px solid rgb(var(--color-border));
		background: rgb(var(--color-surface-raised) / 0.94);
		color: rgb(var(--color-text-secondary));
		box-shadow: 0 4px 12px rgb(0 0 0 / 0.16);
		transition:
			transform var(--dial-snap-duration) var(--dial-snap-easing),
			background-color 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease,
			box-shadow 0.2s ease,
			opacity 0.2s ease;
	}

	.dial-node-button::before {
		content: '';
		position: absolute;
		inset: -0.85rem;
		border-radius: 9999px;
	}

	.dial-node-label {
		position: absolute;
		top: 1.55rem;
		left: 50%;
		width: max-content;
		max-width: 6.5rem;
		transform: translateX(-50%);
		font-size: 0.55rem;
		font-weight: 800;
		line-height: 1.1;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: rgb(var(--color-text-secondary));
		pointer-events: none;
	}

	.dial-node.is-active .dial-node-label {
		opacity: 0.55;
	}

	.dial-node.is-preview:not(.is-active) .dial-node-label {
		color: rgb(var(--color-accent-hover));
	}

	.dial-node:hover .dial-node-button {
		border-color: rgb(var(--color-accent));
		background: rgb(var(--color-accent));
		color: rgb(40 35 28);
		transform: scale(1.08);
		opacity: 1;
	}

	.dial-center {
		position: absolute;
		left: var(--dial-r);
		top: var(--dial-r);
		z-index: 4;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.12rem;
		transform: translate(-50%, -50%);
		cursor: default;
	}

	.dial-center-slot {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
	}

	.dial-center-disc {
		display: inline-flex;
		width: 4rem;
		height: 4rem;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		border: 2px solid rgb(var(--color-accent));
		background: rgb(var(--color-accent));
		color: rgb(40 35 28);
		box-shadow:
			0 0 0 4px rgb(var(--color-accent) / 0.16),
			0 8px 22px rgb(var(--color-accent) / 0.38);
		transition:
			transform var(--dial-snap-duration) var(--dial-snap-easing),
			box-shadow var(--dial-snap-duration) var(--dial-snap-easing);
	}

	.dial-center-disc.is-preview {
		transform: scale(1.06);
		box-shadow:
			0 0 0 5px rgb(var(--color-accent) / 0.24),
			0 10px 26px rgb(var(--color-accent) / 0.48);
	}

	.dial-center-label {
		font-size: 0.6rem;
		font-weight: 900;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgb(var(--color-accent-hover));
	}

	@media (min-width: 768px) {
		.dial-node-button {
			width: 3.25rem;
			height: 3.25rem;
			left: -1.625rem;
			top: -1.625rem;
		}

		.dial-center-disc {
			width: 4.25rem;
			height: 4.25rem;
		}
	}
</style>
