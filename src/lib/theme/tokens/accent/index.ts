import { getPrimaryTokens, type PrimaryTokens } from './primary'
import { getSecondaryTokens, type SecondaryTokens } from './secondary'
import type { ThemeConfig } from '../../themeConfig'

export interface AccentTokens
	extends PrimaryTokens {
	secondary: SecondaryTokens
}

export const getAccentTokens = (config: ThemeConfig): AccentTokens => {
	const primaryColors = getPrimaryTokens(config),
		secondaryColors = getSecondaryTokens(config)

	return {
		...primaryColors,
		secondary: secondaryColors,
	}
}
