/* eslint-disable @typescript-eslint/no-explicit-any */

import { isObject } from '../checks/objects'
import type { DeepMap, DeepMerge, PluralizeKeys } from '@/types/utils'

export const pluralizeKeys = <T extends Record<string, any>>(obj: T): PluralizeKeys<T> => {
	const result = {} as any

	for (const key of Object.keys(obj)) {
		const ks = `${key}s`
		result[ks] = obj[key]
	}

	return result
}

export const deepKeys = <T extends Record<string, unknown>>(obj: T, prefix = '') => {
	let keys = [] as string[]

	for (const key in obj) {
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
	const keys = [...Object.keys(obj1), ...Object.keys(obj2)],
		uniqueKeys = [...new Set(keys)]

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

export const deepSet = <V,>(
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
	const result: Record<string, V> = {}

	for (const [key, value] of map.entries()) {
		if (value instanceof Map)
			Object.assign(result, flattenMap(value))
		else
			result[key] = value
	}

	return result
}
