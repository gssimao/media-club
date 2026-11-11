<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import ModalShell from '$lib/components/ModalShell.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import type { MediaCategory } from '$lib/types/media';
	import { FolderPlus } from 'phosphor-svelte';

	interface Props {
		category: MediaCategory;
		isOpen: boolean;
		onClose: () => void;
	}

	let { category, isOpen, onClose }: Props = $props();

	let albumTitle = $state('');
	let saving = $state(false);

	/** Closes the dialog and clears the field so it opens empty next time. */
	function close() {
		albumTitle = '';
		onClose();
	}
</script>

<ModalShell
	open={isOpen}
	title="Create collection"
	description="Group items you own under one sleeve"
	size="sm"
	onClose={close}
>
	<form
		method="POST"
		action="/admin/albums?/createAlbum"
		class="space-y-4"
		use:enhance={() => {
			const title = albumTitle.trim();
			saving = true;
			return async ({ result }) => {
				saving = false;
				if (result.type === 'failure') {
					toast.error(String(result.data?.message ?? 'Could not create collection.'));
					return;
				}
				if (result.type === 'error') {
					toast.error('Could not create collection.');
					return;
				}
				toast.success(`Created collection "${title}".`);
				close();
				// Refresh the shelf in place: no full page reload, scroll position stays put.
				await invalidateAll();
			};
		}}
	>
		<input type="hidden" name="category" value={category} />

		<label class="block space-y-1 text-sm">
			<span class="font-bold text-stone-700 dark:text-stone-300">Collection title *</span>
			<!-- svelte-ignore a11y_autofocus -->
			<input
				type="text"
				name="title"
				bind:value={albumTitle}
				required
				placeholder="e.g. Wes Anderson, Sci-Fi Classics"
				class="input-round w-full"
				autofocus
			/>
		</label>

		<!-- Phones: full-width buttons, primary action on top. Wider screens: a right-aligned row. -->
		<div class="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
			<button
				type="button"
				onclick={close}
				class="btn-secondary justify-center px-5 py-2.5 text-sm"
			>
				Cancel
			</button>
			<button
				type="submit"
				class="btn-primary justify-center px-5 py-2.5 text-sm"
				disabled={saving}
			>
				<FolderPlus size={16} weight="bold" />
				{saving ? 'Creating…' : 'Create collection'}
			</button>
		</div>
	</form>
</ModalShell>
