import { baseVar } from './handler'
import { createAccessor, createStateAccessor, createValueRef } from './accessor'
import type { ColorStepLabels, PaddedIndexLabels } from '../config/types'
import type {
	BASE_SCALE, COLOR_TOKENS,
	FONT_FAMILY_SCALE, FONT_SIZE_SCALE, FONT_WEIGHT_SCALE, LINE_HEIGHT_SCALE,
	DURATION_SCALE, EASE_SCALE, RADIUS_SCALE,
	SCREEN_SIZE_SCALE,
} from '../scales'

type LastTwoDigits =
  | `${0 | 2 | 4 | 6 | 8}${0 | 4 | 8}`
  | `${1 | 3 | 5 | 7 | 9}${2 | 6}`;

type MultipleOfFour<T extends number> =
    T extends -8 | -4 | 0 | 4 | 8 ? T :
    `${T}` extends `${string}${"e" | "."}${string} ` ? 0 :
    `${T}` extends `${string}${LastTwoDigits}` ? T :
    0

type SiteColors = typeof COLOR_TOKENS
type ThemeColorNames = {
	[K in keyof SiteColors]: SiteColors[K] extends readonly unknown[]
		? K : never
}[keyof SiteColors]

export type StaticColorNames =
	Exclude<keyof SiteColors, ThemeColorNames>

type ThemeColor<K extends ThemeColorNames> =
	ColorStepLabels<SiteColors[K]>

/**
 * One accessor per primitive token category — primitive.brand('100') -> var(--brand-100).
 * Each field's key type is derived straight from its backing scale in scales.ts,
 * so adding/removing a scale step never requires touching a type by hand.
 */
export const primitiveTokens = {
	// hex color scales — step label = position, in hundreds
	ink: createAccessor<ThemeColor<'ink'>>(baseVar, 'ink'),
	oxblood: createAccessor<ThemeColor<'oxblood'>>(baseVar, 'oxblood'),
	ghost: createAccessor<ThemeColor<'ghost'>>(baseVar, 'ghost'),

	paper: createAccessor<ThemeColor<'paper'>>(baseVar, 'paper'),
	crimson: createAccessor<ThemeColor<'crimson'>>(baseVar, 'crimson'),
	smoke: createAccessor<ThemeColor<'smoke'>>(baseVar, 'smoke'),

	// static colors
	red: createValueRef(baseVar, 'red'),
	green: createValueRef(baseVar, 'green'),
	yellow: createValueRef(baseVar, 'yellow'),
	blue: createValueRef(baseVar, 'blue'),
	white: createValueRef(baseVar, 'white'),
	gray: createValueRef(baseVar, 'gray'),
	black: createValueRef(baseVar, 'black'),

	size: createAccessor<`${number}`>(baseVar, 'size'),
	screenSize: createAccessor<`${typeof SCREEN_SIZE_SCALE[number]}`>(baseVar, 'screenSize'),

	// small scale — step label = zero-padded position ('01'..'05')
	radius: createAccessor<PaddedIndexLabels<typeof RADIUS_SCALE>>(baseVar, 'radius'),

	font: createAccessor<keyof typeof FONT_FAMILY_SCALE>(baseVar, 'font'),
	fontSize: createAccessor<`${typeof FONT_SIZE_SCALE[number]}`>(baseVar, 'font', 'size'),
	weight: createAccessor<`${typeof FONT_WEIGHT_SCALE[number]}`>(baseVar, 'weight'),
	lineHeight: createAccessor<keyof typeof LINE_HEIGHT_SCALE>(baseVar, 'line', 'height'),

	duration: createAccessor<keyof typeof DURATION_SCALE>(baseVar, 'duration'),

	// step label = the scale object's own key, optional — omitting it means "base"
	ease: createStateAccessor<Exclude<keyof typeof EASE_SCALE, 'base'>>(baseVar, 'ease'),
}

/** The shape useTheme() exposes to components — see SiteTheme.alias in theme.types.ts. */
export type PrimitiveTokens = typeof primitiveTokens
