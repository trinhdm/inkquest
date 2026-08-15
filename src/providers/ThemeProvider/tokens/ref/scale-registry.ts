import {
	BRAND_SCALE, INK_SCALE, PAPER_SCALE, RADIUS_SCALE,
	FONT_WEIGHT_SCALE, FONT_FAMILY_SCALE, DURATION_SCALE, EASE_SCALE,
} from '../scales'

// Grouped by how each scale's step label is computed — see accessors.ts's
// createPositionAccessors / createPaddedPositionAccessors / createValueAccessors /
// createNamedAccessors / createStateNamedAccessors, one per group below.
// Adding a token category is adding one line to whichever group matches its
// keying style — tkn.ts itself never changes.

/** Step label = array position, in hundreds ('100', '200', ...). */
export const POSITION_KEYED_SCALES = {
	brand: BRAND_SCALE,
	ink: INK_SCALE,
	paper: PAPER_SCALE,
} as const

/** Step label = array position, zero-padded ('01', '02', ...) — small scales. */
export const PADDED_POSITION_SCALES = {
	radius: RADIUS_SCALE,
} as const

/** Step label = the element's own value (400/600/700), not its position. */
export const VALUE_KEYED_SCALES = {
	weight: FONT_WEIGHT_SCALE,
} as const

/** Step label = the scale object's own key, required. */
export const NAMED_SCALES = {
	font: FONT_FAMILY_SCALE,
	duration: DURATION_SCALE,
} as const

/** Step label = the scale object's own key, optional — omitting it means "base". */
export const STATE_NAMED_SCALES = {
	ease: EASE_SCALE,
} as const
