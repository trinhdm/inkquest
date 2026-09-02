import type { BaseVarKey } from './theme.types'
import type { CSSVariable, CSSVars } from '@/types/shared'
import type { TokenGroup, TokenStatesList } from './token.types'

export type Variant =
	| 'solid' | 'outline' | 'ghost' | 'light' | 'dark'
	| 'success' | 'warning' | 'danger' | 'info'

export type Priority =
	| 'primary' | 'secondary' | 'tertiary'

export type Tone =
	| 'neutral' | 'action'
	| 'danger' | 'warning' | 'success' | 'info'

export interface VariantProps {
	variant?: Variant
}

export interface SemanticVariantProps extends VariantProps {
	priority?: Priority
	// variant?: Variant
}

export interface VariantTokens {
	background?: TokenGroup<'backgroundColor'>
	border?: TokenGroup<'borderColor'>
	color?: TokenGroup<'color'>
}

type StateKey =
	keyof TokenStatesList

type StateSuffix<K extends StateKey> =
	K extends BaseVarKey ? '' : `-${K}`

type StateVariable<
	S extends string,
	T extends keyof VariantTokens,
	K extends StateKey = StateKey
> = `--${S}-${T}${StateSuffix<K>}` extends CSSVariable
	? `--${S}-${T}${StateSuffix<K>}`
	: never

export type ColorVariable<
	S extends string,
	T extends keyof VariantTokens = keyof VariantTokens
> = StateVariable<Lowercase<S>, T>

type StateToken<V, K extends StateKey> =
	V extends Record<K, infer X>
		? X
		: K extends BaseVarKey ? V : undefined

type PaletteShape<S extends string, K extends StateKey> =
	{ [T in keyof VariantTokens as StateVariable<S, T, K>]-?: StateToken<VariantTokens[T], K> }

type PaletteOptions<S extends string, K extends StateKey> =
	& PaletteShape<S, K>
	& PaletteShape<S, Exclude<StateKey, K>>

export type PaletteTokens<S extends string> =
	PaletteOptions<S, BaseVarKey>

export interface CssRule {
	selector: string
	vars: CSSVars
}
