import { getDefaultProps } from '@/lib/registries'

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

		if (omitEmpty) isValid = isValid && !!value
		if (isValid) acc[key] = value

		return acc
	}, {} as FilteredProps<T>)
)

type StyleableProps = {
	classNames?: unknown
	styles?: unknown
}

type RenamedProps<T extends StyleableProps> = Omit<T, 'classNames' | 'styles'> & {
	className?: T['classNames']
	style?: T['styles']
}

export const useProps = <T extends object & StyleableProps>(
	name: string | undefined | (string | undefined)[],
	_props: T
): T => {
	let props = {} as T,
		incProps = _props as RenamedProps<T>

	if (name) {
		const component = Array.isArray(name)
			? name.filter(Boolean).join('.')
			: name
		let defaultProps = getDefaultProps<T>(component)

		if (Object.keys(defaultProps).length) {
			defaultProps = filterProps(defaultProps)
			props = { ...props, ...defaultProps }
		}
	}

	if (Object.hasOwn(_props, 'classNames') || Object.hasOwn(_props, 'styles')) {
		const { classNames, styles, ...rest } = _props
		incProps = { ...rest }

		if (Object.hasOwn(_props, 'classNames') && classNames)
			Object.assign(incProps, { className: classNames })

		if (Object.hasOwn(_props, 'styles') && styles)
			Object.assign(incProps, { style: styles })
	}

	const filtered = filterProps(incProps)

	return { ...props, ...filtered } as T
}
