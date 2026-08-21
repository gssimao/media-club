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
			? 'control-pill--active'
			: variant === 'accent'
				? 'control-pill--accent'
				: 'control-pill--neutral'
	)}
>
	{@render children()}
</a>
