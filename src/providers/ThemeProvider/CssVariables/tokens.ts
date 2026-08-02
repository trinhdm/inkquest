import { generateCssVars } from './generator'
import { getThemeColors, ThemeColor, type ThemeColorsConfig } from './themeColors'
import type { CSSVars } from '@/types/shared'
import type { SiteTheme, ThemeName, ThemeTokens } from '../theme.types'

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

	const baseColors = getThemeColors({ ...options, as: 'var' })

	const accent = {
		base: ThemeColor.accent('01', options),
		hover: ThemeColor.accent('02', options),
		text: ThemeColor.alt('01', options),
	}

	const border = {
		base: ThemeColor.alt('05', options),
		strong: ThemeColor.alt('06', options),
		text: ThemeColor.alt('04', options),
	}

	const colors = {
		...baseColors,
		text: ThemeColor.alt('01', options),
	}

	const config = { theme: name } as CSSVars
	Object.assign(config, { colors, accent, border })

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
