<script lang="ts">
	import { LogIn } from '@lucide/svelte';

	let { form } = $props();
</script>

<svelte:head>
	<title>Log in · Media Club</title>
</svelte:head>

<section class="mx-auto max-w-md space-y-6">
	<div class="text-center">
		<div class="mx-auto inline-flex rounded bg-amber-400 p-4">
			<LogIn class="size-8 text-stone-900" strokeWidth={3} />
		</div>
		<h1 class="mt-4 text-3xl font-black text-stone-900 uppercase dark:text-amber-50">
			Admin login
		</h1>
		<p class="mt-2 text-sm font-medium text-stone-700 dark:text-stone-300">
			Only the site admin can add, edit, or remove items. Everyone else can browse the catalog.
		</p>
	</div>

	<form
		method="POST"
		class="space-y-4 rounded border-2 border-stone-300 bg-white p-6 dark:border-stone-700 dark:bg-stone-800"
	>
		{#if form?.message}
			<div
				class="rounded border-2 border-red-400 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-300"
			>
				{form.message}
			</div>
		{/if}

		<label class="block space-y-2 text-sm">
			<span class="font-bold text-stone-700 dark:text-stone-300">Username</span>
			<input
				name="username"
				autocomplete="username"
				class="w-full rounded border-2 border-stone-300 bg-white px-4 py-2.5 font-medium text-stone-900 transition-colors focus:border-amber-400 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-white dark:focus:border-amber-500"
				required
			/>
		</label>

		<label class="block space-y-2 text-sm">
			<span class="font-bold text-stone-700 dark:text-stone-300">Password</span>
			<input
				type="password"
				name="password"
				autocomplete="current-password"
				class="w-full rounded border-2 border-stone-300 bg-white px-4 py-2.5 font-medium text-stone-900 transition-colors focus:border-amber-400 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-white dark:focus:border-amber-500"
				required
			/>
		</label>

		<button
			type="submit"
			class="w-full rounded border-2 border-amber-500 bg-amber-400 px-4 py-3 font-black text-stone-900 uppercase transition-all hover:bg-amber-500"
		>
			Log in
		</button>
	</form>
</section>
