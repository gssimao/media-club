<script lang="ts">
	import GenrePickerPanel from '$lib/components/GenrePickerPanel.svelte';
	import { DEFAULT_GENRE_FILTER_MODE, type GenreFilterMode } from '$lib/utils/movie-genres';

	interface Props {
		options: string[];
		selected: string[];
		mode?: GenreFilterMode;
		onChange: (selected: string[]) => void;
		onModeChange?: (mode: GenreFilterMode) => void;
		onClose: () => void;
	}

	let {
		options,
		selected,
		mode = DEFAULT_GENRE_FILTER_MODE,
		onChange,
		onModeChange,
		onClose
	}: Props = $props();
</script>

<GenrePickerPanel
	{options}
	{selected}
	{mode}
	{onChange}
	{onModeChange}
	{onClose}
	titleId="random-genre-panel-title"
	footerActionLabel="Back to filters"
/>
