<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		FilmStrip,
		VinylRecord,
		BookOpen,
		Heart,
		SignIn,
		SignOut,
		Gear,
		Sun,
		Moon,
		House
	} from 'phosphor-svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import type { AdminUser } from '$lib/server/db/schema';
	import type { Component } from 'svelte';

	interface Props {
		user: AdminUser | null;
		pathname: string;
	}

	let { user, pathname }: Props = $props();

	type NavItem = {
		href: string;
		label: string;
		icon: Component<{ size?: number; weight?: 'bold' | 'regular' | 'fill' }>;
		match: (path: string) => boolean;
	};

	const catalogItems: NavItem[] = [
		{ href: '/', label: 'Home', icon: House, match: (p) => p === '/' },
		{ href: '/movies', label: 'Movies', icon: FilmStrip, match: (p) => p.startsWith('/movies') },
		{ href: '/music', label: 'Music', icon: VinylRecord, match: (p) => p.startsWith('/music') },
		{ href: '/books', label: 'Books', icon: BookOpen, match: (p) => p.startsWith('/books') },
		{
			href: '/wishlist/movies',
			label: 'Wishlist',
			icon: Heart,
			match: (p) => p.startsWith('/wishlist')
		}
	];

	const navItems = $derived<NavItem[]>(
		user
			? [
					...catalogItems,
					{
						href: '/admin',
						label: 'Admin',
						icon: Gear,
						match: (p) => p.startsWith('/admin')
					}
				]
			: [
					...catalogItems,
					{
						href: '/login',
						label: 'Log in',
						icon: SignIn,
						match: (p) => p === '/login'
					}
				]
	);

	const activeIndex = $derived(Math.max(0, navItems.findIndex((item) => item.match(pathname))));
	const activeItem = $derived(navItems[activeIndex] ?? navItems[0]);
	const ActiveIcon = $derived(activeItem.icon);

	/** Bottom-center slot in rotate-then-translate coords (0° = 6 o'clock). */
	const SELECTOR = 0;
	/** Inner arc where nav icon centers sit (fraction of --dial-r). Matches outer groove. */
	const NODE_R_RATIO = 0.82;
	const ARC_START = -68;
	const ARC_END = 68;

	const grooveRadii = [0.82, 0.62, 0.44] as const;
	const tickAngles = [0, 45, 90, 135, 180, 225, 270, 315] as const;

	let dialRoot = $state<HTMLElement | null>(null);
	let rotation = $state(0);
	let dragging = $state(false);
	let dragMoved = $state(false);
	let animating = $state(false);
	let lastPointerAngle = 0;
	/** Fraction of dial radius — pointer inside gets slight sensitivity boost. */
	const CENTER_BOOST_THRESHOLD = 0.45;
	const CENTER_BOOST_MAX = 1.2;

	const itemAngles = $derived(
		navItems.map((_, i) => {
			if (navItems.length === 1) return SELECTOR;
			return ARC_START + (i / (navItems.length - 1)) * (ARC_END - ARC_START);
		})
	);

	const previewIndex = $derived(dragging ? nearestItemIndex(rotation) : activeIndex);
	const previewItem = $derived(navItems[previewIndex] ?? activeItem);
	const PreviewIcon = $derived(previewItem.icon);

	function dialCenter(): { cx: number; cy: number; radius: number } | null {
		if (!dialRoot) return null;
		const rect = dialRoot.getBoundingClientRect();
		const radius = rect.width / 2;
		return { cx: rect.left + radius, cy: rect.top + radius, radius };
	}

	function pointerAngle(clientX: number, clientY: number): number {
		const center = dialCenter();
		if (!center) return 0;
		const atan2Deg = (Math.atan2(clientY - center.cy, clientX - center.cx) * 180) / Math.PI;
		return 90 - atan2Deg;
	}

	function unwrapAngleDelta(delta: number): number {
		let d = delta;
		while (d > 180) d -= 360;
		while (d < -180) d += 360;
		return d;
	}

	/** Slightly faster spin when the pointer is closer to the hub (not inverse-distance damping). */
	function centerDragBoost(clientX: number, clientY: number): number {
		const center = dialCenter();
		if (!center || center.radius <= 0) return 1;
		const dist = Math.hypot(clientX - center.cx, clientY - center.cy);
		const threshold = center.radius * CENTER_BOOST_THRESHOLD;
		if (dist >= threshold) return 1;
		const t = 1 - dist / threshold;
		return 1 + (CENTER_BOOST_MAX - 1) * t;
	}

	function nearestItemIndex(forRotation: number): number {
		let best = 0;
		let bestDist = Infinity;
		for (let i = 0; i < itemAngles.length; i++) {
			const worldAngle = itemAngles[i] + forRotation;
			let dist = Math.abs(worldAngle - SELECTOR);
			if (dist > 180) dist = 360 - dist;
			if (dist < bestDist) {
				bestDist = dist;
				best = i;
			}
		}
		return best;
	}

	function snapRotationToIndex(index: number) {
		rotation = SELECTOR - itemAngles[index];
	}

	function snapToPath(path: string) {
		const index = navItems.findIndex((item) => item.match(path));
		if (index === -1) return;
		snapRotationToIndex(index);
	}

	$effect(() => {
		pathname;
		if (!dragging && !animating) snapToPath(pathname);
	});

	function navigateToIndex(index: number) {
		animating = true;
		snapRotationToIndex(index);
		window.setTimeout(() => {
			animating = false;
			const item = navItems[index];
			if (item && item.href !== pathname) void goto(item.href);
		}, 360);
	}

	function onPointerDown(event: PointerEvent) {
		if (event.button !== 0 || animating) return;
		const target = event.target as HTMLElement;
		if (target.closest('[data-dial-hub]')) return;
		if (target.closest('[data-dial-node]')) return;

		dragging = true;
		dragMoved = false;
		lastPointerAngle = pointerAngle(event.clientX, event.clientY);
		dialRoot?.setPointerCapture(event.pointerId);
	}

	function onPointerMove(event: PointerEvent) {
		if (!dragging) return;
		const angle = pointerAngle(event.clientX, event.clientY);
		const delta = unwrapAngleDelta(angle - lastPointerAngle) * centerDragBoost(event.clientX, event.clientY);
		lastPointerAngle = angle;
		if (Math.abs(delta) > 2) dragMoved = true;
		// Inverted so clockwise drag spins the dial clockwise.
		rotation -= delta;
	}

	function onPointerUp(event: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		dialRoot?.releasePointerCapture(event.pointerId);

		if (dragMoved) {
			navigateToIndex(nearestItemIndex(rotation));
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

</script>

<header class="site-header">
	<div class="header-stack">
		<div class="header-actions" data-dial-hub>
			<button
				type="button"
				class="header-action-btn"
				onclick={() => theme.toggle()}
				aria-label="Toggle theme"
			>
				{#if theme.current === 'dark'}
					<Sun size={14} weight="bold" />
				{:else}
					<Moon size={14} weight="bold" />
				{/if}
			</button>

			{#if user}
				<form method="POST" action="/logout">
					<button type="submit" class="header-action-btn" aria-label="Log out">
						<SignOut size={14} weight="bold" />
					</button>
				</form>
			{/if}
		</div>

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
				<div class="disc-wrap" aria-hidden="true">
					<div class="disc-circle">
						<svg class="disc-grooves" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
							<defs>
								<radialGradient id="mc-disc-shine" cx="50%" cy="18%" r="55%">
									<stop offset="0%" stop-color="#ffe066" stop-opacity="0.18" />
									<stop offset="100%" stop-color="#ffe066" stop-opacity="0" />
								</radialGradient>
							</defs>
							<circle cx="100" cy="100" r="99" fill="url(#mc-disc-shine)" />
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
							style="transform: rotate({angle}deg) translateY(calc(var(--dial-r) * {NODE_R_RATIO})) rotate({-angle - rotation}deg)"
							aria-current={active ? 'page' : undefined}
							aria-label={item.label}
							disabled={animating}
							onclick={(event) => onNodeClick(event, i)}
						>
							<span class="dial-node-button">
								<Icon size={16} weight="bold" />
							</span>
							{#if active || (preview && (dragging || animating))}
								<span class="dial-node-label">{item.label}</span>
							{/if}
						</button>
					{/each}
				</div>

				<div class="dial-center" data-dial-hub>
					<a href={previewItem.href} class="dial-center-slot" aria-current="page">
						<span class="dial-center-disc" class:is-preview={dragging || animating}>
							{#if dragging || animating}
								<PreviewIcon size={22} weight="bold" />
							{:else}
								<ActiveIcon size={22} weight="bold" />
							{/if}
						</span>
						<span class="dial-center-label">
							{dragging || animating ? previewItem.label : activeItem.label}
						</span>
					</a>
				</div>
			</div>
		</div>
	</div>
</header>

<style>
	.site-header {
		--dial-r: clamp(4.5rem, 16vw, 6.5rem);
		position: fixed;
		top: 0.65rem;
		left: 0.65rem;
		z-index: 50;
		pointer-events: none;
	}

	.header-stack {
		pointer-events: auto;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.2rem;
	}

	.header-actions {
		display: flex;
		align-self: flex-end;
		gap: 0.25rem;
		margin-right: 0.15rem;
	}

	.header-action-btn {
		display: inline-flex;
		width: 1.65rem;
		height: 1.65rem;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		border: 1px solid rgb(var(--color-border));
		background: rgb(var(--color-surface-raised) / 0.92);
		color: rgb(var(--color-text-secondary));
		cursor: pointer;
		backdrop-filter: blur(6px);
	}

	.header-action-btn:hover {
		border-color: rgb(var(--color-accent));
		color: rgb(var(--color-text));
	}

	.nav-dial-panel {
		overflow: visible;
	}

	.nav-dial {
		position: relative;
		width: calc(var(--dial-r) * 2);
		height: calc(var(--dial-r) * 2);
		touch-action: none;
		user-select: none;
		cursor: grab;
	}

	.nav-dial:active {
		cursor: grabbing;
	}

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
		width: 2px;
		height: 1.25rem;
		border-radius: 9999px;
		background: linear-gradient(
			0deg,
			rgb(var(--color-accent)) 0%,
			rgb(var(--color-accent) / 0.12) 100%
		);
		box-shadow: 0 0 6px rgb(var(--color-accent) / 0.4);
	}

	.dial-rotator {
		position: absolute;
		inset: 0;
		z-index: 2;
		transform-origin: var(--dial-r) var(--dial-r);
		transition: transform 0.36s cubic-bezier(0.34, 1.25, 0.64, 1);
	}

	.nav-dial.is-dragging .dial-rotator,
	.nav-dial.is-dragging {
		cursor: grabbing;
	}

	.nav-dial.is-dragging .dial-rotator {
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

	.dial-node.is-active .dial-node-button {
		opacity: 0.42;
		border-color: rgb(var(--color-accent) / 0.45);
		background: rgb(var(--color-surface-raised) / 0.65);
		transform: scale(0.9);
		box-shadow: none;
	}

	.dial-node.is-preview:not(.is-active) .dial-node-button {
		border-color: rgb(var(--color-accent));
		background: rgb(var(--color-accent) / 0.25);
		color: rgb(var(--color-accent-hover));
		transform: scale(1.08);
		box-shadow: 0 0 12px rgb(var(--color-accent) / 0.45);
	}

	.dial-node-button {
		position: absolute;
		left: -1rem;
		top: -1rem;
		display: inline-flex;
		width: 2rem;
		height: 2rem;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		border: 2px solid rgb(var(--color-border));
		background: rgb(var(--color-surface-raised) / 0.94);
		color: rgb(var(--color-text-secondary));
		box-shadow: 0 3px 10px rgb(0 0 0 / 0.14);
		transition:
			transform 0.28s cubic-bezier(0.34, 1.2, 0.64, 1),
			background-color 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease,
			box-shadow 0.2s ease,
			opacity 0.2s ease;
	}

	.dial-node-label {
		position: absolute;
		top: 1.1rem;
		left: 50%;
		width: max-content;
		max-width: 4.5rem;
		transform: translateX(-50%);
		font-size: 0.5rem;
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
		transform: scale(1.06);
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
		gap: 0.1rem;
		transform: translate(-50%, -50%);
		cursor: default;
	}

	.dial-center-slot {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.12rem;
	}

	.dial-center-disc {
		display: inline-flex;
		width: 3rem;
		height: 3rem;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		border: 2px solid rgb(var(--color-accent));
		background: rgb(var(--color-accent));
		color: rgb(40 35 28);
		box-shadow:
			0 0 0 3px rgb(var(--color-accent) / 0.16),
			0 6px 18px rgb(var(--color-accent) / 0.38);
		transition:
			transform 0.36s cubic-bezier(0.34, 1.25, 0.64, 1),
			box-shadow 0.25s ease;
	}

	.dial-center-disc.is-preview {
		transform: scale(1.06);
		box-shadow:
			0 0 0 4px rgb(var(--color-accent) / 0.24),
			0 8px 22px rgb(var(--color-accent) / 0.48);
	}

	.dial-center-label {
		font-size: 0.55rem;
		font-weight: 900;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgb(var(--color-accent-hover));
	}

	@media (min-width: 768px) {
		.site-header {
			--dial-r: clamp(5rem, 12vw, 7rem);
			top: 0.75rem;
			left: 0.75rem;
		}

		.dial-node-button {
			width: 2.15rem;
			height: 2.15rem;
			left: -1.075rem;
			top: -1.075rem;
		}

		.dial-center-disc {
			width: 3.15rem;
			height: 3.15rem;
		}
	}
</style>
