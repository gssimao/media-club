<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Album } from '$lib/types/media';

	interface Props {
		itemId: string;
		albumId: string | null;
		albums: Album[];
	}

	let { itemId, albumId, albums }: Props = $props();

	let submitting = $state(false);
</script>

<form
	method="POST"
	action="/admin/albums?/assignToAlbum"
	class="mt-1.5 w-full"
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			submitting = false;
			await update();
		};
	}}
>
	<input type="hidden" name="itemId" value={itemId} />
	<label class="sr-only" for="album-{itemId}">Assign to collection</label>
	<select
		id="album-{itemId}"
		name="albumId"
		value={albumId ?? ''}
		disabled={submitting}
		class="input-round w-full py-1.5 text-[9px] font-bold tracking-wide uppercase disabled:opacity-60"
		onchange={(e) => e.currentTarget.form?.requestSubmit()}
	>
		<option value="">No collection</option>
		{#each albums as album (album.id)}
			<option value={album.id}>{album.title}</option>
		{/each}
	</select>
</form>
