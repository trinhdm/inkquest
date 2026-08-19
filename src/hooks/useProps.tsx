import { getDefaultProps } from '@/lib/registries'
import { hasValue } from '@/utils/helpers'

type DataAttributes<T extends Record<string, any>, S extends string> = {
	[K in keyof T as `${S}-${string & K}`]: string
}

const prefixAttributes = <T extends Record<string, any>, S extends string>(
	attributes: T | undefined,
	prefix: S
): DataAttributes<T, S> | undefined => {
	if (!attributes) return
	const attrs = Object.entries(attributes)

	return attrs.reduce<DataAttributes<T, S>>((acc, [key, value]) => {
		const k = `${prefix}-${key}` as keyof DataAttributes<T, S>
		if (hasValue(value)) acc[k] = value
		return acc
	}, {} as DataAttributes<T, S>)
}

type FilteredProps<T extends object> = {
	[K in keyof T]: T[K] extends undefined
		? never : T[K]
}

export const filterProps = <T extends object>(
	props: T,
	omitEmpty = false
): FilteredProps<T> => (
	(Object.keys(props) as (keyof T)[]).reduce<FilteredProps<T>>((acc, key) => {
		const value = props[key] as FilteredProps<T>[typeof key]
		let isValid = Object.hasOwn(props, key)

		if ((key === 'aria' || key === 'data') && value) {
			const attrs = prefixAttributes(value, key)
			if (attrs) acc = { ...acc, ...attrs }
		} else {
			if (omitEmpty) isValid = isValid && !!value
			if (isValid) acc[key] = value
		}

		return acc
	}, {} as FilteredProps<T>)
)

export const useProps = <T extends object>(
	name: string | undefined | (string | undefined)[],
	props: T
): T => {
	let defaultProps = {} as Partial<T>

	if (name) {
		const component = Array.isArray(name)
			? name.filter(Boolean).join('.')
			: name
		defaultProps = getDefaultProps<T>(component)
	}

	const defaults = filterProps(defaultProps),
		filtered = filterProps(props)

	return { ...defaults, ...filtered } as T
}
