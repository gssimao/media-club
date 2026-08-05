<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		href: string;
		active?: boolean;
		children: import('svelte').Snippet;
	}

	let { href, active = false, children }: Props = $props();
</script>

<a
	{href}
	class={cn(
		'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
		active ? 'bg-indigo-500/20 text-indigo-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'
	)}
>
	{@render children()}
</a>
