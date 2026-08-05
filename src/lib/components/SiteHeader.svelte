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
	class="sticky top-0 z-50 border-b-4 border-amber-400 bg-white dark:border-amber-500 dark:bg-stone-800"
>
	<div class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4">
		<a
			href="/"
			class="flex items-center gap-3 text-xl font-black tracking-tight uppercase transition-colors hover:text-amber-500"
		>
			<div
				class="flex items-center justify-center rounded bg-gradient-to-br from-amber-400 to-amber-500 p-2"
			>
				<Film class="size-6 text-white" strokeWidth={3} />
			</div>
			<span class="text-stone-900 dark:text-amber-50">Media Club</span>
		</a>

		<nav class="hidden items-center gap-2 md:flex" aria-label="Main">
			{#each categories as category (category.href)}
				{@const Icon = category.icon}
				<NavLink href={category.href} active={pathname.startsWith(category.href)}>
					<span class="inline-flex items-center gap-1.5">
						<Icon class="size-4" strokeWidth={2.5} />
						{category.label}
					</span>
				</NavLink>
			{/each}

			<NavLink href="/wishlist/movies" active={pathname.startsWith('/wishlist')}>
				<span class="inline-flex items-center gap-1.5">
					<Heart class="size-4" strokeWidth={2.5} />
					Wishlists
				</span>
			</NavLink>
		</nav>

		<div class="flex items-center gap-2">
			<ThemeToggle />

			{#if user}
				<NavLink href="/admin" active={pathname.startsWith('/admin')}>
					<span class="inline-flex items-center gap-1.5">
						<Settings class="size-4" strokeWidth={2.5} />
						<span class="hidden sm:inline">Admin</span>
					</span>
				</NavLink>
				<form method="POST" action="/logout">
					<button
						type="submit"
						class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold tracking-wide uppercase transition-colors hover:bg-stone-100 dark:hover:bg-stone-700"
						style="color: rgb(var(--color-text-secondary));"
					>
						<LogOut class="size-4" strokeWidth={2.5} />
						<span class="hidden sm:inline">Log out</span>
					</button>
				</form>
			{:else}
				<NavLink href="/login" active={pathname === '/login'}>
					<span class="inline-flex items-center gap-1.5">
						<LogIn class="size-4" strokeWidth={2.5} />
						<span class="hidden sm:inline">Log in</span>
					</span>
				</NavLink>
			{/if}
		</div>
	</div>

	<!-- Mobile navigation -->
	<nav
		class="flex items-center gap-1 overflow-x-auto border-t-2 border-amber-200 bg-amber-50 px-4 py-2 md:hidden dark:border-stone-700 dark:bg-stone-900"
		aria-label="Mobile navigation"
	>
		{#each categories as category (category.href)}
			{@const Icon = category.icon}
			<a
				href={category.href}
				class="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-semibold whitespace-nowrap uppercase transition-colors {pathname.startsWith(
					category.href
				)
					? 'bg-amber-400 text-stone-900'
					: 'text-stone-700 hover:bg-amber-100 dark:text-stone-300 dark:hover:bg-stone-800'}"
			>
				<Icon class="size-4" strokeWidth={2.5} />
				{category.label}
			</a>
		{/each}
		<a
			href="/wishlist/movies"
			class="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-semibold whitespace-nowrap uppercase transition-colors {pathname.startsWith(
				'/wishlist'
			)
				? 'bg-amber-400 text-stone-900'
				: 'text-stone-700 hover:bg-amber-100 dark:text-stone-300 dark:hover:bg-stone-800'}"
		>
			<Heart class="size-4" strokeWidth={2.5} />
			Wishlists
		</a>
	</nav>
</header>
