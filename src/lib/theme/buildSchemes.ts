import { tokenGenerator } from './generate'
import { Tokens } from './tokens'
import { THEME_CONFIGS, type ThemeConfig } from './themeConfig'
import type { ColorScheme, SiteTheme, ThemeTokens } from './types'

const COLOR_SCHEMES = Object.keys(THEME_CONFIGS) as ColorScheme[]
type SchemeTokenList<K extends ColorScheme = ColorScheme> = Pick<ThemeTokens, K>

const buildThemeTokens = <K extends ColorScheme>(
	config: ThemeConfig,
	prefix?: string
): SchemeTokenList<K>[K] => {
	const tokens = {
		theme: config.name,
		accent: Tokens.accent(config),
		color: Tokens.color(config),
		background: Tokens.background(config),
		border: Tokens.border.color(config),
	}

	return tokenGenerator(tokens, prefix)
}

const buildStaticTokens = <K extends keyof ThemeTokens>(
	prefix?: string
): ThemeTokens[K] => {
	const tokens = {
		font: Tokens.typography(),
		space: Tokens.space(),
		breakpoint: Tokens.breakpoint(),
		container: Tokens.container(),
		opacity: Tokens.opacity(),
		pad: Tokens.padding(),
		border: {
			radius: Tokens.border.radius(),
		},
		motion: Tokens.motion(),
	}

	return tokenGenerator(tokens, prefix)
}

const buildPrimitiveTokens = <K extends keyof ThemeTokens>(
	theme: SiteTheme
): ThemeTokens[K] => {
	const { colors, ...baseTheme } = theme
	const colorTokens = tokenGenerator(colors),
		baseTokens = tokenGenerator(baseTheme)

	return { ...colorTokens, ...baseTokens }
}

export const buildSchemes = (
	theme: SiteTheme,
	prefix?: string
): ThemeTokens => {
	const primitives = buildPrimitiveTokens(theme),
		staticTokens = buildStaticTokens(prefix)

	const themes = COLOR_SCHEMES.reduce<SchemeTokenList>((schemes, name) => ({
		...schemes,
		[name]: buildThemeTokens(THEME_CONFIGS[name], prefix),
	}), {} as SchemeTokenList)

	return {
		base: { ...primitives, ...staticTokens },
		...themes,
	}
}
