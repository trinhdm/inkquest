// import { DEFAULT_PALETTE } from '../constants'
// import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import type { CSSProperties } from 'react'
import type { BaseVarKey, SiteTheme } from '@/providers/ThemeProvider'
import type { CssVariable } from 'next/dist/compiled/@next/font'
// import { ThemeColor } from '../css/themeColors'
import { deepMerge } from '@/utils/helpers'
import { nameVariables } from '../css'
import { Token, type ColorPalette, type TokenStatesList } from '../colors/tokens'
// import type { CSSVars } from '@/types/shared'

// export interface ColorPalette2 {
// 	background: CSSProperties['backgroundColor']
// 	border: CSSProperties['borderColor']
// 	color: CSSProperties['color']
// 	focus: CSSProperties['color']
// 	hover: CSSProperties['color']
// }

type StateKey = keyof TokenStatesList<any>

type StateSuffix<K extends StateKey> = K extends BaseVarKey ? '' : `-${K}`

type StateVariable<
	S extends string,
	T extends keyof ColorPalette,
	K extends StateKey = StateKey
> = `--${S}-${T}${StateSuffix<K>}` extends CssVariable
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

// export type ColorVariable<
// 	S extends string,
// 	T extends keyof ColorPalette = keyof ColorPalette
// > = `--${S}-${T}` extends CssVariable ? `--${S}-${T}` : never

// type FlattenToken<V> = V extends { base: infer B } ? B : V

// type PaletteVars<S extends string> = {
// 	[T in keyof ColorPalette as ColorVariable<S, T>]-?: FlattenToken<ColorPalette[T]>
// }

interface GetPaletteArgs<V extends string | undefined> {
	prefix?: string
	theme: SiteTheme
	variant?: V
}

export type GetPaletteFn =
	<V extends string | undefined>(args: GetPaletteArgs<V>) => Partial<ColorPalette>

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

export const getPalette: GetPaletteFn = _props => {
	if (!Object.hasOwn(_props, 'variant'))
		return DEFAULT_PALETTE

	const { theme, variant, ...props } = _props
	// console.log({ props })

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

	// return getPalette2({ prefix, theme, variant })
}

export const setPalette: SetPaletteFn = ({ colors, name }) => {
	// const colors = getVariantColors(variant, {}),
	// 	buildTest = buildVariantTokens(prefix, variant, {})

	type N = typeof name
	const palette = deepMerge(DEFAULT_PALETTE, colors),
		vars = nameVariables(palette, name)

	console.log({ paletteColors: vars })

	return vars as PaletteVars<N>

	// return setPalette2({ colors, name })
}

// export const paint = ({
// 	name,
// 	theme,
// 	variant,
// }) => {
// 	const colors = getPalette({ theme, variant }),
// 		variables = setPalette({ colors, name })

// 	return variables
// }



// export const getPalette2: GetPaletteFn = ({
// 	prefix = PREFIX_CSS_SELECTOR,
// 	theme,
// 	variant,
// }) => {
// 	const basePalette = DEFAULT_PALETTE
// 	let palette: ColorPalette = basePalette

// 	switch (variant) {
// 		case 'solid':
// 			palette = {
// 				background: `var(--${prefix}-accent)`,
// 				'background-hover': `var(--${prefix}-accent-hover)`,
// 				border: 'transparent',
// 				// color: `var(--${prefix}-accent-text)`,
// 				focus: 'transparent',
// 				hover: `var(--${prefix}-accent-hover)`,
// 				// 'border-hover': `var(--${prefix}-accent-hover)`,
// 			}
// 			break
// 		case 'outline':
// 			palette = {
// 				background: 'transparent',
// 				'background-hover': `var(--${prefix}-primary-03)`,
// 				border: `var(--${prefix}-border-strong)`,
// 				// color: 'inherit',
// 				color: `var(--${prefix}-border-text)`,
// 				focus: 'transparent',
// 				hover: 'transparent',
// 			}
// 			break
// 		case 'ghost':
// 			palette = {
// 				background: 'transparent',
// 				'background-hover': `var(--${prefix}-primary-03)`,
// 				border: 'transparent',
// 				color: `var(--${prefix}-border-text)`,
// 				focus: 'transparent',
// 				hover: 'transparent',
// 			}
// 			break
// 		default:
// 			palette = basePalette
// 			break
// 	}

// 	return palette
// }

interface SetPaletteArgs<S extends string> {
	colors: ColorPalette
	name: S
}

export type SetPaletteFn =
	<S extends string>(args: SetPaletteArgs<S>) => PaletteVars<SetPaletteArgs<S>['name']>

// export const setPalette2: SetPaletteFn = ({ colors, name }) => {
// 	type N = typeof name
// 	const targets = Object.keys(colors) as (keyof typeof colors)[],
// 		declarations = {} as PaletteVars<N>

// 	targets.forEach(target => {
// 		type T = typeof target
// 		const variable: ColorVariable<N, T> = `--${name}-${target}`,
// 			color: ColorPalette[T] = colors[target]
// 		Object.assign(declarations, { [variable]: color ?? undefined })
// 	})

// 	return declarations
// }
