import { getPalette, setPalette, type ColorPalette } from './getPalette'
import type { SiteTheme } from './theme.types'

export const DEFAULT_PALETTE: ColorPalette = {
	background: 'transparent',
	border: 'none',
	color: 'inherit',
	focus: 'transparent',
	hover: 'transparent',
}

export const PALETTE_KEYS = Object.keys(DEFAULT_PALETTE) as (keyof typeof DEFAULT_PALETTE)[]

export const DEFAULT_THEME: SiteTheme = {
	getPalette,
	setPalette,

	// colors: string[]
	// font: FontProperties

	// headings: {
	// 	size:
	// },

	breakpoints: {
		xs: '36rem',
		sm: '48rem',
		md: '60rem',
		lg: '72rem',
		xl: '80rem',
	},
}
