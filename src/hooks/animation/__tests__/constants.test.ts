import { revealMargin } from '../constants'

describe('revealMargin', () => {
	it('builds a CSS margin that pulls only the bottom edge in by the lead percentage', () => {
		expect(revealMargin(-10)).toBe('0px 0px -10% 0px')
	})

	it('accepts a positive lead, which pushes the bottom edge out', () => {
		expect(revealMargin(5)).toBe('0px 0px 5% 0px')
	})

	it('accepts zero without falling back to the default lead', () => {
		expect(revealMargin(0)).toBe('0px 0px 0% 0px')
	})

	it('keeps fractional leads as written', () => {
		expect(revealMargin(-2.5)).toBe('0px 0px -2.5% 0px')
	})

	it('falls back to the default lead when called with nothing', () => {
		const margin = revealMargin()

		expect(margin).toMatch(/^0px 0px -?\d+(\.\d+)?% 0px$/)
		expect(margin).toBe(revealMargin(undefined))
	})
})
