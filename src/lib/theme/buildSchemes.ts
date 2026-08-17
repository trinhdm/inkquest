import { Config, THEME_CONFIGS, type ThemeConfig } from './tokens'
import { tokenGenerator } from './generate'
import type { ColorScheme, SiteTheme, ThemeTokens } from './types'

const COLOR_SCHEMES = Object.keys(THEME_CONFIGS) as ColorScheme[]
type SchemeTokenList<K extends ColorScheme = ColorScheme> = Pick<ThemeTokens, K>

const buildThemeTokens = <K extends ColorScheme>(
	config: ThemeConfig, prefix?: string
): SchemeTokenList<K>[K] => {
	const tokens = {
		theme: config.name,
		accent: Config.accent(config),
		color: Config.color(config),
		background: Config.background(config),
		border: Config.border.color(config),
	}

	return tokenGenerator(tokens, prefix)
}

const buildStaticTokens = <K extends keyof ThemeTokens>(
	prefix?: string
): ThemeTokens[K] => {
	const tokens = {
		font: Config.typography(),
		space: Config.space(),
		border: {
			radius: Config.border.radius(),
		},
		motion: Config.motion(),
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
