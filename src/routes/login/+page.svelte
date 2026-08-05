<script lang="ts">
	import { LogIn } from '@lucide/svelte';

	let { form } = $props();
</script>

<svelte:head>
	<title>Log in · Media Club</title>
</svelte:head>

<section class="mx-auto max-w-md space-y-6">
	<div class="text-center">
		<div class="mx-auto inline-flex rounded-2xl bg-blue-50 p-4 dark:bg-blue-950">
			<LogIn class="size-8 text-blue-600 dark:text-blue-400" />
		</div>
		<h1 class="mt-4 text-3xl font-bold text-slate-900 dark:text-white">Admin login</h1>
		<p class="mt-2 text-sm text-slate-600 dark:text-zinc-400">
			Only the site admin can add, edit, or remove items. Everyone else can browse the catalog.
		</p>
	</div>

	<form
		method="POST"
		class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
	>
		{#if form?.message}
			<div
				class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
			>
				{form.message}
			</div>
		{/if}

		<label class="block space-y-2 text-sm">
			<span class="font-medium text-slate-700 dark:text-zinc-300">Username</span>
			<input
				name="username"
				autocomplete="username"
				class="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-blue-500"
				required
			/>
		</label>

		<label class="block space-y-2 text-sm">
			<span class="font-medium text-slate-700 dark:text-zinc-300">Password</span>
			<input
				type="password"
				name="password"
				autocomplete="current-password"
				class="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-blue-500"
				required
			/>
		</label>

		<button
			type="submit"
			class="w-full rounded-lg bg-blue-500 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/40"
		>
			Log in
		</button>
	</form>
</section>
