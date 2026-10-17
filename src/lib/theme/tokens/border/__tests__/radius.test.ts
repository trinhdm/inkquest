import { getBorderRadiusTokens } from '../radius'
import { base } from '../../../reference'

describe('getBorderRadiusTokens', () => {
	const tokens = getBorderRadiusTokens()

	it('maps the named scale steps onto distinct primitive radii, none through pill', () => {
		const scale = [tokens.none, tokens.sm, tokens.md, tokens.lg, tokens.pill]
		expect(scale).toEqual(['01', '02', '03', '04', '05'].map(step => base.radius(step as '01')))
		expect(new Set(scale).size).toBe(5)
	})

	it('defines presets as aliases of the emitted scale, not as raw primitives', () => {
		expect(tokens.chip).toBe('var(--inkq-border-radius-sm)')
		expect(tokens.control).toBe('var(--inkq-border-radius-pill)')
	})
})
