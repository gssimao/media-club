<script lang="ts">
	import { browser } from '$app/environment';
	import HeaderActions from './HeaderActions.svelte';
	import NavDial from './NavDial.svelte';
	import VinylDisc from './VinylDisc.svelte';
	import type { SessionUser } from '$lib/types/auth';
	import { X } from 'phosphor-svelte';

	interface Props {
		user: SessionUser | null;
		pathname: string;
	}

	let { user, pathname }: Props = $props();

	let mobileMenuOpen = $state(false);

	$effect(() => {
		pathname;
		mobileMenuOpen = false;
	});

	$effect(() => {
		if (!browser) return;
		document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});

	function openMobileMenu() {
		mobileMenuOpen = true;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

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

{#if mobileMenuOpen}
	<div
		id="mobile-nav-overlay"
		class="mobile-nav-overlay anim-fade"
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

		<div class="mobile-nav-overlay__panel anim-rise">
			<button
				type="button"
				class="mobile-nav-overlay__close"
				aria-label="Close navigation menu"
				onclick={closeMobileMenu}
			>
				<X size={18} weight="bold" />
			</button>
			<p class="mobile-nav-overlay__hint">Spin the dial or tap a destination</p>
			<NavDial
				instanceId="mobile"
				{user}
				{pathname}
				onNavigate={closeMobileMenu}
			/>
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
		left: var(--nav-dial-inset);
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
		align-items: flex-start;
		gap: var(--nav-dial-stack-gap);
	}

	.header-actions-slot {
		display: flex;
		align-self: flex-end;
		margin-right: 0.15rem;
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
		align-items: center;
		justify-content: center;
		padding: 1.25rem;
		padding-bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
	}

	.mobile-nav-overlay__backdrop {
		position: absolute;
		inset: 0;
		border: none;
		background: rgb(0 0 0 / 0.62);
		backdrop-filter: blur(6px);
		cursor: pointer;
	}

	.mobile-nav-overlay__panel {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		width: min(100%, 22rem);
		padding: 1.25rem 1rem 1.5rem;
		border-radius: 2rem;
		border: 2px solid rgb(var(--color-accent) / 0.35);
		background: rgb(var(--color-surface) / 0.88);
		box-shadow: 0 24px 60px rgb(0 0 0 / 0.45);
		backdrop-filter: blur(14px);
		--nav-dial-r: clamp(6.25rem, 30vw, 7.75rem);
		--nav-dial-size: calc(var(--nav-dial-r) * 2);
	}

	.mobile-nav-overlay__close {
		position: absolute;
		top: 0.85rem;
		right: 0.85rem;
		display: inline-flex;
		width: 2rem;
		height: 2rem;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		border: 1px solid rgb(var(--color-border));
		background: rgb(var(--color-surface-raised) / 0.9);
		color: rgb(var(--color-text-secondary));
		cursor: pointer;
	}

	.mobile-nav-overlay__hint {
		margin: 0;
		padding-top: 0.25rem;
		font-size: 0.65rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgb(var(--color-text-secondary));
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
	}

	:global([data-motion='reduced']) .mobile-nav-fab__glow {
		animation: none;
	}
</style>
