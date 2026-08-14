import { rem } from '@/lib/general';
import { formatToken, getShorthand, type CSSVarArgs } from './format';
import { isObject } from '@/utils/helpers';
import type { CSSVars } from '@/types/shared';
import type { RecordToMap } from '@/types/utils';

type Position = `${number}00` | `0${number}`
const getStep = (num: number, value?: unknown): Position | `${number}` => {
	const isPrimitive = typeof value === 'string' && !value.startsWith('var(--')
	const i = num + 1,
		step = `0${i}` as const

	if (isPrimitive && value.startsWith('#'))
		return `${i}00` as const

	return i < 10 ? step : String(i) as `${number}`
}

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

	const scale = ({ path, prefix, value }: CSSVarArgs<number>) => {
		if (!value) return
		const steps = Array.from({ length: 12 }, (_, i) => i + 1)

		for (let step of steps) {
			step = step * value
			const output = rem(step)
			const name = formatToken({ path: [ 'size', `${step}` ], prefix, value: output })
			assign({ name, value: output })
		}
	}

	const withScale = ({ path, prefix, value }: CSSVarArgs<unknown[]>) => {
		if (!value) return
		const isNum = value.every(v => typeof v === 'number')

		if (isNum) {
			for (const v of value) {
				const step = v % 100 === 0 ? v : rem(v)
				const name = formatToken({ path: [ ...path, `${v}` ], prefix, value: step })
				assign({ name, value: step })
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

		if (typeof value === 'number' && value === 4) {
			scale({ ...args, value })
			return
		}

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
