import { getDefaultProps } from '@/lib/registries'
import { filterProps, styleProps } from '@/utils/helpers'

export const useProps = <T extends object>(
	name: string | undefined | (string | undefined)[],
	_props: T
): T => {
	let props = {} as T

	if (name) {
		const component = Array.isArray(name)
			? name.filter(Boolean).join('.')
			: name
		let defaultProps = getDefaultProps<T>(component)

		if (Object.keys(defaultProps).length) {
			defaultProps = filterProps(defaultProps)
			Object.assign(props, defaultProps)
		}
	}

	const filteredProps = styleProps(_props)
	Object.assign(props, filteredProps)

	return props
}
