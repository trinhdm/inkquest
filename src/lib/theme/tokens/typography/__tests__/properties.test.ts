import { getFontPropertyTokens } from '../properties'
import { alias } from '../../../reference'

describe('getFontPropertyTokens', () => {
	const { fontSize } = getFontPropertyTokens()

	it('builds each heading fluid size as a clamp() between two real size aliases', () => {
		for (const h of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const)
			expect(fontSize[h].fluid).toMatch(/^clamp\(var\(--inkq-font-size-[\w-]+\), \d+vw, var\(--inkq-font-size-[\w-]+\)\)$/)
	})

	it('steps h1 fluid between the display md and lg sizes', () => {
		expect(fontSize.h1.fluid).toBe(
			`clamp(${alias.fontSize('display', 'md')}, 4vw, ${alias.fontSize('display', 'lg')})`
		)
	})

	it('chains each lower heading fluid range to the next heading up', () => {
		expect(fontSize.h4.fluid).toBe(`clamp(${alias.fontSize('h2')}, 3vw, ${alias.fontSize('h1')})`)
		expect(fontSize.h6.fluid).toBe(`clamp(${alias.fontSize('h4')}, 3vw, ${alias.fontSize('h3')})`)
	})
})
