/** Shared shelf density for owned media and streaming watchlists. */
export function mediaGridClass(density: 'compact' | 'cozy') {
	return density === 'compact'
		? 'grid grid-cols-2 gap-x-4 gap-y-6 min-[400px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7'
		: 'grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
}
