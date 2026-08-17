import { base } from '../../reference'
import { byTheme, colorMod } from '../utils'
import type { ColorMixtures } from '../../types'
import type { ThemeConfig } from '../../themeConfig'

export interface PrimaryTokens
	extends ColorMixtures {}

export const getPrimaryTokens = (config: ThemeConfig): PrimaryTokens => {
	const primaryColors = {
		dark: base.oxblood,
		light: base.crimson,
	}

	const { colors } = byTheme(config, primaryColors),
		hues = colorMod(colors.get('100'))

	return hues
}
