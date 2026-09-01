import { getDefaultProps } from '@/lib/registries'
import { filterProps, styleProps } from '@/utils/helpers'
import type { FactoryProps } from '@/components/core/Box/Polymorphic/factory'

// type Unwrap<T> = T extends FactoryProps<infer U> ? U : T

export const useProps = <P,>(
	name: string | undefined | (string | undefined)[],
	// _props: T
	_props: FactoryProps<P>
) => {
	// let props = {} as P['props'] & { as?: P['default']['component'] }
	// let props = {} as P['props'] & AsPolymorphic<P>
	let props = {} as FactoryProps<P>

	if (name) {
		const component = Array.isArray(name)
			? name.filter(Boolean).join('.')
			: name
		let defaultProps = getDefaultProps<P>(component)

		if (Object.keys(defaultProps).length) {
			defaultProps = filterProps(defaultProps)
			Object.assign(props, defaultProps)
		}
	}

	const filteredProps = styleProps(_props)
	Object.assign(props, filteredProps)

	return props
}
