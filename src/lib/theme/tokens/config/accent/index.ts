import { getPrimaryTokens, type PrimaryTokens } from './primary'
import { getSecondaryTokens, type SecondaryTokens } from './secondary'
import type { ThemeConfig } from '../theme'

export interface AccentTokens {
	primary: PrimaryTokens
	secondary: SecondaryTokens
}

export const getAccentTokens = (config: ThemeConfig): AccentTokens => {
	const primaryColors = getPrimaryTokens(config),
		secondaryColors = getSecondaryTokens(config)

	return {
		primary: primaryColors,
		secondary: secondaryColors,
	}
}
