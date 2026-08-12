export function toolSuccess<T>(data: T) {
	return {
		content: [
			{
				type: 'text' as const,
				text: JSON.stringify({ success: true, data }, null, 2)
			}
		]
	};
}

export function toolFailure(message: string) {
	return {
		content: [
			{
				type: 'text' as const,
				text: JSON.stringify({ success: false, error: message }, null, 2)
			}
		],
		isError: true as const
	};
}
