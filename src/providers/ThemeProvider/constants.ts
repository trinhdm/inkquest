import {
	BASE_SCALE, COLOR_TOKENS,
	FONT_FAMILY_SCALE, FONT_SIZE_SCALE, FONT_WEIGHT_SCALE,
	LETTER_SPACING_SCALE, LINE_HEIGHT_SCALE,
	DURATION_SCALE, EASE_SCALE, OPACITY_SCALE,
	ICON_SCALE, RADIUS_SCALE, SCREEN_SCALE,
} from '@/lib/theme/scales'
import type { SiteTheme } from '@/lib/theme/types'

export const DEFAULT_THEME: SiteTheme = {
	scale: { space: BASE_SCALE },

	colors: COLOR_TOKENS,

	fontFamily: FONT_FAMILY_SCALE,
	fontWeight: [...FONT_WEIGHT_SCALE],
	fontSize: [...FONT_SIZE_SCALE],
	lineHeight: LINE_HEIGHT_SCALE,
	letterSpacing: [...LETTER_SPACING_SCALE],

	radius: [...RADIUS_SCALE],

	duration: DURATION_SCALE,
	easing: EASE_SCALE,

	opacity: [...OPACITY_SCALE],

	iconSize: ICON_SCALE,
	screenSize: [...SCREEN_SCALE],
}

//	define token(s) steps
//	---
//	1. type: `@/lib/theme/types/theme.types.ts`
//	2. value: `@/lib/theme/scales`
//	3. token ref: `@/lib/theme/reference/primitive.ts`
//
