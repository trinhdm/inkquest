import { getAttributes } from './get-attributes'
import { styleProps } from '@/utils/helpers'
import type { PolymorphicProps } from '../Polymorphic'

export const handleProps = <P, E>(_props: PolymorphicProps<P, E>) => {
	let props = styleProps(_props)

	const { attributes, ...rest } = props,
		attrs = getAttributes(props)

	return { ...rest, ...attrs }
}
