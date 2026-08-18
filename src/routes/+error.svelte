<script lang="ts">
	import { page } from '$app/stores';
	import PageShell from '$lib/components/PageShell.svelte';
</script>

<PageShell title="Something went wrong" description="An unexpected error occurred.">
	<div class="surface-round mx-auto max-w-lg p-8 text-center">
		<p class="text-sm text-[rgb(var(--color-text-secondary))]">
			{$page.error?.message ?? 'Something went wrong. Please try again.'}
		</p>
		<a href="/" class="btn-primary mt-6 inline-flex">Back to home</a>
	</div>
</PageShell>
