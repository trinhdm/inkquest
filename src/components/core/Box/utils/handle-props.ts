import { getAttributes } from './get-attributes'
import { styleProps } from '@/utils/helpers'
import type { PolymorphicProps } from '../Polymorphic'

export const handleProps = <E, P>(_props: PolymorphicProps<E, P>) => {
	let props = styleProps(_props)

	if (!Object.hasOwn(props, 'attributes'))
		return props as PolymorphicProps<E, P>

	const { attributes, ...rest } = props,
		attrs = getAttributes(_props)

	return { ...rest, ...attrs }
}
