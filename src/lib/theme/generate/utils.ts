import { isObject } from '@/utils/helpers'
import type { TokenEntry } from './types'

export const isSkippable = (value: unknown): boolean =>
	value === null
	|| value === undefined
	|| value === ''
	|| typeof value === 'function'

type Position = `${number}00` | `0${number}`

const isHexColorValue = (value: unknown): value is string =>
	typeof value === 'string'
	&& value.startsWith('#')
	&& (value.length === 4 || value.length === 7)

export const labelStep = (index: number, value?: unknown): Position | `${number}` => {
	const position = index + 1,
		step = `0${position}` as const

	if (isHexColorValue(value))
		return `${position}00` as const

	return position < 10 ? step : String(position) as `${number}`
}


export const toEntry = ({
	name,
	value,
}: Pick<TokenEntry, 'name'> & { value: unknown }): TokenEntry[] =>
	(!name || isSkippable(value)) ? [] : [{ name, value: String(value) }]


const SHORTHAND_KEYS = {
	border: ['color', 'style', 'width'],
	font: ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight'],
} as const satisfies Record<string, readonly string[]>

const isShorthandMatch = <K extends keyof typeof SHORTHAND_KEYS>(
	value: unknown,
	property: K
): value is Record<(typeof SHORTHAND_KEYS)[K][number], unknown> => {
	if (typeof value !== 'object' || value === null) return false

	const keys = Object.keys(value),
		keysToMatch = SHORTHAND_KEYS[property]

	return keys.length === keysToMatch.length
		&& keysToMatch.every(key => keys.includes(key))
}

export const validate = () => {
	type N = number

	return {
		hex: (value: unknown) => isHexColorValue(value),
		numeric: {
			integer: (num: N) => num % 1 === 0,
			percent: (num: N) => num > 0 && num <= 1,
			weight: (num: N) => num > 0 && num % 100 === 0,
		},
		shorthand: {
			font: (value: unknown) => isShorthandMatch(value, 'font'),
		},
	}
}

export const hasShorthandMatch = (value: unknown): value is Record<string, unknown> =>
	isObject(value) && Object.values(validate().shorthand).some(check => check(value))
