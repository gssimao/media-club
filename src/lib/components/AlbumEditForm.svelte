<script lang="ts">
	import { enhance } from '$app/forms';
	import CoverSearchPicker from './CoverSearchPicker.svelte';
	import {
		ALBUM_ACCENT_COLORS,
		ALBUM_COLOR_PRESETS,
		type AlbumAccentColor
	} from '$lib/theme/album-colors';
	import type { MediaCategory } from '$lib/types/media';
	import { toast } from '$lib/stores/toast.svelte';
	import { cn } from '$lib/utils/cn';

	interface Props {
		albumId: string;
		category: MediaCategory;
		titleDraft: string;
		descriptionDraft: string;
		coverUrlDraft: string;
		accentColorDraft: AlbumAccentColor | null;
		isDirty: boolean;
		onCoverSelect: (coverUrl: string) => void;
		onClearCover: () => void;
		onSaved: () => void;
		onCancel: () => void;
	}

	let {
		albumId,
		category,
		titleDraft = $bindable(),
		descriptionDraft = $bindable(),
		coverUrlDraft = $bindable(),
		accentColorDraft = $bindable(),
		isDirty,
		onCoverSelect,
		onClearCover,
		onSaved,
		onCancel
	}: Props = $props();

	let isSaving = $state(false);
</script>

<form
	method="POST"
	action="/admin/albums?/updateAlbum"
	class="surface-round mb-8 space-y-4 p-4"
	use:enhance={() => {
		isSaving = true;
		return async ({ result, update }) => {
			isSaving = false;
			if (result.type === 'failure') {
				toast.error(String(result.data?.message ?? 'Could not save collection.'));
				return;
			}
			toast.success('Collection saved.');
			await update();
			onSaved();
		};
	}}
>
	<div class="flex items-center justify-between gap-3">
		<h2 class="text-sm font-black tracking-wide text-stone-800 uppercase dark:text-amber-50">
			Edit collection
		</h2>
		<button type="button" class="btn-secondary px-3 py-1 text-xs" onclick={onCancel}>
			Close
		</button>
	</div>

	<input type="hidden" name="id" value={albumId} />
	<label class="block space-y-1 text-sm">
		<span class="font-bold text-stone-700 dark:text-stone-300">Title</span>
		<input type="text" name="title" bind:value={titleDraft} required class="input-round w-full" />
	</label>
	<label class="block space-y-1 text-sm">
		<span class="font-bold text-stone-700 dark:text-stone-300">Description</span>
		<input
			type="text"
			name="description"
			bind:value={descriptionDraft}
			class="input-round w-full"
		/>
	</label>

	<div class="space-y-2">
		<span class="block text-sm font-bold text-stone-700 dark:text-stone-300">Cover image</span>
		<CoverSearchPicker {category} onSelect={onCoverSelect} />
	</div>

	<label class="block space-y-1 text-sm">
		<span class="font-bold text-stone-700 dark:text-stone-300">Cover URL (optional)</span>
		<input
			type="url"
			name="coverUrl"
			bind:value={coverUrlDraft}
			class="input-round w-full"
			placeholder="Paste any image link (JPG, PNG, GIF…)"
		/>
		<span class="block text-xs text-[rgb(var(--color-text-secondary))]">
			Leave blank to use the first item cover in this collection.
		</span>
	</label>

	<button type="button" class="btn-secondary px-4 py-1.5 text-xs" onclick={onClearCover}>
		Clear cover URL
	</button>

	<fieldset class="space-y-2">
		<legend class="text-sm font-bold text-stone-700 dark:text-stone-300">Accent color</legend>
		<div class="flex flex-wrap gap-2">
			<label class="flex items-center gap-2">
				<input
					type="radio"
					name="accentColor"
					value=""
					checked={accentColorDraft === null}
					onchange={() => (accentColorDraft = null)}
					class="sr-only"
				/>
				<span
					class="inline-flex size-9 items-center justify-center rounded-full border-2 text-[9px] font-bold transition-transform {accentColorDraft ===
					null
						? 'scale-110 border-stone-900 dark:border-amber-50'
						: 'border-[rgb(var(--color-border))]'}"
				>
					Default
				</span>
			</label>
			{#each ALBUM_ACCENT_COLORS as color (color)}
				<label class="flex items-center">
					<input
						type="radio"
						name="accentColor"
						value={color}
						checked={accentColorDraft === color}
						onchange={() => (accentColorDraft = color)}
						class="sr-only"
					/>
					<span
						class="inline-block size-9 rounded-full {ALBUM_COLOR_PRESETS[color]
							.swatch} transition-transform {accentColorDraft === color
							? 'scale-110 ring-2 ring-stone-900 ring-offset-2 ring-offset-[rgb(var(--color-bg))] dark:ring-amber-50'
							: ''}"
						title={ALBUM_COLOR_PRESETS[color].label}
						aria-label={ALBUM_COLOR_PRESETS[color].label}
					></span>
				</label>
			{/each}
		</div>
	</fieldset>

	<div class="flex flex-wrap items-center gap-3 pt-1">
		<button
			type="submit"
			disabled={!isDirty || isSaving}
			class={cn(
				'btn-primary px-5 py-2 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-amber-400',
				isDirty &&
					!isSaving &&
					'ring-2 ring-amber-500 ring-offset-2 ring-offset-[rgb(var(--color-bg))]'
			)}
		>
			{isSaving ? 'Saving…' : isDirty ? 'Save changes' : 'Save collection'}
		</button>
		{#if isDirty && !isSaving}
			<p class="text-xs font-semibold text-amber-700 dark:text-amber-400">Unsaved changes</p>
		{/if}
	</div>
</form>
