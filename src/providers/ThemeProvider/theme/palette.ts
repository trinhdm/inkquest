import { DEFAULT_PALETTE } from '../constants'
import { PREFIX_CSS_SELECTOR } from '@/utils/constants'
import type { CSSProperties } from 'react'
import type { SiteTheme } from '@/providers/ThemeProvider'
import type { CssVariable } from 'next/dist/compiled/@next/font'

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
> = `--${S}-${T}` extends CssVariable ? `--${S}-${T}` : never

type PaletteVars<S extends string> = {
	[T in keyof ColorPalette as ColorVariable<S, T>]: ColorPalette[T]
}

interface GetPaletteArgs<V extends string | undefined> {
	prefix?: string
	theme: SiteTheme
	variant: V
}

export type GetPaletteFn =
	<V extends string | undefined>(args: GetPaletteArgs<V>) => ColorPalette

export const getPalette: GetPaletteFn = ({
	prefix = PREFIX_CSS_SELECTOR,
	theme,
	variant,
}) => {
	const basePalette = DEFAULT_PALETTE
	let palette: ColorPalette = basePalette

	switch (variant) {
		case 'solid':
			palette = {
				background: `var(--${prefix}-accent)`,
				'background-hover': `var(--${prefix}-accent-hover)`,
				border: 'transparent',
				// color: `var(--${prefix}-accent-text)`,
				focus: 'transparent',
				hover: `var(--${prefix}-accent-hover)`,
				// 'border-hover': `var(--${prefix}-accent-hover)`,
			}
			break
		case 'outline':
			palette = {
				background: 'transparent',
				'background-hover': `var(--${prefix}-primary-03)`,
				border: `var(--${prefix}-border-strong)`,
				// color: 'inherit',
				color: `var(--${prefix}-border-text)`,
				focus: 'transparent',
				hover: 'transparent',
			}
			break
		case 'ghost':
			palette = {
				background: 'transparent',
				'background-hover': `var(--${prefix}-primary-03)`,
				border: 'transparent',
				color: `var(--${prefix}-border-text)`,
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
