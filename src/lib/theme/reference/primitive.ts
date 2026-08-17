import { baseVar, token } from './utils'
import type { PaddedIndexLabels, ThemeColor } from '../types'
import type {
	FONT_FAMILY_SCALE, FONT_SIZE_SCALE, FONT_WEIGHT_SCALE, LINE_HEIGHT_SCALE,
	DURATION_SCALE, EASE_SCALE, RADIUS_SCALE,
	SCREEN_SIZE_SCALE,
} from '../scales'

/**
 * One accessor per primitive token category — primitive.brand('100') -> var(--brand-100).
 * Each field's key type is derived straight from its backing scale in scales.ts,
 * so adding/removing a scale step never requires touching a type by hand.
 */
export const primitiveTokens = {
	// hex color scales — step label = position, in hundreds
	ink: token.path<ThemeColor<'ink'>>(baseVar, 'ink'),
	oxblood: token.path<ThemeColor<'oxblood'>>(baseVar, 'oxblood'),
	ghost: token.path<ThemeColor<'ghost'>>(baseVar, 'ghost'),

	paper: token.path<ThemeColor<'paper'>>(baseVar, 'paper'),
	crimson: token.path<ThemeColor<'crimson'>>(baseVar, 'crimson'),
	smoke: token.path<ThemeColor<'smoke'>>(baseVar, 'smoke'),

	// static colors
	red: token.endPath(baseVar, 'red'),
	green: token.endPath(baseVar, 'green'),
	yellow: token.endPath(baseVar, 'yellow'),
	blue: token.endPath(baseVar, 'blue'),
	white: token.endPath(baseVar, 'white'),
	gray: token.endPath(baseVar, 'gray'),
	black: token.endPath(baseVar, 'black'),

	size: token.path<`${number}`>(baseVar, 'size'),
	screenSize: token.path<`${typeof SCREEN_SIZE_SCALE[number]}`>(baseVar, 'screenSize'),

	// small scale — step label = zero-padded position ('01'..'05')
	radius: token.path<PaddedIndexLabels<typeof RADIUS_SCALE>>(baseVar, 'radius'),

	font: token.path<keyof typeof FONT_FAMILY_SCALE>(baseVar, 'font'),
	fontSize: token.path<`${typeof FONT_SIZE_SCALE[number]}`>(baseVar, 'font', 'size'),
	weight: token.path<`${typeof FONT_WEIGHT_SCALE[number]}`>(baseVar, 'weight'),
	lineHeight: token.path<keyof typeof LINE_HEIGHT_SCALE>(baseVar, 'line', 'height'),

	duration: token.path<keyof typeof DURATION_SCALE>(baseVar, 'duration'),

	// step label = the scale object's own key, optional — omitting it means "base"
	ease: token.optPath<keyof typeof EASE_SCALE>(baseVar, 'ease'),
}

/** The shape useTheme() exposes to components — see SiteTheme.alias in theme.types.ts. */
export type PrimitiveTokens = typeof primitiveTokens
