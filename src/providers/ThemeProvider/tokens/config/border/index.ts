import { getBorderColorTokens, type BorderColorTokens } from './color'
import { getBorderRadiusTokens, type BorderRadiusTokens } from './radius'
import type { ThemeConfig } from '../theme'

interface BorderTokens {
	color: ({ scheme, mixer }: ThemeConfig) => BorderColorTokens
	radius: () => BorderRadiusTokens
}

export const borderTokens: BorderTokens = {
	color: getBorderColorTokens,
	radius: getBorderRadiusTokens,
}

export type { BorderColorTokens } from './color'
export type { BorderRadiusTokens } from './radius'
