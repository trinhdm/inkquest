import type { OneKeyOf, PluralizeKeys } from '@/types/utils'

export const isObject = <T extends Record<string, any>>(target: unknown): target is T =>
	!!target && target?.constructor === Object && !Array.isArray(target)

function hasKeyWithValue<
	T extends object,
	K extends PropertyKey,
>(obj: T | undefined, key: K): obj is T & Record<K, unknown>
function hasKeyWithValue<
	T extends object,
	const E extends Record<string, unknown>,
>(obj: T | undefined, entry: OneKeyOf<E>): obj is T & E
function hasKeyWithValue(
	obj: object | undefined,
	entry: PropertyKey | Record<string, unknown>
): boolean {
	let k, v = null

	if (isObject(entry)) ([k, v] = Object.entries(entry)[0])
	else k = String(entry)

	if (!isObject(obj) || !Object.hasOwn(obj, k))
		return false

	return v === null ? !!obj[k] : obj[k] === v
}

export const keyHasValue = hasKeyWithValue


export const pluralizeKeys = <T extends Record<string, any>>(obj: T): PluralizeKeys<T> => {
	const result = {} as any

	for (const key of Object.keys(obj)) {
		const ks = `${key}s`
		result[ks] = obj[key]
	}

	return result
}


const deepKeys = <T extends Record<string, unknown>>(obj: T, prefix = '') => {
	let keys = [] as string[]

	for (let key in obj) {
		const value = obj[key]
		const keyList = prefix ? `${prefix}-${key}` : key

		if (isObject(value)) keys = keys.concat(deepKeys(value, keyList))
		else keys.push(keyList)
	}

	return keys
}

export const deepMerge = <
	T extends Record<string, any>,
	U extends Record<string, any>
>(obj1: T, obj2: U): DeepMerge<T, U> => {
	const uniqueKeys = [...new Set([...Object.keys(obj1), ...Object.keys(obj2)])]
	const entries = uniqueKeys.map(key => {
		const v1 = obj1[key],
			v2 = obj2[key]
		const value = isObject(v1) && isObject(v2)
			? deepMerge(v1 as T, v2 as U)
			: v2 ?? v1

		return [key, value]
	})

	return Object.fromEntries(entries) as DeepMerge<T, U>
}

type DeepMerge<T, U> = {
	[K in keyof T | keyof U]: K extends keyof U
		? K extends keyof T
			? T[K] extends Record<string, any>
				? U[K] extends Record<string, any>
					? DeepMerge<T[K], U[K]>
					: U[K]
				: U[K]
			: U[K]
		: K extends keyof T
			? T[K]
			: never
}

type DeepMap<V> = Map<string, V | DeepMap<V>>

export const deepSetMap = <V,>(
	map: DeepMap<V>,
	...args: [...keys: string[], value: V]
): DeepMap<V> => {
	let current = map
	const value = args.pop() as V,
		keys = args as string[]

	for (const key of keys) {
		if (typeof key !== 'string') continue
		let next = current.has(key) && current.get(key)

		if (!(next instanceof Map)) {
			next = new Map()
			current.set(key, next)
		}

		current = next
	}

	current.set(`${keys.at(-1)}`, value)

	return map
}

export const flattenMap = <V,>(map: DeepMap<V>): Record<string, V> => {
	let result: Record<string, V> = {}

	for (const [key, value] of map.entries()) {
		if (value instanceof Map)
			Object.assign(result, flattenMap(value))
		else
			result[key] = value
	}

	return result
}
