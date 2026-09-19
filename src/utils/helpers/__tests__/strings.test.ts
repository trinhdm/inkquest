import { capitalize, toKebabCase } from '../strings'

describe('capitalize', () => {
	it('uppercases the first letter of a lowercase word', () => {
		expect(capitalize('hello')).toBe('Hello')
	})

	it('leaves an already-capitalized word unchanged', () => {
		expect(capitalize('Hello')).toBe('Hello')
	})

	it('leaves the rest of the string untouched, including internal casing', () => {
		expect(capitalize('hELLO wORLD')).toBe('HELLO wORLD')
	})

	it('handles a single-character string', () => {
		expect(capitalize('a')).toBe('A')
	})

	it('throws on an empty string, since there is no first character to index', () => {
		expect(() => capitalize('')).toThrow()
	})
})

describe('toKebabCase', () => {
	it('converts camelCase to kebab-case', () => {
		expect(toKebabCase('camelCase')).toBe('camel-case')
	})

	it('converts PascalCase to kebab-case without a leading dash', () => {
		expect(toKebabCase('PascalCase')).toBe('pascal-case')
	})

	it('inserts a dash before every uppercase letter, including consecutive ones', () => {
		expect(toKebabCase('ABC')).toBe('a-b-c')
	})

	it('returns an already-lowercase string unchanged', () => {
		expect(toKebabCase('lowercase')).toBe('lowercase')
	})

	it('returns an empty string unchanged', () => {
		expect(toKebabCase('')).toBe('')
	})

	it('leaves non-alphabetic characters untouched aside from the dash insertions', () => {
		expect(toKebabCase('data2Value')).toBe('data2-value')
	})
})
