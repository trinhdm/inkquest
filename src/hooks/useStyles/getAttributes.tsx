import { isObject, keyWithValue } from '@/utils/helpers'
// import type { DataAttrs } from '@/types/shared'
// import type { RecordToMap } from '@/types/utils'
import type { SharedConfig } from './useStyles'
import type { ValidSpecs } from '@/types/spec'

// const getDataAttrs = <S extends ValidSpecs<S>>({ props }: SharedConfig<S>) => {
// 	const dataAttrs: RecordToMap<DataAttrs> = new Map()
// 	if (!isObject(props)) return dataAttrs

// 	// const attrsMap = {
// 	// 	fullWidth: 'data-block',
// 	// 	priority: 'data-priority',
// 	// 	variant: 'data-variant',
// 	// } as Record<keyof typeof props, keyof DataAttrs>

// 	// for (const [prop, attr] of Object.entries(attrsMap)) {
// 	// 	if (keyWithValue(prop, props))
// 	// 		dataAttrs.set(attr, props[prop])
// 	// }

// 	return dataAttrs
// }

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
	// if (!isObject(args.props)) return {}
	// const data = getDataAttrs(args),
	// 	html = getHtmlAttrs(args),
	// 	attrs = new Map<string, unknown>([...data, ...html])

	const attrs = getHtmlAttrs(args)

	return args.check.isRoot
		? Object.fromEntries(attrs)
		: {}
}
