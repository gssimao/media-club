<script lang="ts">
	import type { Album } from '$lib/types/media';

	interface Props {
		itemId: string;
		albumId: string | null;
		albums: Album[];
	}

	let { itemId, albumId, albums }: Props = $props();
</script>

<form method="POST" action="/admin/albums?/assignToAlbum" class="mt-1.5 w-full">
	<input type="hidden" name="itemId" value={itemId} />
	<label class="sr-only" for="album-{itemId}">Assign to album</label>
	<select
		id="album-{itemId}"
		name="albumId"
		class="input-round w-full py-1.5 text-[9px] font-bold tracking-wide uppercase"
		onchange={(e) => e.currentTarget.form?.requestSubmit()}
	>
		<option value="" selected={!albumId}>No album</option>
		{#each albums as album (album.id)}
			<option value={album.id} selected={albumId === album.id}>{album.title}</option>
		{/each}
	</select>
</form>
