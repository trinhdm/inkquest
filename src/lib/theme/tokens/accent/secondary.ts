import { base } from '../../reference'
import { byTheme, colorMod } from '../utils'
import type { ColorMixtures } from '../../types'
import type { ThemeConfig } from '../../themeConfig'

export interface SecondaryTokens
	extends ColorMixtures {}

export const getSecondaryTokens = (config: ThemeConfig): SecondaryTokens => {
	const secondaryColors = {
		dark: base.ghost,
		light: base.smoke,
	}

	const { colors } = byTheme(config, secondaryColors),
		hues = colorMod(colors.get('100'))

	return hues
}
