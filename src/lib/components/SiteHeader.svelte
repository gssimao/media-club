<script lang="ts">
	import { Film, BookOpen, Disc3, Heart, LogIn, LogOut, Settings } from '@lucide/svelte';
	import NavLink from './NavLink.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	import type { AdminUser } from '$lib/server/db/schema';

	interface Props {
		user: AdminUser | null;
		pathname: string;
	}

	let { user, pathname }: Props = $props();

	const categories = [
		{ href: '/movies', label: 'Movies', icon: Film },
		{ href: '/music', label: 'Music', icon: Disc3 },
		{ href: '/books', label: 'Books', icon: BookOpen }
	] as const;
</script>

<header
	class="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-black/80"
	style="border-color: rgb(var(--color-border));"
>
	<div class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3">
		<a
			href="/"
			class="flex items-center gap-2.5 text-lg font-semibold tracking-tight transition-colors hover:text-blue-500"
		>
			<div class="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-1.5">
				<Film class="size-4 text-white" />
			</div>
			<span>Media Club</span>
		</a>

		<nav class="hidden items-center gap-1 md:flex" aria-label="Main">
			{#each categories as category (category.href)}
				{@const Icon = category.icon}
				<NavLink href={category.href} active={pathname.startsWith(category.href)}>
					<span class="inline-flex items-center gap-1.5">
						<Icon class="size-4" />
						{category.label}
					</span>
				</NavLink>
			{/each}

			<NavLink href="/wishlist/movies" active={pathname.startsWith('/wishlist')}>
				<span class="inline-flex items-center gap-1.5">
					<Heart class="size-4" />
					Wishlists
				</span>
			</NavLink>
		</nav>

		<div class="flex items-center gap-2">
			<ThemeToggle />

			{#if user}
				<NavLink href="/admin" active={pathname.startsWith('/admin')}>
					<span class="inline-flex items-center gap-1.5">
						<Settings class="size-4" />
						<span class="hidden sm:inline">Admin</span>
					</span>
				</NavLink>
				<form method="POST" action="/logout">
					<button
						type="submit"
						class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
						style="color: rgb(var(--color-text-secondary));"
					>
						<LogOut class="size-4" />
						<span class="hidden sm:inline">Log out</span>
					</button>
				</form>
			{:else}
				<NavLink href="/login" active={pathname === '/login'}>
					<span class="inline-flex items-center gap-1.5">
						<LogIn class="size-4" />
						<span class="hidden sm:inline">Log in</span>
					</span>
				</NavLink>
			{/if}
		</div>
	</div>

	<!-- Mobile navigation -->
	<nav
		class="flex items-center gap-1 overflow-x-auto border-t px-4 py-2 md:hidden"
		style="border-color: rgb(var(--color-border));"
		aria-label="Mobile navigation"
	>
		{#each categories as category (category.href)}
			{@const Icon = category.icon}
			<a
				href={category.href}
				class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm whitespace-nowrap transition-colors {pathname.startsWith(
					category.href
				)
					? 'bg-blue-50 font-medium text-blue-600 dark:bg-blue-950 dark:text-blue-400'
					: 'hover:bg-slate-100 dark:hover:bg-slate-800'}"
				style="color: {pathname.startsWith(category.href)
					? ''
					: 'rgb(var(--color-text-secondary))'}"
			>
				<Icon class="size-4" />
				{category.label}
			</a>
		{/each}
		<a
			href="/wishlist/movies"
			class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm whitespace-nowrap transition-colors {pathname.startsWith(
				'/wishlist'
			)
				? 'bg-blue-50 font-medium text-blue-600 dark:bg-blue-950 dark:text-blue-400'
				: 'hover:bg-slate-100 dark:hover:bg-slate-800'}"
			style="color: {pathname.startsWith('/wishlist') ? '' : 'rgb(var(--color-text-secondary))'}"
		>
			<Heart class="size-4" />
			Wishlists
		</a>
	</nav>
</header>
