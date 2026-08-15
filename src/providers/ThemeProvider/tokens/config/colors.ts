import { alias, tokn } from '../ref'
import { colorMix } from './color-mix'
import { ALT_THEME, type ThemeConfig } from './theme'

export interface AccentTokens {
	base: string
	hover: string
	press: string
	muted: string
	text: string
}

export const accentTokens = (): AccentTokens => ({
	base: tokn.brand('100'),
	hover: tokn.brand('200'),
	press: tokn.brand('300'),
	muted: colorMix(alias.background.page(), 80, alias.accent()),
	text: alias.color.link(),
})

export interface ColorTokens {
	text: { base: string; inverse: string }
	link: { base: string; hover: string }
	action: { base: string; hover: string }
	interactive: { base: string; hover: string }
}

export const colorTokens = ({ scheme, mixer }: ThemeConfig): ColorTokens => {
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
			base: alias.accent(),
			hover: alias.accent('hover'),
		},
		interactive: {
			base: colorMix(mixer, 100, scaleBase),
			hover: colorMix(mixer, 90, scaleBase),
		},
	}
}
