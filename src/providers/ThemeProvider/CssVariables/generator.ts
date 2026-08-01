import { isObject } from '@/utils/helpers'
import { getShorthand, getVariable } from './formatters'
import type { CSSVars, HexCode } from '@/types/shared'
import type { ColorScheme, SiteTheme, ThemeName } from '../theme.types'

const generateCssVars = <T extends Record<string, any>>(
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
				Object.entries(value).forEach(([k, v]) => generate(v, [...path, k]))
				return
			}

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

export const themeToCssVars = (
	theme: SiteTheme,
	prefix: string = ''
) => {
	const darkTheme = {
		themeName: 'dark',
	}

	const lightTheme = {
		themeName: 'light',
	}

	const general = generateCssVars(theme, prefix),
		dark = generateCssVars(darkTheme, prefix),
		light = generateCssVars(lightTheme, prefix)

	const cssVars = { general, dark, light }

	return cssVars
}
