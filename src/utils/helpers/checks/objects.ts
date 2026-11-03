/* eslint-disable @typescript-eslint/no-explicit-any */

import type { OneKeyOf } from '@/types/utils'

export const isObject = <T extends Record<string, any>>(target: unknown): target is T =>
	!!target && target?.constructor === Object && !Array.isArray(target)

export const isKeyOf = <T extends object>(obj: T, key: PropertyKey): key is keyof T =>
	Object.hasOwn(obj, key) || key in obj

type WithKeyValue<T, K extends PropertyKey> =
	T extends unknown
		? Extract<Omit<T, K> & { [P in K]: P extends keyof T ? NonNullable<T[P]> : unknown }, T>
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

	if (!isObject(obj) || !isKeyOf(obj, k))
		return false

	return v === null ? !!obj[k] : obj[k] === v
}

export const keyHasValue = hasKeyWithValue
