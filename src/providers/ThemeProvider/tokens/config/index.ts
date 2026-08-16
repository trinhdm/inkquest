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

export { THEME_CONFIGS, type ThemeConfig } from './theme'
