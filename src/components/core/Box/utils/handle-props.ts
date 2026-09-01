import { getAttributes } from './get-attributes'
import { styleProps } from '@/utils/helpers'
import type { PolymorphicProps } from '../Polymorphic'
// attributes?: SpecAttributes

export const handleProps = <P, E>(_props: PolymorphicProps<P, E>) => {
	let props = styleProps(_props)

	// if (!Object.hasOwn(props, 'attributes'))
	// 	return props as T

	// const { attributes, ...rest } = props as T & { attributes?: SpecAttributes }
	const { attributes, ...rest } = props,
		attrs = getAttributes(props)

	return { ...rest, ...attrs }
}
