import { isObject } from '@/utils/helpers'
import { getShorthand, getVariable, type CSSVarArgs } from '../format'
import type { CSSVars } from '@/types/shared'

export const generateCssVars = <T extends Record<string, unknown>>(
	input: T,
	prepend?: string
): CSSVars => {
	const vars: Record<string, string> = {}

	const assign = ({ name, value }: Record<'name' | 'value', string>) => {
		vars[name] = String(value)
	}

	const toFontShorthand = (args: CSSVarArgs<T>, tag: string) => ({
		name: getVariable({ ...args, path: ['text', tag] }),
		value: getShorthand({ ...args, tag, property: 'font' })
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

	const traverse = ({ value, path, prefix }: CSSVarArgs<T>) => {
		Object.entries(value).forEach(([k, v]) =>
			generate({ value: v as T, path: [...path, k], prefix }))
	}

	const generate = (args: CSSVarArgs<T>) => {
		const { value } = args

		if (typeof value === 'function') return
		if (value === undefined) return

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
