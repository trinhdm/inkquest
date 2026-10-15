/* eslint-disable @typescript-eslint/no-explicit-any */

import type { OneKeyOf } from '@/types/utils'

export const isObject = <T extends Record<string, any>>(target: unknown): target is T =>
	!!target && target?.constructor === Object && !Array.isArray(target)

type WithKeyValue<T, K extends PropertyKey> =
	T extends unknown
		? T & { [P in K]: P extends keyof T ? NonNullable<T[P]> : unknown }
		: never

function hasKeyWithValue<
	T extends object,
	K extends PropertyKey,
>(obj: T | undefined, key: K): obj is WithKeyValue<T, K>
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

	return k in obj && (v === null ? !!obj[k] : obj[k] === v)
}

export const keyHasValue = hasKeyWithValue
