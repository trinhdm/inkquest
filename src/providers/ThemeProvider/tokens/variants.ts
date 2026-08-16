import { alias } from './reference'
import { deepMerge } from '@/utils/helpers'
import { tokenGenerator } from './generate'
import type { BaseVarKey, SiteTheme } from '@/providers/ThemeProvider'
import type { CSSVariable } from '@/types/shared'
import type { TokenStatesList, TokenGroup } from './config'
import type { ValidSpecs } from '@/types/spec'

export interface ColorPalette {
	background?: TokenGroup<'backgroundColor'>
	border?: TokenGroup<'borderColor'>
	color?: TokenGroup<'color'>
}

type Variant =
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
> = StateVariable<Lowercase<S>, T>

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
	<S extends ValidSpecs<S>>(args: GetPaletteArgs<S> & Omit<S['props'], 'name'>) => Partial<ColorPalette>

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
					base: alias.accent.primary(),
					hover: alias.accent.primary('hover'),
				},
				color: alias.color.interactive(),
			}
		case 'outline':
			return {
				border: {
					base: alias.border(),
					hover: alias.border('strong'),
				},
				color: alias.color.interactive(),
			}
		case 'ghost':
			return {
				background: {
					base: 'transparent',
					hover: alias.background.card(),
				},
				border: {
					base: 'transparent',
					hover: alias.background.card('hover'),
				},
				color: {
					base: alias.color.interactive(),
					hover: alias.color.interactive('hover'),
				},
			}
		case 'light':
			return {
				background: alias.accent.primary('muted'),
				border: 'currentColor',
				color: alias.accent.primary(),
			}
		case 'dark':
			return {
				background: {
					base: alias.background.card(),
					hover: alias.background.card('hover'),
				},
				border: {
					base: alias.background.card(),
					hover: alias.background.card('hover'),
				},
				color: alias.color.interactive(),
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
    <S extends string>(args: SetPaletteArgs<S>) => PaletteVars<Lowercase<S>>

export const getVariantTokens: SetPaletteFn = ({ colors, name }) => {
	type N = Lowercase<typeof name>
	const namespace = `${name.toLowerCase() as N}` as const
	const palette = deepMerge(DEFAULT_PALETTE, colors),
		vars = tokenGenerator(palette, namespace)

	return vars as PaletteVars<N>
}


interface PaintVariantsArgs<S extends ValidSpecs<S>, N extends string>
    extends GetPaletteArgs<S> {
    name: N
}

export type PaintVariantsFn =
	<S extends ValidSpecs<S>, N extends string>(
		args: PaintVariantsArgs<S, N> & S['props']
	) => PaletteVars<Lowercase<N>>

export const paintVariants: PaintVariantsFn = <S extends ValidSpecs<S>, N extends string>(
    _props: PaintVariantsArgs<S, N> & S['props']
) => {
    const { name, ...props } = _props
    const colors = getVariantColors<S>(props),
        variables = getVariantTokens({ colors, name })

    return variables
}
