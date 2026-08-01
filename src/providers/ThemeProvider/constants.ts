import { rem } from '@/lib/general'
import { getPalette, setPalette, type ColorPalette } from './theme/palette'
import type { SiteTheme, ThemeName } from './theme.types'

export const DEFAULT_COLORS: SiteTheme['colors'] = {
	brand: [
		'#E8483F',
		'#D63A31',
		'#C22F27',
		'#3A211F',
		'#FBE3E1',
	],
	ink: [
		'#0E0E10',
		'#17171A',
		'#1B1B1F',
		'#232327',
		'#2A2A2E',
		'#3A3A3F',
	],
	paper: [
		'#FFFAFA',
		'#F8F6F2',
		'#F2F0EC',
		'#EAE7E0',
		'#DEDBD4',
		'#C9C6BF',
	],
}

const DEFAULT_FONT_FAMILY: SiteTheme['fontFamily'] = {
	body: `'Archivo', -apple-system, BlinkMacSystemFont, sans-serif`,
	title: `'Archivo Black', 'Archivo', sans-serif`,
	label: `'Space Mono', SF Mono, monospace`,
}

export const DEFAULT_THEME_NAME: ThemeName = 'dark'

export const DEFAULT_THEME: SiteTheme = {
	getPalette,
	setPalette,

	colors: DEFAULT_COLORS,
	fontFamily: DEFAULT_FONT_FAMILY,

	fontWeight: {
		regular: 400,
		bold: 600,
		black: 700,
	},

	fontSize: {
		xs: rem(10),
		sm: rem(12),
		md: rem(16),
		lg: rem(18),
		xl: rem(20),
	},

	lineHeight: {
		xs: 1.3,
		sm: 1.5,
		md: 1.55,
		lg: 1.55,
		// xl: 1.5,
	},

	headings: {
		fontFamily: DEFAULT_FONT_FAMILY.title,
		fontWeight: 700,
		tagName: {
			h1: {
				fontSize: rem(32),
				lineHeight: 1.15,
			},
			h2: {
				fontSize: rem(24),
				lineHeight: 1.25,
			},
			h3: {
				fontSize: rem(20),
				lineHeight: 1.3,
				fontWeight: 600,
			},
		}
	},

	breakpoints: {
		xs: rem(360),
		sm: rem(768),
		md: rem(1080),
		lg: rem(1280),
		xl: rem(1440),
	},

	radius: {
		sm: rem(6),
		md: rem(8),
		lg: rem(12),
		pill: rem(999),
	},
}

export const DEFAULT_PALETTE: ColorPalette = {
	background: 'transparent',
	border: 'none',
	color: 'inherit',
	focus: 'transparent',
	hover: 'transparent',
}
