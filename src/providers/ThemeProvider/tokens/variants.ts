import type { BaseVarKey, SiteTheme } from '@/providers/ThemeProvider'
import { deepMerge } from '@/utils/helpers'
import { nameVariables } from '../css'
import { Token } from './reference'
import type { CSSVariable } from '@/types/shared'
import type { TokenStatesList, TokenGroup } from './builder'
import type { ValidSpecs } from '@/types/spec'

export interface ColorPalette {
	background?: TokenGroup<'backgroundColor'>
	border?: TokenGroup<'borderColor'>
	color?: TokenGroup<'color'>
}

export type Variant =
	| 'solid'
	| 'outline'
	| 'ghost'
	| 'light'
	| 'dark'
	| 'success'
	| 'warning'
	| 'danger'

type StateKey = keyof TokenStatesList<any>

type StateSuffix<K extends StateKey> = K extends BaseVarKey ? '' : `-${K}`

type StateVariable<
	S extends string,
	T extends keyof ColorPalette,
	K extends StateKey = StateKey
> = `--${S}-${T}${StateSuffix<K>}` extends CSSVariable
	? `--${S}-${T}${StateSuffix<K>}`
	: never

export type ColorVariable<
	S extends string,
	T extends keyof ColorPalette = keyof ColorPalette
> = StateVariable<S, T>

type StateToken<V, K extends StateKey> =
	V extends Record<K, infer X>
		? X
		: K extends BaseVarKey ? V : undefined

type PaletteVars<S extends string> =
	& { [T in keyof ColorPalette as StateVariable<S, T, BaseVarKey>]-?: StateToken<ColorPalette[T], BaseVarKey> }
	& { [T in keyof ColorPalette as StateVariable<S, T, Exclude<StateKey, BaseVarKey>>]-?: StateToken<ColorPalette[T], Exclude<StateKey, BaseVarKey>> }

interface GetPaletteArgs<S extends ValidSpecs<S>> {
	prefix?: string
	theme: SiteTheme
	variant?: S['variant']
}

export type GetPaletteFn =
	<S extends ValidSpecs<S>>(args: GetPaletteArgs<S> & S['props']) => Partial<ColorPalette>

const DEFAULT_PALETTE: ColorPalette = {
	background: {
		base: 'transparent',
		hover: 'transparent',
	},
	border: {
		base: 'transparent',
		hover: 'transparent',
	},
	color: {
		base: 'inherit',
		hover: 'inherit',
	},
}

export const getVariantColors: GetPaletteFn = _props => {
	if (!Object.hasOwn(_props, 'variant'))
		return DEFAULT_PALETTE

	const { theme, variant, ...props } = _props

	switch (variant) {
		case 'solid':
			return {
				background: {
					base: Token.alias('accent'),
					hover: Token.alias('accent', 'hover'),
				},
				color: Token.alias('accent', 'text'),
			}
		case 'outline':
			return {
				border: {
					base: Token.alias('border'),
					hover: Token.alias('border', 'strong'),
				},
				color: Token.alias('border', 'text'),
			}
		case 'ghost':
			return {
				background: {
					base: 'transparent',
					hover: Token.alias('primary', '03'),
				},
				border: {
					base: 'transparent',
					hover: Token.alias('primary', '03'),
				},
				color: Token.alias('border', 'text'),
			}
		case 'light':
			return {
				background: {
					base: Token.alias('secondary', '06'),
					hover: Token.alias('secondary', '04'),
				},
				border: {
					base: Token.alias('secondary', '06'),
					hover: Token.alias('secondary', '04'),
				},
				color: Token.alias('primary', '02'),
			}
		case 'dark':
			return {
				background: {
					base: Token.alias('primary', '04'),
					hover: Token.alias('primary', '06'),
				},
				border: {
					base: Token.alias('primary', '04'),
					hover: Token.alias('primary', '06'),
				},
				color: Token.alias('secondary', '02'),
			}
		default:
			return DEFAULT_PALETTE
	}
}


interface SetPaletteArgs<S extends string> {
	colors: ColorPalette
	name: S
}

export type SetPaletteFn =
	<S extends string>(args: SetPaletteArgs<S>) => PaletteVars<SetPaletteArgs<S>['name']>

export const getVariantTokens: SetPaletteFn = ({ colors, name }) => {
	type N = typeof name
	const palette = deepMerge(DEFAULT_PALETTE, colors),
		vars = nameVariables(palette, name)

	return vars as PaletteVars<N>
}


interface PaintVariantsArgs<S extends ValidSpecs<S>, N extends string>
	extends GetPaletteArgs<S> {
	name: N
}

export type PaintVariantsFn =
	<S extends ValidSpecs<S>, N extends string>(
		args: PaintVariantsArgs<S, N> & S['props']
	) => PaletteVars<N>

export const paintVariants: PaintVariantsFn = _props => {
	const { name, ...props } = _props
	const colors = getVariantColors(props),
		variables = getVariantTokens({ colors, name })

	return variables
}
