<script lang="ts">
	import MediaFilterPopover from '$lib/components/MediaFilterPopover.svelte';
	import { FORMAT_TAG_PRESETS } from '$lib/utils/format-tags';
	import { FilmSlate } from 'phosphor-svelte';

	interface Props {
		selectedFormats: string[];
		onFilterChange: (formats: string[]) => void;
	}

	let { selectedFormats = $bindable([]), onFilterChange }: Props = $props();

	const formatOptions = $derived(
		FORMAT_TAG_PRESETS.movie.map((tag) => ({ value: tag, label: tag }))
	);
</script>

<MediaFilterPopover
	label="Format"
	triggerIcon={FilmSlate}
	options={formatOptions}
	bind:selected={selectedFormats}
	onChange={onFilterChange}
	ariaLabel="Filter by format"
/>
