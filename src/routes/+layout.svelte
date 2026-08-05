<script lang="ts">
	import SiteHeader from '$lib/components/SiteHeader.svelte';

	let { data, children } = $props();
</script>

<SiteHeader user={data.user} pathname={data.pathname} />

<main class="mx-auto max-w-7xl px-4 py-8">
	{@render children()}
</main>

<footer class="border-t border-[var(--color-border)] py-8 text-center text-xs text-slate-500">
	Media Club — a simple catalog of what you own at home.
</footer>
