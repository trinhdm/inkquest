import { getColorTokens, getOpacityTokens } from '../index'
import { getOpacityTokens as getOpacityDirect } from '../opacity'
import { getTextColorTokens } from '../text'
import { getStateHueTokens } from '../states'
import { byScheme } from '../../utils'
import { THEME_CONFIGS } from '../../../themeConfig'

describe('getColorTokens', () => {
	it.each(['dark', 'light'] as const)('merges the text and state-hue groups on %s', (scheme) => {
		const config = THEME_CONFIGS[scheme],
			configuration = byScheme(config)

		expect(getColorTokens(config)).toEqual({
			...getTextColorTokens(configuration),
			...getStateHueTokens(configuration),
		})
	})

	it('has no key collisions between the two groups', () => {
		const configuration = byScheme(THEME_CONFIGS.dark),
			text = Object.keys(getTextColorTokens(configuration)),
			states = Object.keys(getStateHueTokens(configuration)),
			merged = Object.keys(getColorTokens(THEME_CONFIGS.dark))

		expect(merged).toHaveLength(text.length + states.length)
	})
})

describe('colors barrel', () => {
	it('re-exports getOpacityTokens from ./opacity', () => {
		expect(getOpacityTokens).toBe(getOpacityDirect)
	})
})
