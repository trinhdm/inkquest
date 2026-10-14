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

		// sm shifts the heading order by its step (2): h3 -> h5. No step-size
		// token without layout="steps".
		expect(result.root).toEqual({
			'--accordion-column-width': 'var(--space-5)',
			'--accordion-gap': 'var(--space-3)',
			'--accordion-padding': 'var(--space-4)',
			'--accordion-indicator-size': 'var(--font-size-16)',
			'--accordion-step-size': undefined,
			'--accordion-title-size': 'var(--inkq-font-size-h5)',
		})
	})

	it('returns only a `root` token group -- there is no longer a `title`/`content` split', () => {
		document.documentElement.style.fontSize = '16px'
		const result = getSharedTokens({ size: 'sm' })

		expect(Object.keys(result)).toEqual(['root'])
	})

	it('only emits a step-size token for layout="steps", and none for the default layout', () => {
		document.documentElement.style.fontSize = '16px'

		expect(getSharedTokens({ size: 'md' }).root!['--accordion-step-size']).toBeUndefined()
		expect(getSharedTokens({ size: 'md', layout: 'default' }).root!['--accordion-step-size']).toBeUndefined()
		expect(getSharedTokens({ size: 'md', layout: 'steps' }).root!['--accordion-step-size']).toEqual(expect.any(String))
	})

	it('uses a smaller step unit (rem(3)) for size="sm" than for "md"/"lg" (rem(6)) under layout="steps"', () => {
		document.documentElement.style.fontSize = '16px'
		const sm = getSharedTokens({ layout: 'steps', size: 'sm' })
		const md = getSharedTokens({ layout: 'steps', size: 'md' })
		const lg = getSharedTokens({ layout: 'steps', size: 'lg' })

		// the unit is multiplied by (step + 1): sm 3, md 2, lg 1
		expect(sm.root!['--accordion-step-size']).toBe(
			`calc((var(--accordion-title-size) - var(--accordion-indicator-size)) + (${ rem(3) } * 3) )`
		)
		expect(md.root!['--accordion-step-size']).toBe(
			`calc((var(--accordion-title-size) - var(--accordion-indicator-size)) + (${ rem(6) } * 2) )`
		)
		expect(lg.root!['--accordion-step-size']).toBe(
			`calc((var(--accordion-title-size) - var(--accordion-indicator-size)) + (${ rem(6) } * 1) )`
		)
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
		expect(result.root!['--accordion-title-size']).toBe('var(--inkq-font-size-h1)')
	})

	it('only layout="steps" changes the root tokens -- it adds the step-size and nothing else', () => {
		document.documentElement.style.fontSize = '16px'
		const withLayout = getSharedTokens({ layout: 'steps', order: 1, size: 'lg' }),
			withoutLayout = getSharedTokens({ order: 1, size: 'lg' })

		expect({ ...withLayout.root, '--accordion-step-size': undefined }).toEqual(withoutLayout.root)
		expect(withLayout.root!['--accordion-step-size']).toEqual(expect.any(String))
		expect(withLayout.root).not.toHaveProperty('--accordion-content-indent')
		expect(withLayout.root).not.toHaveProperty('--accordion-title-indent')
	})
})
