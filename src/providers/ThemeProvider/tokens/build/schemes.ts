import type { ThemeName, SiteTheme } from '../../theme.types'
import type { CSSVars } from '@/types/shared'
import { tokenGenerator } from '../generate'
import { Config } from '../config'
import { THEME_CONFIGS, THEME_NAMES, type ThemeConfig, type ThemeTokens } from '../config/theme'

export interface ThemeTokensConfig {
	config: ThemeConfig
	prefix?: string
}

const buildSemanticTheme = (
	options: ThemeConfig
) => {
	const { mixer, scheme } = options

	return {
		accent: Config.accent(),
		colors: Config.color({ scheme, mixer }),
		backgrounds: Config.background(options),
		border: Config.border.color({ scheme, mixer }),
	}
}

export const buildThemeTokens = ({ config, prefix }: ThemeTokensConfig): CSSVars => {
	const semanticTokens = buildSemanticTheme(config)
	const tokens = { theme: config.name, ...semanticTokens }

	return tokenGenerator(tokens, prefix)
}

const buildStaticTokens = (prefix?: string): CSSVars => {
	const tokens = {
		fonts: Config.typography(),
		space: Config.space(),
		border: { radius: Config.border.radius() },
		motion: Config.motion(),
	}

	return tokenGenerator(tokens, prefix)
}

const buildPrimitiveTokens = <K extends keyof ThemeTokens>(
	theme: SiteTheme
): ThemeTokens[K] => {
	// let primitives = {}
	const { colors, name, setName, ...baseTheme } = theme
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
