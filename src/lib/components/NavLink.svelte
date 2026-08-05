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
		'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
		active
			? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
			: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
	)}
>
	{@render children()}
</a>
