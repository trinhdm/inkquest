import { Config, THEME_CONFIGS, type ThemeConfig } from './tokens/config'
import { tokenGenerator } from './tokens/generate'
import type { CSSVars } from '@/types/shared'
import type { SiteTheme, ThemeName } from './types'
import type { ThemeTokens } from './tokens/token.types'

export interface ThemeTokensConfig {
	config: ThemeConfig
	prefix?: string
}

const THEME_NAMES = Object.keys(THEME_CONFIGS) as ThemeName[]

export const buildThemeTokens = ({ config, prefix }: ThemeTokensConfig): CSSVars => {
	const tokens = {
		theme: config.name,
		accent: Config.accent(config),
		color: Config.color(config),
		background: Config.background(config),
		border: Config.border.color(config),
	}

	return tokenGenerator(tokens, prefix)
}

const buildStaticTokens = (prefix?: string): CSSVars => {
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

	const themes = THEME_NAMES.reduce<Record<ThemeName, CSSVars>>((schemes, name) => ({
		...schemes,
		[name]: buildThemeTokens({ config: THEME_CONFIGS[name], prefix }),
	}), {} as Record<ThemeName, CSSVars>)

	return {
		base: { ...primitives, ...staticTokens },
		...themes,
	}
}
