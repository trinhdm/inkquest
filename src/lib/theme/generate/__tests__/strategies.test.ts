import { GENERATOR_STRATEGIES } from '../strategies'
import { dispatchGenerator } from '../dispatch'

// The precedence order of GENERATOR_STRATEGIES *is* the module's public
// contract (dispatch.ts picks the first `matches`), so destructuring by
// position documents that contract rather than reaching into an
// implementation detail.
const [
	scaleStrategy,
	numericArrayStrategy,
	textArrayStrategy,
	shorthandStrategy,
	nestedObjectStrategy,
	hexCodeStrategy,
	primitiveStrategy,
] = GENERATOR_STRATEGIES

// rem()/em() read `getComputedStyle(document.documentElement).fontSize` when
// `window` exists (see src/lib/general/unitConverter.ts). jsdom only reports
// a computed font-size once one is explicitly set, so pin it for
// deterministic px -> rem conversion across these tests.
beforeAll(() => {
	document.documentElement.style.fontSize = '16px'
})

afterAll(() => {
	document.documentElement.style.fontSize = ''
})

describe('primitiveStrategy', () => {
	it('matches any value (it is the catch-all, last in precedence order)', () => {
		expect(primitiveStrategy.matches({ path: ['x'], value: 'anything' })).toBe(true)
		expect(primitiveStrategy.matches({ path: ['x'], value: 42 })).toBe(true)
	})

	it('formats a token name from the path, ignoring the value', () => {
		const entries = primitiveStrategy.run({ path: ['theme'], value: 'ink' }, dispatchGenerator)
		expect(entries).toEqual([{ name: '--theme', value: 'ink' }])
	})
})

describe('hexCodeStrategy', () => {
	it('matches a 4- or 7-character #-prefixed string', () => {
		expect(hexCodeStrategy.matches({ path: ['red'], value: '#fff' })).toBe(true)
		expect(hexCodeStrategy.matches({ path: ['red'], value: '#ff0000' })).toBe(true)
	})

	it('does not match a non-hex string', () => {
		expect(hexCodeStrategy.matches({ path: ['red'], value: 'red' })).toBe(false)
	})

	it('always labels the step as position*100, even at index 0 of a scalar (non-array) value', () => {
		const entries = hexCodeStrategy.run({ path: ['red'], value: '#ff0000' }, dispatchGenerator)
		expect(entries).toEqual([{ name: '--red-100', value: '#ff0000' }])
	})
})

describe('nestedObjectStrategy', () => {
	it('matches plain objects only', () => {
		expect(nestedObjectStrategy.matches({ path: ['x'], value: { a: 1 } })).toBe(true)
		expect(nestedObjectStrategy.matches({ path: ['x'], value: [1, 2] })).toBe(false)
		expect(nestedObjectStrategy.matches({ path: ['x'], value: 'a' })).toBe(false)
	})

	it('recurses through the provided generate callback for every entry, extending the path', () => {
		const generate = jest.fn(() => [{ name: '--stub' as const, value: 'v' }])
		const entries = nestedObjectStrategy.run(
			{ path: ['border'], prefix: 'inkq', value: { color: '#fff', width: '1px' } },
			generate
		)

		expect(generate).toHaveBeenCalledWith({ value: '#fff', path: ['border', 'color'], prefix: 'inkq' })
		expect(generate).toHaveBeenCalledWith({ value: '1px', path: ['border', 'width'], prefix: 'inkq' })
		expect(entries).toEqual([{ name: '--stub', value: 'v' }, { name: '--stub', value: 'v' }])
	})
})

describe('shorthandStrategy', () => {
	const font = { fontFamily: 'Archivo', fontSize: '16px', fontWeight: 400, lineHeight: 1.5 }

	it('matches an object with exactly the registered font shorthand keys', () => {
		expect(shorthandStrategy.matches({ path: ['font'], value: font })).toBe(true)
	})

	it('does not match an object with a missing or extra key', () => {
		const { lineHeight, ...missingKey } = font
		expect(shorthandStrategy.matches({ path: ['font'], value: missingKey })).toBe(false)
		expect(shorthandStrategy.matches({ path: ['font'], value: { ...font, extra: 1 } })).toBe(false)
	})

	it('composes "weight size/lineHeight family" and names the token from the current path only', () => {
		const entries = shorthandStrategy.run({ path: ['font'], value: font }, dispatchGenerator)
		expect(entries).toEqual([{ name: '--font', value: '400 16px/1.5 Archivo' }])
	})
})

