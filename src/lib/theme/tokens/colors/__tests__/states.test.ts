import { getStateHueTokens } from '../states'
import { byScheme } from '../../utils'
import { base } from '../../../reference'
import { THEME_CONFIGS } from '../../../themeConfig'

describe('getStateHueTokens', () => {
	it.each(['dark', 'light'] as const)('derives each semantic hue from its static color on %s', (scheme) => {
		const configuration = byScheme(THEME_CONFIGS[scheme]),
			tokens = getStateHueTokens(configuration)

		expect(tokens.danger).toEqual(configuration.modColor('red'))
		expect(tokens.success).toEqual(configuration.modColor('green'))
		expect(tokens.warning).toEqual(configuration.modColor('yellow'))
		expect(tokens.info).toEqual(configuration.modColor('blue'))
		expect(tokens.danger.base).toBe(base.red())
	})

	it('uses the scheme-bound modColor it is handed (dark and light differ)', () => {
		const dark = getStateHueTokens(byScheme(THEME_CONFIGS.dark)),
			light = getStateHueTokens(byScheme(THEME_CONFIGS.light))

		expect(dark.danger.tint).not.toBe(light.danger.tint)
		expect(dark.danger.base).toBe(light.danger.base)
	})

	it('references the emitted accent aliases for action, rather than computing colors', () => {
		const { action } = getStateHueTokens(byScheme(THEME_CONFIGS.dark))

		expect(action).toEqual({
			base: 'var(--inkq-accent)',
			hover: 'var(--inkq-accent-hover)',
			active: 'var(--inkq-accent-active)',
			select: 'var(--inkq-accent-tint)',
		})
	})

	it('references text color aliases for control', () => {
		const { control } = getStateHueTokens(byScheme(THEME_CONFIGS.dark))

		expect(control).toEqual({
			base: 'var(--inkq-color-text-tertiary)',
			hover: 'var(--inkq-color-text)',
		})
	})
})
