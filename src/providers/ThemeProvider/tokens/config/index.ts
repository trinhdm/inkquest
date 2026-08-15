import { backgroundTokens } from './backgrounds'
import { borderTokens } from './border'
import { accentTokens, colorTokens } from './colors'
import { motionTokens } from './motion'
import { spaceTokens } from './space'
import { typographyTokens } from './typography'

export const Config = {
	accent: accentTokens,
	background: backgroundTokens,
	border: borderTokens,
	color: colorTokens,
	motion: motionTokens,
	space: spaceTokens,
	typography: typographyTokens,
}

export type { ThemeTokens, TokenGroup, TokenStatesList } from './theme'
