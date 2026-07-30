import type { SiteTheme } from '@/providers/ThemeProvider'
// import type { HexCode } from '@/types/common'
import type { CSSProperties } from 'react'

interface PaletteSettings {
	theme: SiteTheme
	variant: string | undefined
}

export interface ColorPalette {
	background: CSSProperties['backgroundColor']
	border: CSSProperties['borderColor']
	color: CSSProperties['color']
	focus: CSSProperties['color']
	hover: CSSProperties['color']
}

export type PaletteConfig = (settings: PaletteSettings) => ColorPalette

export const getPalette: PaletteConfig = ({
	theme,
	variant,
}) => {
	const basePalette: ColorPalette = {
		background: 'transparent',
		border: 'none',
		color: 'inherit',
		focus: 'transparent',
		hover: 'transparent',
	}

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
