import { base } from '../../reference'
import { byScheme } from '../utils'
import type { ThemeConfig } from '../../themeConfig'
import type { TokenStateHues } from '../../types'

export interface SecondaryTokens
	extends TokenStateHues {}

export const getSecondaryTokens = (config: ThemeConfig): SecondaryTokens => {
	const secondaryColors = {
		dark: base.ghost,
		light: base.smoke,
	}

	const modPercents = {
		tint: 2.5,
		shade: 18,
		bright: 5,
		dim: 28,
		muted: 12.5,
	}

	const { colors, modColor } = byScheme(config, secondaryColors),
		hues = modColor(colors.get('100'), modPercents)

	return hues
}
