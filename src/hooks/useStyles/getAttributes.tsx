import { isObject, keyWithValue } from '@/utils/helpers'
import type { SharedConfig } from './useStyles'
import type { ValidSpecs } from '@/types/spec'

const getHtmlAttrs = <S extends ValidSpecs<S>>(config: SharedConfig<S>) => {
	const { props }: { props: S['props'] } = config
	const attrs = new Map<string, unknown>()

	if (!isObject(props)) return attrs

	if (config.props.as === 'button' && !(keyWithValue('type', props)))
		attrs.set('type', 'button')

	if (keyWithValue(['disabled', true], props) && typeof config.props.as === 'string') {
		const validTags: readonly string[] = [
			'button', 'fieldset', 'input',
			'optgroup', 'option', 'select', 'textarea',
		]
		if (validTags.includes(config.props.as))
			attrs.set('disabled', true)
	}

	return attrs
}

export const getAttributes = <S extends ValidSpecs<S>>(args: SharedConfig<S>) => {
	const attrs = getHtmlAttrs(args)

	return args.check.isRoot
		? Object.fromEntries(attrs)
		: {}
}
