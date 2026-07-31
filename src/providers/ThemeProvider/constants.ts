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

	breakpoints: {
		xs: '36rem',
		sm: '48rem',
		md: '60rem',
		lg: '72rem',
		xl: '80rem',
	},

	font: {
		family: {
			monospace: '',
			'sans-serif': '',
			serif: '',
		},
		size: {
			xs: '8px',
			sm: '10px',
			md: '12px',
			lg: '16px',
			xl: '18px',
		},
		weight: {
			thin: 100,
			light: 300,
			regular: 400,
			medium: 500,
			bold: 600,
			black: 800,
		},
		lineHeight: {
			xs: 1,
			sm: 1.125,
			md: 1.25,
			lg: 1.375,
			xl: 1.5,
		},
	},

	headings: {
		fontFamily: '',
		fontWeight: '',
		tagName: {
			h1: {
				fontSize: '2rem',
				lineHeight: 1.5,
			},
			h2: {
				fontSize: '2rem',
				lineHeight: 1.5,
			},
			h3: {
				fontSize: '2rem',
				lineHeight: 1.5,
			},
			h4: {
				fontSize: '2rem',
				lineHeight: 1.5,
			},
			h5: {
				fontSize: '2rem',
				lineHeight: 1.5,
			},
			h6: {
				fontSize: '2rem',
				lineHeight: 1.5,
			},
		}
	},
}
