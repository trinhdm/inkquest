import { buildAttributes, type AttrSource } from './buildAttributes'
import { styleProps } from '@/hooks'

export const resolveProps = <T extends AttrSource>(_props: T) => {
	const props = styleProps(_props)

	const { attributes: oldAttrs, ...rest } = props,
		attributes = buildAttributes(props)

	return { ...attributes, ...rest }
}
