<script lang="ts">
	let { form } = $props();
</script>

<svelte:head>
	<title>Log in · Media Club</title>
</svelte:head>

<section class="mx-auto max-w-md space-y-6">
	<div>
		<h1 class="text-3xl font-semibold">Admin login</h1>
		<p class="mt-2 text-sm text-slate-400">
			Only the site admin can add, edit, or remove items. Everyone else can browse the lists.
		</p>
	</div>

	<form
		method="POST"
		class="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6"
	>
		{#if form?.message}
			<p class="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{form.message}</p>
		{/if}

		<label class="block space-y-2 text-sm">
			<span>Username</span>
			<input
				name="username"
				autocomplete="username"
				class="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
				required
			/>
		</label>

		<label class="block space-y-2 text-sm">
			<span>Password</span>
			<input
				type="password"
				name="password"
				autocomplete="current-password"
				class="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
				required
			/>
		</label>

		<button
			type="submit"
			class="w-full rounded-lg bg-indigo-500 px-4 py-2.5 font-medium text-white hover:bg-indigo-400"
		>
			Log in
		</button>
	</form>
</section>
