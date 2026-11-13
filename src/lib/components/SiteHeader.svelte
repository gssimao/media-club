<script lang="ts">
	import { untrack } from 'svelte';
	import { X } from 'phosphor-svelte';
	import HeaderActions from './HeaderActions.svelte';
	import NavDial from './NavDial.svelte';
	import VinylDisc from './VinylDisc.svelte';
	import { modal } from '$lib/utils/modal';
	import type { SessionUser } from '$lib/types/auth';
	let { user, pathname }: { user: SessionUser | null; pathname: string } = $props();
	let open = $state(false);
	const home = $derived(pathname === '/');
	$effect(() => {
		void pathname;
		untrack(() => {
			open = false;
		});
	});
</script>

{#if home}
	<header class="home-actions" aria-label="Site actions">
		<HeaderActions showLogout={!!user} />
	</header>
{:else}
	<header class="wheel-sidebar" aria-label="Site navigation">
		<a href="/" class="brand">Media Club<span>.</span></a>
		<div class="sidebar-actions"><HeaderActions showLogout={!!user} /></div>
		<NavDial instanceId="desktop" {user} {pathname} />
		<p class="dial-hint">Spin the dial or tap a destination</p>
	</header>
	<header class="compact-header" aria-label="Site actions">
		<a href="/" class="brand">Media Club<span>.</span></a><HeaderActions showLogout={!!user} />
	</header>
	<button
		class="wheel-launcher"
		type="button"
		aria-label="Open navigation wheel"
		aria-haspopup="dialog"
		aria-expanded={open}
		aria-controls="navigation-wheel"
		onclick={(event) => {
			// Safari does not focus buttons on a pointer click. Give the modal a
			// reliable trigger to return focus to when it closes.
			event.currentTarget.focus({ preventScroll: true });
			open = true;
		}}
	>
		<VinylDisc class="launcher-record" /><span>Navigate</span>
	</button>
{/if}
{#if open}
	<div
		id="navigation-wheel"
		class="wheel-overlay anim-fade"
		role="dialog"
		aria-modal="true"
		aria-labelledby="wheel-title"
		{@attach modal({
			onEscape: () => {
				open = false;
			}
		})}
	>
		<button
			class="wheel-backdrop"
			type="button"
			tabindex="-1"
			aria-label="Close navigation wheel"
			onclick={() => {
				open = false;
			}}
		></button>
		<section class="wheel-sheet anim-rise">
			<div class="sheet-heading">
				<h2 id="wheel-title">Media Club</h2>
				<button
					type="button"
					class="icon-button"
					aria-label="Close navigation wheel"
					onclick={() => {
						open = false;
					}}><X size={22} /></button
				>
			</div>
			<NavDial
				instanceId="mobile"
				{user}
				{pathname}
				onNavigate={() => {
					open = false;
				}}
			/>
			<p class="dial-hint">Spin the dial or tap a destination</p>
		</section>
	</div>
{/if}

<style>
	.brand {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		color: rgb(var(--color-text));
		font-size: 1.125rem;
		font-weight: 650;
		letter-spacing: -0.05em;
	}
	.brand span {
		color: rgb(var(--color-accent));
	}
	.home-actions {
		position: absolute;
		z-index: 50;
		top: max(0.75rem, env(safe-area-inset-top));
		right: max(1rem, env(safe-area-inset-right));
	}
	.wheel-sidebar {
		position: fixed;
		top: 1.5rem;
		left: 1rem;
		z-index: 50;
		width: 17rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.sidebar-actions {
		margin: 0.6rem 0 1.5rem;
	}
	.dial-hint {
		margin: 1.4rem 0 0;
		text-align: center;
		font-size: 0.6875rem;
		line-height: 1.5;
		color: rgb(var(--color-text-tertiary));
	}
	.compact-header,
	.wheel-launcher {
		display: none;
	}
	.wheel-overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: max(0.75rem, env(safe-area-inset-top)) max(0.75rem, env(safe-area-inset-right))
			max(0.75rem, env(safe-area-inset-bottom)) max(0.75rem, env(safe-area-inset-left));
	}
	.wheel-backdrop {
		position: absolute;
		inset: 0;
		background: rgb(var(--color-bg) / 0.88);
		border: 0;
	}
	.wheel-sheet {
		position: relative;
		width: min(100%, 24rem);
		max-height: calc(100dvh - 1.5rem);
		overflow-y: auto;
		border: 1px solid rgb(var(--color-border));
		border-radius: 2rem;
		padding: 1rem 1rem 1.75rem;
		background: rgb(var(--color-surface));
		box-shadow: 0 18px 60px rgb(0 0 0/0.2);
		--nav-dial-size: min(17rem, calc(100vw - 5rem));
		--nav-dial-r: calc(var(--nav-dial-size)/2);
	}
	.sheet-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.25rem;
		padding-left: 0.75rem;
	}
	h2 {
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: -0.02em;
	}
	@media (max-width: 1099px) {
		.wheel-sidebar {
			display: none;
		}
		.compact-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 0.5rem;
			padding: max(0.75rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) 0.25rem
				max(1rem, env(safe-area-inset-left));
		}
		.wheel-launcher {
			position: fixed;
			z-index: 60;
			left: 50%;
			bottom: max(0.8rem, env(safe-area-inset-bottom));
			transform: translateX(-50%);
			display: flex;
			align-items: center;
			gap: 0.55rem;
			min-height: 60px;
			padding: 0.4rem 1rem 0.4rem 0.4rem;
			border-radius: 999px;
			border: 1px solid rgb(var(--color-accent) / 0.5);
			background: rgb(var(--color-surface-raised));
			color: rgb(var(--color-text-secondary));
			box-shadow: 0 6px 24px rgb(0 0 0/0.2);
			font-size: 0.75rem;
			cursor: pointer;
		}
		.wheel-launcher :global(.launcher-record) {
			width: 44px;
			height: 44px;
		}
	}
	@media (max-height: 520px) {
		.wheel-overlay {
			align-items: flex-start;
		}
	}
</style>
