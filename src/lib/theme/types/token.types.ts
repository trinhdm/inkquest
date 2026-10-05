import type { CSSProperties } from 'react'
import type { CSSVariable, Heading, Size, SizeRange } from '@/types/shared'
import type { COLOR_TOKENS } from '../scales'

export type TokenVar =
	`var(${CSSVariable})`

export type TokenVariableShape =
	| `${TokenVar}`
	| `${TokenVar} ${TokenVar}`

export type TokenHeadingShape<T extends Heading = Exclude<Heading, 'h6'>> =
	Record<T, TokenVariableShape>

export type TokenSizeShape<S extends SizeRange = Size> =
	Record<S, TokenVariableShape>

type TokenItem<T extends keyof CSSProperties = 'color'> =
	CSSProperties[T]

export type TokenState =
	| 'active'
	| 'disable'
	| 'focus'
	| 'hover'
	| 'pressed'
	| 'select'

export interface TokenStates<T extends keyof CSSProperties = 'color'>
	extends Partial<Record<Exclude<TokenState, 'hover'>, TokenItem<T>>> {
	base: TokenItem<T>
	hover: TokenItem<T>
}

export type TokenGroup<T extends keyof CSSProperties> =
	| TokenItem<T>
	| TokenStates<T>

interface ColorMixtures {
	base: string
	bright: string
	dim: string
	muted: string
	shade: string
	tint: string
}

export interface TokenStateHues
	extends Omit<ColorMixtures, 'base'>,
		Omit<TokenStates, 'base'> {
	base: (ColorMixtures | TokenStates)['base']
}


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


type SiteColors = typeof COLOR_TOKENS

type ThemeColorNames = {
	[K in keyof SiteColors]: SiteColors[K] extends readonly unknown[]
		? K : never
}[keyof SiteColors]

export type StaticColorNames =
	Exclude<keyof SiteColors, ThemeColorNames>

export type ThemeColor<K extends ThemeColorNames> =
	ColorStepLabels<SiteColors[K]>
