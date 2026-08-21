<script lang="ts">
	const previewCount = 4;
</script>

<section class="mb-8" aria-hidden="true">
	<div class="mb-3 flex items-end justify-between gap-3">
		<div class="skeleton h-4 w-28 rounded-full"></div>
		<div class="skeleton h-[2.375rem] w-20 rounded-full"></div>
	</div>
	<div class="flex gap-4 overflow-hidden pb-2">
		{#each Array.from({ length: previewCount }, (_, index) => index) as index (index)}
			<div class="w-[9.5rem] shrink-0">
				<div
					class="skeleton aspect-[3/4] w-full rounded-[1.5rem] border border-[rgb(var(--color-border))]/30"
				></div>
				<div class="skeleton mx-auto mt-2.5 h-3.5 w-[70%] rounded-full"></div>
				<div class="skeleton mx-auto mt-1 h-3 w-[40%] rounded-full"></div>
			</div>
		{/each}
	</div>
</section>
