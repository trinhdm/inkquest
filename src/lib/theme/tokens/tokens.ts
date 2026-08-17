import { getAccentTokens } from './accent'
import { getBackgroundTokens } from './background'
import { getBorderTokens } from './border'
import { getColorTokens, getOpacityTokens } from './colors'
import { getLayoutTokens } from './layout'
import { getMotionTokens } from './motion'
import { getTypographyTokens } from './typography'

export const Tokens = {
	accent: getAccentTokens,
	background: getBackgroundTokens,
	border: getBorderTokens,
	color: getColorTokens,
	element: getLayoutTokens.element,
	motion: getMotionTokens,
	opacity: getOpacityTokens,
	padding: getLayoutTokens.padding,
	space: getLayoutTokens.space,
	typography: getTypographyTokens,
}
