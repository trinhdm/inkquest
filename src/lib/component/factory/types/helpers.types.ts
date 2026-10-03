export type WithDefaults<P, K extends PropertyKey> =
	[K] extends [never]
		? P
		: P extends unknown
			? Omit<P, K> & Required<Pick<P, K & keyof P>>
			: never
