import { _is } from './checks'
import { toKebabCase } from '@/utils/helpers'
import { isObject } from '@/utils/helpers'
import { getShorthand } from '.'
// import { deepSetMap, flattenMap, keyWithValue } from '@/utils/helpers'
import type { CSSVars } from '@/types/shared'
import type { BaseVarKey } from '@/providers/ThemeProvider'

export interface CSSVarArgs<T> {
	path: string[]
	prefix?: string
	value?: T
}

const FONT_PART_INDEX = {
	'family': 1,
	'weight': 0,
} as const

const formatFontName = (name: string) => {
	const parts = name.split('-'),
		index = FONT_PART_INDEX[parts[1] as keyof typeof FONT_PART_INDEX]
	return typeof index === 'number'
		? parts.toSpliced(index, 1).join('-')
		: name
}

const formatName = <T,>({ path, value }: CSSVarArgs<T>) => {
	let name = toKebabCase(path[0])

	if (_is.FontName(name))
		name = formatFontName(name)

	if (_is.Plural(name) && _is.Singular(value))
		name = name.slice(0, -1)

	if (_is.Verb(name))
		name = name.replace('ing', 'e')

	return name
}

const formatRoute = <T,>({ path }: CSSVarArgs<T>) => {
	let route = path

	if (route.at(-1) === ('base' as BaseVarKey))
		route = route.slice(0, -1)

	for (const [i, str] of route.entries())
		route[i] = toKebabCase(str)

	return route
}

export const getVariable = <T,>(args: CSSVarArgs<T>): string => {
	const { path, prefix } = args
	if (!path?.length) return ''

	const name = formatName(args),
		route = formatRoute(args)

	const segments = [name, ...route.slice(1)]

	if (prefix && !name.startsWith(`--${prefix}`))
		segments.unshift(prefix)

	const variable = segments.join('-')
	return variable.replace(/^[- ]*/, '--')
}

type Position = `0${number}`

function getStep(num: number, value: string): string
function getStep(num: Position, value?: never): number
function getStep(num: number | Position, value: string = ''): number | string {
	const isPrimitive = !value.startsWith('var(--')

	if (typeof num === 'number') {
		const i = num + 1,
			step = isPrimitive ? i * 100 : `0${i}`
		return i < 10 ? `${step}` as const : String(i)
	}

	return parseFloat(num) - 1
}


export const nameVariables = <T extends Record<string, unknown>>(
	input: T,
	prepend?: string
): CSSVars => {
	// const variables = new Map()
	const vars: Record<string, string> = {}

	const assign = ({ name, value }: Record<'name' | 'value', string>) => {
		vars[name] = String(value)
	}

	const toFontShorthand = (args: CSSVarArgs<T>, tag: string) => ({
		name: getVariable({ ...args, path: ['text', tag] }),
		value: getShorthand({ ...args, tag, property: 'font' }),
	})

	const toShorthand = (args: CSSVarArgs<T>) => {
		const { value: { tagName } } = args as CSSVarArgs<T> & { value: { tagName: T } }

		for (const tag of Object.keys(tagName)) {
			const tagValues = tagName[tag]
			let shorthand = {} as Parameters<typeof assign>[0]

			if (!isObject(tagValues)) continue
			if (Object.keys(tagValues).some(k => k.includes('font')))
				(shorthand = toFontShorthand(args, tag))

			assign(shorthand)
		}
	}

	const withScale = ({ path, prefix, value }: CSSVarArgs<T>) => {
		if (!value) return
		for (const [index, v] of value.entries()) {
			const step = getStep(index, v)
			const name = getVariable({ path: [ ...path, step ], prefix, value: v })
			assign({ name, value: v })
		}
	}

	const traverse = ({ value, path, prefix }: CSSVarArgs<T>) => {
		if (!value) return
		Object.entries(value).forEach(([k, v]) =>
			generate({ value: v as T, path: [...path, k], prefix }))
	}

	const generate = (args: CSSVarArgs<T>) => {
		const { value } = args

		if (typeof value === 'function') return
		if (value === undefined) return

		if (Array.isArray(value)) {
			withScale(args)
			// for (const [index, val] of value.entries()) {
			// 	const step = getStep(index)
			// 	const name = getVariable({ path: [ ...args.path, step ], value: val })
			// 	assign({ name, value: val })
			// }

			return
		}

		if (isObject(value)) {
			if (!Object.hasOwn(value, 'tagName')) {
				traverse(args)
				return
			}

			if (!isObject(value.tagName)) return
			toShorthand(args)
			return
		}

		assign({ name: getVariable(args), value })
	}

	generate({ value: input, path: [], prefix: prepend })
	return vars as CSSVars
}
