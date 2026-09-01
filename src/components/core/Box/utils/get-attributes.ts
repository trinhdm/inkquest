import { hasValue, keyHasValue, toKebabCase } from '@/utils/helpers'
import type { ElementType } from 'react'
import type { SpecAttributes } from '@/types/spec'
// import type { ExtractHtmlAttributes } from '@/types/spec'

/** the only fields these helpers read off a component's props */
export interface AttrSource {
	as?: ElementType
	attributes?: SpecAttributes
	unstyled?: boolean
}

type DataSpecs = SpecAttributes['data']

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

const prefixAttributes = <T extends Record<string, any>, S extends string>(
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
const DISABLEABLE_TAGS: readonly string[] = [
	'button', 'fieldset', 'input',
	'optgroup', 'option', 'select', 'textarea',
]

interface CheckOptions {
	isDisabled: boolean
	isUnstyled: boolean
}

// unstyled attributes only
const filterDecorative = <P, E>(
	data: DataSpecs,
	check: CheckOptions
) => {
	if (!check.isUnstyled || !data) return data

	return Object.fromEntries(
		Object.entries(data).filter(([key]) => {
			if (key === 'disabled' && check.isDisabled)
				return false
			return STATE_KEYS.has(key)
		})
	)
}

const getDataAttrs = <P, E>(
	data: DataSpecs,
	check: CheckOptions
) => {
	const dataList = filterDecorative(data, check)
	return prefixAttributes(dataList, 'data')
}

const getHtmlAttrs = (
	_props: AttrSource,
	check: CheckOptions
) => {
	const attrs = new Map<string, unknown>()

	if (_props.as === 'button' && !Object.hasOwn(_props, 'type'))
		attrs.set('type', 'button')

	if (check.isDisabled)
		attrs.set('disabled', true)

	return Object.fromEntries(attrs)
	// as ExtractHtmlAttributes<E>
}

export const getAttributes = (_props: AttrSource) => {
	const { as, attributes } = _props
	const { aria, data } = attributes ?? {}

	const check: CheckOptions = {
		isDisabled: keyHasValue(data, { disabled: true }) && DISABLEABLE_TAGS.includes(`${as}`),
		isUnstyled: keyHasValue(_props, { unstyled: true }),
	}

	const ariaAttrs = prefixAttributes(aria, 'aria'),
		dataAttrs = getDataAttrs(data, check),
		htmlAttrs = getHtmlAttrs(_props, check)

	return {
		...dataAttrs,
		...ariaAttrs,
		...htmlAttrs,
	}
}
