import { byScheme } from '../utils'
import { getStateHueTokens, type StateHueTokens } from './states'
import { getTextColorTokens, type TextColorTokens } from './text'
import type { ThemeConfig } from '../../themeConfig'

export interface ColorTokens
	extends TextColorTokens, StateHueTokens {}

export const getColorTokens = (config: ThemeConfig): ColorTokens => {
	const configuration = byScheme(config)
	const textColors = getTextColorTokens(configuration),
		hueStates = getStateHueTokens(configuration)

	return { ...textColors, ...hueStates }
}

export { getOpacityTokens, type OpacityTokens } from './opacity'
