import { hasValue, isObject, keyWithValue, toKebabCase } from '@/utils/helpers'
import type { SharedConfig } from './useStyles'
import type { ValidSpecs } from '@/types/spec'

type PrefixedAttributes<T extends Record<string, any>, S extends string> = {
	[K in keyof T as `${S}-${string & K}`]?: T[K]
}

const formatAttribute = (key: string) => {
	let attribute = key,
		parts = [] as string[],
		prefix = ''

	if (key.startsWith('aria-') || key.startsWith('data-')) {
		([prefix, ...parts] = key.split('-'))
		attribute = parts.join('-')
		parts = [prefix]
	}

	attribute = toKebabCase(attribute)
	parts.push(attribute)

	return parts.join('-')
}

export const prefixAttributes = <T extends Record<string, any>, S extends string>(
	attributes: T | undefined,
	prefix: S
): PrefixedAttributes<T, S> => {
	if (!attributes) return {}
	const attrs = Object.entries(attributes)

	return attrs.reduce<PrefixedAttributes<T, S>>((acc, [key, value]) => {
		const k = formatAttribute(`${prefix}-${key}`) as keyof PrefixedAttributes<T, S>
		if (hasValue(value)) acc[k] = value
		return acc
	}, {} as PrefixedAttributes<T, S>)
}

// attributes that reflect functional/interaction state, not visual styling —
// kept even when `unstyled`, unlike every other entry in a component's `data` bag
const STATE_KEYS = new Set([
	'busy', 'checked', 'disabled', 'expanded',
	'invalid', 'loading', 'pressed', 'readonly',
	'required', 'selected',
])

const filterDecorative = (data: Record<string, unknown>, isInstanceUnstyled: boolean) => {
	if (!isInstanceUnstyled) return data

	return Object.fromEntries(
		Object.entries(data).filter(([key]) => STATE_KEYS.has(key))
	)
}

const getHtmlAttrs = <S extends ValidSpecs<S>>(props: S['props']) => {
	const attrs = new Map<string, boolean | string>()

	if (!isObject(props)) return attrs

	if (props.as === 'button' && !(keyWithValue('type', props)))
		attrs.set('type', 'button')

	if (keyWithValue(['disabled', true], props) && typeof props.as === 'string') {
		const validTags: readonly string[] = [
			'button', 'fieldset', 'input',
			'optgroup', 'option', 'select', 'textarea',
		]
		if (validTags.includes(props.as))
			attrs.set('disabled', true)
	}

	return attrs
}

export const getAttributes = <S extends ValidSpecs<S>>(args: SharedConfig<S>) => {
	const { check, config, props } = args

	const htmlAttrs = check.isRoot
		? Object.fromEntries(getHtmlAttrs(props))
		: {}

	if (!config) return htmlAttrs

	const { aria, data } = config ?? {}
	const decorative = data && filterDecorative(data, check.isUnstyled)

	return {
		...htmlAttrs,
		...prefixAttributes(aria, 'aria'),
		...prefixAttributes(decorative, 'data'),
	}
}
