import { getDefaultProps } from '@/lib/registries'
import { filterProps, styleProps } from '@/utils/helpers'

export const useProps = <T extends object>(
	name: string | undefined | (string | undefined)[],
	_props: T
): T => {
	const props = {} as T

	if (name) {
		const target = Array.isArray(name) ? name.filter(Boolean).join('.') : name,
			defaultProps = getDefaultProps<T>(target)

		if (Object.keys(defaultProps).length)
			Object.assign(props, filterProps(defaultProps))
	}

	Object.assign(props, styleProps(_props))

	return props
}
