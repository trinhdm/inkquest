import { isObject, keyHasValue } from '../objects'

describe('isObject', () => {
	it('returns true for a plain object literal', () => {
		expect(isObject({ a: 1 })).toBe(true)
	})

	it('returns true for an empty plain object', () => {
		expect(isObject({})).toBe(true)
	})

	it('returns false for an array', () => {
		expect(isObject([1, 2])).toBe(false)
	})

	it('returns false for null', () => {
		expect(isObject(null)).toBe(false)
	})

	it('returns false for undefined', () => {
		expect(isObject(undefined)).toBe(false)
	})

	it('returns false for a string', () => {
		expect(isObject('object')).toBe(false)
	})

	it('returns false for a Map instance', () => {
		expect(isObject(new Map())).toBe(false)
	})

	it('returns false for a class instance whose constructor is not Object', () => {
		class Custom {}
		expect(isObject(new Custom())).toBe(false)
	})
})

describe('keyHasValue', () => {
	it('returns true when the key exists with a truthy value (single-key form)', () => {
		expect(keyHasValue({ active: true }, 'active')).toBe(true)
	})

	it('returns false when the key exists but its value is falsy (single-key form)', () => {
		expect(keyHasValue({ active: false }, 'active')).toBe(false)
	})

	it('returns false when the key is absent entirely', () => {
		expect(keyHasValue({ other: 1 }, 'active')).toBe(false)
	})

	it('returns false when the target is undefined', () => {
		expect(keyHasValue(undefined, 'active')).toBe(false)
	})

	it('returns false when the target is an array, since isObject rejects arrays', () => {
		expect(keyHasValue([1, 2], 'length')).toBe(false)
	})

	it('returns true when the entry-object form matches the exact value', () => {
		expect(keyHasValue({ size: 'sm' }, { size: 'sm' })).toBe(true)
	})

	it('returns false when the entry-object form value does not strictly match', () => {
		expect(keyHasValue({ size: 'sm' }, { size: 'lg' })).toBe(false)
	})

	it('falls back to a truthiness check, not strict-null-equality, when the entry value is explicitly null', () => {
		// v === null routes to the `!!obj[k]` branch instead of comparing obj[k] === null
		expect(keyHasValue({ size: 'sm' }, { size: null as unknown })).toBe(true)
		expect(keyHasValue({ size: '' }, { size: null as unknown })).toBe(false)
	})

	it('returns false for the entry-object form when the key does not exist on the object', () => {
		expect(keyHasValue({ other: 1 }, { size: 'sm' })).toBe(false)
	})

	it('treats an own key with value undefined as present but falsy', () => {
		expect(keyHasValue({ active: undefined }, 'active')).toBe(false)
	})
})
