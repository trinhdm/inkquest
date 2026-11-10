import { getTextColorTokens } from '../text'
import { byScheme } from '../../utils'
import { base } from '../../../reference'
import { THEME_CONFIGS } from '../../../themeConfig'

describe('getTextColorTokens', () => {
	it('inverts text against the theme: inverse is the lightest step of the active palette', () => {
		expect(getTextColorTokens(byScheme(THEME_CONFIGS.dark)).text.inverse).toBe(base.ink('100'))
		expect(getTextColorTokens(byScheme(THEME_CONFIGS.light)).text.inverse).toBe(base.paper('100'))
	})

	it('derives the text ramp from the secondary accent states', () => {
		const { text } = getTextColorTokens(byScheme(THEME_CONFIGS.dark))

		expect(text.base).toBe('var(--inkq-accent-secondary)')
		expect(text.secondary).toBe('var(--inkq-accent-secondary-shade)')
		expect(text.tertiary).toBe('var(--inkq-accent-secondary-dim)')
	})

	it('puts text on accents in the inverse color, via the emitted alias', () => {
		const { text } = getTextColorTokens(byScheme(THEME_CONFIGS.light))
		expect(text.on.accent).toBe('var(--inkq-color-text-inverse)')
	})

	it('maps link states and placeholder onto secondary accent states', () => {
		const tokens = getTextColorTokens(byScheme(THEME_CONFIGS.dark))

		expect(tokens.link).toEqual({
			base: 'var(--inkq-accent-secondary-shade)',
			hover: 'var(--inkq-accent-secondary-tint)',
			focus: 'var(--inkq-accent-secondary-muted)',
			disable: 'var(--inkq-accent-secondary-dim)',
		})
		expect(tokens.placeholder).toBe('var(--inkq-accent-secondary-muted)')
	})
})
