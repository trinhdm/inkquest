import { rem } from '@/lib/general';
import { formatToken, getShorthand, type CSSVarArgs } from './format';
import { isObject } from '@/utils/helpers';
import type { CSSVars } from '@/types/shared';
import type { RecordToMap } from '@/types/utils';

type Position = `${number}00` | `0${number}`
type TokenEntry = { name: keyof CSSVars; value: unknown }
type TokenEntries = (TokenEntry | undefined)[] | undefined

type CSSVarValue<T> =
	Omit<CSSVarArgs<T>, 'value'> & Required<Pick<CSSVarArgs<T>, 'value'>>

const getStep = (num: number, value?: unknown): Position | `${number}` => {
	const isPrimitive = typeof value === 'string' && !value.startsWith('var(--')
	const i = num + 1,
		step = `0${i}` as const

	if (isPrimitive && value.startsWith('#'))
		return `${i}00` as const

	return i < 10 ? step : String(i) as `${number}`
}

// const toEntry = (entry?: TokenEntry): TokenEntry[] | undefined => {
// 	if (!isObject(entry)) return
// 	const { name, value } = entry
// 	return (!name || !value) ? [] : [{ name, value: String(value) }]
// }

const toEntry = ({ name, value }: TokenEntry): TokenEntry[] =>
	(!name || value === undefined) ? [] : [{ name, value: String(value) }]

const convertPX = (args: CSSVarValue<number>): TokenEntry[] => {
	const name = formatToken(args),
		output = rem(args.value)

	return toEntry({ name, value: output })
}

const scaleTokens = ({ path, prefix, value }: CSSVarValue<number>): TokenEntry[] => {
	const steps = Array.from({ length: 12 }, (_, i) => i + 1)
	const pathname = path.slice(1)

	return steps.flatMap(v => {
		const step = v * value,
			output = rem(step)
		const name = formatToken({ path: [...pathname, `${step}`], prefix, value: output })
		return toEntry({ name, value: output })
	})
}

const asNumeric = (args: CSSVarValue<number>) => {
	const { path, value } = args,
		start = path[0].toLowerCase()

	if (start === 'scale')
		return scaleTokens(args)

	else if (start.includes('size'))
		return convertPX(args)

	return toEntry({ name: formatToken(args), value })
}

const withScale = ({ path, prefix, value }: CSSVarValue<unknown[]>): TokenEntry[] =>
	value.flatMap((v, i) => {
		let output = v,
			step = getStep(i, v)

		if (typeof v === 'number') {
			if (path[0].toLowerCase().includes('size')) {
				step = `${v}`
				output = rem(v)
			} else if (v > 0 && v % 100 === 0) {
				step = `${v}`
			} else {
				output = rem(v)
			}
		}

		const pathname = [...path, step],
			name = formatToken({ path: pathname, prefix, value: output })

		return toEntry({ name, value: output })
	})


const toShorthand = (args: CSSVarValue<Record<string, unknown>>): TokenEntries => {
	const { value } = args
	let shorthand: TokenEntry | undefined

	const fontKeys = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight'],
		keys = Object.keys(value)

	if (keys.length === fontKeys.length && fontKeys.every(k => keys.includes(k))) {
		shorthand = {
			name: formatToken(args),
			value: getShorthand({ property: 'font', values: [value!] }),
		}
	}

	if (!shorthand) return
	return toEntry(shorthand)
}

const traverse = ({ path, prefix, value }: CSSVarValue<Record<string, unknown>>): TokenEntries =>
	Object.entries(value).flatMap(([k, v]) =>
		generate({ value: v, path: [...path, k], prefix }))

const generate = (args: CSSVarArgs<unknown>): TokenEntries => {
	const { value } = args

	if (value === undefined) return
	if (typeof value === 'function') return

	if (typeof value === 'number')
		return asNumeric({ ...args, value })

	if (Array.isArray(value))
		return withScale({ ...args, value })

	if (isObject(value)) {
		const shorthand = toShorthand({ ...args, value })
		return shorthand ?? traverse({ ...args, value })
	}

	return toEntry({ name: formatToken(args), value })
}

export const generateTokens = <T extends Record<string, unknown>>(
	input: T,
	prepend?: string
): CSSVars => {
	const variables: RecordToMap<CSSVars> = new Map()
	let entries = generate({ value: input, path: [], prefix: prepend }) ?? []
	entries = entries.filter(Boolean)

	for (const { name, value } of entries as TokenEntry[])
		variables.set(name, String(value))

	return Object.fromEntries(variables) as CSSVars
}
