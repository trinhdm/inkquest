import { hasValue } from '../checks'

describe('hasValue', () => {
	it('returns false for null', () => {
		expect(hasValue(null)).toBe(false)
	})

	it('returns false for undefined', () => {
		expect(hasValue(undefined)).toBe(false)
	})

	it('returns false for an empty string', () => {
		expect(hasValue('')).toBe(false)
	})

	it('returns false for a whitespace-only string', () => {
		expect(hasValue('   ')).toBe(false)
	})

	it('returns true for a non-empty string, ignoring surrounding whitespace', () => {
		expect(hasValue('  hi  ')).toBe(true)
	})

	it('returns false for an empty array', () => {
		expect(hasValue([])).toBe(false)
	})

	it('returns true for a non-empty array', () => {
		expect(hasValue([0])).toBe(true)
	})

	it('returns false for an empty Map', () => {
		expect(hasValue(new Map())).toBe(false)
	})

	it('returns true for a non-empty Map', () => {
		expect(hasValue(new Map([['a', 1]]))).toBe(true)
	})

	it('returns false for an empty Set', () => {
		expect(hasValue(new Set())).toBe(false)
	})

	it('returns true for a non-empty Set', () => {
		expect(hasValue(new Set([1]))).toBe(true)
	})

	it('returns false for an empty plain object', () => {
		expect(hasValue({})).toBe(false)
	})

	it('returns true for a plain object with keys', () => {
		expect(hasValue({ a: 1 })).toBe(true)
	})

	it('returns false for a non-plain object (e.g. a class instance) because the object branch requires constructor === Object', () => {
		// The final `typeof value === 'object'` branch only returns true for
		// plain object literals; any other object-typed value (class
		// instances, etc.) falls through to false here rather than reaching
		// the unconditional `return true` at the end of the function.
		class Custom {}
		expect(hasValue(new Custom())).toBe(false)
	})

	it('returns true for the number 0 (only nullish/empty-container values are falsy here)', () => {
		expect(hasValue(0)).toBe(true)
	})

	it('returns true for boolean false (not treated as "empty")', () => {
		expect(hasValue(false)).toBe(true)
	})

	it('returns true for a non-empty function', () => {
		expect(hasValue(() => {})).toBe(true)
	})
})
