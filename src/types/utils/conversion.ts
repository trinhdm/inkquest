
//	primitives

export type StrToNum<T extends string> =
	T extends `${infer N extends number}` ? N : never


//	objects

export type RecordToMap<T extends Record<PropertyKey, unknown>> =
	Map<keyof T, T[keyof T]>

export type MapToArray<T> =
	T extends Map<infer K, infer V>
		? [K, V]
		: never
