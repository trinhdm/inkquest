
export type RecordToMap<T extends Record<PropertyKey, any>> =
	Map<keyof T, T[keyof T]>

export type MapToArray<T> =
	T extends Map<infer K, infer V>
		? [K, V]
		: never
