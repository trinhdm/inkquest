
type EnforceLengthSync<
	T extends readonly unknown[],
	S extends readonly unknown[]
> = T['length'] extends S['length']
	? T
	: `Error: Array length (${T['length']}) must exactly match S length (${S['length']})`

export const syncLengthTo = <const S extends readonly unknown[]>(_obj: S) => {
	return <const T extends readonly string[]>(
		arr: T & EnforceLengthSync<T, S>
	) => arr
}
