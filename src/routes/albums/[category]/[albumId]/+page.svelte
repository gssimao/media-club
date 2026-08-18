<script lang="ts">
	import { enhance } from '$app/forms';
	import PageShell from '$lib/components/PageShell.svelte';
	import AlbumSleeve from '$lib/components/AlbumSleeve.svelte';
	import AlbumRandomPicker from '$lib/components/AlbumRandomPicker.svelte';
	import CoverSearchPicker from '$lib/components/CoverSearchPicker.svelte';
	import MediaGrid from '$lib/components/MediaGrid.svelte';
	import NavLink from '$lib/components/NavLink.svelte';
	import {
		ALBUM_ACCENT_COLORS,
		ALBUM_COLOR_PRESETS,
		type AlbumAccentColor
	} from '$lib/theme/album-colors';
	import { CATEGORY_ACTION_WORDING, CATEGORY_PATHS, type MediaItem } from '$lib/types/media';
	import { toast } from '$lib/stores/toast.svelte';
	import { cn } from '$lib/utils/cn';

	let { data } = $props();

	const categoryPath = $derived(CATEGORY_PATHS[data.category]);
	const wording = $derived(CATEGORY_ACTION_WORDING[data.category]);

	const unwatchedItems = $derived(data.items.filter((item) => !item.albumWatchedAt));
	const watchedItems = $derived(data.items.filter((item) => item.albumWatchedAt));

	let highlightedId = $state<string | null>(null);
	let titleDraft = $state('');
	let descriptionDraft = $state('');
	let coverUrlDraft = $state('');
	let accentColorDraft = $state<AlbumAccentColor | null>(null);
	let isSaving = $state(false);

	$effect(() => {
		titleDraft = data.album.title;
		descriptionDraft = data.album.description ?? '';
		coverUrlDraft = data.album.coverUrl ?? '';
		accentColorDraft = data.album.accentColor;
	});

	const isDirty = $derived(
		titleDraft.trim() !== data.album.title ||
			descriptionDraft.trim() !== (data.album.description ?? '') ||
			coverUrlDraft.trim() !== (data.album.coverUrl ?? '') ||
			accentColorDraft !== data.album.accentColor
	);

	const itemFallbackCover = $derived(data.items.find((item) => item.coverUrl)?.coverUrl ?? null);
	const previewDisplayCover = $derived(
		coverUrlDraft.trim() ? coverUrlDraft.trim() : itemFallbackCover
	);
	const previewAlbum = $derived({
		...data.album,
		accentColor: accentColorDraft
	});

	function handlePick(item: MediaItem) {
		highlightedId = item.id;
		requestAnimationFrame(() => {
			document.getElementById(`item-${item.id}`)?.scrollIntoView({
				behavior: 'smooth',
				block: 'center'
			});
		});
	}

	function handleCoverSelect(coverUrl: string) {
		coverUrlDraft = coverUrl;
	}

	function clearCover() {
		coverUrlDraft = '';
	}
</script>

<svelte:head>
	<title>{data.album.title} · Media Club</title>
</svelte:head>

<PageShell title={data.album.title} description={data.album.description ?? undefined}>
	{#snippet controls()}
		<NavLink href="/albums/{data.category}" variant="accent">All {data.label} albums</NavLink>
		<NavLink href="/{categoryPath}">Back to {data.label}</NavLink>

		<AlbumRandomPicker
			{unwatchedItems}
			category={data.category}
			isAdmin={data.isAdmin}
			onPick={handlePick}
		/>

		{#if data.isAdmin}
			<form
				method="POST"
				action="/admin/albums?/deleteAlbum"
				use:enhance={({ cancel }) => {
					if (!confirm(`Delete the album "${data.album.title}"? Items stay in the catalog.`)) {
						cancel();
					}
				}}
			>
				<input type="hidden" name="id" value={data.album.id} />
				<button
					type="submit"
					class="pill-nav border border-red-400/80 text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
				>
					Delete album
				</button>
			</form>
		{/if}
	{/snippet}

	<div class="mb-8">
		<AlbumSleeve
			album={data.isAdmin ? previewAlbum : data.album}
			displayCoverUrl={data.isAdmin ? previewDisplayCover : data.displayCoverUrl}
		/>
	</div>

	{#if data.isAdmin}
		<form
			method="POST"
			action="/admin/albums?/updateAlbum"
			class="surface-round mb-8 space-y-4 p-4"
			use:enhance={() => {
				isSaving = true;
				return async ({ result, update }) => {
					isSaving = false;
					if (result.type === 'failure') {
						toast.error(String(result.data?.message ?? 'Could not save album.'));
						return;
					}
					toast.success('Album saved.');
					await update();
				};
			}}
		>
			<input type="hidden" name="id" value={data.album.id} />
			<label class="block space-y-1 text-sm">
				<span class="font-bold text-stone-700 dark:text-stone-300">Title</span>
				<input
					type="text"
					name="title"
					bind:value={titleDraft}
					required
					class="input-round w-full"
				/>
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
				<CoverSearchPicker category={data.category} onSelect={handleCoverSelect} />
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
					Leave blank to use the first item cover in this album.
				</span>
			</label>

			<button type="button" class="btn-secondary px-4 py-1.5 text-xs" onclick={clearCover}>
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
					{isSaving ? 'Saving…' : isDirty ? 'Save changes' : 'Save album'}
				</button>
				{#if isDirty && !isSaving}
					<p class="text-xs font-semibold text-amber-700 dark:text-amber-400">Unsaved changes</p>
				{/if}
			</div>
		</form>
	{/if}

	<MediaGrid
		items={unwatchedItems}
		isAdmin={data.isAdmin}
		albums={[data.album]}
		sectionTitle="To {wording.verb}"
		{highlightedId}
		showAlbumWatchedToggle={data.isAdmin}
		emptyTitle="Nothing left to {wording.verb}"
		emptyDescription={watchedItems.length > 0
			? `Every item in this album has been marked ${wording.done}. Use Mark ${wording.notDone} on a card to add it back to the pool.`
			: `Assign items from the ${data.label.toLowerCase()} collection using the album dropdown on each card.`}
	/>

	{#if watchedItems.length > 0}
		<div class="mt-12">
			<MediaGrid
				items={watchedItems}
				isAdmin={data.isAdmin}
				albums={[data.album]}
				sectionTitle="Already {wording.done}"
				{highlightedId}
				showAlbumWatchedToggle={data.isAdmin}
				showSearch={false}
				emptyTitle=""
				emptyDescription=""
			/>
		</div>
	{/if}
</PageShell>
