import { alias as tokens, paintVariants } from './tokens'
import { rem } from '@/lib/general'
import {
	BRAND_SCALE, INK_SCALE, PAPER_SCALE, BASE_SCALE,
	FONT_FAMILY_SCALE, FONT_SIZE_SCALE, FONT_WEIGHT_SCALE, LINE_HEIGHT_SCALE,
	DURATION_SCALE, EASE_SCALE, RADIUS_SCALE,
} from './tokens/scales'
import type { SiteTheme } from './theme.types'
// import { themeControls } from '@/components/core/ScriptInjector'

const DEFAULT_COLORS: SiteTheme['colors'] = {
	brand: BRAND_SCALE,
	ink: INK_SCALE,
	paper: PAPER_SCALE,
}

// const { applyTheme, getStoredTheme, persistTheme } = themeControls()

export const DEFAULT_THEME: SiteTheme = {
	// get name() { return getStoredTheme() },
	// setName: (theme) => { applyTheme(theme); persistTheme(theme) },

	paintVariants,
	tokens,

	scale: {
		size: BASE_SCALE
	},

	colors: DEFAULT_COLORS,
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
}