describe('numericArrayStrategy', () => {
	it('matches an array of all numbers only', () => {
		expect(numericArrayStrategy.matches({ path: ['x'], value: [1, 2, 3] })).toBe(true)
		expect(numericArrayStrategy.matches({ path: ['x'], value: [1, '2'] })).toBe(false)
		expect(numericArrayStrategy.matches({ path: ['x'], value: 'x' })).toBe(false)
	})

	it('for a path containing "size", keeps the raw px number as the step label but rem-converts the value', () => {
		const entries = numericArrayStrategy.run({ path: ['fontSize'], value: [10, 12] }, dispatchGenerator)
		expect(entries).toEqual([
			{ name: '--font-size-10', value: '0.625rem' },
			{ name: '--font-size-12', value: '0.75rem' },
		])
	})

	it('for a value in (0, 1], labels the step as a percentage but leaves the value un-rem-converted', () => {
		const entries = numericArrayStrategy.run({ path: ['opacity'], value: [0.2, 1] }, dispatchGenerator)
		expect(entries).toEqual([
			{ name: '--opacity-20', value: '0.2' },
			{ name: '--opacity-1', value: '1' },
		])
	})

	it('for a positive multiple of 100, labels the step as the raw weight but leaves the value un-rem-converted', () => {
		const entries = numericArrayStrategy.run({ path: ['fontWeight'], value: [400, 600] }, dispatchGenerator)
		expect(entries).toEqual([
			{ name: '--font-weight-400', value: '400' },
			{ name: '--font-weight-600', value: '600' },
		])
	})

	it('falls back to a zero-padded index label and a rem-converted value for anything else, including 0', () => {
		const entries = numericArrayStrategy.run({ path: ['radius'], value: [0, 6] }, dispatchGenerator)
		expect(entries).toEqual([
			{ name: '--radius-01', value: '0rem' },
			{ name: '--radius-02', value: '0.375rem' },
		])
	})
})

describe('textArrayStrategy', () => {
	it('matches an array of all strings only', () => {
		expect(textArrayStrategy.matches({ path: ['x'], value: ['a', 'b'] })).toBe(true)
		expect(textArrayStrategy.matches({ path: ['x'], value: ['a', 1] })).toBe(false)
	})

	it('labels each entry by zero-padded index and keeps the raw string value, unlike numericArrayStrategy', () => {
		const entries = textArrayStrategy.run({ path: ['letterSpacing'], value: ['-0.03em', '0.02em'] }, dispatchGenerator)
		expect(entries).toEqual([
			{ name: '--letter-spacing-01', value: '-0.03em' },
			{ name: '--letter-spacing-02', value: '0.02em' },
		])
	})
})

describe('scaleStrategy', () => {
	it('matches only path[0] === "scale" with a numeric value', () => {
		expect(scaleStrategy.matches({ path: ['scale'], value: 4 })).toBe(true)
		expect(scaleStrategy.matches({ path: ['scale'], value: '4' })).toBe(false)
		expect(scaleStrategy.matches({ path: ['other'], value: 4 })).toBe(false)
	})

	it('always generates exactly 16 rem-converted steps, scaled by the input value', () => {
		const entries = scaleStrategy.run({ path: ['scale'], prefix: 'inkq', value: 4 }, dispatchGenerator)
		expect(entries).toHaveLength(16)
		// step 1 -> 1 * 4 = 4px -> 0.25rem
		expect(entries[0]).toEqual({ name: '--inkq-1', value: '0.25rem' })
		// step 11 (index 10, j=11) uses the "10 + (j-10)*2" branch -> 10+2=12 -> 12*4=48px -> 3rem
		expect(entries[10]).toEqual({ name: '--inkq-11', value: '3rem' })
	})
})
