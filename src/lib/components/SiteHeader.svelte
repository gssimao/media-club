<script lang="ts">
	import { Film, BookOpen, Disc3, Heart, Home, LogIn, LogOut, Settings } from '@lucide/svelte';
	import NavLink from './NavLink.svelte';
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
	class="border-b border-[var(--color-border)] bg-[var(--color-surface-raised)]/80 backdrop-blur"
>
	<div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
		<a href="/" class="flex items-center gap-2 text-lg font-semibold tracking-tight">
			<Home class="size-5 text-indigo-400" />
			Media Club
		</a>

		<nav class="flex flex-wrap items-center gap-1" aria-label="Main">
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
			{#if user}
				<NavLink href="/admin" active={pathname.startsWith('/admin')}>
					<span class="inline-flex items-center gap-1.5">
						<Settings class="size-4" />
						Admin
					</span>
				</NavLink>
				<form method="POST" action="/logout">
					<button
						type="submit"
						class="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
					>
						<LogOut class="size-4" />
						Log out
					</button>
				</form>
			{:else}
				<NavLink href="/login" active={pathname === '/login'}>
					<span class="inline-flex items-center gap-1.5">
						<LogIn class="size-4" />
						Log in
					</span>
				</NavLink>
			{/if}
		</div>
	</div>
</header>
