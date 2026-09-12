import { baseVar, token } from './utils'
import type { PaddedIndexLabels, ThemeColor } from '../types'
import type {
	FONT_FAMILY_SCALE, FONT_SIZE_SCALE, FONT_WEIGHT_SCALE,
	LETTER_SPACING_SCALE, LINE_HEIGHT_SCALE,
	DURATION_SCALE, EASE_SCALE,
	OPACITY_SCALE, RADIUS_SCALE,
	SCREEN_SCALE,
} from '../scales'

const baseColorTokens = {
	// hex color scales — step label = position, in hundreds
	ink: token.path<ThemeColor<'ink'>>(baseVar, 'ink'),
	oxblood: token.path<ThemeColor<'oxblood'>>(baseVar, 'oxblood'),
	ghost: token.path<ThemeColor<'ghost'>>(baseVar, 'ghost'),

	paper: token.path<ThemeColor<'paper'>>(baseVar, 'paper'),
	crimson: token.path<ThemeColor<'crimson'>>(baseVar, 'crimson'),
	smoke: token.path<ThemeColor<'smoke'>>(baseVar, 'smoke'),

	// static colors
	red: token.endPath(baseVar, 'red', '100'),
	green: token.endPath(baseVar, 'green', '100'),
	yellow: token.endPath(baseVar, 'yellow', '100'),
	blue: token.endPath(baseVar, 'blue', '100'),
	white: token.endPath(baseVar, 'white', '100'),
	gray: token.endPath(baseVar, 'gray', '100'),
	black: token.endPath(baseVar, 'black', '100'),
}

const baseFontTokens = {
	fontFamily: token.path<keyof typeof FONT_FAMILY_SCALE>(baseVar, 'font', 'family'),
	fontSize: token.path<`${typeof FONT_SIZE_SCALE[number]}`>(baseVar, 'font', 'size'),
	fontWeight: token.path<`${typeof FONT_WEIGHT_SCALE[number]}`>(baseVar, 'font', 'weight'),
	lineHeight: token.path<keyof typeof LINE_HEIGHT_SCALE>(baseVar, 'line', 'height'),
	letterSpacing: token.path<PaddedIndexLabels<typeof LETTER_SPACING_SCALE>>(baseVar, 'letter', 'spacing'),
}

/**
 * One accessor per primitive token category — primitive.brand('100') -> var(--brand-100).
 * Each field's key type is derived straight from its backing scale in scales.ts,
 * so adding/removing a scale step never requires touching a type by hand.
 */
export const primitiveTokens = {
	space: token.path<`${number}`>(baseVar, 'space'),

	...baseColorTokens,
	...baseFontTokens,

	screen: token.path<`${typeof SCREEN_SCALE[number]}`>(baseVar, 'screenSize'),

	// small scale — step label = zero-padded position ('01'..'05')
	radius: token.path<PaddedIndexLabels<typeof RADIUS_SCALE>>(baseVar, 'radius'),
	opacity: token.path<`${typeof OPACITY_SCALE[number]}`>(baseVar, 'opacity'),

	duration: token.path<keyof typeof DURATION_SCALE>(baseVar, 'duration'),
	easing: token.optPath<keyof typeof EASE_SCALE>(baseVar, 'easing'),
}

/** The shape useTheme() exposes to components — see SiteTheme.alias in theme.types.ts. */
export type PrimitiveTokens = typeof primitiveTokens
