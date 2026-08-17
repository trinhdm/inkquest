import { base } from '../../reference'
import { byScheme } from '../utils'
import type { ThemeConfig } from '../../themeConfig'
import type { TokenStateHues } from '../../types'

export interface PrimaryTokens
	extends TokenStateHues {}

export const getPrimaryTokens = (config: ThemeConfig): PrimaryTokens => {
	const primaryColors = {
		dark: base.oxblood,
		light: base.crimson,
	}

	const { colors, modColor } = byScheme(config, primaryColors),
		hues = modColor(colors.get('100'))

	return hues
}
