export {
	BASE_SCALE, COLOR_TOKENS,
	FONT_FAMILY_SCALE, FONT_SIZE_SCALE, FONT_WEIGHT_SCALE, LINE_HEIGHT_SCALE,
	DURATION_SCALE, EASE_SCALE, RADIUS_SCALE,
	SCREEN_SIZE_SCALE,
} from './tokens/scales'

export {
	alias as tokens,
	buildSchemes,
	paintVariants,
	type ColorVariable,
} from './tokens'

export { setThemeCSS, type ThemeCSSConfig } from './setThemeCSS'
export type { BaseVarKey, SiteTheme, ThemeName } from './types'
