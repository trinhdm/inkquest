import { isObject, keyWithValue } from '@/utils/helpers'
import type { SharedConfig } from './useStyles'
import type { ValidSpecs } from '@/types/spec'

const getHtmlAttrs = <S extends ValidSpecs<S>>(config: SharedConfig<S>) => {
	const { props } = config
	const attrs = new Map<string, unknown>()

	if (!isObject(props)) return attrs

	if (keyWithValue(['as', 'button'], props) && !(keyWithValue('type', props)))
		attrs.set('type', 'button')

	if (keyWithValue(['disabled', true], props) && Object.hasOwn(props, 'as')) {
		const validTags: (keyof HTMLElementTagNameMap)[] = [
			'button', 'fieldset', 'input',
			'optgroup', 'option', 'select', 'textarea',
		]
		if (validTags.includes(props?.as))
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
