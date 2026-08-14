import { rem } from '@/lib/general'
import { paintVariants } from './tokens'
import { themeControls } from '@/components/core/ScriptInjector'
import type { SiteTheme } from './theme.types'

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
	black: `'Archivo Black', 'Archivo', sans-serif`,
	mono: `'Space Mono', SF Mono, monospace`,
	sans: `'Archivo', -apple-system, BlinkMacSystemFont, sans-serif`,
}

const { applyTheme, getStoredTheme, persistTheme } = themeControls()

export const DEFAULT_THEME: SiteTheme = {
	get name() { return getStoredTheme() },
	setName: (theme) => { applyTheme(theme); persistTheme(theme) },

	paintVariants,

	// baseSize: 4,
	scale: {
		size: 4
	},

	colors: DEFAULT_COLORS,
	fontFamily: DEFAULT_FONT_FAMILY,

	fontSizes: [12, 14, 16, 20, 24, 32, 48, 96],

	fontWeight: [
		400,
		600,
		700,
	],

	lineHeight: {
		xs: 1.3,
		sm: 1.5,
		md: 1.55,
		lg: 1.55,
		// xl: 1.5,
	},

	breakpoints: {
		xs: rem(360),
		sm: rem(768),
		md: rem(1080),
		lg: rem(1280),
		xl: rem(1440),
	},

	radius: [
		0,
		6,
		8,
		12,
		999,
	],

	easing: {
		base: 'cubic-bezier(0.4, 0, 0.2, 1)',
		out: 'cubic-bezier(0.16, 1, 0.3, 1)',
		inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
	},

	duration: {
		instant: '100ms',
		fast: '160ms',
		default: '240ms',
		slow: '400ms',
		gradual: '600ms',
	},

	// fontWeight: {
	// 	regular: 400,
	// 	bold: 600,
	// 	black: 700,
	// },

	// fontSize: {
	// 	xs: rem(10),
	// 	sm: rem(12),
	// 	md: rem(16),
	// 	lg: rem(18),
	// 	xl: rem(20),
	// },

	// fontSize: [1, 2, 3, 4, 6, 8, 10, 12],

	// headings: {
	// 	fontFamily: DEFAULT_FONT_FAMILY.title,
	// 	fontWeight: 700,
	// 	tagName: {
	// 		h1: {
	// 			fontSize: tkn('size', '32'),
	// 			lineHeight: 1.15,
	// 		},
	// 		h2: {
	// 			fontSize: tkn('size', '24'),
	// 			lineHeight: 1.25,
	// 		},
	// 		h3: {
	// 			fontSize: tkn('size', '20'),
	// 			lineHeight: 1.3,
	// 			fontWeight: 500,
	// 		},
	// 	}
	// },

	// radius: {
	// 	sm: rem(6),
	// 	md: rem(8),
	// 	lg: rem(12),
	// 	pill: rem(999),
	// },
}
