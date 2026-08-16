import { getPrimaryTokens, type PrimaryTokens } from './primary'
import { getSecondaryTokens, type SecondaryTokens } from './secondary'

export interface AccentTokens {
	primary: PrimaryTokens
	secondary: SecondaryTokens
}

export const getAccentTokens = (): AccentTokens => {
	const primaryColors = getPrimaryTokens(),
		secondaryColors = getSecondaryTokens()

	return {
		primary: primaryColors,
		secondary: secondaryColors,
	}
}
