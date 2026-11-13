<script lang="ts">
	import { untrack } from 'svelte';
	import {
		BookOpen,
		DotsThree,
		FilmStrip,
		Heart,
		House,
		MonitorPlay,
		SignIn,
		SignOut,
		SlidersHorizontal,
		UserGear,
		VinylRecord,
		X
	} from 'phosphor-svelte';
	import HeaderActions from './HeaderActions.svelte';
	import type { SessionUser } from '$lib/types/auth';
	import { modal } from '$lib/utils/modal';
	let { user, pathname }: { user: SessionUser | null; pathname: string } = $props();
	let menuOpen = $state(false);
	const destinations = [
		{ href: '/', label: 'Home', icon: House, category: '' },
		{ href: '/movies', label: 'Movies', icon: FilmStrip, category: 'movie' },
		{ href: '/shows', label: 'Shows', icon: MonitorPlay, category: 'show' },
		{ href: '/music', label: 'Music', icon: VinylRecord, category: 'music' },
		{ href: '/books', label: 'Books', icon: BookOpen, category: 'book' }
	];
	function isCurrent(item: (typeof destinations)[number]) {
		return (
			pathname === item.href ||
			(item.href !== '/' &&
				(pathname.startsWith(item.href + '/') ||
					pathname === '/albums/' + item.category ||
					pathname.startsWith('/albums/' + item.category + '/')))
		);
	}
	$effect(() => {
		void pathname;
		untrack(() => {
			menuOpen = false;
		});
	});
</script>

