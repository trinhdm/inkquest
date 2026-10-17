import { getBackgroundTokens } from '../index'
import { base } from '../../../reference'
import { THEME_CONFIGS } from '../../../themeConfig'

describe('getBackgroundTokens', () => {
	describe('dark (ink)', () => {
		const tokens = getBackgroundTokens(THEME_CONFIGS.dark)

		it('takes page and card from the ink scale', () => {
			expect(tokens.page).toBe(base.ink('100'))
			expect(tokens.card.base).toBe(base.ink('300'))
		})

		it('takes surface and card hover from the theme palette', () => {
			expect(tokens.surface).toBe(base.ink('200'))
			expect(tokens.card.hover).toBe(base.ink('400'))
		})

		it('builds a 135deg gradient from the theme palette', () => {
			expect(tokens.gradient).toBe(
				`linear-gradient(135deg, ${base.ink('500')}, ${base.ink('200')})`
			)
		})
	})

	describe('light (paper)', () => {
		const tokens = getBackgroundTokens(THEME_CONFIGS.light)

		it('takes page and card from the paper scale (page darker than card)', () => {
			expect(tokens.page).toBe(base.paper('300'))
			expect(tokens.card.base).toBe(base.paper('100'))
		})

		it('takes surface, hover and gradient from the paper palette', () => {
			expect(tokens.surface).toBe(base.paper('200'))
			expect(tokens.card.hover).toBe(base.paper('400'))
			expect(tokens.gradient).toContain(base.paper('500'))
		})
	})

	it('points control at the emitted card alias on both schemes, not at a raw color', () => {
		const expected = 'var(--inkq-background-card)'
		expect(getBackgroundTokens(THEME_CONFIGS.dark).control).toBe(expected)
		expect(getBackgroundTokens(THEME_CONFIGS.light).control).toBe(expected)
	})
})
