import { baseVar } from './handler'
import { createAccessor, createStateAccessor } from './accessor'
import type { ColorStepLabels, PaddedIndexLabels } from '../config/types'
import type {
	BRAND_SCALE, INK_SCALE, PAPER_SCALE, BASE_SCALE,
	FONT_FAMILY_SCALE, FONT_SIZE_SCALE, FONT_WEIGHT_SCALE, LINE_HEIGHT_SCALE,
	DURATION_SCALE, EASE_SCALE, RADIUS_SCALE,
} from '../scales'

type LastTwoDigits =
  | `${0 | 2 | 4 | 6 | 8}${0 | 4 | 8}`
  | `${1 | 3 | 5 | 7 | 9}${2 | 6}`;

type MultipleOfFour<T extends number> =
    T extends -8 | -4 | 0 | 4 | 8 ? T :
    `${T}` extends `${string}${"e" | "."}${string} ` ? 0 :
    `${T}` extends `${string}${LastTwoDigits}` ? T :
    0

/**
 * One accessor per primitive token category — primitive.brand('100') -> var(--brand-100).
 * Each field's key type is derived straight from its backing scale in scales.ts,
 * so adding/removing a scale step never requires touching a type by hand.
 */
export const primitiveTokens = {
	// hex color scales — step label = position, in hundreds
	brand: createAccessor<ColorStepLabels<typeof BRAND_SCALE>>(baseVar, 'brand'),
	ink: createAccessor<ColorStepLabels<typeof INK_SCALE>>(baseVar, 'ink'),
	paper: createAccessor<ColorStepLabels<typeof PAPER_SCALE>>(baseVar, 'paper'),
	// ink/paper must stay the same shape — config/backgrounds.ts and
	// config/colors.ts do primitive[scheme]('100') with a runtime scheme.
	size: createAccessor<`${number}`>(baseVar, 'size'),

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
