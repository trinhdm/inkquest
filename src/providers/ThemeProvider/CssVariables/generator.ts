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

interface ThemeColorsConfig {
	prefix?: string
	scheme: ColorScheme
	theme: SiteTheme
}

const getThemeColor = (
	step: `0${number}`,
	options: ThemeColorsConfig,
	isAltScheme: boolean = false
) => {
	const { prefix, scheme, theme } = options

	const alt = scheme === 'ink' ? 'paper' : 'ink',
		colorScheme = isAltScheme ? alt : scheme

	const colors = theme.colors[scheme],
		index = parseFloat(step) - 1,
		value = colors[index]

	const variable = getVariable({ path: ['color', colorScheme, step], prefix, value })

	return `var(${variable})`
}

const getThemeColors = ({
	as = 'hex',
	prefix,
	scheme,
	theme,
}: ThemeColorsConfig & {
	as?: 'hex' | 'var'
}) => {
	if (!Object.hasOwn(theme.colors, scheme)) return {}

	const colors = theme.colors[scheme],
		vars = {}

	for (const [index, value] of colors.entries()) {
		const i = index + 1,
			step = i < 10 ? `0${i}` : String(i),
			variable = getVariable({ path: ['color', scheme, step], prefix, value }),
			color = as === 'hex' ? value : `var(${variable})`

		Object.assign(vars, { [step]: color })
	}

	return vars as CSSVars<HexCode>
}

type KeysInBoth<T, U> = keyof { [K in keyof T as K extends U ? K : never]: T[K] }

type BuildThemeScheme<
	K extends keyof ThemeTokens,
	N extends KeysInBoth<ThemeTokens, ThemeName>,
> = {
	name: K extends N ? N : never
	scheme: ThemeColorsConfig['scheme']
}

type BuildThemeBase = {
	name?: never
	scheme?: never
}

type BuildThemeProps<
	K extends keyof ThemeTokens,
	N extends KeysInBoth<ThemeTokens, ThemeName>,
> =
	Pick<ThemeColorsConfig, 'prefix' | 'theme'>
	& (BuildThemeScheme<K, N> | BuildThemeBase)

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
		const { colors, ...baseTheme } = theme,
			schemes = Object.keys(colors) as (keyof typeof colors)[],
			vars = {}
		// const brandColors = getThemeColors(theme, 'brand')

		for (const scheme of schemes)
			Object.assign(vars, { [scheme]: getThemeColors({ ...options, scheme }) })

		Object.assign(baseTheme, { colors: vars })

		return generateCssVars(baseTheme, prefix) as R
	}

	return configureTheme(options) as R
}

const configureTheme = <
	K extends keyof ThemeTokens,
	N extends ThemeName,
>(options: BuildThemeProps<K, N>) => {
	const {
		name,
		theme,
		scheme,
		prefix,
	} = options

	const isConfigTheme = name && scheme
	if (!isConfigTheme || !Object.hasOwn(theme.colors, scheme)) return {}

	const baseColors = getThemeColors({ theme, scheme, prefix, as: 'var' })

	const border = {
		strong: getThemeColor('06', options, true),
		subtle: getThemeColor('05', options, true),
		text: getThemeColor('04', options, true),
	}

	const colors = {
		...baseColors,
		// accent: getThemeColor('01', options),
		cta: `var(--inkq-color-03)`,
		focus: `var(--inkq-color-03)`,
		text: getThemeColor('01', options, true),
		// 'accent-text': getThemeColor('01', options, true),
		// text: `var(--inkq-color-${altScheme}-01)`,
	}

	const config = { theme: name } as CSSVars
	Object.assign(config, { border, colors })

	return generateCssVars(config, prefix)
}

// build theme
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
