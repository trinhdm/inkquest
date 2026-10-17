import { getSecondaryTokens } from '../secondary'
import { getPrimaryTokens } from '../primary'
import { base } from '../../../reference'
import { THEME_CONFIGS } from '../../../themeConfig'

describe('getSecondaryTokens', () => {
	it('uses the ghost scale on dark and the smoke scale on light', () => {
		expect(getSecondaryTokens(THEME_CONFIGS.dark).base).toBe(base.ghost('100'))
		expect(getSecondaryTokens(THEME_CONFIGS.light).base).toBe(base.smoke('100'))
	})

	it('applies its own mix percents instead of the defaults', () => {
		const hues = getSecondaryTokens(THEME_CONFIGS.dark)
		expect(hues.tint).toContain(' 2.5%,')
		expect(hues.shade).toContain(' 20%,')
		expect(hues.bright).toContain(' 5%,')
		expect(hues.dim).toContain(' 30%,')
		expect(hues.muted).toContain(' 45%,')
	})

	it('mixes differently from the primary hues (control: primary keeps the 15% tint)', () => {
		const primary = getPrimaryTokens(THEME_CONFIGS.dark)
		expect(primary.tint).toContain(' 15%,')
		expect(getSecondaryTokens(THEME_CONFIGS.dark).tint).not.toContain(' 15%,')
	})
})
