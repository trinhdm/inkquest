
type FilteredProps<T extends object> = {
	[K in keyof T]: T[K] extends undefined ? never : T[K]
}

const filterProps = <T extends object>(props: T) => (
	(Object.keys(props) as (keyof T)[]).reduce<FilteredProps<T>>((acc, key) => {
		if (Object.hasOwn(props, key)) acc[key] = props[key]
		return acc
	}, {} as FilteredProps<T>)
)

export const useProps = <T extends object>(
	component: string | (string | undefined)[],
	defaultProps: Partial<T>,
	props: T
): T => {
	const filtered = filterProps(props)
	return { ...defaultProps, ...filtered } as T
}
