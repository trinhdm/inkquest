// Raw, `as const` token-scale data — the single source of truth for both
// DEFAULT_THEME (constants.ts) and the tkn registry (reference/). Lives
// here, with zero imports of its own, specifically so neither side has to
// import the other: constants.ts pulls in `paintVariants` (which depends on
// reference/), so a direct reference/ -> constants.ts value import closes a
// real runtime cycle — verified: it throws "Cannot access '...' before
// initialization" at module-load time. Both sides depending on this leaf
// module instead avoids that entirely.
//
// This file is also the canonical SHAPE authority for tkn, not just its
// default values: tkn.brand/ink/paper/radius/etc.'s key types are derived
// from these exact arrays' lengths and these exact objects' keys (see
// reference/scale-registry.ts + accessors.ts). Any SiteTheme passed to
// buildSchemes() is expected to match this shape — same step counts, same
// keys — and vary only its *values*, the same way dark/light already do
// (both conform to this same shape, they just assign different colors to
// it). SiteTheme's own field types (e.g. `colors: Record<ColorScheme,
// HexCode[]>`) are deliberately open-ended arrays with no fixed length, so
// there is no way to derive finite step-label types from SiteTheme's type
// alone — only from one concrete, `as const` instance like this one. A
// theme that didn't conform (a different number of brand colors, say) would
// still generate correctly for its own values, but tkn's types would no
// longer exactly match what that theme generates. Accepted as a known,
// documented constraint rather than solved structurally — doing that would
// mean tightening SiteTheme's scale fields in theme.types.ts to fixed-length
// shapes, a larger, separate change.

export const BRAND_SCALE = ['#E8483F', '#D63A31', '#C22F27', '#3A211F', '#FBE3E1'] as const
export const INK_SCALE = ['#0E0E10', '#17171A', '#1B1B1F', '#232327', '#2A2A2E', '#3A3A3F'] as const
export const PAPER_SCALE = ['#FFFAFA', '#F8F6F2', '#F2F0EC', '#EAE7E0', '#DEDBD4', '#C9C6BF'] as const

export const BASE_SCALE = 4 as const

export const FONT_FAMILY_SCALE = {
	black: `'Archivo Black', 'Archivo', sans-serif`,
	mono: `'Space Mono', SF Mono, monospace`,
	sans: `'Archivo', -apple-system, BlinkMacSystemFont, sans-serif`,
} as const

export const FONT_SIZE_SCALE = [10, 12, 14, 16, 20, 24, 32, 48, 96] as const

export const FONT_WEIGHT_SCALE = [400, 600, 700] as const

export const LINE_HEIGHT_SCALE = {
	exact: 1,
	tight: 1.15,
	snug: 1.3,
	normal: 1.5,
	loose: 1.75,
} as const

export const TRACKING_SCALE = [
	'0.08em',
	'0.1em',
] as const

export const RADIUS_SCALE = [0, 6, 8, 12, 999] as const

export const DURATION_SCALE = {
	instant: '.1s',
	fast: '.15s',
	default: '.25s',
	slow: '.4s',
	gradual: '.6s',
} as const

export const EASE_SCALE = {
	base: 'cubic-bezier(0.4, 0, 0.2, 1)',
	out: 'cubic-bezier(0.16, 1, 0.3, 1)',
	inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
} as const
