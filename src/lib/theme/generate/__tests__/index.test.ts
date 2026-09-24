import { tokenGenerator } from '../index'

beforeAll(() => {
	document.documentElement.style.fontSize = '16px'
})

afterAll(() => {
	document.documentElement.style.fontSize = ''
})

describe('tokenGenerator', () => {
	it('flattens a nested token tree into a flat CSS-variable map', () => {
		const result = tokenGenerator({ border: { radius: { topLeft: '4px' } } })
		expect(result).toEqual({ '--border-radius-top-left': '4px' })
	})

	it('applies the prefix as the leading segment for a primitive (non-hex) value', () => {
		const result = tokenGenerator({ theme: 'ink' }, 'inkq')
		expect(result).toEqual({ '--inkq-theme': 'ink' })
	})

	// Source bug, not a desired contract: hexCodeStrategy.run() destructures
	// only `{ path, value }` from its args and never forwards `prefix` into
	// formatToken(), so a hex-color leaf's variable name silently drops the
	// prefix that every other strategy (primitive/numeric/text/shorthand)
	// honors. This test pins the current, prefix-dropping behavior; see the
	// Maintenance Note.
	it('BUG: drops the prefix for hex-color leaves, unlike every other value type', () => {
		const hex = tokenGenerator({ accent: '#111111' }, 'inkq')
		expect(hex).toEqual({ '--accent-100': '#111111' })

		const nonHex = tokenGenerator({ theme: 'ink' }, 'inkq')
		expect(nonHex).toEqual({ '--inkq-theme': 'ink' })
	})

	it('drops skippable (null/undefined/empty-string/function) leaves entirely', () => {
		const result = tokenGenerator({ a: null, b: undefined, c: '', d: () => {}, e: 'kept' })
		expect(result).toEqual({ '--e': 'kept' })
	})

	it('trims a trailing "base" path segment', () => {
		const result = tokenGenerator({ color: { base: 'red' } })
		expect(result).toEqual({ '--color': 'red' })
	})

	// Finding, not asserted-as-desired: two *different* input keys can
	// collide on the same generated CSS variable name once each is
	// independently kebab-cased (`'top-left'` and `'topLeft'` both become
	// `top-left`). tokenGenerator builds its output via a single `Map`, so
	// the later key silently overwrites the earlier one's value with no
	// warning. This test locks in the current (last-write-wins) behavior;
	// see the Maintenance Note for why this is flagged as a source risk
	// rather than "fixed" here.
	it('silently lets a later key overwrite an earlier one when their kebab-cased names collide', () => {
		const result = tokenGenerator({ pad: { 'top-left': '1px', topLeft: '2px' } })
		expect(result).toEqual({ '--pad-top-left': '2px' })

		const reversed = tokenGenerator({ pad: { topLeft: '2px', 'top-left': '1px' } })
		expect(reversed).toEqual({ '--pad-top-left': '1px' })
	})

	it('keeps every top-level key as the fixed first path segment for its entire subtree', () => {
		const result = tokenGenerator({ border: { color: { danger: '#f00' }, width: '1px' } })
		expect(Object.keys(result)).toEqual(
			expect.arrayContaining(['--border-color-danger-100', '--border-width'])
		)
	})
})
