
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
