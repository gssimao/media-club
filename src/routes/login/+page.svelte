<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
	import CircularTextInput from '$lib/components/CircularTextInput.svelte';

	let { form } = $props();
</script>

<svelte:head>
	<title>Log in · Media Club</title>
</svelte:head>

<PageShell
	title="Admin login"
	description="Only the site admin can add, edit, or remove items. Everyone else can browse the catalog."
>
	<form method="POST" class="surface-round mx-auto max-w-md space-y-6 p-8">
		{#if form?.message}
			<div
				class="rounded-[2rem] border border-red-400 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-300"
			>
				{form.message}
			</div>
		{/if}

		<div class="flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
			<CircularTextInput
				name="username"
				label="Username"
				autocomplete="username"
				placeholder="Username"
				required
			/>
			<CircularTextInput
				name="password"
				label="Password"
				type="password"
				autocomplete="current-password"
				placeholder="Password"
				required
			/>
		</div>

		<button type="submit" class="btn-primary w-full justify-center py-3">Log in</button>
	</form>
</PageShell>
