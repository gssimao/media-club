<script lang="ts">
	import { goto } from '$app/navigation';
	import NavDialFace from './nav-dial/NavDialFace.svelte';
	import {
		buildNavItems,
		centerDragBoost,
		DIAL_SNAP_MS,
		itemAnglesForCount,
		nearestItemIndex,
		nearestItemIndexWithHysteresis,
		pointerAngle,
		snapRotationToIndex,
		unwrapAngleDelta
	} from './nav-dial/nav-dial';
	import type { SessionUser } from '$lib/types/auth';

	interface Props {
		user: SessionUser | null;
		pathname: string;
		instanceId?: string;
		onNavigate?: () => void;
	}

	let { user, pathname, instanceId = 'main', onNavigate }: Props = $props();

	const navItems = $derived(buildNavItems(user));
	const activeIndex = $derived(
		Math.max(
			0,
			navItems.findIndex((item) => item.match(pathname))
		)
	);

	let dialRoot = $state<HTMLElement | null>(null);
	let rotation = $state(0);
	let dragging = $state(false);
	let dragMoved = $state(false);
	let animating = $state(false);
	let targetNavIndex = $state<number | null>(null);
	let pendingHref = $state<string | null>(null);
	let pathAtNavigationStart = '';
	let stickyPreviewIndex = $state(0);
	let lastPointerAngle = 0;
	let rotationAtDragStart = 0;
	let totalDragDelta = 0;

	const itemAngles = $derived(itemAnglesForCount(navItems.length));
	const previewIndex = $derived(
		animating && targetNavIndex !== null
			? targetNavIndex
			: dragging
				? stickyPreviewIndex
				: activeIndex
	);

	function setRotationForIndex(index: number) {
		rotation = snapRotationToIndex(itemAngles, index);
	}

	function snapToPath(path: string) {
		const index = navItems.findIndex((item) => item.match(path));
		if (index === -1) return;
		setRotationForIndex(index);
	}

	function finishNavigation() {
		animating = false;
		targetNavIndex = null;
		pendingHref = null;
	}

	$effect(() => {
		const path = pathname;

		if (targetNavIndex !== null) {
			const targetItem = navItems[targetNavIndex];
			if (targetItem?.match(path)) {
				finishNavigation();
			} else if (pendingHref && path !== pathAtNavigationStart && !targetItem?.match(path)) {
				finishNavigation();
				if (!dragging) snapToPath(path);
			}
			return;
		}

		if (!dragging && !animating) snapToPath(path);
	});

	$effect(() => {
		if (!dragging && !animating) {
			stickyPreviewIndex = activeIndex;
		}
	});

	let navTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		return () => clearTimeout(navTimer);
	});

	function navigateToIndex(index: number) {
		const item = navItems[index];
		if (!item) return;

		pathAtNavigationStart = pathname;
		targetNavIndex = index;
		pendingHref = item.href !== pathname ? item.href : null;
		animating = true;
		setRotationForIndex(index);

		navTimer = setTimeout(() => {
			if (pendingHref) void goto(pendingHref);
			else finishNavigation();
			onNavigate?.();
		}, DIAL_SNAP_MS);
	}

	function onPointerDown(event: PointerEvent) {
		if (event.button !== 0 || animating) return;
		const target = event.target as HTMLElement;
		if (target.closest('[data-dial-hub]')) return;
		if (target.closest('[data-dial-node]')) return;

		dragging = true;
		dragMoved = false;
		rotationAtDragStart = rotation;
		totalDragDelta = 0;
		stickyPreviewIndex = nearestItemIndex(itemAngles, rotation);
		lastPointerAngle = pointerAngle(dialRoot, event.clientX, event.clientY);
		dialRoot?.setPointerCapture(event.pointerId);
	}

	function onPointerMove(event: PointerEvent) {
		if (!dragging) return;
		const angle = pointerAngle(dialRoot, event.clientX, event.clientY);
		const step =
			unwrapAngleDelta(angle - lastPointerAngle) *
			centerDragBoost(dialRoot, event.clientX, event.clientY);
		lastPointerAngle = angle;
		totalDragDelta += step;
		if (Math.abs(totalDragDelta) > 2) dragMoved = true;
		rotation = rotationAtDragStart - totalDragDelta;
		stickyPreviewIndex = nearestItemIndexWithHysteresis(itemAngles, rotation, stickyPreviewIndex);
	}

	function onPointerUp(event: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		dialRoot?.releasePointerCapture(event.pointerId);

		if (dragMoved) {
			navigateToIndex(stickyPreviewIndex);
		}

		queueMicrotask(() => {
			dragMoved = false;
		});
	}

	function onNodeClick(event: MouseEvent, index: number) {
		event.preventDefault();
		if (dragMoved || animating) return;
		navigateToIndex(index);
	}

	function onCenterClick() {
		onNavigate?.();
	}
</script>

<div class="nav-dial-panel">
	<div
		bind:this={dialRoot}
		class="nav-dial"
		class:is-dragging={dragging}
		class:is-animating={animating}
		role="application"
		aria-label="Spin the navigation dial"
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointercancel={onPointerUp}
	>
		<NavDialFace
			{instanceId}
			{navItems}
			{itemAngles}
			{pathname}
			{rotation}
			{previewIndex}
			{dragging}
			{animating}
			{onNodeClick}
			{onCenterClick}
		/>
	</div>
</div>

<style>
	.nav-dial-panel {
		--dial-r: var(--nav-dial-r);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: visible;
		width: var(--nav-dial-size);
		height: var(--nav-dial-size);
		margin-inline: auto;
	}

	.nav-dial {
		--dial-snap-duration: 450ms;
		--dial-snap-easing: cubic-bezier(0.45, 0, 0.55, 1);
		position: relative;
		width: var(--nav-dial-size);
		height: var(--nav-dial-size);
		touch-action: none;
		user-select: none;
		cursor: grab;
	}

	.nav-dial:active {
		cursor: grabbing;
	}

	.nav-dial.is-dragging,
	.nav-dial.is-dragging:active {
		cursor: grabbing;
	}
</style>
