import { getAccentTokens } from '../index'
import { getPrimaryTokens } from '../primary'
import { getSecondaryTokens } from '../secondary'
import { THEME_CONFIGS } from '../../../themeConfig'

describe('getAccentTokens', () => {
	it.each(['dark', 'light'] as const)('spreads the primary hues at the top level on %s', (scheme) => {
		const config = THEME_CONFIGS[scheme],
			{ secondary, ...primary } = getAccentTokens(config)

		expect(primary).toEqual(getPrimaryTokens(config))
		expect(secondary).toEqual(getSecondaryTokens(config))
	})

	it('keeps secondary distinct from the primary hues', () => {
		const tokens = getAccentTokens(THEME_CONFIGS.dark)
		expect(tokens.secondary.base).not.toBe(tokens.base)
	})
})
