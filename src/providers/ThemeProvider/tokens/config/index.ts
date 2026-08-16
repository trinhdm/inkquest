import { borderTokens } from './border'
import { getAccentTokens } from './accent'
import { getBackgroundTokens } from './background'
import { getColorTokens } from './colors'
import { getMotionTokens } from './motion'
import { getSpaceTokens } from './layout/space'
import { getTypographyTokens } from './typography'

export const Config = {
	accent: getAccentTokens,
	background: getBackgroundTokens,
	border: borderTokens,
	color: getColorTokens,
	motion: getMotionTokens,
	space: getSpaceTokens,
	typography: getTypographyTokens,
}

export type { ThemeTokens, TokenGroup, TokenStatesList } from './theme'
export type { AccentTokens } from './accent'
export type { BackgroundTokens } from './background'
export type { BorderColorTokens, BorderRadiusTokens } from './border'
export type { ColorTokens } from './colors'
export type { MotionTokens } from './motion'
export type { SpaceTokens } from './layout'
export type { TypographyTokens } from './typography'
