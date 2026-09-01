import {
	BASE_SCALE, COLOR_TOKENS,
	FONT_FAMILY_SCALE, FONT_SIZE_SCALE, FONT_WEIGHT_SCALE,
	LINE_HEIGHT_SCALE, TRACKING_SCALE,
	DURATION_SCALE, EASE_SCALE, OPACITY_SCALE,
	RADIUS_SCALE, SCREEN_SCALE,
	type SiteTheme,
} from '@/lib/theme'

export const DEFAULT_THEME: SiteTheme = {
	scale: {
		size: BASE_SCALE,
	},

	colors: COLOR_TOKENS,

	fontFamily: FONT_FAMILY_SCALE,
	fontWeight: [...FONT_WEIGHT_SCALE],
	fontSize: [...FONT_SIZE_SCALE],

	lineHeight: LINE_HEIGHT_SCALE,
	tracking: TRACKING_SCALE,

	radius: [...RADIUS_SCALE],

	duration: DURATION_SCALE,
	easing: EASE_SCALE,

	opacity: [...OPACITY_SCALE],

	screenSize: [...SCREEN_SCALE],
}
