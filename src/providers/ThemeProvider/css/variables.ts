import { _is } from './checks'
import { isObject, toKebabCase } from '@/utils/helpers'
import { getShorthand } from './shorthand'
import type { BaseVarKey } from '../theme.types'
import type { CSSVars } from '@/types/shared'
import type { RecordToMap } from '@/types/utils'

type ThemeNode =
    | string
    | number
    | ((...args: never[]) => unknown)
    | ThemeNode[]
    | { [key: string]: ThemeNode }

export interface CSSVarArgs<T = ThemeNode> {
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

const formatRoute = <T,>({ path }: CSSVarArgs<T>): CSSVarArgs<T>['path'] => {
	if (!path?.length) return path
	let route = path

	if (route.at(-1) === ('base' as BaseVarKey))
		route = route.slice(0, -1)

	for (const [i, str] of route.entries())
		route[i] = toKebabCase(str)

	return route
}

export const getVariable = <T,>(args: CSSVarArgs<T>): keyof CSSVars => {
	// if (!path?.length) return ''
	const name = formatName(args),
		route = formatRoute(args)

	const segments = [name, ...route.slice(1)]
	const { prefix } = args

	if (prefix && !name.startsWith(`--${prefix}`))
		segments.unshift(prefix)

	let variable = segments.join('-')
	variable = variable.replace(/^[- ]*/, '--')

	return `${variable as keyof CSSVars}` as const
}

type Position = `0${number}`

function getStep(num: number, value?: unknown): string
function getStep(num: Position, value?: never): number
function getStep(num: number | Position, value?: unknown): number | string {
	if (typeof num === 'string')
		return parseFloat(num) - 1

	const isPrimitive = typeof value === 'string' && !value.startsWith('var(--')
	const i = num + 1,
		step = isPrimitive ? i * 100 : `0${i}`
	return i < 10 ? `${step}` as const : String(i)
}


export const nameVariables = <T extends Record<string, unknown>>(
	input: T,
	prepend?: string
): CSSVars => {
	const variables: RecordToMap<CSSVars> = new Map()
	// const vars: Record<string, string> = {}

	const assign = ({ name, value }: { name: keyof CSSVars; value: unknown }) => {
		// vars[name] = String(value)
		variables.set(name, String(value))
	}

	const toFontShorthand = (args: CSSVarArgs<Record<string, unknown>>, tag: string) => ({
		name: getVariable({ ...args, path: ['text', tag] }),
		value: getShorthand({ ...args, tag, property: 'font' }),
	})

	const toShorthand = <U = T>(args: CSSVarArgs<Record<string, unknown>>) => {
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

	const withScale = ({ path, prefix, value }: CSSVarArgs<unknown[]>) => {
		if (!value) return
		for (const [index, v] of value.entries()) {
			const step = getStep(index, v)
			const name = getVariable({ path: [ ...path, step ], prefix, value: v })
			assign({ name, value: v })
		}
	}

	const traverse = <U = T>({ value, path, prefix }: CSSVarArgs<U>) => {
		if (!value) return
		Object.entries(value).forEach(([k, v]) =>
			generate({ value: v as T, path: [...path, k], prefix }))
	}

	const generate = (args: CSSVarArgs<unknown>) => {
		const { value } = args

		if (typeof value === 'function') return
		if (value === undefined) return

		if (Array.isArray(value)) {
			withScale({ ...args, value })
			return
		}

		if (isObject(value)) {
			if (!Object.hasOwn(value, 'tagName')) {
				traverse({ ...args, value })
				return
			}

			if (!isObject(value.tagName)) return
			toShorthand({ ...args, value })
			return
		}

		assign({ name: getVariable(args), value })
	}

	generate({ value: input, path: [], prefix: prepend })
	return Object.fromEntries(variables) as CSSVars
}
