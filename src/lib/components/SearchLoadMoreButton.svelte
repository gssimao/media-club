<script lang="ts">
	import { VinylRecord } from 'phosphor-svelte';

	interface Props {
		hasMore: boolean;
		loadingMore: boolean;
		onLoadMore: () => void;
	}

	let { hasMore, loadingMore, onLoadMore }: Props = $props();
</script>

{#if hasMore}
	<div class="flex justify-center pt-2">
		<button
			type="button"
			class="btn-secondary inline-flex items-center gap-2 px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
			disabled={loadingMore}
			onclick={onLoadMore}
		>
			{#if loadingMore}
				<VinylRecord
					size={16}
					weight="bold"
					class="animate-spin text-amber-500 [animation-duration:1.4s]"
					aria-hidden="true"
				/>
				Loading…
			{:else}
				Load more
			{/if}
		</button>
	</div>
{/if}
