
type ContainSubstr<S extends string, Sub extends string> =
	S extends `${string}${Sub}${string}`
		? true
		: false

export type RemoveSubstr<S extends string, Sub extends string> =
	S extends `${infer Before}${Sub}${infer After}`
		? `${Before}${After}`
		: S

export type RewriteKeysWithout<Sub extends string, T> = {
	[K in keyof T as K extends string
		? ContainSubstr<K, Sub> extends true
			? Lowercase<RemoveSubstr<K, Sub>>
			: K
		: K]: T[K]
}
