import { getAttributes, type AttrSource } from './getAttributes'
import { styleProps } from '@/hooks'

export const handleProps = <T extends AttrSource>(_props: T) => {
	let props = styleProps(_props)

	const { attributes, ...rest } = props,
		attrs = getAttributes(_props)

	return { ...rest, ...attrs }
}
