import { rem } from '@/lib/general'
import { getPalette, setPalette, type ColorPalette } from './theme/palette'
import type { FontList } from '@/types/shared'
import type { SiteTheme } from './theme.types'
import { themeToCssVars } from './theme'
import { themeToCssVarsTEMP } from './theme/cssVariables'


export const DEFAULT_PALETTE: ColorPalette = {
	background: 'transparent',
	border: 'none',
	color: 'inherit',
	focus: 'transparent',
	hover: 'transparent',
}

const DEFAULT_FONT_FAMILY: Record<FontList['fontFamily'], string> = {
	body: 'Archivo, -apple-system, BlinkMacSystemFont, sans-serif',
	title: 'Archivo Black, Archivo, sans-serif',
	label: 'Space Mono, SF Mono, monospace',
}

export const DEFAULT_THEME: SiteTheme = {
	getPalette,
	setPalette,

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
}
