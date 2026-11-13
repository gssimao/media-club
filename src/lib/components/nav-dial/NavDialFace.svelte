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
		skipTransition?: boolean;
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
		skipTransition = false,
		onNodeClick,
		onCenterClick
	}: Props = $props();
	const previewItem = $derived(navItems[previewIndex] ?? navItems[0]);
	const PreviewIcon = $derived(previewItem.icon);
	function onNodeKeydown(event: KeyboardEvent, index: number) {
		const direction =
			event.key === 'ArrowRight' || event.key === 'ArrowDown'
				? 1
				: event.key === 'ArrowLeft' || event.key === 'ArrowUp'
					? -1
					: 0;
		if (!direction) return;
		event.preventDefault();
		const nodes = (event.currentTarget as HTMLElement)
			.closest('.dial-rotator')
			?.querySelectorAll<HTMLAnchorElement>('[data-dial-node]');
		nodes?.[(index + direction + navItems.length) % navItems.length]?.focus();
	}
</script>

<div class="disc-wrap" aria-hidden="true">
	<svg viewBox="0 0 200 200">
		{#each grooveRadii as ratio (ratio)}<circle
				cx="100"
				cy="100"
				r={99 * ratio}
				fill="none"
				stroke="currentColor"
				stroke-width=".7"
			/>{/each}
		{#each tickAngles as angle (angle)}<line
				x1="100"
				y1="5"
				x2="100"
				y2="10"
				stroke="currentColor"
				stroke-width="1"
				transform="rotate({angle} 100 100)"
			/>{/each}
	</svg>
</div>
<div class="selector-arm" aria-hidden="true"></div>
<div
	class="dial-rotator"
	class:no-transition={skipTransition}
	style:transform="rotate({rotation}deg)"
>
	{#each navItems as item, i (item.href)}
		{@const Icon = item.icon}{@const angle = itemAngles[i]}
		<div
			class="dial-position"
			style:transform="rotate({angle}deg) translateY(calc(var(--dial-r) * {NODE_R_RATIO}))"
		>
			<a
				href={item.href}
				data-dial-node
				data-tone={item.tone}
				class="dial-node"
				class:is-active={item.match(pathname)}
				class:is-preview={i === previewIndex && (dragging || animating)}
				style:transform="rotate({-angle - rotation}deg)"
				aria-current={item.match(pathname) ? 'page' : undefined}
				aria-label={item.label}
				onclick={(event) => onNodeClick(event, i)}
				onkeydown={(event) => onNodeKeydown(event, i)}
			>
				<Icon size={21} weight="regular" /><span class="dial-node-label">{item.label}</span>
			</a>
		</div>
	{/each}
</div>
<div class="dial-center" data-dial-hub data-tone={previewItem.tone}>
	<a
		href={previewItem.href}
		aria-label={previewItem.label}
		onclick={onCenterClick}
		class="dial-center-slot"
		aria-current={!dragging && !animating && previewItem.match(pathname) ? 'page' : undefined}
	>
		<span class="dial-center-disc" class:is-preview={dragging || animating}
			><PreviewIcon size={27} weight="regular" /></span
		>
		<span class="dial-center-label" id="dial-selection-{instanceId}">{previewItem.label}</span>
	</a>
</div>

<style>
	.disc-wrap {
		position: absolute;
		inset: 0;
		border: 1px solid rgb(var(--color-accent) / 0.35);
		border-radius: 50%;
		pointer-events: none;
		background: conic-gradient(
			from 30deg,
			rgb(var(--color-surface) / 0.96),
			rgb(var(--color-sky) / 0.12),
			rgb(var(--color-surface) / 0.96) 42%,
			rgb(var(--color-coral) / 0.1) 65%,
			rgb(var(--color-surface) / 0.96)
		);
		box-shadow:
			inset 0 0 0 4px rgb(var(--color-bg) / 0.5),
			0 6px 22px rgb(0 0 0/0.08);
	}
	.disc-wrap svg {
		width: 100%;
		height: 100%;
		color: rgb(var(--color-accent) / 0.32);
	}
	.selector-arm {
		position: absolute;
		bottom: 0;
		left: calc(50% - 1px);
		width: 2px;
		height: 12px;
		background: rgb(var(--color-accent));
		box-shadow: 0 0 8px rgb(var(--color-accent) / 0.25);
	}
	.dial-rotator {
		position: absolute;
		inset: 0;
		transition: transform var(--dial-snap-duration) var(--dial-snap-easing);
	}
	.dial-position {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 0;
		height: 0;
	}
	.dial-node {
		position: absolute;
		left: -22px;
		top: -22px;
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid rgb(var(--destination-color) / 0.45);
		border-radius: 50%;
		background: rgb(var(--color-surface-raised));
		color: rgb(var(--destination-color));
		transition:
			transform var(--dial-snap-duration) var(--dial-snap-easing),
			background-color 180ms ease,
			box-shadow 180ms ease;
	}
	.dial-node-label {
		position: absolute;
		top: calc(100% + 3px);
		left: 50%;
		transform: translateX(-50%);
		color: rgb(var(--color-text-secondary));
		font-size: 0.5625rem;
		line-height: 1;
		white-space: nowrap;
		font-weight: 550;
		pointer-events: none;
	}
	.dial-node.is-active {
		background: rgb(var(--color-surface));
		border-style: dashed;
	}
	/* The hub names the current page; leave the selector at the rim unobstructed. */
	.dial-node.is-active .dial-node-label {
		visibility: hidden;
	}
	.dial-node:is(:hover, :focus-visible),
	.dial-node.is-preview {
		box-shadow: 0 0 18px rgb(var(--destination-color) / 0.24);
		background: rgb(var(--color-bg));
		border-color: rgb(var(--destination-color));
	}
	.dial-center {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		z-index: 3;
	}
	.dial-center-slot {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		border-radius: 50%;
	}
	.dial-center-disc {
		width: 56px;
		height: 56px;
		display: grid;
		place-items: center;
		border-radius: 50%;
		background: rgb(var(--color-accent-light));
		border: 1px solid rgb(var(--destination-color) / 0.7);
		color: rgb(var(--destination-color));
		box-shadow: 0 0 0 4px rgb(var(--destination-color) / 0.08);
		transition: transform var(--dial-snap-duration) var(--dial-snap-easing);
	}
	.dial-center-disc.is-preview {
		transform: scale(1.05);
	}
	.dial-center-label {
		font-size: 0.625rem;
		color: rgb(var(--color-text-secondary));
		line-height: 1;
	}
	.dial-rotator.no-transition,
	.dial-rotator.no-transition .dial-node,
	.dial-rotator.no-transition ~ .dial-center .dial-center-disc {
		transition: none;
	}
	:global(.nav-dial.is-dragging) .dial-rotator,
	:global(.nav-dial.is-dragging) .dial-node {
		transition: none;
	}
</style>
