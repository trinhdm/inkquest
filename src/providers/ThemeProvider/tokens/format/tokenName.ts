import { _is } from './checks'
import { isObject, toKebabCase } from '@/utils/helpers'
import { getShorthand } from './shorthand'
import type { BaseVarKey } from '../../theme.types'
import type { CSSVars } from '@/types/shared'
import type { RecordToMap } from '@/types/utils'
import { rem } from '@/lib/general'

export interface CSSVarArgs<T> {
	path: string[]
	prefix?: string
	value?: T
}

const FONT_PART_INDEX = {
	family: 1,
	size: 0,
	weight: 0,
} as const

const formatFontName = (name: string) => {
	const parts = name.split('-'),
		index = FONT_PART_INDEX[parts[1] as keyof typeof FONT_PART_INDEX]
	return typeof index === 'number'
		? parts.toSpliced(index, 1).join('-')
		: name
}

const formatName = <T,>({ path, value }: CSSVarArgs<T>): string => {
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

	for (const [i, str] of route.entries()) {
		// let part = toKebabCase(str)

		// if (_is.Plural(part))
		// 	part = part.slice(0, -1)

		route[i] = toKebabCase(str)
	}

	return route
}

export const formatToken = <T,>(args: CSSVarArgs<T>): keyof CSSVars => {
	const name = formatName(args),
		route = formatRoute(args)

	const segments = [name, ...route.slice(1)]
	const { prefix } = args

	if (prefix && !name.startsWith(`--${prefix}`))
		segments.unshift(prefix)

	let token = segments.join('-')
	token = token.replace(/^[- ]*/, '--')

	return `${token as keyof CSSVars}` as const
}

type Position = `${number}00` | `0${number}`
const getStep = (num: number, value?: unknown): Position | `${number}` => {
	const isPrimitive = typeof value === 'string' && !value.startsWith('var(--')
	const i = num + 1,
		step = `0${i}` as const

	if (isPrimitive && value.startsWith('#'))
		return `${i}00` as const

	return i < 10 ? step : String(i) as `${number}`
}



const scale = (steps: number[], base = 4) => steps.reduce((acc, step) => {
	acc.push(rem(step * base))
	return acc
}, [] as ReturnType<typeof rem>[])


export const generateTokens = <T extends Record<string, unknown>>(
	input: T,
	prepend?: string
): CSSVars => {
	const variables: RecordToMap<CSSVars> = new Map()

	const assign = ({ name, value }: { name: keyof CSSVars; value: unknown }) => {
		if (!name || !value) return
		variables.set(name, String(value))
	}

	const toShorthand = (args: CSSVarArgs<Record<string, unknown>>) => {
		const { path, value: { tagName } } = args as CSSVarArgs<T> & { value: { tagName: T } }
		let shorthand = {} as Parameters<typeof assign>[0]

		if (tagName) {
			for (const tag of Object.keys(tagName)) {
				const tagValues = tagName[tag]

				if (!isObject(tagValues)) continue
				if (!Object.keys(tagValues).some(k => k.includes('font'))) continue

				const route = path.length > 1 ? path : ['text']
				shorthand = {
					name: formatToken({ ...args, path: [...route, tag] }),
					value: getShorthand({ property: 'font', values: [args.value!, tagValues] }),
				}
				console.log({ tag, tagValues, shorthand })
				if (!shorthand.value) continue
				assign(shorthand)
			}
		} else {
			shorthand = {
				name: formatToken(args),
				value: getShorthand({ property: 'font', values: [args.value!] }),
			}

			if (!shorthand.value) return
			assign(shorthand)
		}
	}

	const withScale = ({ path, prefix, value }: CSSVarArgs<unknown[]>) => {
		if (!value) return
		const isNum = value.every(v => typeof v === 'number')

		if (isNum) {
			for (const v of value) {
				const step = v * 4
				const name = formatToken({ path: [ ...path, `${step}` ], prefix, value: rem(step) })
				assign({ name, value: rem(step) })
			}
		}
		else {
			for (const [index, v] of value.entries()) {
				const step = getStep(index, v)
				const name = formatToken({ path: [ ...path, step ], prefix, value: v })
				assign({ name, value: v })
			}
		}
	}

	const traverse = <U = T>({ path, prefix, value }: CSSVarArgs<U>) => {
		if (!value) return
		Object.entries(value).forEach(([k, v]) =>
			generate({ value: v, path: [...path, k], prefix }))
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
			const fontKeys = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight'],
				keys = Object.keys(value)

			if (keys.length === fontKeys.length && fontKeys.every(k => keys.includes(k))) {
				toShorthand({ ...args, value })
				return
			}

			if (!Object.hasOwn(value, 'tagName')) {
				traverse({ ...args, value })
				return
			}

			if (!isObject(value.tagName)) return
			toShorthand({ ...args, value })
			return
		}

		assign({ name: formatToken(args), value })
	}

	generate({ value: input, path: [], prefix: prepend })
	return Object.fromEntries(variables) as CSSVars
}
