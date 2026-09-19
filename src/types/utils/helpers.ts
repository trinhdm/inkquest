
//	general

export type DeepRequired<T> = T extends Function
	? T
	: T extends Array<infer InferredArrayType>
		? DeepRequired<InferredArrayType>[]
		: T extends object
			? { [K in keyof T]-?: DeepRequired<T[K]> }
			: T


//	strings

type ContainSubstr<S extends string, Sub extends string> =
	S extends `${string}${Sub}${string}`
		? true
		: false

export type RemoveSubstr<S extends string, Sub extends string> =
	S extends `${infer Before}${Sub}${infer After}`
		? `${Before}${After}`
		: S


//	objects

export type PluralizeKeys<T> = {
	[K in keyof T as K extends string ? `${K}s` : K]: T[K]
}

export type RewriteKeysWithout<Sub extends string, T> = {
	[K in keyof T as K extends string
		? ContainSubstr<K, Sub> extends true
			? Lowercase<RemoveSubstr<K, Sub>>
			: K
		: K]: T[K]
}

export type AtLeastOneKeyOf<Keys extends PropertyKey, V> = {
	[K in Keys]: Partial<Record<Keys, V>> & Record<K, V>
}[Keys]


// Forces the checker to eagerly flatten an intersection/conditional chain
// into one plain object type. Doesn't change what the type *is* — same
// members, same values — only how much re-walking is needed to display it.
export type Simplify<T> = { [K in keyof T]: T[K] } & {}


type IsUnion<T, U = T> =
	T extends unknown
		? [U] extends [T] ? false : true
		: never

// Resolves to E only when E has exactly one key; otherwise never.
// Apply as `E & OneKeyOf<E>` so E still infers from the argument —
// a conditional type is not an inference site, so it constrains without blocking.
export type OneKeyOf<E> =
	[keyof E] extends [never]
		? never
		: IsUnion<keyof E> extends true
			? never
			: E


// Omit that keeps a union a union. `Omit<A | B, K>` flattens both branches into one
// object (keyof a union is the intersection of its keys), which kills `Extract`/`in` narrowing.
export type DistributiveOmit<T, K extends PropertyKey> =
	T extends unknown ? Omit<T, K> : never


// Resolves to a shape that rejects any key of V not present in T.
// Apply as `V & NoExcessKeys<T, V>` so V still infers from the argument —
// a mapped type over `keyof V` is not an inference site, so it constrains without blocking.
export type NoExcessKeys<T, V> =
	Record<Exclude<keyof V, keyof T>, never>


export type WithDefaults<P, K extends PropertyKey> =
	[K] extends [never]
		? P
		: P extends unknown
			? Omit<P, K> & Required<Pick<P, K & keyof P>>
			: never
