import { _is } from '../checks'

describe('_is.FontName', () => {
	it('recognizes a hyphenated font-prefixed name', () => {
		expect(_is.FontName('font-size')).toBe(true)
	})

	it('rejects a camelCase font-prefixed name with no hyphen', () => {
		expect(_is.FontName('fontSize')).toBe(false)
	})

	it('rejects a name that merely contains "font" mid-string', () => {
		expect(_is.FontName('some-font-thing')).toBe(false)
	})

	it('rejects the bare word "font" (no hyphen at all)', () => {
		expect(_is.FontName('font')).toBe(false)
	})
})

describe('_is.Plural', () => {
	it('treats a trailing "s" name longer than two characters as plural', () => {
		expect(_is.Plural('colors')).toBe(true)
	})

	it('excludes names on the singular-names allowlist even though they end in "s"', () => {
		expect(_is.Plural('radius')).toBe(false)
	})

	it('rejects a two-character name ending in "s"', () => {
		expect(_is.Plural('as')).toBe(false)
	})

	it('rejects a single-character name', () => {
		expect(_is.Plural('s')).toBe(false)
	})

	it('rejects a name that does not end in "s"', () => {
		expect(_is.Plural('color')).toBe(false)
	})
})

describe('_is.Verb', () => {
	it('recognizes an "-ing" suffixed name', () => {
		expect(_is.Verb('spacing')).toBe(true)
	})

	it('rejects a name without the "-ing" suffix', () => {
		expect(_is.Verb('spacer')).toBe(false)
	})
})

describe('_is.Empty', () => {
	it('treats undefined as empty', () => {
		expect(_is.Empty(undefined)).toBe(true)
	})

	it('treats null as empty', () => {
		expect(_is.Empty(null)).toBe(true)
	})

	it('does not treat 0 as empty', () => {
		expect(_is.Empty(0)).toBe(false)
	})

	it('does not treat an empty string as empty', () => {
		expect(_is.Empty('')).toBe(false)
	})

	it('does not treat false as empty', () => {
		expect(_is.Empty(false)).toBe(false)
	})
})

describe('_is.HexCode', () => {
	it('matches a 3-digit hex code', () => {
		expect(_is.HexCode('#fff')).toBe(true)
	})

	it('matches a 6-digit hex code', () => {
		expect(_is.HexCode('#ffffff')).toBe(true)
	})

	it('matches uppercase hex digits', () => {
		expect(_is.HexCode('#ABCDEF')).toBe(true)
	})

	it('matches a hex code embedded inside a larger string', () => {
		expect(_is.HexCode('color:#abc;')).toBe(true)
	})

	it('rejects a 4-digit hex code (neither 3 nor 6 hex digits)', () => {
		expect(_is.HexCode('#1234')).toBe(false)
	})

	it('rejects a 2-digit hex code', () => {
		expect(_is.HexCode('#12')).toBe(false)
	})

	it('rejects non-hex characters after the hash', () => {
		expect(_is.HexCode('#gg0000')).toBe(false)
	})

	it('rejects a value with no hash at all', () => {
		expect(_is.HexCode('ffffff')).toBe(false)
	})

	it('coerces a non-string value to a string before testing, so a plain number never matches', () => {
		expect(_is.HexCode(123)).toBe(false)
	})
})

describe('_is.Numeric', () => {
	it('treats any number, including NaN, as numeric via typeof', () => {
		expect(_is.Numeric(42)).toBe(true)
		expect(_is.Numeric(NaN)).toBe(true)
	})

	it('treats a string containing at least one digit as numeric', () => {
		expect(_is.Numeric('16px')).toBe(true)
	})

	it('rejects a string with no digits', () => {
		expect(_is.Numeric('abc')).toBe(false)
	})

	it('rejects null (not an object, no digit in "null")', () => {
		expect(_is.Numeric(null)).toBe(false)
	})

	it('treats a plain object as numeric only when every one of its values is numeric', () => {
		expect(_is.Numeric({ a: 1, b: { c: 2 } })).toBe(true)
	})

	it('rejects a plain object when any value is non-numeric', () => {
		expect(_is.Numeric({ a: 1, b: 'x' })).toBe(false)
	})

	it('treats an empty object as numeric, since Array.every on an empty list is vacuously true', () => {
		expect(_is.Numeric({})).toBe(true)
	})

	it('treats an array of numbers as numeric via the digit-in-stringified-value branch, not the object branch', () => {
		// isObject() excludes arrays, so this hits `/\d/.test(String([1, 2]))` -> "1,2"
		expect(_is.Numeric([1, 2])).toBe(true)
	})

	it('rejects an array of non-numeric strings, since its stringified form contains no digits', () => {
		expect(_is.Numeric(['a', 'b'])).toBe(false)
	})
})

describe('_is.TagGroup', () => {
	it('recognizes an object with an object-valued "tagName" key', () => {
		expect(_is.TagGroup({ tagName: { span: true } })).toBe(true)
	})

	it('rejects an object whose "tagName" is a plain string, not an object', () => {
		expect(_is.TagGroup({ tagName: 'span' })).toBe(false)
	})

	it('rejects an object with no "tagName" key at all', () => {
		expect(_is.TagGroup({})).toBe(false)
	})

	it('rejects null', () => {
		expect(_is.TagGroup(null)).toBe(false)
	})
})

describe('_is.Singular', () => {
	it('is true for a tag group', () => {
		expect(_is.Singular({ tagName: { span: true } })).toBe(true)
	})

	it('is true for a hex code', () => {
		expect(_is.Singular('#fff')).toBe(true)
	})

	it('is true for a plain number', () => {
		expect(_is.Singular(16)).toBe(true)
	})

	it('is false for a non-numeric, non-hex, non-tag-group string', () => {
		expect(_is.Singular('hello')).toBe(false)
	})
})
