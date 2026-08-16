import { Config } from './config'
import { tokenGenerator } from './generate'
import { THEME_CONFIGS, type ThemeConfig, type ThemeTokens } from './config/theme'
import type { CSSVars } from '@/types/shared'
import type { ThemeName, SiteTheme } from '../theme.types'

export interface ThemeTokensConfig {
	config: ThemeConfig
	prefix?: string
}

const THEME_NAMES = Object.keys(THEME_CONFIGS) as ThemeName[]

export const buildThemeTokens = ({ config, prefix }: ThemeTokensConfig): CSSVars => {
	const tokens = {
		theme: config.name,
		accent: Config.accent(),
		colors: Config.color(config),
		backgrounds: Config.background(config),
		border: Config.border.color(config),
	}

	return tokenGenerator(tokens, prefix)
}

const buildStaticTokens = (prefix?: string): CSSVars => {
	const tokens = {
		fonts: Config.typography(),
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
