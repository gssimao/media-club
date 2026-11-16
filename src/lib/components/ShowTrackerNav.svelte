<script lang="ts">
	import NavLink from './NavLink.svelte';
	let { completed = false, count = 0 }: { completed?: boolean; count?: number } = $props();
</script>

<nav class="mb-6 flex flex-wrap gap-2" aria-label="Show tracker sections">
	<NavLink href="/shows/watching" active={!completed}>Watching & coming up</NavLink>
	<NavLink href="/shows/watching/completed" active={completed}
		>Completed watch <span class="tabular-nums">{count}</span></NavLink
	>
</nav>
