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
'inline-flex items-center gap-1.5 rounded px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-all',
active
? 'bg-amber-400 text-stone-900'
: 'text-stone-700 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-stone-100'
)}
>
{@render children()}
</a>
