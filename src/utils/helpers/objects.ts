
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

export const isObject = <T extends Record<string, unknown>>(target: unknown): target is T => (
	!!target
	&& target?.constructor === Object
	&& !Array.isArray(target)
)

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

const deepKeys = <T extends Record<string, any>>(obj: T, prefix = '') => {
	let keys = [] as string[]

	for (let key in obj) {
		const value = obj[key]
		const keyList = prefix ? `${prefix}-${key}` : key

		if (isObject(value)) {

			keys = keys.concat(deepKeys(value, keyList))
			// console.log('test', keys)
		}
		else
			keys.push(keyList)
	}

	return keys
}
