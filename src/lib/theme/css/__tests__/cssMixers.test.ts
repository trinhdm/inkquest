import { colorMix, toOklch, fromOklch, scaleLCH } from '../cssMixers'

describe('colorMix', () => {
	it('produces a valid CSS color-mix() call in the oklab color space', () => {
		expect(colorMix('red', 50, 'blue')).toBe('color-mix(in oklab, red 50%, blue)')
	})

	it('interpolates a 0 percent value as-is, without special-casing it', () => {
		expect(colorMix('red', 0, 'blue')).toBe('color-mix(in oklab, red 0%, blue)')
	})

	it('interpolates a negative percent as-is (no validation/clamping)', () => {
		expect(colorMix('red', -10, 'blue')).toBe('color-mix(in oklab, red -10%, blue)')
	})

	it('interpolates a fractional percent as-is', () => {
		expect(colorMix('red', 33.3, 'blue')).toBe('color-mix(in oklab, red 33.3%, blue)')
	})
})

describe('toOklch', () => {
	it('defaults l, c, and h to the literal channel-reference letters when omitted', () => {
		expect(toOklch({})).toBe('oklch(l c h)')
	})

	it('substitutes explicit channel values in place of the defaults', () => {
		expect(toOklch({ l: '50%', c: 0.1, h: '180deg' })).toBe('oklch(50% 0.1 180deg)')
	})

	it('omits the alpha segment entirely when alpha is not provided', () => {
		expect(toOklch({ l: '50%' })).toBe('oklch(50% c h)')
	})

	it('appends an alpha segment when alpha is 0, since the check is `!== undefined`, not truthiness', () => {
		expect(toOklch({ alpha: 0 })).toBe('oklch(l c h / 0)')
	})

	it('appends a fractional alpha segment', () => {
		expect(toOklch({ alpha: 0.5 })).toBe('oklch(l c h / 0.5)')
	})
})

describe('fromOklch', () => {
	it('defaults l, c, and h deltas to 0 when omitted', () => {
		expect(fromOklch('red', {})).toBe(
			'oklch(from red calc(l + 0) calc(c + 0) calc(h + 0))'
		)
	})

	it('wraps each provided delta in its own calc() addition', () => {
		expect(fromOklch('var(--base-color)', { l: 10, c: -0.02, h: 5 })).toBe(
			'oklch(from var(--base-color) calc(l + 10) calc(c + -0.02) calc(h + 5))'
		)
	})

	it('omits the alpha segment when alpha is not provided', () => {
		expect(fromOklch('red', { l: 1 })).toBe(
			'oklch(from red calc(l + 1) calc(c + 0) calc(h + 0))'
		)
	})

	it('appends an alpha segment when alpha is explicitly 0', () => {
		expect(fromOklch('red', { alpha: 0 })).toBe(
			'oklch(from red calc(l + 0) calc(c + 0) calc(h + 0) / 0)'
		)
	})
})

describe('scaleLCH', () => {
	it('multiplies every numeric channel by the given factor', () => {
		expect(scaleLCH({ l: 10, c: 2, h: 5 }, 2)).toEqual({ l: 20, c: 4, h: 10 })
	})

	it('scales a negative value with a negative factor back to positive', () => {
		expect(scaleLCH({ l: -5 }, -1)).toEqual({ l: 5 })
	})

	it('zeroes out every channel when the factor is 0', () => {
		expect(scaleLCH({ l: 10 }, 0)).toEqual({ l: 0 })
	})

	it('returns an empty object for an empty input, since there are no keys to iterate', () => {
		expect(scaleLCH({}, 2)).toEqual({})
	})

	it('DEAD CODE: silently drops any non-numeric channel value instead of scaling it, since the string-handling branch is commented out in source', () => {
		// FromOKLCHArgs types l/c/h/alpha as `number`, so this exercises the
		// runtime guard against a value that slips through at the JS boundary.
		const lch = { l: 10, c: 'not-a-number' } as unknown as Parameters<typeof scaleLCH>[0]
		expect(scaleLCH(lch, 2)).toEqual({ l: 20 })
	})

	it('drops a key whose value is undefined rather than scaling it to NaN', () => {
		const lch = { l: undefined } as unknown as Parameters<typeof scaleLCH>[0]
		expect(scaleLCH(lch, 2)).toEqual({})
	})
})
