import type { ColorScheme } from '../../theme.types'
import type { INK_SCALE, PAPER_SCALE, LINE_HEIGHT_SCALE } from '../scales'

export type PaletteName = Extract<ColorScheme, 'ink' | 'paper'>

/** Needed externally: builder/theme-config.ts's ThemeConfig.background.{page,cardBase} are typed with this. */
export type ColorScaleStep = ColorStepLabels<typeof INK_SCALE> | ColorStepLabels<typeof PAPER_SCALE>

/** Needed by primitive.ts's own hand-kept lineHeight accessor. */
export type LineHeightKey = keyof typeof LINE_HEIGHT_SCALE

/** Needed by primitive.ts's own hand-kept size accessor — generated (1x-24x baseSize) at runtime, not enumerable from a fixed list. */
export type SizeStep = `${number}`


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

export type { AccentTokens } from './accent'
export type { BackgroundTokens } from './background'
export type { BorderColorTokens, BorderRadiusTokens } from './border'
export type { ColorTokens } from './colors'
export type { MotionTokens } from './motion'
export type { SpaceTokens } from './layout'
export type { TypographyTokens } from './typography'
