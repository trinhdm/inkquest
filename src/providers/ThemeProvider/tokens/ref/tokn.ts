// import { baseVar } from './token-var'
import {
	createAccessor, createPositionAccessors, createPaddedPositionAccessors,
	createValueAccessors, createNamedAccessors, createStateNamedAccessors,
} from './accessors'
import {
	POSITION_KEYED_SCALES, PADDED_POSITION_SCALES, VALUE_KEYED_SCALES,
	NAMED_SCALES, STATE_NAMED_SCALES,
} from './scale-registry'
// import type { LineHeightKey, SizeStep } from './keys'
import { baseVar } from './shared'

/**
 * One typed accessor per primitive token category. Almost all of them are
 * generated from the registries in scale-registry.ts — adding a new color
 * scale, duration step, weight, etc. is one line there; this object and its
 * types never change. Two categories don't fit that pattern and stay explicit:
 *  - lineHeight's CSS path is two segments ('line', 'height'), not the one
 *    segment every registry-driven accessor assumes.
 *  - size has no backing scale at all — it's a computed range (1x-24x
 *    baseSize, see generate/strategies/spacing-scale.ts), not stored data,
 *    so there's nothing to register.
 */
export const tokn = {
	...createPositionAccessors(baseVar, POSITION_KEYED_SCALES),
	...createPaddedPositionAccessors(baseVar, PADDED_POSITION_SCALES),
	...createValueAccessors(baseVar, VALUE_KEYED_SCALES),
	...createNamedAccessors(baseVar, NAMED_SCALES),
	...createStateNamedAccessors(baseVar, STATE_NAMED_SCALES),
	lineHeight: createAccessor(baseVar, 'line', 'height'),
	size: createAccessor(baseVar, 'size'),
	fontSize: createAccessor(baseVar, 'font', 'size'),
}

// tkn.ink and tkn.paper both come from POSITION_KEYED_SCALES and happen to
// share one signature (same-length scales), so callers holding a runtime
// PaletteName ('ink' | 'paper') can look up the right accessor by indexing
// instead of branching: tkn[paletteName]('600'). Verified this still holds
// after the spread with tsc --strict before proposing it.
