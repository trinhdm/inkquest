import { rem } from '@/lib/general'
import { getSharedTokens } from '../utils'

describe('getSharedTokens', () => {
	it('returns an empty object when no size is given', () => {
		expect(getSharedTokens({})).toEqual({})
	})

	it('derives CSS custom properties for a non-steps layout, using the default order (3)', () => {
		const result = getSharedTokens({ size: 'sm' })

		expect(result.root).toEqual({
			'--accordion-column-width': 'var(--space-5)',
			'--accordion-gap': 'var(--space-3)',
			'--accordion-padding': 'var(--space-4)',
			'--accordion-indicator-size': 'var(--font-size-16)',
			'--accordion-step-size': `calc((var(--accordion-text-size) - var(--accordion-indicator-size)) + (${ rem(3) } * 3) )`,
			'--accordion-text-size': 'var(--inkq-font-size-heading-h5)',
			'--accordion-content-indent': 'var(--accordion-indent)',
			'--accordion-title-indent': 'var(--accordion-indent)',
		})
	})

	it('leaves title/content indent overrides empty for a non-steps layout', () => {
		const result = getSharedTokens({ size: 'sm' })

		expect(result.title).toEqual({})
		expect(result.content).toEqual({})
	})

	it('uses a smaller step unit (rem(3)) for size="sm" than for "md"/"lg" (rem(6))', () => {
		const sm = getSharedTokens({ size: 'sm' })
		const md = getSharedTokens({ size: 'md' })

		expect(sm.root!['--accordion-step-size']).toContain(rem(3))
		expect(md.root!['--accordion-step-size']).toContain(rem(6))
	})

	it('applies a smaller step multiplier for larger sizes (lg has step 0, sm has step 2)', () => {
		const lg = getSharedTokens({ size: 'lg' })
		const sm = getSharedTokens({ size: 'sm' })

		// lg: colWidth 11 - 3*0 = 11; sm: colWidth 11 - 3*2 = 5
		expect(lg.root!['--accordion-column-width']).toBe('var(--space-11)')
		expect(sm.root!['--accordion-column-width']).toBe('var(--space-5)')
	})

	it('honors a custom `order`, reflected in the derived heading text-size token', () => {
		// lg has step 0, so order passes through unshifted
		const result = getSharedTokens({ order: 1, size: 'lg' })
		expect(result.root!['--accordion-text-size']).toBe('var(--inkq-font-size-heading-h1)')
	})

	it('shifts the indent tokens onto title/content for layout="steps"', () => {
		const result = getSharedTokens({ layout: 'steps', order: 1, size: 'lg' })

		expect(result.root!['--accordion-content-indent']).toBe(
			'calc(var(--accordion-column-width) + var(--accordion-gap))'
		)
		expect(result.root!['--accordion-title-indent']).toBe(0)
		expect(result.title).toEqual({ '--accordion-indent': 0 })
		expect(result.content).toEqual({
			'--accordion-indent': 'calc(var(--accordion-column-width) + var(--accordion-gap))',
		})
	})
})
