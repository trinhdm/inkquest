import { baseVar, token } from './utils'
import type {
	BASE_SCALE, COLOR_TOKENS,
	FONT_FAMILY_SCALE, FONT_SIZE_SCALE, FONT_WEIGHT_SCALE, LINE_HEIGHT_SCALE,
	DURATION_SCALE, EASE_SCALE, RADIUS_SCALE,
	SCREEN_SIZE_SCALE,
} from '../../scales'

/**
 * Type-level mirror of generate/step-naming.ts's getArrayStepLabel(): derives
 * the exact set of valid step labels straight from a scale array's length, so
 * accessor key types never need hand-counting or manual updates when a scale
 * gains or loses a step. The runtime and type-level versions implement the
 * same labeling rule at two different phases (JS values vs. TS types) — that
 * duplication is inherent to TypeScript's phase separation, not a shortcut.
 */
type Increment<Counted extends unknown[]> = [...Counted, unknown]

/** '100' | '200' | ... — one label per element, in order. For hex-color scales (brand/ink/paper). */
export type ColorStepLabels<
	T extends readonly unknown[],
	Acc extends string = never,
	Counted extends unknown[] = []
> = T extends readonly [unknown, ...infer Rest]
	? ColorStepLabels<Rest, Acc | `${Increment<Counted>['length']}00`, Increment<Counted>>
	: Acc

/** '01' | '02' | ... — one zero-padded label per element. For small (<10-step) scales like radius. */
export type PaddedIndexLabels<
	T extends readonly unknown[],
	Acc extends string = never,
	Counted extends unknown[] = []
> = T extends readonly [unknown, ...infer Rest]
	? PaddedIndexLabels<Rest, Acc | `0${Increment<Counted>['length']}`, Increment<Counted>>
	: Acc

export type ColorScaleStep =
	| ColorStepLabels<typeof COLOR_TOKENS.ink>
	| ColorStepLabels<typeof COLOR_TOKENS.paper>


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
