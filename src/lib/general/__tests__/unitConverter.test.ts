import { em, rem } from '../unitConverter'

describe('unitConverter', () => {
	afterEach(() => {
		// jsdom leaves the root font-size unset (computed fontSize === ''),
		// so this must be reset between tests that opt into setting it.
		document.documentElement.style.fontSize = ''
	})

	describe('numeric input', () => {
		it('converts a positive px number to em using the root font-size as the base', () => {
			document.documentElement.style.fontSize = '16px'
			expect(em(32)).toBe('2em')
		})

		it('converts a positive px number to rem the same way, with the rem unit', () => {
			document.documentElement.style.fontSize = '16px'
			expect(rem(32)).toBe('2rem')
		})

		it('produces the exact fractional decimal when the division does not resolve evenly', () => {
			document.documentElement.style.fontSize = '16px'
			expect(em(10)).toBe('0.625em')
		})

		it('converts a negative px number to a negative unit value', () => {
			document.documentElement.style.fontSize = '16px'
			expect(em(-16)).toBe('-1em')
		})

		it('short-circuits the literal number 0 to "0<unit>" without dividing by the computed base', () => {
			// No root font-size is set here. If 0 fell through to calculate(),
			// dividing by the unresolved (NaN) base would produce "NaNem" instead.
			expect(em(0)).toBe('0em')
		})

		it('divides by NaN when the root font-size is unresolved, yielding "NaN<unit>" for any non-zero number', () => {
			// jsdom's getComputedStyle().fontSize is '' by default, so parseFloat
			// gives NaN and every non-zero numeric conversion becomes NaN<unit>.
			expect(em(16)).toBe('NaNem')
			expect(rem(1)).toBe('NaNrem')
		})

		it('propagates a NaN input straight through the division', () => {
			document.documentElement.style.fontSize = '16px'
			expect(em(NaN)).toBe('NaNem')
		})
	})

	describe('string input', () => {
		it('treats an empty string as zero, returning "0<unit>"', () => {
			expect(em('')).toBe('0em')
		})

		it('short-circuits the exact string "0" to "0<unit>"', () => {
			expect(em('0')).toBe('0em')
		})

		it('does NOT take the "0" fast path for "0px" -- it strips the unit and runs the division instead, so an unresolved base still yields "NaN<unit>"', () => {
			expect(em('0px')).toBe('NaNem')
		})

		it('resolves "0px" to "0<unit>" once a real base is available, matching "0" numerically even though it took the slower path', () => {
			document.documentElement.style.fontSize = '16px'
			expect(em('0px')).toBe('0em')
		})

		it('strips a trailing "px" and converts the remaining number', () => {
			document.documentElement.style.fontSize = '16px'
			expect(em('32px')).toBe('2em')
		})

		it('accepts a bare, unit-less numeric string and treats it as px', () => {
			document.documentElement.style.fontSize = '16px'
			expect(em('32')).toBe('2em')
		})

		it('converts a negative px string', () => {
			document.documentElement.style.fontSize = '16px'
			expect(em('-16px')).toBe('-1em')
		})

		it('converts a fractional px string with full decimal precision', () => {
			document.documentElement.style.fontSize = '16px'
			expect(em('8.5px')).toBe('0.53125em')
		})

		it('only strips the first "px" occurrence (String.replace has no global flag)', () => {
			document.documentElement.style.fontSize = '16px'
			// '16pxpx'.replace('px', '') -> '16px'; parseFloat still reads the
			// leading "16" correctly, so the leftover unit text is harmless here.
			expect(em('16pxpx')).toBe('1em')
		})

		it('does not strip non-"px" unit suffixes, so a value in another unit is silently reinterpreted as px', () => {
			document.documentElement.style.fontSize = '16px'
			// '10rem' has no "px" to strip; parseFloat reads the leading "10"
			// and it gets divided as if it were 10px, not 10rem.
			expect(em('10rem')).toBe('0.625em')
		})

		it('returns a non-numeric string unchanged when nothing can be parsed after stripping "px"', () => {
			expect(em('abcpx')).toBe('abcpx')
		})

		it('returns a bare "px" string unchanged (nothing left to parse after stripping the unit)', () => {
			expect(em('px')).toBe('px')
		})

		it('returns a whitespace-only string unchanged', () => {
			expect(em('   ')).toBe('   ')
		})
	})

	describe('non-string, non-number input (defensive / malformed)', () => {
		it('returns null unchanged since neither the numeric nor string branch matches', () => {
			expect(em(null as unknown as string)).toBeNull()
		})

		it('returns undefined unchanged since neither branch matches', () => {
			expect(em(undefined as unknown as string)).toBeUndefined()
		})

		it('returns a boolean value unchanged', () => {
			expect(em(true as unknown as string)).toBe(true)
		})

		it('returns an object value unchanged (same reference)', () => {
			const obj = { px: 16 }
			expect(em(obj as unknown as string)).toBe(obj)
		})
	})

	describe('rem shares the same conversion logic as em but appends its own unit', () => {
		it('converts a positive number to rem', () => {
			document.documentElement.style.fontSize = '16px'
			expect(rem(48)).toBe('3rem')
		})

		it('short-circuits zero to "0rem"', () => {
			expect(rem(0)).toBe('0rem')
		})

		it('short-circuits the string "0" to "0rem"', () => {
			expect(rem('0')).toBe('0rem')
		})
	})
})
