export {
	BASE_SCALE, COLOR_TOKENS, SCREEN_SIZE_SCALE,
	FONT_FAMILY_SCALE, FONT_SIZE_SCALE, FONT_WEIGHT_SCALE, LINE_HEIGHT_SCALE,
	DURATION_SCALE, EASE_SCALE, RADIUS_SCALE,
} from './scales'

export { alias as tokens } from './reference'
export { buildSchemes } from './buildSchemes'
export { getVariantColors, paintVariants } from './variants'
export { setThemeCSS, type ThemeCSSConfig } from './setThemeCSS'

export type {
	BaseVarKey, ColorVariable, ColorScheme,
	SiteTheme, ThemeName, ThemeTokens,
} from './types'
