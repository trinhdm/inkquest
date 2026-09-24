import { keyHasValue } from '@/utils/helpers'
import { prefixAttributes } from './prefixAttributes'
import type { ElementType } from 'react'
import type { SpecAttributes } from '@/types/shared'

/** the only fields these helpers read off a component's props */
export interface AttrSource {
	as?: ElementType
	attributes?: SpecAttributes
	unstyled?: boolean
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
const keepStateAttrs = (
	data: SpecAttributes['data'],
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

const getDataAttrs = (
	data: SpecAttributes['data'],
	check: CheckOptions
) => {
	const dataList = keepStateAttrs(data, check)
	return prefixAttributes(dataList, 'data')
}

const getNativeAttrs = (
	_props: AttrSource,
	check: CheckOptions
) => {
	const attrs = new Map<string, unknown>()

	if (_props.as === 'button' && !Object.hasOwn(_props, 'type'))
		attrs.set('type', 'button')

	if (check.isDisabled)
		attrs.set('disabled', true)

	return Object.fromEntries(attrs)
}

export const buildAttributes = (_props: AttrSource) => {
	const { as, attributes } = _props
	const { aria, data } = attributes ?? {}

	const check: CheckOptions = {
		isDisabled: keyHasValue(data, { disabled: true }) && DISABLEABLE_TAGS.includes(`${as}`),
		isUnstyled: keyHasValue(_props, { unstyled: true }),
	}

	const ariaAttrs = prefixAttributes(aria, 'aria'),
		dataAttrs = getDataAttrs(data, check),
		nativeAttrs = getNativeAttrs(_props, check)

	return {
		...dataAttrs,
		...ariaAttrs,
		...nativeAttrs,
	}
}
