<script lang="ts">
	import CircularTextInput from '$lib/components/CircularTextInput.svelte';
	import { SignIn } from 'phosphor-svelte';

	let { form } = $props();
</script>

<svelte:head>
	<title>Log in · Media Club</title>
</svelte:head>

<section class="mx-auto max-w-md space-y-6">
	<div class="text-center">
		<div class="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-amber-400">
			<SignIn size={32} weight="bold" class="text-stone-900" />
		</div>
		<h1 class="mt-4 text-3xl font-black text-stone-900 uppercase dark:text-amber-50">
			Admin login
		</h1>
		<p class="mt-2 text-sm font-medium text-stone-700 dark:text-stone-300">
			Only the site admin can add, edit, or remove items. Everyone else can browse the catalog.
		</p>
	</div>

	<form method="POST" class="surface-round space-y-6 p-8">
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
</section>
