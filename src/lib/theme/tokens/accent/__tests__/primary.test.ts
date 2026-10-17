import { getPrimaryTokens } from '../primary'
import { byScheme } from '../../utils'
import { base } from '../../../reference'
import { THEME_CONFIGS } from '../../../themeConfig'

describe('getPrimaryTokens', () => {
	it('uses the oxblood scale on dark', () => {
		expect(getPrimaryTokens(THEME_CONFIGS.dark).base).toBe(base.oxblood('100'))
	})

	it('uses the crimson scale on light', () => {
		expect(getPrimaryTokens(THEME_CONFIGS.light).base).toBe(base.crimson('100'))
	})

	it.each(['dark', 'light'] as const)('derives the %s state hues with default mix percents', (scheme) => {
		const config = THEME_CONFIGS[scheme]
		expect(getPrimaryTokens(config)).toEqual(
			byScheme(config).modColor(getPrimaryTokens(config).base!)
		)
	})
})
