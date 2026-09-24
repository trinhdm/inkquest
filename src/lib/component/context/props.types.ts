
// Resolves to a shape that rejects any key of V not present in T.
// Apply as `V & NoExcessKeys<T, V>` so V still infers from the argument —
// a mapped type over `keyof V` is not an inference site, so it constrains without blocking.

// export type NoExcessKeys<T, V> =
// 	Record<Exclude<keyof V, keyof T>, ['key not declared on context type', never]>

export type NoExcessKeys<T, V> =
	Record<Exclude<keyof V, keyof T>, never>

// export type NoExcessKeys<T, V> =
// 	[keyof T] extends [never]
// 		? unknown
// 		: Record<Exclude<keyof V, keyof T>, ['excess key: not declared on the context type', never]>
