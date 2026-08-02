import { generateCssVars } from './generator'
import { getThemeColors, ThemeColor } from './themeColors'
import { keyWithValue } from '@/utils/helpers'
import type { ColorScheme, SiteTheme, ThemeName } from '@/providers/ThemeProvider'
import type { CSSVars } from '@/types/shared'

export type ThemeTokens<V = unknown> = Record<ThemeName | 'base', CSSVars<V>>

interface TokenBuilder {
	theme: SiteTheme
	prefix?: string
}

type BaseTokenBuilder = TokenBuilder & {
	name?: never
	scheme?: never
}

type ThemeTokenBuilder<K extends ThemeName> = TokenBuilder & {
	name: K | never
	scheme: ColorScheme | never
}

type TokenBuilderOptions<K extends keyof ThemeTokens> =
	K extends ThemeName ? ThemeTokenBuilder<K> : BaseTokenBuilder

const buildTokens = <K extends keyof ThemeTokens>(
	options: TokenBuilderOptions<K>
): ThemeTokens[K] => {
	const { prefix, theme } = options

	const isConfigTheme = keyWithValue('name', options)
		&& keyWithValue('scheme', options)

	if (!isConfigTheme) {
		const { colors, ...baseTheme } = theme,
			schemes = Object.keys(colors) as (keyof typeof colors)[],
			vars = {}

		for (const scheme of schemes)
			Object.assign(vars, { [scheme]: getThemeColors({ ...options, scheme }) })

		return generateCssVars({ ...baseTheme, colors: vars }, prefix)
	}

	return buildThemeTokens(options as TokenBuilderOptions<Exclude<K, 'base'>>)
}

const buildThemeTokens = <K extends ThemeName>(
	options: TokenBuilderOptions<K>
): ThemeTokens[K] => {
	const { name, theme, scheme, prefix } = options
	if (!Object.hasOwn(theme.colors, scheme)) return {}

	const themeColors = getThemeColors({ ...options, as: 'var' })

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
		...themeColors,
		text: ThemeColor.alt('01', options),
	}

	const config = { theme: name, colors, accent, border } as CSSVars
	return generateCssVars(config, prefix) as ThemeTokens[K]
}

export const themeToCssVars = (
	theme: SiteTheme,
	prefix?: string
): ThemeTokens => ({
	base: buildTokens({ theme, prefix }),
	dark: buildTokens({ name: 'dark', scheme: 'ink', theme, prefix }),
	light: buildTokens({ name: 'light', scheme: 'paper', theme, prefix }),
})
