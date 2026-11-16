<script lang="ts">
	import VinylRecord from '../VinylRecord.svelte';
	import { NODE_R_RATIO, type NavItem } from './nav-dial';
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

<VinylRecord />
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
				<span class="dial-node-label">{item.label}</span><Icon size={20} weight="regular" />
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
		<span class="dial-center-disc" class:is-preview={dragging || animating}>
			<span class="dial-center-label" id="dial-selection-{instanceId}">{previewItem.label}</span>
			<PreviewIcon size={25} weight="regular" />
		</span>
	</a>
</div>

<style>
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
		flex-direction: column;
		gap: 3px;
		position: absolute;
		left: -26px;
		top: -26px;
		width: 52px;
		height: 52px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid rgb(var(--destination-color) / 0.45);
		border-radius: 50%;
		background: rgb(var(--vinyl-button));
		color: rgb(var(--destination-color));
		transition:
			transform var(--dial-snap-duration) var(--dial-snap-easing),
			background-color 180ms ease,
			box-shadow 180ms ease;
	}
	.dial-node-label {
		color: rgb(var(--vinyl-text));
		font-size: 10px;
		line-height: 1;
		white-space: nowrap;
		font-weight: 550;
		pointer-events: none;
	}
	.dial-node.is-active {
		background: rgb(var(--vinyl-base));
		border-style: dashed;
	}
	.dial-node:is(:hover, :focus-visible),
	.dial-node.is-preview {
		box-shadow: 0 0 18px rgb(var(--destination-color) / 0.24);
		background: rgb(var(--vinyl-base));
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
		width: 70px;
		height: 70px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 5px;
		border-radius: 50%;
		background: rgb(var(--vinyl-paper));
		border: 1px solid rgb(var(--destination-color) / 0.7);
		color: rgb(var(--vinyl-ink));
		box-shadow: 0 0 0 4px rgb(var(--destination-color) / 0.08);
		transition: transform var(--dial-snap-duration) var(--dial-snap-easing);
	}
	.dial-center-disc.is-preview {
		transform: scale(1.05);
	}
	.dial-center-label {
		font-size: 0.625rem;
		color: rgb(var(--vinyl-ink));
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
