import { tokn } from '../../ref'
import { colorMix } from '../utils'
import type { ThemeConfig } from '../theme'

export interface BorderColorTokens {
	base: string
	strong: string
}

export const getBorderColorTokens = ({ scheme, mixer }: ThemeConfig): BorderColorTokens => {
	const scaleBase = tokn[scheme]('600')
	// const scaleBase = tkn(scheme, '100')

	return {
		base: scaleBase,
		strong: colorMix(mixer, 55, scaleBase),		// Token.alias('border')
	}
}
