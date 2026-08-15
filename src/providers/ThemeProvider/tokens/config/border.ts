import { tokn } from '../ref'
import { colorMix } from './color-mix'
import type { ThemeConfig } from './theme'

export interface BorderRadiusTokens {
	none: string
	sm: string
	md: string
	lg: string
	pill: string
}

const borderRadiusTokens = (): BorderRadiusTokens => ({
	none: tokn.radius('01'),
	sm: tokn.radius('02'),
	md: tokn.radius('03'),
	lg: tokn.radius('04'),
	pill: tokn.radius('05'),
})

export interface BorderColorTokens {
	base: string
	strong: string
}

const borderColorTokens = ({ scheme, mixer }: ThemeConfig): BorderColorTokens => {
	const scaleBase = tokn[scheme]('600')
	// const scaleBase = tkn(scheme, '100')

	return {
		base: scaleBase,
		strong: colorMix(mixer, 55, scaleBase),		// Token.alias('border')
	}
}


export const borderTokens = {
	color: borderColorTokens,
	radius: borderRadiusTokens,
}
