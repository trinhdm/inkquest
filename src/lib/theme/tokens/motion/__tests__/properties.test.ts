import { getTransitionPropertyTokens } from '../transitions/properties'
import { base } from '../../../reference'

describe('getTransitionPropertyTokens', () => {
	const tokens = getTransitionPropertyTokens()

	it('writes each as "<css-property> <duration> <easing>"', () => {
		expect(tokens.background).toBe(`background-color ${base.duration('default')} ${base.easing()}`)
		expect(tokens.border).toBe(`border-color ${base.duration('default')} ${base.easing()}`)
		expect(tokens.color).toBe(`color ${base.duration('default')} ${base.easing()}`)
	})

	it('uses the instant duration for opacity and transform, and the default for color properties', () => {
		expect(tokens.opacity).toContain(base.duration('instant'))
		expect(tokens.transform).toContain(base.duration('instant'))
		expect(tokens.color).not.toContain(base.duration('instant'))
	})

	it('animates the right CSS property in each token', () => {
		expect(tokens.opacity.startsWith('opacity ')).toBe(true)
		expect(tokens.transform.startsWith('transform ')).toBe(true)
	})
})
