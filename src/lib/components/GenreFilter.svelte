<script lang="ts">
	import MediaFilterPopover from '$lib/components/MediaFilterPopover.svelte';
	import { Tag } from 'phosphor-svelte';

	interface Props {
		options: string[];
		selectedGenres: string[];
		onFilterChange: (genres: string[]) => void;
	}

	let { options, selectedGenres = $bindable([]), onFilterChange }: Props = $props();

	const genreOptions = $derived(options.map((genre) => ({ value: genre, label: genre })));
</script>

{#if options.length > 0}
	<MediaFilterPopover
		label="Genre"
		triggerIcon={Tag}
		options={genreOptions}
		bind:selected={selectedGenres}
		onChange={onFilterChange}
		ariaLabel="Filter by genre"
	/>
{/if}
