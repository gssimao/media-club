<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		href: string;
		active?: boolean;
		/** 'accent' renders the amber tinted pill used for primary page links. */
		variant?: 'neutral' | 'accent';
		children: import('svelte').Snippet;
	}

	let { href, active = false, variant = 'neutral', children }: Props = $props();
</script>

<a
	{href}
	aria-current={active ? 'page' : undefined}
	class={cn(
		'pill-nav',
		active
			? 'bg-amber-400 text-stone-900'
			: variant === 'accent'
				? 'bg-amber-400/15 text-amber-700 hover:bg-amber-400/25 dark:text-amber-400'
				: 'text-stone-700 hover:bg-stone-900/5 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-stone-100'
	)}
>
	{@render children()}
</a>
