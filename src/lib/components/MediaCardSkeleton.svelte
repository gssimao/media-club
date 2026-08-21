<script lang="ts">
	interface Props {
		isAdmin?: boolean;
	}

	let { isAdmin = false }: Props = $props();
</script>

<article class="mx-auto flex h-full w-full max-w-[15rem] flex-col items-center" aria-hidden="true">
	<div class="mb-1 flex min-h-7 w-full items-center justify-between px-0.5">
		<span class="skeleton h-3.5 w-10 rounded-full"></span>
		{#if isAdmin}
			<span class="skeleton size-7 rounded-full"></span>
		{/if}
	</div>

	<div
		class="skeleton-disc aspect-square w-full max-w-[13rem] rounded-full border-2 border-[rgb(var(--color-border))]/40 sm:max-w-[15rem]"
	></div>

	<div class="mt-2.5 w-full shrink-0 px-1 text-center">
		<div class="skeleton mx-auto h-4 w-[85%] rounded-full"></div>
		<div class="skeleton mx-auto mt-1.5 h-3 w-[60%] rounded-full"></div>
	</div>

	{#if isAdmin}
		<div class="mt-2 flex min-h-[1.375rem] w-full shrink-0 justify-center gap-1 px-1">
			{#each [0, 1, 2, 3] as tagIndex (tagIndex)}
				<span class="skeleton h-5 w-10 rounded-full"></span>
			{/each}
		</div>
		<div class="mt-3 w-full shrink-0 px-1">
			<div class="skeleton h-8 w-full rounded-full"></div>
		</div>
	{/if}
</article>