<header class="site-header">
	<div class="site-header__inner">
		<a href="/" class="brand" aria-label="Media Club home"
			><FilmStrip size={24} weight="regular" /><span
				>media club<span class="brand-dot">.</span></span
			></a
		>
		<nav class="desktop-nav" aria-label="Main navigation">
			{#each destinations.slice(1) as item (item.href)}
				<a href={item.href} aria-current={isCurrent(item) ? 'page' : undefined}>{item.label}</a>
			{/each}
			<a
				href="/wishlist/movies"
				aria-current={pathname.startsWith('/wishlist') ? 'page' : undefined}>Wishlist</a
			>
		</nav>
		<div class="site-header__actions">
			<HeaderActions showSettings={false} />
			<button
				class="icon-button"
				type="button"
				aria-label="More navigation"
				aria-expanded={menuOpen}
				aria-controls="more-navigation"
				onclick={() => {
					menuOpen = true;
				}}><DotsThree size={24} weight="bold" /></button
			>
		</div>
	</div>
</header>

<nav class="mobile-tabs" aria-label="Main navigation">
	{#each destinations as item (item.href)}
		{@const Icon = item.icon}
		<a href={item.href} aria-current={isCurrent(item) ? 'page' : undefined}
			><Icon size={22} weight={isCurrent(item) ? 'fill' : 'regular'} /><span>{item.label}</span></a
		>
	{/each}
</nav>

{#if menuOpen}
	<div
		class="navigation-overlay anim-fade"
		role="dialog"
		aria-modal="true"
		aria-labelledby="navigation-title"
		id="more-navigation"
		{@attach modal({
			onEscape: () => {
				menuOpen = false;
			}
		})}
	>
		<button
			class="navigation-backdrop"
			type="button"
			tabindex="-1"
			aria-label="Close navigation"
			onclick={() => {
				menuOpen = false;
			}}
		></button>
		<section class="navigation-panel surface-round anim-rise">
			<div class="navigation-heading">
				<h2 id="navigation-title">Your Media Club</h2>
				<button
					class="icon-button"
					type="button"
					aria-label="Close navigation"
					onclick={() => {
						menuOpen = false;
					}}><X size={20} /></button
				>
			</div>
			<nav aria-label="More destinations">
				<a
					href="/wishlist/movies"
					onclick={() => {
						menuOpen = false;
					}}><Heart size={21} />Wishlist</a
				>
				<a
					href="/settings"
					onclick={() => {
						menuOpen = false;
					}}><SlidersHorizontal size={21} />Settings</a
				>
				{#if user}
					<a
						href="/admin"
						onclick={() => {
							menuOpen = false;
						}}><UserGear size={21} />Admin</a
					>
					<form method="POST" action="/logout">
						<button type="submit"><SignOut size={21} />Log out</button>
					</form>
				{:else}
					<a
						href="/login"
						onclick={() => {
							menuOpen = false;
						}}><SignIn size={21} />Admin login</a
					>
				{/if}
			</nav>
		</section>
	</div>
{/if}

<style>
	.site-header {
		position: sticky;
		top: 0;
		z-index: 50;
		border-bottom: 1px solid rgb(var(--color-border) / 0.65);
		background: rgb(var(--color-bg) / 0.88);
		-webkit-backdrop-filter: blur(20px);
		backdrop-filter: blur(20px);
	}
	.site-header__inner {
		max-width: 90rem;
		margin: auto;
		min-height: 4.5rem;
		padding: env(safe-area-inset-top, 0px) max(1.25rem, env(safe-area-inset-right)) 0
			max(1.25rem, env(safe-area-inset-left));
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
	}
	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.65rem;
		min-height: 44px;
		white-space: nowrap;
		font-size: 1.25rem;
		font-weight: 650;
		letter-spacing: -0.055em;
	}
	.brand-dot {
		color: rgb(var(--color-accent));
	}
	.desktop-nav {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
	.desktop-nav a {
		padding: 0.75rem 1rem;
		border-radius: 0.75rem;
		color: rgb(var(--color-text-secondary));
		font-size: 0.875rem;
		font-weight: 550;
	}
	.desktop-nav a:hover,
	.desktop-nav a[aria-current] {
		color: rgb(var(--color-text));
		background: rgb(var(--color-surface-raised));
	}
	.site-header__actions {
		display: flex;
		gap: 0.25rem;
	}
	.mobile-tabs {
		display: none;
	}
	.navigation-overlay {
		position: fixed;
		inset: 0;
		z-index: 80;
		display: flex;
		align-items: flex-start;
		justify-content: flex-end;
		padding: 5.5rem 1.5rem 1.5rem;
	}
	.navigation-backdrop {
		position: absolute;
		inset: 0;
		border: 0;
		background: rgb(0 0 0 / 0.45);
		backdrop-filter: blur(8px);
	}
	.navigation-panel {
		position: relative;
		width: min(100%, 23rem);
		padding: 1rem;
		box-shadow: 0 24px 80px rgb(0 0 0 / 0.25);
	}
	.navigation-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0 0.25rem 0.75rem 0.75rem;
	}
	h2 {
		font-size: 1rem;
		font-weight: 600;
	}
	.navigation-panel nav a,
	.navigation-panel nav button {
		display: flex;
		width: 100%;
		min-height: 52px;
		align-items: center;
		gap: 0.9rem;
		padding: 0.75rem;
		border: 0;
		border-radius: 0.75rem;
		background: transparent;
		text-align: left;
		color: rgb(var(--color-text-secondary));
		cursor: pointer;
	}
	.navigation-panel nav a:hover,
	.navigation-panel nav button:hover {
		background: rgb(var(--color-surface));
		color: rgb(var(--color-text));
	}
	@media (max-width: 767px) {
		.site-header__inner {
			min-height: 4rem;
			gap: 0.5rem;
			padding-inline: max(1rem, env(safe-area-inset-left));
		}
		.desktop-nav {
			display: none;
		}
		.mobile-tabs {
			position: fixed;
			z-index: 55;
			left: 0;
			right: 0;
			bottom: 0;
			display: grid;
			grid-template-columns: repeat(5, minmax(0, 1fr));
			padding: 0.5rem max(0.5rem, env(safe-area-inset-right))
				max(0.5rem, env(safe-area-inset-bottom)) max(0.5rem, env(safe-area-inset-left));
			border-top: 1px solid rgb(var(--color-border) / 0.7);
			background: rgb(var(--color-surface) / 0.94);
			-webkit-backdrop-filter: blur(20px);
			backdrop-filter: blur(20px);
		}
		.mobile-tabs a {
			display: flex;
			min-height: 48px;
			align-items: center;
			justify-content: center;
			flex-direction: column;
			gap: 0.3rem;
			border-radius: 0.8rem;
			color: rgb(var(--color-text-tertiary));
			font-size: 0.65rem;
			font-weight: 550;
		}
		.mobile-tabs a[aria-current] {
			color: rgb(var(--color-text));
			background: rgb(var(--color-accent) / 0.12);
		}
		.navigation-overlay {
			align-items: flex-end;
			padding: 0.75rem 0.75rem max(0.75rem, env(safe-area-inset-bottom));
		}
		.navigation-panel {
			width: 100%;
			max-height: 85dvh;
			overflow-y: auto;
		}
	}
	@media (min-width: 1024px) {
		.site-header__inner {
			padding-inline: 3rem;
		}
	}
</style>
