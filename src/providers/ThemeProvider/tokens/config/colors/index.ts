import { ALT_THEME, type ThemeConfig } from '../theme'
import { alias, tokn } from '../../ref'
import { colorMix } from '../utils'

export interface ColorTokens {
	text: {
		base: string
		inverse: string
	}
	link: {
		base: string
		hover: string
	}
	action: {
		base: string
		hover: string
	}
	interactive: {
		base: string
		hover: string
	}
}

export const getColorTokens = ({ scheme, mixer }: ThemeConfig): ColorTokens => {
	// const scaleBase = tkn[paletteName]('100')
	const scaleBase = tokn[scheme]('100')
	const altBase = tokn[ALT_THEME[scheme]]('100')

	return {
		text: {
			base: colorMix(mixer, 95, scaleBase),
			inverse: colorMix(mixer, 95, altBase),
			// inverse: tkn[OPPOSITE_PALETTE_NAME[paletteName]]('100'),
		},
		link: {
			base: colorMix(mixer, 50, scaleBase),
			hover: colorMix(mixer, 75, scaleBase),
		},
		action: {
			base: alias.accent.primary(),
			hover: alias.accent.primary('hover'),
		},
		interactive: {
			base: colorMix(mixer, 100, scaleBase),
			hover: colorMix(mixer, 90, scaleBase),
		},
	}
}
