<script lang="ts">
	import { browser } from '$app/environment';
	import { untrack } from 'svelte';
	import HeaderActions from './HeaderActions.svelte';
	import NavDial from './NavDial.svelte';
	import VinylDisc from './VinylDisc.svelte';
	import type { SessionUser } from '$lib/types/auth';
	import { settings } from '$lib/stores/settings.svelte';
	import { X } from 'phosphor-svelte';

	interface Props {
		user: SessionUser | null;
		pathname: string;
	}

	let { user, pathname }: Props = $props();

	const MOBILE_NAV_CLOSE_MS = 400;

	let mobileMenuOpen = $state(false);
	let overlayMounted = $state(false);
	let overlayClosing = $state(false);

	const reducedMotion = $derived(settings.motion === 'reduced');

	$effect(() => {
		void pathname;
		untrack(() => closeMobileMenu());
	});

	$effect(() => {
		if (!browser) return;
		document.body.style.overflow = overlayMounted ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});

	function openMobileMenu() {
		overlayClosing = false;
		overlayMounted = true;
		mobileMenuOpen = true;
	}

	function closeMobileMenu() {
		if (!overlayMounted || overlayClosing) return;
		overlayClosing = true;
		mobileMenuOpen = false;

		const duration = reducedMotion ? 0 : MOBILE_NAV_CLOSE_MS;
		setTimeout(() => {
			overlayMounted = false;
			overlayClosing = false;
		}, duration);
	}

	function onOverlayKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') closeMobileMenu();
	}
</script>

<svelte:window onkeydown={overlayMounted ? onOverlayKeydown : undefined} />

<!-- Desktop: fixed nav wheel (top-left) -->
<header class="site-header site-header--desktop" aria-label="Site navigation">
	<div class="header-stack">
		<div class="header-actions-slot" data-dial-hub>
			<HeaderActions showLogout={!!user} --action-btn-size="var(--nav-dial-actions-h)" />
		</div>
		<NavDial instanceId="desktop" {user} {pathname} />
	</div>
</header>

<!-- Mobile: compact actions (top-right) -->
<header class="site-header site-header--mobile" aria-label="Site actions">
	<HeaderActions showLogout={!!user} --action-btn-size="2.35rem" />
</header>

<!-- Mobile: spinning record launcher -->
<button
	type="button"
	class="mobile-nav-fab"
	class:is-open={mobileMenuOpen}
	aria-label={mobileMenuOpen ? 'Navigation menu open' : 'Open navigation menu'}
	aria-expanded={mobileMenuOpen}
	aria-controls="mobile-nav-overlay"
	disabled={mobileMenuOpen}
	onclick={openMobileMenu}
>
	<span class="mobile-nav-fab__glow" aria-hidden="true"></span>
	<span class="mobile-nav-fab__disc">
		<VinylDisc spinning class="size-full text-amber-400" />
	</span>
</button>

