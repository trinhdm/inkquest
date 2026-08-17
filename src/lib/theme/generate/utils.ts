import type { TokenEntry } from './types'

export const isSkippable = (value: unknown): boolean =>
	value === null
	|| value === undefined
	|| value === ''
	|| typeof value === 'function'

type Position = `${number}00` | `0${number}`

const isHexColorValue = (value: unknown): value is string =>
	typeof value === 'string' && value.startsWith('#')

export const labelStep = (index: number, value?: unknown): Position | `${number}` => {
	const position = index + 1,
		step = `0${position}` as const

	if (isHexColorValue(value))
		return `${position}00` as const

	return position < 10 ? step : String(position) as `${number}`
}


const FONT_SHORTHAND_KEYS = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight']

export const isFontShorthandMatch = (value: unknown): value is Record<string, unknown> => {
	if (typeof value !== 'object' || value === null) return false
	const keys = Object.keys(value)
	return keys.length === FONT_SHORTHAND_KEYS.length
		&& FONT_SHORTHAND_KEYS.every(key => keys.includes(key))
}


export const toEntry = ({ name, value }: Pick<TokenEntry, 'name'> & { value: unknown }): TokenEntry[] =>
	(!name || isSkippable(value)) ? [] : [{ name, value: String(value) }]


export const validate = () => {
	type N = number
	return {
		integer: (num: N) => num % 1 === 0,
		percent: (num: N) => num >= 0 && num <= 1,
		weight: (num: N) => num > 0 && num % 100 === 0,
	}
}
