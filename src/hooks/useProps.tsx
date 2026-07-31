import { getDefaultProps } from '@/lib/registries'

type FilteredProps<T extends object> = {
	[K in keyof T]: T[K] extends undefined ? never : T[K]
}

export const filterProps = <T extends object>(
	props: T,
	omitEmpty = false
) => (
	(Object.keys(props) as (keyof T)[]).reduce<FilteredProps<T>>((acc, key) => {
		const value = props[key] as FilteredProps<T>[typeof key]
		let isValid = Object.hasOwn(props, key)

		if (omitEmpty) isValid = isValid && !!value
		if (isValid) acc[key] = value

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