{#if overlayMounted}
	<div
		id="mobile-nav-overlay"
		class="mobile-nav-overlay"
		class:is-closing={overlayClosing}
		role="dialog"
		aria-modal="true"
		aria-label="Navigation menu"
	>
		<button
			type="button"
			class="mobile-nav-overlay__backdrop"
			aria-label="Close navigation menu"
			onclick={closeMobileMenu}
		></button>

		<button
			type="button"
			class="mobile-nav-overlay__close"
			aria-label="Close navigation menu"
			onclick={closeMobileMenu}
		>
			<X size={18} weight="bold" />
		</button>

		<div class="mobile-nav-overlay__content">
			<p class="mobile-nav-overlay__hint">Spin the dial or tap a destination</p>
			<NavDial instanceId="mobile" {user} {pathname} onNavigate={closeMobileMenu} />
		</div>
	</div>
{/if}

<style>
	.site-header {
		z-index: 50;
		pointer-events: none;
	}

	.site-header--desktop {
		display: none;
		position: fixed;
		top: var(--nav-dial-inset);
		left: 0;
	}

	.site-header--mobile {
		display: block;
		position: fixed;
		top: var(--nav-dial-inset);
		right: var(--nav-dial-inset);
		pointer-events: auto;
	}

	.header-stack {
		pointer-events: auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--nav-dial-stack-gap);
		width: var(--nav-dial-reserve-w);
	}

	.header-actions-slot {
		display: flex;
		justify-content: center;
		min-height: var(--nav-dial-actions-h);
	}

	.mobile-nav-fab {
		position: fixed;
		left: 50%;
		bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
		z-index: 55;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 4.25rem;
		height: 4.25rem;
		padding: 0;
		border: none;
		background: transparent;
		transform: translateX(-50%);
		cursor: pointer;
	}

	.mobile-nav-fab:is(:disabled, .is-open) {
		opacity: 0;
		pointer-events: none;
	}

	.mobile-nav-fab__glow {
		position: absolute;
		inset: -0.35rem;
		border-radius: 9999px;
		background: radial-gradient(circle, rgb(var(--color-accent) / 0.45) 0%, transparent 70%);
		animation: fab-pulse 2.4s ease-in-out infinite;
	}

	.mobile-nav-fab__disc {
		position: relative;
		display: flex;
		width: 3.75rem;
		height: 3.75rem;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		border: 2px solid rgb(var(--color-accent));
		background: rgb(var(--color-accent) / 0.18);
		box-shadow:
			0 0 0 4px rgb(var(--color-accent) / 0.12),
			0 10px 28px rgb(0 0 0 / 0.35);
		backdrop-filter: blur(8px);
	}

	.mobile-nav-overlay {
		position: fixed;
		inset: 0;
		z-index: 80;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		pointer-events: none;
	}

	.mobile-nav-overlay__backdrop {
		position: absolute;
		inset: 0;
		z-index: 0;
		border: none;
		pointer-events: auto;
		cursor: pointer;
		background: linear-gradient(
			to bottom,
			rgb(0 0 0 / 0) 0%,
			rgb(0 0 0 / 0.12) 30%,
			rgb(0 0 0 / 0.55) 55%,
			rgb(0 0 0 / 0.88) 100%
		);
		animation: mc-fade 0.35s ease-out backwards;
	}

	.mobile-nav-overlay.is-closing .mobile-nav-overlay__backdrop {
		animation: mc-fade-out 0.35s ease-in forwards;
	}

	.mobile-nav-overlay__close {
		position: absolute;
		top: calc(0.85rem + env(safe-area-inset-top, 0px));
		right: calc(0.85rem + env(safe-area-inset-right, 0px));
		z-index: 2;
		display: inline-flex;
		width: 2.25rem;
		height: 2.25rem;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		border: 1px solid rgb(var(--color-accent) / 0.45);
		background: rgb(0 0 0 / 0.35);
		color: rgb(var(--color-accent));
		backdrop-filter: blur(8px);
		cursor: pointer;
		pointer-events: auto;
	}

	.mobile-nav-overlay__content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		width: min(100%, 22rem);
		padding: 0 1rem 1.5rem;
		padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
		pointer-events: auto;
		--nav-dial-r: clamp(6.25rem, 30vw, 7.75rem);
		--nav-dial-size: calc(var(--nav-dial-r) * 2);
		animation: mc-slide-up-bottom 0.5s cubic-bezier(0.22, 1, 0.36, 1) backwards;
	}

	.mobile-nav-overlay.is-closing .mobile-nav-overlay__content {
		animation: mc-slide-down-bottom 0.4s cubic-bezier(0.55, 0, 1, 0.45) forwards;
	}

	.mobile-nav-overlay__hint {
		margin: 0;
		font-size: 0.65rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgb(var(--color-accent) / 0.9);
		text-shadow: 0 1px 10px rgb(0 0 0 / 0.65);
	}

	@keyframes fab-pulse {
		0%,
		100% {
			opacity: 0.55;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.08);
		}
	}

	@media (min-width: 768px) {
		.site-header--desktop {
			display: block;
		}

		.site-header--mobile,
		.mobile-nav-fab,
		.mobile-nav-overlay {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.mobile-nav-fab__glow {
			animation: none;
		}

		.mobile-nav-overlay__backdrop,
		.mobile-nav-overlay__content,
		.mobile-nav-overlay.is-closing .mobile-nav-overlay__backdrop,
		.mobile-nav-overlay.is-closing .mobile-nav-overlay__content {
			animation-duration: 0.01ms;
			animation-delay: 0ms;
		}
	}

	:global([data-motion='reduced']) .mobile-nav-fab__glow {
		animation: none;
	}

	:global([data-motion='reduced']) .mobile-nav-overlay__backdrop,
	:global([data-motion='reduced']) .mobile-nav-overlay__content,
	:global([data-motion='reduced']) .mobile-nav-overlay.is-closing .mobile-nav-overlay__backdrop,
	:global([data-motion='reduced']) .mobile-nav-overlay.is-closing .mobile-nav-overlay__content {
		animation-duration: 0.01ms;
		animation-delay: 0ms;
	}
</style>
