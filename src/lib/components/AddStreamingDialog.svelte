<script lang="ts">
	import { enhance } from '$app/forms';
	import ModalShell from '$lib/components/ModalShell.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { Plus } from 'phosphor-svelte';

	interface Props {
		listId: string;
		isOpen: boolean;
		onClose: () => void;
	}

	let { listId, isOpen, onClose }: Props = $props();

	let manualTitle = $state('');
	let manualSubtitle = $state('');
	let manualYear = $state('');
	let manualCoverUrl = $state('');

	$effect(() => {
		if (!isOpen) {
			manualTitle = '';
			manualSubtitle = '';
			manualYear = '';
			manualCoverUrl = '';
		}
	});
</script>

<ModalShell
	open={isOpen}
	title="Manual entry"
	description="Add a movie to this streaming list without searching TMDB"
	{onClose}
>
	<form
		method="POST"
		action="?/addItem"
		class="space-y-4"
		use:enhance={({ formData }) => {
			formData.set('externalId', `manual-${Date.now()}`);
			return async ({ result: actionResult, update }) => {
				if (actionResult.type === 'failure') {
					toast.error(String(actionResult.data?.message ?? 'Could not add movie.'));
				} else {
					toast.success(`Added "${manualTitle}" to this streaming list.`);
					manualTitle = '';
					manualSubtitle = '';
					manualYear = '';
					manualCoverUrl = '';
					onClose();
				}
				await update();
			};
		}}
	>
		<input type="hidden" name="listId" value={listId} />
		<input type="hidden" name="externalId" value="manual-{Date.now()}" />

		<label class="block space-y-1 text-sm">
			<span class="font-bold text-stone-700 dark:text-stone-300">Title *</span>
			<input
				type="text"
				name="title"
				bind:value={manualTitle}
				required
				placeholder="Enter title"
				class="input-round w-full"
			/>
		</label>

		<label class="block space-y-1 text-sm">
			<span class="font-bold text-stone-700 dark:text-stone-300">Subtitle</span>
			<input
				type="text"
				name="subtitle"
				bind:value={manualSubtitle}
				placeholder="Optional subtitle"
				class="input-round w-full"
			/>
		</label>

		<label class="block space-y-1 text-sm">
			<span class="font-bold text-stone-700 dark:text-stone-300">Year</span>
			<input
				type="number"
				name="year"
				bind:value={manualYear}
				min="1"
				max="2100"
				step="1"
				inputmode="numeric"
				placeholder="e.g. 1994"
				class="input-round w-full"
			/>
		</label>

		<label class="block space-y-1 text-sm">
			<span class="font-bold text-stone-700 dark:text-stone-300">Cover URL</span>
			<input
				type="url"
				name="coverUrl"
				bind:value={manualCoverUrl}
				placeholder="https://example.com/cover.jpg"
				class="input-round w-full"
			/>
		</label>

		<!-- Phones: full-width buttons, primary action on top. Wider screens: a right-aligned row. -->
		<div class="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
			<button
				type="button"
				onclick={onClose}
				class="btn-secondary justify-center px-5 py-2.5 text-sm"
			>
				Cancel
			</button>
			<button type="submit" class="btn-primary justify-center px-5 py-2.5 text-sm">
				<Plus size={16} weight="bold" />
				Add to list
			</button>
		</div>
	</form>
</ModalShell>
