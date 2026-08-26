let seq = 0;

/** Unique id prefix for inline SVG defs (gradients, clips) per component instance. */
export function nextSvgInstanceId(prefix: string): string {
	seq += 1;
	return `${prefix}-${seq}`;
}
