import { formatToken } from '../tokenName'

describe('formatToken', () => {
	it('kebab-cases a single-segment path into a CSS custom property', () => {
		expect(formatToken({ path: ['colors'] })).toBe('--colors')
	})

	it('joins a two-segment path with a hyphen', () => {
		expect(formatToken({ path: ['colors', 'primary'] })).toBe('--colors-primary')
	})

	it('strips a trailing "base" segment from the token', () => {
		expect(formatToken({ path: ['colors', 'primary', 'base'] })).toBe('--colors-primary')
	})

	it('leaves a numeric-looking final segment such as a color step untouched', () => {
		expect(formatToken({ path: ['colors', 'primary', '500'] })).toBe('--colors-primary-500')
	})

	it('scales a fractional decimal segment below 100 by x100 (e.g. a 0.5 line-height step)', () => {
		// '0.5' -> parseFloat -> 0.5 < 100 -> "50"
		expect(formatToken({ path: ['spacing', 'weights', '0.5'] })).toBe('--spacing-weights-50')
	})

	it('does not scale a decimal segment that is already >= 100', () => {
		expect(formatToken({ path: ['spacing', 'weights', '150.5'] })).toBe('--spacing-weights-150.5')
	})

	it('prepends a prefix that is not already part of the leading segment', () => {
		expect(formatToken({ path: ['colors', 'primary'], prefix: 'app' })).toBe('--app-colors-primary')
	})

	it('applies both the prefix and the trailing "base" stripping together', () => {
		expect(formatToken({ path: ['colors', 'primary', 'base'], prefix: 'app' })).toBe('--app-colors-primary')
	})

	it('throws when given an empty path, since the leading segment is read unconditionally', () => {
		expect(() => formatToken({ path: [] })).toThrow()
	})

	describe('when the path has more than two segments, a multi-word (camelCase) segment is exploded on its internal hyphen', () => {
		it('splits a camelCase middle segment into two independent token words', () => {
			// 'lineHeight' -> kebab 'line-height' -> path.length (3) > 2 -> split
			// into ['line', 'height'] as separate route entries
			expect(formatToken({ path: ['spacing', 'lineHeight', '10'] })).toBe('--spacing-line-height-10')
		})

		it('also explodes an already-hyphenated middle segment the same way', () => {
			expect(formatToken({ path: ['fontFamily', 'sans-serif', 'stack'] })).toBe(
				'--font-family-family-sans-serif-stack'
			)
		})

		it('BUG: duplicates a word when the FIRST path segment itself is multi-word, because the token name is built from the raw first segment while the route\'s split remainder is reattached alongside it', () => {
			// path[0] 'borderRadius' -> kebab 'border-radius' -> name = 'border-radius'
			// route splits 'borderRadius' into ['border', 'radius'] too, and
			// formatToken does `[name, ...route.slice(1)]`, re-including 'radius'
			expect(formatToken({ path: ['borderRadius', 'topLeft', '150.5'] })).toBe(
				'--border-radius-radius-top-left-150.5'
			)
		})

		it('BUG: the same first-segment duplication happens for "fontFamily" as the leading segment', () => {
			expect(formatToken({ path: ['fontFamily', 'nested', 'weight'] })).toBe(
				'--font-family-family-nested-weight'
			)
		})

		it('deduplicates identical words produced by splitting, but only within the flattened route -- the name+route reassembly can still reintroduce a duplicate', () => {
			// 'colorRed' -> ['color', 'red']; final 'red' segment collides with
			// the split 'red', so the Set removes the duplicate from route itself
			expect(formatToken({ path: ['colorRed', 'other', 'red'] })).toBe('--color-red-red-other')
		})
	})

	it('does not split a 3+ segment path when none of the kebab-cased segments contain a hyphen', () => {
		expect(formatToken({ path: ['a', 'b', 'c', 'd'] })).toBe('--a-b-c-d')
	})

	it('does not split a hyphenated segment when the path has two or fewer segments', () => {
		// path.length (2) is not > 2, so 'topLeft' -> 'top-left' stays intact
		expect(formatToken({ path: ['margin', 'topLeft'] })).toBe('--margin-top-left')
	})
})
