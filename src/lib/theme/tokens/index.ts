import { getAccentTokens } from './accent'
import { getBackgroundTokens } from './background'
import { getBorderTokens } from './border'
import { getColorTokens } from './colors'
import { getLayoutTokens } from './layout'
import { getMotionTokens } from './motion'
import { getTypographyTokens } from './typography'

export const Config = {
	accent: getAccentTokens,
	background: getBackgroundTokens,
	border: getBorderTokens,
	color: getColorTokens,
	element: getLayoutTokens.element,
	motion: getMotionTokens,
	space: getLayoutTokens.space,
	typography: getTypographyTokens,
}

export { THEME_CONFIGS, type ThemeConfig } from '../themeConfig'
export type { AccentTokens } from './accent'
export type { BackgroundTokens } from './background'
export type { BorderColorTokens, BorderRadiusTokens } from './border'
export type { ColorTokens } from './colors'
export type { MotionTokens } from './motion'
export type { SpaceTokens } from './layout'
export type { TypographyTokens } from './typography'
