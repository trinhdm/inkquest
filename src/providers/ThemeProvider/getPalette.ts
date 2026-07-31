import { DEFAULT_PALETTE } from './constants'
import type { SiteTheme } from '@/providers/ThemeProvider'
// import type { HexCode } from '@/types/common'
import type { CSSProperties } from 'react'

export interface ColorPalette {
	background: CSSProperties['backgroundColor']
	border: CSSProperties['borderColor']
	color: CSSProperties['color']
	focus: CSSProperties['color']
	hover: CSSProperties['color']
}

export type ColorVars<S extends string> = `--${S}-${keyof ColorPalette}`

interface PaletteSettings<V extends string | undefined> {
	theme: SiteTheme
	variant: V
}

export type PaletteConfig =
	<V extends string | undefined>(settings: PaletteSettings<V>) => ColorPalette

export const getPalette: PaletteConfig = ({
	theme,
	variant,
}) => {
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
