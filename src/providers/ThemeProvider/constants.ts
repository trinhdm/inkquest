import { rem } from '@/lib/general'
import {
	paintVariants, tokens,
	BASE_SCALE, COLOR_TOKENS,
	FONT_FAMILY_SCALE, FONT_SIZE_SCALE, FONT_WEIGHT_SCALE, LINE_HEIGHT_SCALE,
	DURATION_SCALE, EASE_SCALE, RADIUS_SCALE,
	SCREEN_SIZE_SCALE,
	type SiteTheme,
} from '@/lib/theme'
// import { themeControls } from '@/components/core/ScriptInjector'

// const { applyTheme, getStoredTheme, persistTheme } = themeControls()

export const DEFAULT_THEME: SiteTheme = {
	// get name() { return getStoredTheme() },
	// setName: (theme) => { applyTheme(theme); persistTheme(theme) },

	paintVariants,
	tokens,

	scale: {
		size: BASE_SCALE,
	},

	colors: COLOR_TOKENS,

	fontFamily: FONT_FAMILY_SCALE,
	fontWeight: [...FONT_WEIGHT_SCALE],
	fontSize: [...FONT_SIZE_SCALE],

	lineHeight: LINE_HEIGHT_SCALE,

	breakpoints: {
		xs: rem(360),
		sm: rem(768),
		md: rem(1080),
		lg: rem(1280),
		xl: rem(1440),
	},

	radius: [...RADIUS_SCALE],

	easing: EASE_SCALE,

	duration: DURATION_SCALE,

	screenSize: [...SCREEN_SIZE_SCALE],
	// width: [ 1200 ],
}
