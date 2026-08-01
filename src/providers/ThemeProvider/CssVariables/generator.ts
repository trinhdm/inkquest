import { isObject } from '@/utils/helpers'
import { getShorthand, getVariable } from './formatters'
import type { CSSVars, HexCode } from '@/types/shared'
import type { ColorScheme, SiteTheme, ThemeName, ThemeTokens } from '../theme.types'

const generateCssVars = <T extends Record<string, unknown>>(
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

const getThemeColors = (
	theme: SiteTheme,
	scheme: ColorScheme
) => {
	if (!Object.hasOwn(theme.colors, scheme)) return {}

	const colors = theme.colors[scheme],
		vars = {}

	for (const [index, color] of colors.entries()) {
		const step = index + 1,
			id = step < 10 ? `0${step}` : step
			// name = `color-${i}`

		Object.assign(vars, { [id]: color })
	}

	return vars as CSSVars<HexCode>
}

type KeysInBoth<T, U> = keyof { [K in keyof T as K extends U ? K : never]: T[K] }

type BuildThemeScheme<
	K extends keyof ThemeTokens,
	N extends KeysInBoth<ThemeTokens, ThemeName>,
> = {
	name: K extends N ? N : never
	scheme: ColorScheme
}

type BuildThemeBase = {
	name?: never
	scheme?: never
}

type BuildThemeProps<
	K extends keyof ThemeTokens,
	N extends KeysInBoth<ThemeTokens, ThemeName>,
> = {
	theme: SiteTheme
	prefix?: string
} & (BuildThemeScheme<K, N> | BuildThemeBase)

const buildTheme = <
	// T extends ThemeTokens,
	K extends keyof ThemeTokens,
	N extends KeysInBoth<ThemeTokens, ThemeName>,
	X extends Exclude<K, ThemeName>,
	R extends ThemeTokens[K extends N ? N : X]
	// N extends keyof { [K in keyof ThemeTokens as K extends ThemeName ? K : never]?: T[K] }
>(options: BuildThemeProps<K, N>): R => {
	const { prefix, theme } = options

	const isConfigTheme = (Object.hasOwn(options, 'name') && options['name'])
		&& (Object.hasOwn(options, 'scheme') && options['scheme'])

	if (!isConfigTheme) {
		const { colors, ...baseTheme } = theme
		return generateCssVars(baseTheme, prefix) as R
	}

	const { name, scheme } = options

	if (!Object.hasOwn(theme.colors, scheme)) return {} as R

	const config = { theme: name } as CSSVars
	const baseColors = getThemeColors(theme, scheme)

	// Object.assign(config, baseColors)

	const colors = {
		[scheme]: baseColors,
		focus: `var(--inkq-color-03)`,
		text: `var(--inkq-color-01)`,
	}

	Object.assign(config, { colors })

	const vars = generateCssVars(config, prefix)

	return vars as R
}

export const themeToCssVars = (
	theme: SiteTheme,
	prefix?: string
) => {
	const options = { theme, prefix }

	const base = buildTheme(options),
		dark = buildTheme({ name: 'dark', scheme: 'ink', ...options }),
		light = buildTheme({ name: 'light', scheme: 'paper', ...options })

	const cssVars: ThemeTokens = { base, dark, light }

	return cssVars
}
