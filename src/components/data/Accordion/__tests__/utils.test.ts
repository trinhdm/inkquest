import { getSharedTokens } from '../utils'
import { rem } from '@/lib/general'

describe('getSharedTokens', () => {
	afterEach(() => {
		// jsdom leaves the root font-size unset (computed fontSize === ''), so
		// rem()'s internal base resolves to NaN unless a test opts in below.
		// See src/lib/general/__tests__/unitConverter.test.ts for the same idiom.
		document.documentElement.style.fontSize = ''
	})

	it('returns an empty object when no size is given', () => {
		expect(getSharedTokens({})).toEqual({})
	})

	it('derives root CSS custom properties for a given size, using the default order (3)', () => {
		document.documentElement.style.fontSize = '16px'
		const result = getSharedTokens({ size: 'sm' })

		expect(result.root).toEqual({
			'--accordion-column-width': 'var(--space-5)',
			'--accordion-gap': 'var(--space-3)',
			'--accordion-padding': 'var(--space-4)',
			'--accordion-indicator-size': 'var(--font-size-16)',
			'--accordion-step-size': `calc((var(--accordion-text-size) - var(--accordion-indicator-size)) + (${ rem(3) } * 3) )`,
			'--accordion-text-size': 'var(--inkq-font-size-heading-h5)',
		})
	})

	it('returns only a `root` token group -- there is no longer a `title`/`content` split', () => {
		document.documentElement.style.fontSize = '16px'
		const result = getSharedTokens({ size: 'sm' })

		expect(Object.keys(result)).toEqual(['root'])
	})

	it('uses a smaller step unit (rem(3)) for size="sm" than for "md"/"lg" (rem(6))', () => {
		document.documentElement.style.fontSize = '16px'
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

	it('honors a custom `order`, reflected in the derived heading title-size token', () => {
		// lg has step 0, so order passes through unshifted
		const result = getSharedTokens({ order: 1, size: 'lg' })
		expect(result.root!['--accordion-title-size']).toBe('var(--inkq-font-size-heading-h1)')
	})

	it('ignores `layout` entirely -- the title/content indent tokens moved to AccordionTitle/AccordionContent, so passing `layout` produces the same root tokens as omitting it', () => {
		document.documentElement.style.fontSize = '16px'
		const withLayout = getSharedTokens({ layout: 'steps', order: 1, size: 'lg' })
		const withoutLayout = getSharedTokens({ order: 1, size: 'lg' })

		expect(withLayout).toEqual(withoutLayout)
		expect(withLayout.root).not.toHaveProperty('--accordion-content-indent')
		expect(withLayout.root).not.toHaveProperty('--accordion-title-indent')
	})
})
