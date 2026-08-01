import { DEFAULT_PALETTE } from '../constants'
import type { CSSProperties } from 'react'
import type { SiteTheme } from '@/providers/ThemeProvider'

export interface ColorPalette {
	background: CSSProperties['backgroundColor']
	border: CSSProperties['borderColor']
	color: CSSProperties['color']
	focus: CSSProperties['color']
	hover: CSSProperties['color']
}

export type ColorVariable<
	S extends string,
	T extends keyof ColorPalette = keyof ColorPalette
> = `--${S}-${T}`

type PaletteVars<S extends string> = {
	[T in keyof ColorPalette as ColorVariable<S, T>]: ColorPalette[T]
}

interface GetPaletteArgs<V extends string | undefined> {
	theme: SiteTheme
	variant: V
}

export type GetPaletteFn =
	<V extends string | undefined>(args: GetPaletteArgs<V>) => ColorPalette

export const getPalette: GetPaletteFn = ({ theme, variant }) => {
	const basePalette = DEFAULT_PALETTE
	let palette: ColorPalette = basePalette

	switch (variant) {
		case 'outline':
			palette = {
				background: 'transparent',
				border: 'none',
				color: 'inherit',
				focus: 'transparent',
				hover: 'transparent',
			}
			break
		default:
			palette = basePalette
			break
	}

	return palette
}

interface SetPaletteArgs<S extends string> {
	colors: ColorPalette
	name: S
}

export type SetPaletteFn =
	<S extends string>(args: SetPaletteArgs<S>) => PaletteVars<SetPaletteArgs<S>['name']>

export const setPalette: SetPaletteFn = ({ colors, name }) => {
	type N = typeof name
	const targets = Object.keys(colors) as (keyof typeof colors)[],
		declarations = {} as PaletteVars<N>

	targets.forEach(target => {
		type T = typeof target
		const variable: ColorVariable<N, T> = `--${name}-${target}`,
			color: ColorPalette[T] = colors[target]
		Object.assign(declarations, { [variable]: color ?? undefined })
	})

	return declarations
}
