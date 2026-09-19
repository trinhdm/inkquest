import { filterProps, styleProps } from './helpers'
import { getDefaultProps } from '@/lib/registries'

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

	type P = Record<string, unknown>
	const incoming = styleProps(_props)

	for (const key of Object.keys(incoming))
		if ((incoming as P)[key] !== undefined)
			(props as P)[key] = (incoming as P)[key]

	return props
}
