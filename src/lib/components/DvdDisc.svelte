<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { nextSvgInstanceId } from '$lib/utils/svg-instance-id';

	interface Props {
		class?: string;
		style?: string;
	}

	let { class: className, style }: Props = $props();

	const uid = nextSvgInstanceId('dvd-disc');
	const sheenId = `${uid}-sheen`;
	const rainbowId = `${uid}-rainbow`;
</script>

<svg viewBox="0 0 100 100" class={cn(className)} {style} aria-hidden="true">
	<defs>
		<linearGradient id={sheenId} x1="0%" y1="0%" x2="100%" y2="100%">
			<stop offset="0%" stop-color="#e2e8f0" />
			<stop offset="30%" stop-color="#94a3b8" />
			<stop offset="55%" stop-color="#cbd5e1" />
			<stop offset="80%" stop-color="#64748b" />
			<stop offset="100%" stop-color="#e2e8f0" />
		</linearGradient>
		<linearGradient id={rainbowId} x1="0%" y1="50%" x2="100%" y2="50%">
			<stop offset="0%" stop-color="#f472b6" stop-opacity="0.28" />
			<stop offset="22%" stop-color="#a78bfa" stop-opacity="0.22" />
			<stop offset="44%" stop-color="#60a5fa" stop-opacity="0.28" />
			<stop offset="66%" stop-color="#34d399" stop-opacity="0.22" />
			<stop offset="88%" stop-color="#fbbf24" stop-opacity="0.26" />
			<stop offset="100%" stop-color="#f472b6" stop-opacity="0.24" />
		</linearGradient>
	</defs>
	<circle cx="50" cy="50" r="48" fill="url(#{sheenId})" />
	<circle cx="50" cy="50" r="48" fill="url(#{rainbowId})" />
	{#each [42, 38, 34, 30] as radius (radius)}
		<circle
			cx="50"
			cy="50"
			r={radius}
			fill="none"
			stroke="currentColor"
			stroke-width="0.5"
			class="text-slate-400/25 dark:text-slate-500/20"
		/>
	{/each}
	<path
		d="M 50 8 A 42 42 0 0 1 78 22"
		fill="none"
		stroke="white"
		stroke-opacity="0.45"
		stroke-width="2"
		stroke-linecap="round"
	/>
	<circle cx="50" cy="50" r="14" class="fill-stone-200 dark:fill-stone-700" />
	<circle cx="50" cy="50" r="13" fill="none" stroke="rgb(0 0 0 / 0.12)" stroke-width="0.5" />
	<circle cx="50" cy="50" r="3" class="fill-stone-400 dark:fill-stone-500" />
</svg>
