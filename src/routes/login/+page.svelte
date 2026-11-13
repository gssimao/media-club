<script lang="ts">
	import PageShell from '$lib/components/PageShell.svelte';
	let { form } = $props();
</script>

<svelte:head><title>Log in · Media Club</title></svelte:head>
<PageShell
	title="Welcome back"
	description="Log in to manage your collection. Everyone is welcome to browse."
>
	<form method="POST" class="surface-round mx-auto w-full max-w-md space-y-6 p-6 sm:p-8">
		{#if form?.message}<p
				role="alert"
				class="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300"
			>
				{form.message}
			</p>{/if}
		<div class="space-y-2">
			<label for="username" class="block text-sm font-medium">Username</label><input
				id="username"
				name="username"
				autocomplete="username"
				class="input-round w-full"
				required
			/>
		</div>
		<div class="space-y-2">
			<label for="password" class="block text-sm font-medium">Password</label><input
				id="password"
				name="password"
				type="password"
				autocomplete="current-password"
				class="input-round w-full"
				required
			/>
		</div>
		<button type="submit" class="btn-primary w-full">Log in</button>
		<a
			href="/movies"
			class="flex min-h-11 items-center justify-center text-sm text-[rgb(var(--color-text-secondary))]"
			>Continue browsing</a
		>
	</form>
</PageShell>
