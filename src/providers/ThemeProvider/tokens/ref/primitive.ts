import { createAccessor, createStateAccessor } from './accessor'
import { baseVar } from './shared'
import {
	BRAND_SCALE, INK_SCALE, PAPER_SCALE, RADIUS_SCALE,
	FONT_WEIGHT_SCALE, FONT_FAMILY_SCALE, DURATION_SCALE, EASE_SCALE, LINE_HEIGHT_SCALE,
} from '../scales'
import type { ColorStepLabels, PaddedIndexLabels } from '../config/types'

/**
 * One accessor per primitive token category — primitive.brand('100') -> var(--brand-100).
 * Each field's key type is derived straight from its backing scale in scales.ts,
 * so adding/removing a scale step never requires touching a type by hand.
 */
export const primitive = {
	// hex color scales — step label = position, in hundreds
	brand: createAccessor<ColorStepLabels<typeof BRAND_SCALE>>(baseVar, 'brand'),
	ink: createAccessor<ColorStepLabels<typeof INK_SCALE>>(baseVar, 'ink'),
	paper: createAccessor<ColorStepLabels<typeof PAPER_SCALE>>(baseVar, 'paper'),
	// ink/paper must stay the same shape — config/backgrounds.ts and
	// config/colors.ts do primitive[scheme]('100') with a runtime scheme.

	// small scale — step label = zero-padded position ('01'..'05')
	radius: createAccessor<PaddedIndexLabels<typeof RADIUS_SCALE>>(baseVar, 'radius'),

	// step label = the element's own value, not its position
	weight: createAccessor<`${typeof FONT_WEIGHT_SCALE[number]}`>(baseVar, 'weight'),

	// step label = the scale object's own key, required
	font: createAccessor<keyof typeof FONT_FAMILY_SCALE>(baseVar, 'font'),
	duration: createAccessor<keyof typeof DURATION_SCALE>(baseVar, 'duration'),

	// step label = the scale object's own key, optional — omitting it means "base"
	ease: createStateAccessor<Exclude<keyof typeof EASE_SCALE, 'base'>>(baseVar, 'ease'),

	// no backing scale bucket — kept explicit, same as before
	lineHeight: createAccessor<keyof typeof LINE_HEIGHT_SCALE>(baseVar, 'line', 'height'),
	size: createAccessor<`${number}`>(baseVar, 'size'),
	fontSize: createAccessor(baseVar, 'font', 'size'),
}
