import type { CSSProperties } from 'react'
import type { CSSVars } from '@/types/shared'
import type { COLOR_TOKENS } from '../scales'

export type TokenVar =
	`var(${keyof CSSVars})`

export type TokenVariableShape =
	| `${TokenVar}`
	| `${TokenVar} ${TokenVar}`

type TokenItem<T extends keyof CSSProperties = 'color'> =
	CSSProperties[T]

export interface TokenStatesList<T extends keyof CSSProperties = 'color'> {
	base: TokenItem<T>
	hover: TokenItem<T>
	active?: TokenItem<T>
	disable?: TokenItem<T>
	focus?: TokenItem<T>
	pressed?: TokenItem<T>
	select?: TokenItem<T>
}

export type TokenGroup<T extends keyof CSSProperties> =
	| TokenItem<T>
	| TokenStatesList<T>

export interface ColorMixtures {
	base: string
	bright: string
	dim: string
	muted: string
	shade: string
	tint: string
}

export interface TokenStateHues
	extends Omit<ColorMixtures, 'base'>,
		Omit<TokenStatesList, 'base'> {
	base: (ColorMixtures | TokenStatesList)['base']
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

export type ThemeColor<K extends ThemeColorNames> =
	ColorStepLabels<SiteColors[K]>
