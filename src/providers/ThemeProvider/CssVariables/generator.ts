import { isObject } from '@/utils/helpers'
import { getShorthand, getVariable } from './formatters'
import type { CSSVars } from '@/types/shared'

export const generateCssVars = <T extends Record<string, unknown>>(
	input: T,
	prefix?: string
): CSSVars => {
	const vars: Record<string, string> = {}

	const generate = (value: T, path: string[]) => {
		if (typeof value === 'function') return
		if (value === undefined) return

		const args = { path, prefix, value }
		let name = getVariable(args)

		if (isObject(value)) {
			if (!Object.hasOwn(value, 'tagName')) {
				Object.entries(value).forEach(([k, v]) => generate(v as T, [...path, k]))
				return
			}

			if (!isObject(value['tagName'])) return
			const tags = Object.keys(value['tagName'])

			for (const tag of tags) {
				name = getVariable({ ...args, path: ['text', tag] })
				vars[name] = getShorthand({ property: 'font', tag, value })
			}

			return
		}

		vars[name] = String(value)
	}

	generate(input, [])
	return vars as CSSVars
}
